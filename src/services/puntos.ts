import { supabase } from "@/supabaseClient";

export type RecyclingPoint = {
  id: number;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  tipo_material: string;
};

export const fetchRecyclingPoints = async (): Promise<RecyclingPoint[]> => {
  const { data, error } = await supabase
    .from<RecyclingPoint>("puntos_limpios")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};
