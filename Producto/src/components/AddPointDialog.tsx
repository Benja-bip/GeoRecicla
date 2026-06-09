import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Loader2, Navigation, Search, Map, X, Plus } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { comunaCenters } from "@/lib/comunas";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Materiales predefinidos que coinciden con los filtros
const MATERIAL_OPTIONS = [
  { label: "Plástico", emoji: "🧴" },
  { label: "Cartón", emoji: "📦" },
  { label: "Vidrio", emoji: "🫙" },
  { label: "Metal", emoji: "🥫" },
  { label: "Papel", emoji: "📄" },
  { label: "Electrónicos", emoji: "📱" },
  { label: "Orgánico", emoji: "🌱" },
  { label: "Ropa", emoji: "👕" },
];

function detectComuna(lat: number, lng: number): string {
  let closest = "";
  let minDist = Infinity;
  for (const [comuna, center] of Object.entries(comunaCenters)) {
    const d = Math.sqrt((lat - center.lat) ** 2 + (lng - center.lng) ** 2);
    if (d < minDist) { minDist = d; closest = comuna; }
  }
  return closest;
}

const MapClickHandler = ({ onSelect }: { onSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({ click(e) { onSelect(e.latlng.lat, e.latlng.lng); } });
  return null;
};

type LocationMode = "gps" | "search" | "map" | null;

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddPointDialog = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [customMaterial, setCustomMaterial] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [comuna, setComuna] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const toggleMaterial = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const addCustomMaterial = () => {
    const trimmed = customMaterial.trim();
    if (!trimmed) return;
    if (selectedMaterials.includes(trimmed)) {
      toast.error("Ese material ya fue agregado");
      return;
    }
    setSelectedMaterials((prev) => [...prev, trimmed]);
    setCustomMaterial("");
  };

  const removeMaterial = (material: string) => {
    setSelectedMaterials((prev) => prev.filter((m) => m !== material));
  };

  const setLocation = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setComuna(detectComuna(newLat, newLng));
  };

  const getGPS = () => {
    if (!navigator.geolocation) { toast.error("Tu navegador no soporta geolocalización"); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocation(pos.coords.latitude, pos.coords.longitude); setLocationMode("gps"); toast.success("Ubicación capturada por GPS"); },
      () => toast.error("No se pudo obtener la ubicación")
    );
  };

  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery + ", Chile")}`;
      const res = await fetch(url, { headers: { "Accept-Language": "es" } });
      const data = await res.json();
      if (!data.length) { toast.error("No se encontró esa dirección"); return; }
      setLocation(parseFloat(data[0].lat), parseFloat(data[0].lon));
      setAddress(data[0].display_name.split(",").slice(0, 3).join(", "));
      toast.success("Dirección encontrada");
    } catch { toast.error("Error al buscar"); }
    finally { setSearching(false); }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setName(""); setAddress(""); setSelectedMaterials([]); setCustomMaterial("");
    setNotes(""); setLat(null); setLng(null); setComuna(""); setPhoto(null);
    setPhotoPreview(null); setLocationMode(null); setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (lat === null || lng === null) { toast.error("Selecciona una ubicación primero"); return; }
    if (selectedMaterials.length === 0) { toast.error("Agrega al menos un material"); return; }
    setLoading(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const path = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: upErr } = await supabase.storage.from("recycling-photos").upload(path, photo);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("recycling-photos").getPublicUrl(path);
        photo_url = data.publicUrl;
      }
      const { error } = await supabase.from("recycling_points").insert({
        user_id: user.id,
        name,
        address: address || null,
        latitude: lat,
        longitude: lng,
        materials: selectedMaterials,
        notes: notes || null,
        photo_url,
        comuna: comuna || null,
      });
      if (error) throw error;
      toast.success(`¡Punto agregado en ${comuna || "el mapa"}!`);
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const locationConfirmed = lat !== null && lng !== null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar punto de reciclaje</DialogTitle>
          <DialogDescription>Ayuda a la comunidad confirmando un nuevo punto.</DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Inicia sesión para agregar puntos.</p>
            <Link to="/auth"><Button>Iniciar sesión</Button></Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Paso 1 — Nombre */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">1. Información</p>
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Punto Limpio Plaza Mayor" required />
              </div>
            </div>

            {/* Paso 2 — Materiales */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">2. Materiales *</p>
              <p className="text-xs text-muted-foreground">Selecciona los materiales que acepta este punto</p>

              {/* Grid de materiales predefinidos */}
              <div className="grid grid-cols-4 gap-2">
                {MATERIAL_OPTIONS.map((m) => {
                  const active = selectedMaterials.includes(m.label);
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => toggleMaterial(m.label)}
                      className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all ${
                        active
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:bg-secondary"
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <span className="text-[10px] font-medium leading-tight">{m.label}</span>
                      {active && <span className="text-[9px] text-primary">✓</span>}
                    </button>
                  );
                })}
              </div>

              {/* Material personalizado */}
              <div className="flex gap-2">
                <Input
                  value={customMaterial}
                  onChange={(e) => setCustomMaterial(e.target.value)}
                  placeholder="Otro material..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomMaterial())}
                  className="text-sm"
                />
                <Button type="button" onClick={addCustomMaterial} size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Tags de materiales seleccionados */}
              {selectedMaterials.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-secondary/50 rounded-xl border border-border">
                  <p className="w-full text-[10px] text-muted-foreground mb-1">Materiales seleccionados:</p>
                  {selectedMaterials.map((m) => (
                    <span
                      key={m}
                      className="flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5"
                    >
                      {m}
                      <button type="button" onClick={() => removeMaterial(m)} className="hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Paso 3 — Ubicación */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">3. Ubicación *</p>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={getGPS}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${locationMode === "gps" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}>
                  <Navigation className="w-5 h-5" />
                  <span className="text-xs font-medium">Mi GPS</span>
                  <span className="text-[10px] text-muted-foreground">Automático</span>
                </button>
                <button type="button" onClick={() => setLocationMode("search")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${locationMode === "search" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}>
                  <Search className="w-5 h-5" />
                  <span className="text-xs font-medium">Dirección</span>
                  <span className="text-[10px] text-muted-foreground">Buscar</span>
                </button>
                <button type="button" onClick={() => setLocationMode("map")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${locationMode === "map" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"}`}>
                  <Map className="w-5 h-5" />
                  <span className="text-xs font-medium">En mapa</span>
                  <span className="text-[10px] text-muted-foreground">Click</span>
                </button>
              </div>

              {locationMode === "search" && (
                <div className="flex gap-2">
                  <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Av. Providencia 123, Santiago"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), searchAddress())} />
                  <Button type="button" onClick={searchAddress} disabled={searching} size="sm">
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
              )}

              {(locationMode === "map" || (locationMode !== "search" && locationConfirmed)) && (
                <div className="rounded-xl overflow-hidden border border-border" style={{ height: 200 }}>
                  <MapContainer
                    center={lat && lng ? [lat, lng] : [-33.4489, -70.6693]}
                    zoom={lat && lng ? 15 : 12}
                    className="w-full h-full"
                    key={`${lat}-${lng}`}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onSelect={setLocation} />
                    {lat && lng && <Marker position={[lat, lng]} icon={defaultIcon} />}
                  </MapContainer>
                </div>
              )}

              {locationConfirmed && (
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary">{comuna ? `📍 ${comuna}` : "Ubicación seleccionada"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lat!.toFixed(5)}, {lng!.toFixed(5)}</p>
                  </div>
                  <button type="button" onClick={() => { setLat(null); setLng(null); setComuna(""); setLocationMode(null); }}
                    className="text-xs text-muted-foreground hover:text-foreground">✕</button>
                </div>
              )}
            </div>

            {/* Paso 4 — Foto y notas */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">4. Foto y notas (opcional)</p>
              <label htmlFor="photo" className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                <Camera className="w-5 h-5" />
                <span className="text-sm">{photo ? photo.name : "Tomar / subir foto"}</span>
              </label>
              <input id="photo" type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 rounded-lg max-h-40 mx-auto" />}
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Horario, acceso, información adicional..." />
            </div>

            <Button type="submit" disabled={loading || !locationConfirmed || selectedMaterials.length === 0} className="w-full">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar punto
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPointDialog;
