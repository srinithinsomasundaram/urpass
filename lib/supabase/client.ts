import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sjzuheujgwkpanykkdin.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqenVoZXVqZ3drcGFueWtrZGluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5OTQxNzcsImV4cCI6MjEwMzU3MDE3N30.sJ1ad0CpUKFOUli-CU_tfQkYChKvB_j_4k4ddEunj3k";
  return createBrowserClient(url, key);
}
