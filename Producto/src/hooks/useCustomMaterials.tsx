import { useState, useEffect } from "react";
import { type Material } from "@/lib/materials-data";

const STORAGE_KEY = "georecicla_custom_materials";

export const useCustomMaterials = () => {
  const [customMaterials, setCustomMaterials] = useState<Material[]>([]);

  // Cargar desde localStorage al montar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomMaterials(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading custom materials:", e);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambian
  const saveMaterials = (materials: Material[]) => {
    setCustomMaterials(materials);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(materials));
  };

  const addMaterial = (material: Omit<Material, "id">) => {
    const newMaterial: Material = {
      ...material,
      id: `custom_${Date.now()}`,
    };
    saveMaterials([...customMaterials, newMaterial]);
    return newMaterial;
  };

  const removeMaterial = (id: string) => {
    if (!id.startsWith("custom_")) return; // Solo eliminar materiales personalizados
    saveMaterials(customMaterials.filter((m) => m.id !== id));
  };

  return {
    customMaterials,
    addMaterial,
    removeMaterial,
  };
};
