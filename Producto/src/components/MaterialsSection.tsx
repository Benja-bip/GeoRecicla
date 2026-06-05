import { motion } from "framer-motion";
import { MATERIALS, type Material } from "@/lib/materials-data";

interface MaterialsSectionProps {
  onOpenDialog: (material: Material) => void;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const MaterialsSection = ({ onOpenDialog, activeFilter, onFilterChange }: MaterialsSectionProps) => {
  const handleClick = (material: Material) => {
    // Si ya está activo ese filtro, lo desactiva
    if (activeFilter === material.filter) {
      onFilterChange(null);
    } else {
      onFilterChange(material.filter);
    }
    onOpenDialog(material);
  };

  return (
    <section id="materiales">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-foreground">Identifica tu material</h2>
        {activeFilter && (
          <button
            onClick={() => onFilterChange(null)}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Limpiar filtro ✕
          </button>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {MATERIALS.map((material) => {
          const isActive = activeFilter === material.filter;
          return (
            <motion.button
              key={material.id}
              onClick={() => handleClick(material)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl border shadow-sm p-4 min-w-[140px] flex flex-col items-center gap-3 transition-all ${
                isActive
                  ? "bg-primary/10 border-primary shadow-eco ring-2 ring-primary/30"
                  : "bg-card border-border hover:shadow-eco"
              }`}
            >
              <div className={`w-20 h-28 rounded-xl flex items-center justify-center transition-colors ${
                isActive ? "bg-primary/15" : "bg-secondary"
              }`}>
                <span className="text-4xl">{material.emoji}</span>
              </div>
              <div className="text-center">
                <h3 className="font-display font-bold text-foreground text-sm">{material.name}</h3>
                <p className="text-xs text-muted-foreground">{material.desc}</p>
                {isActive && (
                  <span className="text-[10px] font-semibold text-primary mt-1 block">Filtrando ✓</span>
                )}
              </div>
            </motion.button>
          );
        })}

        {/* Agrega otro */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          className="bg-card rounded-2xl border border-dashed border-border shadow-sm p-4 min-w-[140px] min-h-[200px] flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-eco transition-all"
        >
          <div className="w-20 h-28 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-5xl text-primary">+</span>
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground text-sm">Agrega otro</h3>
          </div>
        </motion.button>
      </div>
    </section>
  );
};

export default MaterialsSection;
