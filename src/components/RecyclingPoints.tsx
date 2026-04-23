import { MapPin, Clock, Navigation } from "lucide-react";
import { motion } from "framer-motion";

const points = [
  { name: "Punto Limpio Municipal", address: "Av. Las Palmas 23", hours: "09:00 AM - 06:00 PM", distance: "4 min", materials: ["PET", "Vidrio", "Cartón"] },
  { name: "EcoCenter Mall Plaza", address: "Calle Comercio 150", hours: "10:00 AM - 08:00 PM", distance: "12 min", materials: ["PET", "Aluminio", "Papel"] },
  { name: "Punto Verde Parque Central", address: "Av. Central s/n", hours: "08:00 AM - 05:00 PM", distance: "18 min", materials: ["Vidrio", "Cartón", "Orgánico"] },
];

const RecyclingPoints = () => {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Puntos limpios cercanos</h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {points.map((point, i) => (
          <motion.div
            key={point.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl border border-border p-4 hover:shadow-eco transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-display font-bold text-foreground text-sm">{point.name}</h3>
              <span className="flex items-center gap-1 text-xs text-primary font-semibold bg-secondary rounded-full px-2 py-0.5">
                <Navigation className="w-3 h-3" />
                {point.distance}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" />
              {point.address}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Clock className="w-3 h-3" />
              {point.hours}
            </div>
            <div className="flex flex-wrap gap-1">
              {point.materials.map((m) => (
                <span key={m} className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-0.5">{m}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecyclingPoints;
