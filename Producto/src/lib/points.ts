export interface RecyclingPoint {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  materials: string[];
  photo_url: string | null;
  notes: string | null;
}

export const demoPoints: RecyclingPoint[] = [
  { id: "demo-1", name: "Punto Limpio Municipal", address: "Av. Las Palmas 23", latitude: -33.4489, longitude: -70.6693, materials: ["PET", "Vidrio", "Cartón"], photo_url: null, notes: null },
  { id: "demo-2", name: "EcoCenter Mall Plaza", address: "Calle Comercio 150", latitude: -33.4520, longitude: -70.6500, materials: ["PET", "Aluminio", "Papel"], photo_url: null, notes: null },
  { id: "demo-3", name: "Punto Verde Parque Central", address: "Av. Central s/n", latitude: -33.4400, longitude: -70.6800, materials: ["Vidrio", "Cartón", "Orgánico"], photo_url: null, notes: null },
];

// Distance in km between two lat/lng points
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, { headers: { "Accept-Language": "es" } });
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name,
  };
}

export function directionsUrl(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
  return `https://www.openstreetmap.org/directions?from=${from.lat},${from.lng}&to=${to.lat},${to.lng}`;
}
