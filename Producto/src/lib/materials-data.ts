// Datos de materiales — el campo "filter" debe coincidir exactamente
// con los valores usados en la columna "materials" de Supabase

export interface Material {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  filter: string; // valor que se busca en la columna materials
  fullName: string;
  info: string;
  tips: string[];
  recyclable: boolean;
}

export const MATERIALS: Material[] = [
  {
    id: "pet",
    name: "Botella PET",
    emoji: "🧴",
    desc: "Plástico reciclable #1",
    filter: "Plástico",
    fullName: "Botella PET - Plástico #1",
    info: "El PET (Polietileno Tereftalato) es uno de los plásticos más reciclados. Se encuentra en botellas de agua y bebidas. Debe enjuagarse antes de reciclar y retirar la tapa.",
    tips: ["Enjuaga antes de reciclar", "Retira la tapa", "Aplasta para ahorrar espacio"],
    recyclable: true,
  },
  {
    id: "carton",
    name: "Cartón",
    emoji: "📦",
    desc: "Material reciclable",
    filter: "Cartón",
    fullName: "Cartón y papel corrugado",
    info: "El cartón es altamente reciclable y puede convertirse en nuevo cartón o papel. Incluye cajas, envases y embalajes. Debe estar seco y limpio para ser reciclado.",
    tips: ["Aplana las cajas", "Retira cintas adhesivas", "Debe estar seco y sin grasa"],
    recyclable: true,
  },
  {
    id: "vidrio",
    name: "Vidrio",
    emoji: "🫙",
    desc: "Material reciclable",
    filter: "Vidrio",
    fullName: "Vidrio y botellas de vidrio",
    info: "El vidrio es 100% reciclable y puede reciclarse infinitas veces sin perder calidad. Incluye botellas, frascos y envases de vidrio.",
    tips: ["Enjuaga los envases", "Retira tapas metálicas", "No incluir vidrio roto"],
    recyclable: true,
  },
  {
    id: "aluminio",
    name: "Aluminio",
    emoji: "🥫",
    desc: "Material reciclable",
    filter: "Metal",
    fullName: "Aluminio y latas metálicas",
    info: "El aluminio es uno de los materiales más valiosos para reciclar. Reciclar aluminio ahorra hasta un 95% de energía comparado con producirlo desde cero.",
    tips: ["Enjuaga las latas", "Aplasta para ahorrar espacio", "Incluye papel aluminio limpio"],
    recyclable: true,
  },
  {
    id: "papel",
    name: "Papel",
    emoji: "📄",
    desc: "Material reciclable",
    filter: "Papel",
    fullName: "Papel y periódicos",
    info: "El papel reciclado reduce la tala de árboles y el consumo de agua. Incluye periódicos, revistas, papel de oficina y cuadernos.",
    tips: ["Debe estar seco", "Retira grapas y clips", "Sin papel encerado ni carbónico"],
    recyclable: true,
  },
  {
    id: "electronico",
    name: "Electrónicos",
    emoji: "📱",
    desc: "Residuos especiales",
    filter: "Electrónicos",
    fullName: "Residuos electrónicos (RAEE)",
    info: "Los residuos electrónicos contienen materiales valiosos y sustancias peligrosas. Celulares, computadores, cables y baterías deben ir a puntos especializados.",
    tips: ["Elimina tus datos personales", "No los tires a la basura común", "Busca puntos RAEE autorizados"],
    recyclable: true,
  },
];
