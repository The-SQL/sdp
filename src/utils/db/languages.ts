import { createClient } from "@/utils/supabase/client";
import {
    Language
} from "../types";

export async function createLanguage(language: string): Promise<Language> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("languages")
    .insert({ name: language })
    .select();

  if (error) {
    console.error("Error creating language:", error);
    throw error;
  }

  return data[0];
}