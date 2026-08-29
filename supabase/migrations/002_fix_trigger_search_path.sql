-- Fix handle_new_user trigger to explicitly use public schema.
-- Triggers on auth.users run with auth as the default search_path,
-- so unqualified table references (profiles, plans, subscriptions)
-- fail to resolve. Adding SET search_path = public fixes this.

create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
declare
  free_plan_id uuid;
begin
  insert into public.profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  );

  select id into free_plan_id from public.plans where slug = 'free' limit 1;

  if free_plan_id is not null then
    insert into public.subscriptions (user_id, plan_id, status, provider)
    values (new.id, free_plan_id, 'active', 'free');
  end if;

  return new;
end;
$$;
