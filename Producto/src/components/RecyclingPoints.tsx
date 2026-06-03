import { useState, useEffect } from "react";
import { MapPin, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface ComunaPoint {
  id: string;
  comuna: string;
  name: string;
  address: string;
  materials: string;
  type: "Público" | "Privado";
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

const RecyclingPoints = () => {
  const [selectedComuna, setSelectedComuna] = useState("Santiago");
  const [points, setPoints] = useState<ComunaPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPoints = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("comuna_points")
        .select("id, comuna, name, address, materials, type")
        .eq("comuna", selectedComuna)
        .order("name");

      if (!error && data) {
        setPoints(data as ComunaPoint[]);
      }
      setLoading(false);
    };

    fetchPoints();
  }, [selectedComuna]);

  // Suscripción en tiempo real — si cambias datos en Supabase se refleja al instante
  useEffect(() => {
    const channel = supabase
      .channel("comuna_points_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comuna_points" },
        () => {
          supabase
            .from("comuna_points")
            .select("id, comuna, name, address, materials, type")
            .eq("comuna", selectedComuna)
            .order("name")
            .then(({ data }) => {
              if (data) setPoints(data as ComunaPoint[]);
            });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedComuna]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Puntos limpios</h2>
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
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {points.map((point, i) => (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl border border-border p-4 hover:shadow-eco transition-shadow"
            >
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-display font-bold text-foreground text-sm">{point.name}</h3>
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 ${
                    point.type === "Público"
                      ? "bg-primary/15 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  {point.type}
                </span>
              </div>
              <div className="flex items-start gap-1 text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{point.address}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {point.materials.split(",").map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
                  >
                    {m.trim()}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecyclingPoints;
