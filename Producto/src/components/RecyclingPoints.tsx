import { useState, useEffect, useCallback } from "react";
import { MapPin, Building2, Loader2, User, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface ComunaPoint {
  id: string;
  comuna: string;
  name: string;
  address: string | null;
  latitude?: number;
  longitude?: number;
  materials: string;
  type: "Público" | "Privado" | "Usuario";
  source: "official" | "user";
}

const COMUNAS = [
  "Santiago", "Providencia", "Las Condes", "Maipú", "Ñuñoa",
  "La Florida", "Puente Alto", "Peñalolén", "Quilicura", "Huechuraba",
  "Renca", "Lo Prado", "Lo Barnechea", "Vitacura", "Independencia",
  "Recoleta", "La Granja", "Macul", "San Miguel", "Estación Central",
  "Conchalí", "Cerrillos", "Pedro Aguirre Cerda", "Cerro Navia", "Pudahuel",
  "San Bernardo", "El Bosque", "La Cisterna", "La Pintana", "Paine",
  "Pirque", "Talagante", "Melipilla", "San Joaquín", "San Ramón",
  "Padre Hurtado", "Tiltil", "Lampa", "María Pinto",
];

const POINTS_PER_PAGE = 6;

const RecyclingPoints = () => {
  const [selectedComuna, setSelectedComuna] = useState("Santiago");
  const [points, setPoints] = useState<ComunaPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchPoints = useCallback(async (comuna: string) => {
    setLoading(true);
    try {
      const [{ data: official }, { data: userPoints }] = await Promise.all([
        supabase
          .from("comuna_points")
          .select("id, comuna, name, address, materials, type")
          .eq("comuna", comuna)
          .order("name"),
        supabase
          .from("recycling_points")
          .select("id, name, address, materials, comuna, latitude, longitude")
          .eq("comuna", comuna)
          .order("created_at", { ascending: false }),
      ]);

      const officialMapped: ComunaPoint[] = (official ?? []).map((p) => ({
        id: p.id,
        comuna: p.comuna,
        name: p.name,
        address: p.address,
        materials: p.materials,
        type: p.type as "Público" | "Privado",
        source: "official",
      }));

      const userMapped: ComunaPoint[] = (userPoints ?? []).map((p) => ({
        id: p.id,
        comuna: p.comuna ?? comuna,
        name: p.name,
        address: p.address ?? null,
        latitude: p.latitude,
        longitude: p.longitude,
        materials: Array.isArray(p.materials) ? p.materials.join(", ") : (p.materials ?? ""),
        type: "Usuario",
        source: "user",
      }));

      setPoints([...officialMapped, ...userMapped]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Resetear página al cambiar comuna
  useEffect(() => {
    setPage(1);
    fetchPoints(selectedComuna);
  }, [selectedComuna, fetchPoints]);

  // Tiempo real — se resuscribe correctamente cuando cambia la comuna
  useEffect(() => {
    const channel = supabase
      .channel(`points_changes_${selectedComuna}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comuna_points" },
        () => fetchPoints(selectedComuna))
      .on("postgres_changes", { event: "*", schema: "public", table: "recycling_points" },
        () => fetchPoints(selectedComuna))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedComuna, fetchPoints]);

  const getLocationText = (point: ComunaPoint): string => {
    if (point.address) return point.address;
    if (point.latitude && point.longitude) return `${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}`;
    return "Sin dirección";
  };

  const totalPages = Math.ceil(points.length / POINTS_PER_PAGE);
  const paginatedPoints = points.slice((page - 1) * POINTS_PER_PAGE, page * POINTS_PER_PAGE);
  const userPointsCount = points.filter(p => p.source === "user").length;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Puntos limpios</h2>
          {points.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {points.length} puntos
              {userPointsCount > 0 && ` · ${userPointsCount} agregados por usuarios`}
            </p>
          )}
        </div>
        <Select value={selectedComuna} onValueChange={setSelectedComuna}>
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Selecciona una comuna" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {COMUNAS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No hay puntos registrados para esta comuna.
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedComuna}-${page}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid gap-3 md:grid-cols-2 lg:grid-cols-3"
            >
              {paginatedPoints.map((point, i) => (
                <motion.div
                  key={point.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`bg-card rounded-xl border p-4 hover:shadow-eco transition-shadow ${
                    point.source === "user" ? "border-primary/30 bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-display font-bold text-foreground text-sm leading-tight">{point.name}</h3>
                    <span className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${
                      point.type === "Público" ? "bg-primary/15 text-primary"
                      : point.type === "Usuario" ? "bg-blue-500/15 text-blue-600"
                      : "bg-secondary text-secondary-foreground"
                    }`}>
                      {point.type === "Usuario" ? <User className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                      {point.type}
                    </span>
                  </div>

                  <div className="flex items-start gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-primary/60" />
                    <span className={point.address ? "" : "font-mono text-[10px]"}>
                      {getLocationText(point)}
                    </span>
                  </div>

                  {point.materials && (
                    <div className="flex flex-wrap gap-1">
                      {point.materials.split(",").map((m) => (
                        <span key={m} className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                          {m.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      page === n
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Info de página */}
          {totalPages > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              Mostrando {(page - 1) * POINTS_PER_PAGE + 1}–{Math.min(page * POINTS_PER_PAGE, points.length)} de {points.length} puntos
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default RecyclingPoints;
