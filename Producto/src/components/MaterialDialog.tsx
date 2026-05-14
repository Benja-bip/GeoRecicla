import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Clock, Recycle } from "lucide-react";
import plasticBottle from "@/assets/plastic-bottle.png";

interface MaterialDialogProps {
  open: boolean;
  onClose: () => void;
}

const MaterialDialog = ({ open, onClose }: MaterialDialogProps) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-border"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-display text-xl font-bold text-foreground">Botella PET - Plástico #1</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex gap-4 mb-4">
                <div className="w-20 h-28 flex-shrink-0 flex items-center justify-center bg-secondary rounded-xl p-2">
                  <img src={plasticBottle} alt="Botella PET" className="h-full object-contain" />
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  El PET (Polietileno Tereftalato) es uno de los plásticos más reciclados. Se encuentra comúnmente en botellas de agua y bebidas. Debe enjuagarse antes de reciclar y retirar la tapa.
                </p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Recycle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Reciclable en punto limpio</span>
              </div>

              {/* Nearby point */}
              <div className="bg-secondary rounded-xl p-4 mb-4">
                <h3 className="font-display font-bold text-foreground mb-1">Punto Limpio Municipal</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  Av. Las Palmas 23
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  09:00 AM - 06:00 PM
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl gradient-eco font-semibold text-sm text-primary-foreground transition-opacity hover:opacity-90">
                  Ver en mapa
                </button>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:bg-secondary transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MaterialDialog;
