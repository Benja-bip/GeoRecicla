import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { type Material } from "@/lib/materials-data";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddMaterialDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (material: Omit<Material, "id">) => void;
}

// Emojis comunes para materiales
const EMOJI_PICKER = ["🧴", "📦", "🫙", "🥫", "📄", "📱", "🛢️", "🪛", "⚙️", "🪨", "🧬", "💡", "🔌", "📡", "🪜"];

const AddMaterialDialog = ({ open, onClose, onAdd }: AddMaterialDialogProps) => {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧴");
  const [desc, setDesc] = useState("");
  const [fullName, setFullName] = useState("");
  const [filter, setFilter] = useState("");
  const [info, setInfo] = useState("");
  const [tips, setTips] = useState(["", "", ""]);
  const [recyclable, setRecyclable] = useState(true);

  const handleAddTip = () => {
    if (tips.length < 5) {
      setTips([...tips, ""]);
    }
  };

  const handleRemoveTip = (index: number) => {
    setTips(tips.filter((_, i) => i !== index));
  };

  const handleTipChange = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const handleSubmit = () => {
    // Validación
    if (!name.trim()) {
      toast.error("El nombre del material es obligatorio");
      return;
    }
    if (!filter.trim()) {
      toast.error("El filtro es obligatorio (valor para buscar)");
      return;
    }

    const validTips = tips.filter((t) => t.trim());
    if (validTips.length === 0) {
      toast.error("Agrega al menos un tip");
      return;
    }

    const newMaterial: Omit<Material, "id"> = {
      name: name.trim(),
      emoji: emoji,
      desc: desc.trim() || "Material personalizado",
      fullName: fullName.trim() || name.trim(),
      filter: filter.trim(),
      info: info.trim() || `Material personalizado: ${name}`,
      tips: validTips,
      recyclable,
    };

    onAdd(newMaterial);
    toast.success(`✓ Material "${name}" agregado exitosamente`);

    // Reset
    setName("");
    setEmoji("🧴");
    setDesc("");
    setFullName("");
    setFilter("");
    setInfo("");
    setTips(["", "", ""]);
    setRecyclable(true);
    onClose();
  };

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
            className="fixed inset-x-4 top-[5%] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bg-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-border max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">Agregar Material</h2>
                <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji Picker */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Ícono del material
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {EMOJI_PICKER.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                          emoji === e
                            ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/30"
                            : "bg-secondary border border-border hover:border-primary/50"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nombre del material *
                  </label>
                  <Input
                    placeholder="Ej: Plástico PVC"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Descripción corta */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descripción corta
                  </label>
                  <Input
                    placeholder="Ej: Plástico tipo 3"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Nombre completo */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nombre completo (para diálogo)
                  </label>
                  <Input
                    placeholder="Ej: Plástico PVC - Tipo 3"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-secondary border-border"
                  />
                </div>

                {/* Filtro */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Valor de filtro (para mapa) *
                  </label>
                  <Input
                    placeholder="Ej: PVC"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-secondary border-border"
                    disabled={name.length === 0}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    El mapa buscará exactamente este valor en los puntos de reciclaje
                  </p>
                </div>

                {/* Información */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Información detallada
                  </label>
                  <textarea
                    placeholder="Descripción completa para que aparezca en el diálogo..."
                    value={info}
                    onChange={(e) => setInfo(e.target.value)}
                    className="w-full p-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground resize-vertical min-h-20"
                  />
                </div>

                {/* Tips */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-foreground">
                      Tips para reciclar *
                    </label>
                    <button
                      onClick={handleAddTip}
                      disabled={tips.length >= 5}
                      className="text-xs text-primary hover:underline disabled:opacity-50"
                    >
                      + Agregar tip
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tips.map((tip, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder={`Tip ${i + 1}`}
                          value={tip}
                          onChange={(e) => handleTipChange(i, e.target.value)}
                          className="bg-secondary border-border flex-1"
                        />
                        {tips.length > 1 && (
                          <button
                            onClick={() => handleRemoveTip(i)}
                            className="px-3 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reciclable */}
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={recyclable}
                      onChange={(e) => setRecyclable(e.target.checked)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Reciclable en punto limpio
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl gradient-eco font-semibold text-sm text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Agregar Material
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm text-foreground hover:bg-secondary transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddMaterialDialog;
