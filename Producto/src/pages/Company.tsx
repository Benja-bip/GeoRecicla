import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2, Plus, MapPin, Trash2, Loader2, Recycle, Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AddPointDialog from "@/components/AddPointDialog";

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

const Company = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, isCompany } = useProfile();

  const [points, setPoints] = useState<Point[]>([]);
  const [loadingPoints, setLoadingPoints] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      .eq("owner_type", "company")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setPoints((data as Point[]) ?? []);
    setLoadingPoints(false);
  };

  useEffect(() => {
    if (user && isCompany) loadPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isCompany]);


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

      <AddPointDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          loadPoints();
        }}
        ownerType="company"
      />
    </div>
  );
};

export default Company;
