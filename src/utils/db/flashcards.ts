import { createClient } from "../supabase/client";
import { Flashcard, FlashcardSet } from "../types";

export async function insertFlashcardSet(
  flashcard_set: Partial<FlashcardSet>
): Promise<FlashcardSet | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flashcard_sets")
    .insert(flashcard_set)
    .select()
    .single();

  if (error) {
    console.error("Error inserting flashcard set:", error);
    return null;
  }

  return data;
}

export async function getFlashcardSetsByAuthor(
  author_id: string,
  query: string
): Promise<FlashcardSet[]> {
  const supabase = createClient();

  let queryBuilder = supabase
    .from("flashcard_sets")
    .select("*")
    .eq("author_id", author_id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,language_name.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  const { data, error } = await queryBuilder.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching flashcard sets:", error);
    return [];
  }

  return data || [];
}

export async function getAllFlashcardSets(
  author_id: string,
  query: string
): Promise<FlashcardSet[]> {
  const supabase = createClient();

  let queryBuilder = supabase
    .from("flashcard_sets")
    .select("*")
    .eq("visibility", "public")
    .neq("author_id", author_id);

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,language_name.ilike.%${query}%,description.ilike.%${query}%`
    );
  }

  const { data, error } = await queryBuilder.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function getFlashcardSetById(
  id: string
): Promise<FlashcardSet | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flashcard_sets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching flashcard set by ID:", error);
    return null;
  }

  return data || null;
}

export async function getFlashcardsBySetId(
  flashcard_set_id: string
): Promise<Flashcard[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("flashcard_set_id", flashcard_set_id);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

export async function insertFlashcard(
  flashcard: Partial<Flashcard>
): Promise<Flashcard | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("flashcards")
    .insert(flashcard)
    .select()
    .single();

  if (error) {
    console.error("Error inserting flashcard set:", error);
    return null;
  }

  return data;
}
