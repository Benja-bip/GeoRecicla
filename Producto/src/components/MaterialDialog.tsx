import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Recycle, CheckCircle2 } from "lucide-react";
import { type Material } from "@/lib/materials-data";

interface MaterialDialogProps {
  open: boolean;
  onClose: () => void;
  material: Material | null;
  onCreatePoint?: (material: Material) => void;
}

const MaterialDialog = ({ open, onClose, material, onCreatePoint }: MaterialDialogProps) => {
  if (!material) return null;

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
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{material.emoji}</span>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground">{material.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{material.desc}</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Info */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {material.info}
              </p>

              {/* Tips */}
              <div className="bg-secondary rounded-xl p-4 mb-4">
                <h3 className="font-display font-bold text-foreground text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Tips para reciclar
                </h3>
                <ul className="space-y-1">
                  {material.tips.map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estado reciclable */}
              <div className="flex items-center gap-2 mb-4">
                <Recycle className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  {material.recyclable ? "Reciclable en punto limpio" : "Requiere punto especializado"}
                </span>
              </div>

              {/* Filtro activo */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    El mapa ahora muestra puntos que aceptan <strong>{material.filter}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    onCreatePoint?.(material);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl gradient-eco font-semibold text-sm text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Agregar punto con este material
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  Ver en mapa
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
