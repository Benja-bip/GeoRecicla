import { MapPin, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import heroMap from "@/assets/hero-map.jpg";

const MapView = () => {
  return (
    <div className="relative w-full aspect-[16/10] md:aspect-[16/7] rounded-2xl overflow-hidden shadow-eco border border-border">
      <img src={heroMap} alt="Mapa de puntos de reciclaje" className="w-full h-full object-cover" />
      
      {/* Simulated markers */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
        className="absolute top-[35%] left-[40%]"
      >
        <div className="relative">
          <MapPin className="w-8 h-8 text-primary fill-primary/30 drop-shadow-lg" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-eco-glow animate-pulse" />
        </div>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute top-[55%] left-[65%]"
      >
        <MapPin className="w-8 h-8 text-destructive fill-destructive/30 drop-shadow-lg" />
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: "spring" }}
        className="absolute top-[45%] left-[25%]"
      >
        <MapPin className="w-8 h-8 text-eco-sky fill-eco-sky/30 drop-shadow-lg" />
      </motion.div>

      {/* User location */}
      <div className="absolute bottom-[30%] left-[50%]">
        <div className="w-4 h-4 rounded-full bg-eco-sky border-2 border-card shadow-lg" />
        <div className="absolute inset-0 w-4 h-4 rounded-full bg-eco-sky/40 animate-ping" />
      </div>

      {/* Distance badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-[35%] left-[55%] bg-card/95 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-foreground shadow-md border border-border"
      >
        <Navigation className="w-3 h-3 inline mr-1 text-primary" />
        4 min caminando
      </motion.div>
    </div>
  );
};

export default MapView;
