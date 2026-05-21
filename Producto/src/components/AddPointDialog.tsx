import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddPointDialog = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [materials, setMaterials] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        toast.success("Ubicación capturada");
      },
      () => toast.error("No se pudo obtener la ubicación")
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPhotoPreview(URL.createObjectURL(f));
  };

  const reset = () => {
    setName(""); setAddress(""); setMaterials(""); setNotes("");
    setLat(null); setLng(null); setPhoto(null); setPhotoPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (lat === null || lng === null) {
      toast.error("Captura tu ubicación primero");
      return;
    }
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
        materials: materials.split(",").map((m) => m.trim()).filter(Boolean),
        notes: notes || null,
        photo_url,
      });
      if (error) throw error;
      toast.success("¡Punto de reciclaje agregado!");
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.message ?? "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="materials">Materiales (separados por coma)</Label>
              <Input id="materials" value={materials} onChange={(e) => setMaterials(e.target.value)} placeholder="PET, Vidrio, Cartón" />
            </div>
            <div>
              <Label>Ubicación *</Label>
              <Button type="button" variant="outline" onClick={getLocation} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                {lat !== null ? `${lat.toFixed(5)}, ${lng!.toFixed(5)}` : "Usar mi ubicación actual"}
              </Button>
            </div>
            <div>
              <Label htmlFor="photo">Foto de confirmación</Label>
              <label htmlFor="photo" className="flex items-center justify-center gap-2 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-secondary/50">
                <Camera className="w-5 h-5" />
                <span className="text-sm">{photo ? photo.name : "Tomar / subir foto"}</span>
              </label>
              <input id="photo" type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 rounded-lg max-h-40 mx-auto" />}
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
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
