-- Update handle_new_user to capture avatar_url from Google OAuth metadata
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  insert into public.profiles (user_id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    new.email,
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  )
  on conflict (user_id) do update
    set
      full_name  = coalesce(
        excluded.full_name,
        profiles.full_name
      ),
      avatar_url = coalesce(
        excluded.avatar_url,
        profiles.avatar_url
      ),
      updated_at = now();

  select id into free_plan_id from public.plans where slug = 'free' limit 1;

  if free_plan_id is not null then
    insert into public.subscriptions (user_id, plan_id, status, provider)
    values (new.id, free_plan_id, 'active', 'free')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
