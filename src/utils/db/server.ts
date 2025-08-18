import { createClient } from "@/utils/supabase/server";

export async function insertUser(
  clerk_id: string,
  name: string,
  email: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .insert([{ clerk_id, name, email }])
    .select();

  if (error) {
    console.error("Error inserting user:", error);
    throw error;
  }

  return data;
}

export async function checkUserExists(clerk_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerk_id)
    .single();

  if (error) {
    console.error("Error checking user existence:", error);
    throw error;
  }

  return !!data;
}
