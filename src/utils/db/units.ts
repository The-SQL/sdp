 import { createClient } from "@/utils/supabase/client";
import {
    Unit
} from "../types";

export async function insertUnit(
  courseId: string,
  title: string,
  order_index: number
): Promise<Unit> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("units")
    .insert({ course_id: courseId, title, order_index })
    .select();

  if (error) {
    console.error("Error inserting unit:", error);
    throw error;
  }

  return data[0];
}

export async function insertUnits(courseId: string, units: Unit[]) {
  const supabase = createClient();

  const payload = units.map((unit) => ({
    course_id: courseId,
    id: unit.id,
    title: unit.title,
    order_index: unit.order_index,
  }));

  const { error } = await supabase.from("units").insert(payload);

  if (error) throw error;
}

export async function updateUnit(
  unitId: string,
  updates: Partial<Unit>
): Promise<Unit> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("units")
    .update(updates)
    .eq("id", unitId)
    .select();

  if (error) {
    console.error("Error updating unit:", error);
    throw error;
  }

  return data[0];
}
