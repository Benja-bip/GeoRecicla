import { MapPin, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchRecyclingPoints, type RecyclingPoint } from "@/services/puntos";

const formatMaterials = (tipo_material: string) =>
  tipo_material
    .split(/[,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const RecyclingPoints = () => {
  const {
    data: points = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["recyclingPoints"],
    queryFn: fetchRecyclingPoints,
  });

  return (
    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Puntos limpios cercanos</h2>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          No se pudieron cargar los puntos limpios. Revisa tu conexión a Supabase.
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((skeleton) => (
            <motion.div
              key={skeleton}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: skeleton * 0.05 }}
              className="rounded-xl border border-border p-4 bg-card shadow-sm"
            >
              <div className="h-4 w-3/4 rounded-full bg-slate-200 dark:bg-slate-700 mb-3" />
              <div className="h-3 w-1/2 rounded-full bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-slate-700" />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {points.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No hay puntos limpios disponibles en Supabase.
            </div>
          ) : (
            points.map((point: RecyclingPoint, i) => (
              <motion.div
                key={point.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border p-4 hover:shadow-eco transition-shadow cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-display font-bold text-foreground text-sm">{point.nombre}</h3>
                  <span className="flex items-center gap-1 text-xs text-primary font-semibold bg-secondary rounded-full px-2 py-0.5">
                    <Navigation className="w-3 h-3" />
                    {point.latitud && point.longitud ? "Ver mapa" : "Ubicación"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {point.direccion}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Clock className="w-3 h-3" />
                  {point.tipo_material}
                </div>
                <div className="flex flex-wrap gap-1">
                  {formatMaterials(point.tipo_material).map((material) => (
                    <span key={material} className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">
                      {material}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default RecyclingPoints;
