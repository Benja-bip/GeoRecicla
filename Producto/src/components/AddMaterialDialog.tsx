import { useState } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl z-50 border border-border flex flex-col overflow-hidden"
          >
            {/* Header fijo */}
            <div className="p-5 text-center space-y-1 shrink-0">
              <h2 className="font-display text-xl font-bold text-foreground">Agregar Material</h2>
              <p className="text-xs text-muted-foreground">Completa la información para crear un nuevo material personalizado</p>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="overflow-y-auto flex-1">
              <div className="px-6 pb-3 space-y-4">
                {/* Emoji Picker */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-sm font-semibold text-foreground">
                    Ícono del material
                  </label>
                  <div className="flex gap-1.5 justify-center flex-wrap max-w-xs mx-auto">
                    {EMOJI_PICKER.map((e) => (
                      <button
                        key={e}
                        onClick={() => setEmoji(e)}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                          emoji === e
                            ? "bg-primary/20 border-2 border-primary ring-2 ring-primary/30 scale-110"
                            : "bg-secondary border border-border hover:border-primary/50 hover:scale-105"
                        }`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-3 max-w-md mx-auto">
                  {/* Nombre */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
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
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
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
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
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
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
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
                      El mapa buscará exactamente este valor en los puntos
                    </p>
                  </div>

                  {/* Información */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      Información detallada
                    </label>
                    <textarea
                      placeholder="Descripción completa para el diálogo..."
                      value={info}
                      onChange={(e) => setInfo(e.target.value)}
                      className="w-full p-2 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none min-h-16"
                    />
                  </div>

                  {/* Tips */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Tips para reciclar *
                      </label>
                      <button
                        onClick={handleAddTip}
                        disabled={tips.length >= 5}
                        className="text-xs text-primary hover:underline disabled:opacity-50 font-semibold"
                      >
                        + Agregar
                      </button>
                    </div>
                    <div className="space-y-2">
                      {tips.map((tip, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            placeholder={`Tip ${i + 1}`}
                            value={tip}
                            onChange={(e) => handleTipChange(i, e.target.value)}
                            className="bg-secondary border-border flex-1 text-sm"
                          />
                          {tips.length > 1 && (
                            <button
                              onClick={() => handleRemoveTip(i)}
                              className="px-2.5 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-xs font-semibold"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reciclable */}
                  <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
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
              </div>
            </div>

            {/* Botones fijos al fondo */}
            <div className="flex gap-3 p-5 pt-3 border-t border-border bg-card shrink-0 max-w-md mx-auto w-full justify-center">
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
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AddMaterialDialog;