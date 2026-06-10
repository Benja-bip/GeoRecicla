import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Plus, MapPin, Trash2, Loader2, Recycle, Camera, Phone, FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { geocodeAddress } from "@/lib/points";
import { comunaCenters } from "@/lib/comunas";

interface Point {
  id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  materials: string[];
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

function detectComuna(lat: number, lng: number): string {
  let closest = "";
  let minDist = Infinity;
  for (const [comuna, center] of Object.entries(comunaCenters)) {
    const d = Math.sqrt((lat - center.lat) ** 2 + (lng - center.lng) ** 2);
    if (d < minDist) { minDist = d; closest = comuna; }
  }
  return closest;
}

const Company = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isCompany } = useProfile();

  const [points, setPoints] = useState<Point[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [materials, setMaterials] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    if (profile && !isCompany) {
      toast.error("Esta sección es solo para cuentas empresa");
      navigate("/", { replace: true });
    }
  }, [user, authLoading, profile, profileLoading, isCompany, navigate]);

  const loadPoints = async () => {
    if (!user) return;
    setLoadingPoints(true);
    const { data, error } = await supabase
      .from("recycling_points")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPoints((data as Point[]) ?? []);
    setLoadingPoints(false);
  };

  useEffect(() => {
    if (user && isCompany) loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isCompany]);

  const resetForm = () => {
    setName(""); setAddress(""); setMaterials(""); setNotes("");
    setLat(null); setLng(null); setPhoto(null); setPhotoPreview(null);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocalización no disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        toast.success("Ubicación capturada");
      },
      () => toast.error("No se pudo obtener la ubicación")
    );
  };

  const geocodeFromAddress = async () => {
    if (!address.trim()) return toast.error("Escribe una dirección primero");
    setGeocoding(true);
    try {
      const res = await geocodeAddress(address);
      if (!res) return toast.error("Dirección no encontrada");
      setLat(res.lat);
      setLng(res.lng);
      toast.success("Coordenadas obtenidas desde la dirección");
    } finally {
      setGeocoding(false);
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (lat === null || lng === null) return toast.error("Define la ubicación del punto");
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (photo) {
        const path = `${user.id}/${Date.now()}-${photo.name}`;
        const { error: upErr } = await supabase.storage
          .from("recycling-photos")
          .upload(path, photo);
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("recycling-photos").getPublicUrl(path).data.publicUrl;
      }

      const comuna = detectComuna(lat, lng);

      const { error } = await supabase.from("recycling_points").insert({
        user_id: user.id,
        name,
        address: address || null,
        latitude: lat,
        longitude: lng,
        materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
        notes: notes || null,
        photo_url,
        comuna,
        owner_type: "company",
      });
      if (error) throw error;
      toast.success(`Punto verde publicado en ${comuna}`);
      resetForm();
      setDialogOpen(false);
      loadPoints();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este punto?")) return;
    const { error } = await supabase.from("recycling_points").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Punto eliminado");
      setPoints((p) => p.filter((x) => x.id !== id));
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/15 via-card to-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/15 text-primary">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Panel de empresa
              </p>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
                {profile?.company_name ?? "Mi empresa"}
              </h1>
              {profile?.description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-xl">{profile.description}</p>
              )}
              {profile?.phone && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {profile.phone}
                </p>
              )}
            </div>
            <Button onClick={() => setDialogOpen(true)} className="hidden md:inline-flex">
              <Plus className="w-4 h-4 mr-2" /> Nuevo punto verde
            </Button>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="w-full mt-4 md:hidden">
            <Plus className="w-4 h-4 mr-2" /> Nuevo punto verde
          </Button>
        </motion.div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-foreground">
              Mis puntos verdes
            </h2>
            <Badge variant="secondary">{points.length}</Badge>
          </div>

          {loadingPoints ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : points.length === 0 ? (
            <Card className="p-10 text-center space-y-3">
              <Recycle className="w-10 h-10 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                Aún no has publicado puntos verdes. Crea el primero para que la comunidad pueda
                encontrarte en el mapa.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Crear primer punto
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {points.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Recycle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                      {p.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {p.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.materials.map((m) => (
                          <Badge key={m} variant="outline" className="text-[10px]">
                            {m}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(p.id)}
                      aria-label="Eliminar"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Publicar punto verde</DialogTitle>
            <DialogDescription>
              Completa la información del punto. Aparecerá en el mapa público de GeoRecicla.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="EcoVerde Las Condes" />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <div className="flex gap-2">
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Apoquindo 4000" />
                <Button type="button" variant="outline" onClick={geocodeFromAddress} disabled={geocoding}>
                  {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="materials">Materiales (separados por coma)</Label>
              <Input id="materials" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="PET, Vidrio, Cartón" />
            </div>
            <div>
              <Label>Ubicación *</Label>
              <Button type="button" variant="outline" onClick={useMyLocation} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                {lat !== null ? `${lat.toFixed(5)}, ${lng!.toFixed(5)}` : "Usar mi ubicación actual"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                También puedes obtenerla desde la dirección con el botón "Buscar".
              </p>
            </div>
            <div>
              <Label htmlFor="photo">Foto del punto</Label>
              <label htmlFor="photo" className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                <Camera className="w-5 h-5" />
                <span className="text-sm">{photo ? photo.name : "Subir foto"}</span>
              </label>
              <input id="photo" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 rounded-lg max-h-40 mx-auto" />}
            </div>
            <div>
              <Label htmlFor="notes" className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> Notas / horario
              </Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Lun-Vie 9:00 a 18:00" />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Publicar punto
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Company;
