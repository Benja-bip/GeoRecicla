import { supabase } from "@/supabaseClient";
import type { Tables } from "@/integrations/supabase/types";

export type RecyclingPoint = Tables<"recycling_points">;

export const fetchRecyclingPoints = async (): Promise<RecyclingPoint[]> => {
  const { data, error } = await supabase
    .from("recycling_points")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createRecyclingPoint = async (point: Omit<RecyclingPoint, "id" | "created_at" | "updated_at">): Promise<RecyclingPoint> => {
  const { data, error } = await supabase
    .from("recycling_points")
    .insert(point)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const updateRecyclingPoint = async (id: string, updates: Partial<Omit<RecyclingPoint, "id" | "created_at" | "updated_at">>): Promise<RecyclingPoint> => {
  const { data, error } = await supabase
    .from("recycling_points")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const deleteRecyclingPoint = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("recycling_points")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
};
