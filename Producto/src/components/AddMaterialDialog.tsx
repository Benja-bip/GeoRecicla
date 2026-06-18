import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2 } from "lucide-react";
import { type Material } from "@/lib/materials-data";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface AddMaterialDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (material: Omit<Material, "id">) => void;
}

const EMOJI_PICKER = ["🧴", "📦", "🫙", "🥫", "📄", "📱", "🛢️", "🪛", "⚙️", "🪨", "🧬", "💡", "🔌", "📡", "🪜"];

const AddMaterialDialog = ({ open, onClose, onAdd }: AddMaterialDialogProps) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🧴");
  const [desc, setDesc] = useState("");
  const [tips, setTips] = useState(["", ""]);
  const [recyclable, setRecyclable] = useState(true);

  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 10);
      document.body.style.overflow = "hidden";
    } else {
      setVisible(false);
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleAddTip = () => {
    if (tips.length < 4) setTips([...tips, ""]);
  };

  const handleRemoveTip = (index: number) => {
    if (tips.length > 1) setTips(tips.filter((_, i) => i !== index));
  };

  const handleTipChange = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index] = value;
    setTips(newTips);
  };

  const handleClose = () => {
    setName(""); setEmoji("🧴"); setDesc("");
    setTips(["", ""]); setRecyclable(true);
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim()) { toast.error("El nombre del material es obligatorio"); return; }
    const validTips = tips.filter((t) => t.trim());
    if (validTips.length === 0) { toast.error("Agrega al menos un tip de reciclaje"); return; }

    // Campos técnicos generados automáticamente desde el nombre
    onAdd({
      name: name.trim(),
      emoji,
      desc: desc.trim() || name.trim(),
      fullName: name.trim(),
      filter: name.trim(),
      info: desc.trim() || `Material personalizado: ${name.trim()}`,
      tips: validTips,
      recyclable,
    });

    toast.success(`✓ Material "${name}" agregado`);
    handleClose();
  };

  if (!open) return null;

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "hsl(var(--muted-foreground))",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          maxHeight: "88vh",
          backgroundColor: "hsl(var(--card))",
          borderRadius: "1rem",
          border: "1px solid hsl(var(--border))",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(16px)",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          opacity: visible ? 1 : 0,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem 1rem",
          borderBottom: "1px solid hsl(var(--border))",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
              Agregar material
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
              Crea un material personalizado para el mapa
            </p>
          </div>
          <button onClick={handleClose} style={{ padding: "0.25rem", borderRadius: "0.5rem", border: "none", background: "transparent", cursor: "pointer", color: "hsl(var(--muted-foreground))", display: "flex", alignItems: "center", marginLeft: "1rem" }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Emoji picker */}
            <div>
              <label style={labelStyle}>Ícono</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                {EMOJI_PICKER.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      borderRadius: "0.625rem",
                      border: emoji === e ? "2px solid hsl(var(--primary))" : "1px solid hsl(var(--border))",
                      background: emoji === e ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                      fontSize: "1.25rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: emoji === e ? "scale(1.1)" : "scale(1)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: "hsl(var(--border))" }} />

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre del material *</label>
              <Input
                placeholder="Ej: Plástico PVC"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
              <Input
                placeholder="Ej: Plástico rígido tipo 3"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="bg-secondary border-border"
              />
            </div>

            {/* Tips */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Tips para reciclar *</label>
                <button
                  onClick={handleAddTip}
                  disabled={tips.length >= 4}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "hsl(var(--primary))",
                    background: "none",
                    border: "none",
                    cursor: tips.length >= 4 ? "not-allowed" : "pointer",
                    opacity: tips.length >= 4 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Plus size={14} /> Agregar
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {tips.map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
                    <Input
                      placeholder={`Ej: ${i === 0 ? "Enjuaga antes de reciclar" : "Retira la tapa"}`}
                      value={tip}
                      onChange={(e) => handleTipChange(i, e.target.value)}
                      className="bg-secondary border-border flex-1 text-sm"
                    />
                    {tips.length > 1 && (
                      <button
                        onClick={() => handleRemoveTip(i)}
                        style={{
                          padding: "0 0.625rem",
                          borderRadius: "0.5rem",
                          border: "none",
                          background: "hsl(var(--destructive) / 0.1)",
                          color: "hsl(var(--destructive))",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reciclable */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              background: "hsl(var(--primary) / 0.05)",
              border: "1px solid hsl(var(--primary) / 0.2)",
              borderRadius: "0.5rem",
            }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer", flex: 1 }}>
                <input
                  type="checkbox"
                  checked={recyclable}
                  onChange={(e) => setRecyclable(e.target.checked)}
                  style={{ width: "1rem", height: "1rem" }}
                />
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "hsl(var(--foreground))" }}>
                  Reciclable en punto limpio
                </span>
              </label>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid hsl(var(--border))",
          display: "flex",
          gap: "0.75rem",
          flexShrink: 0,
          background: "hsl(var(--card))",
        }}>
          <button
            onClick={handleSubmit}
            className="gradient-eco"
            style={{
              flex: 1,
              padding: "0.625rem",
              borderRadius: "0.75rem",
              border: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "hsl(var(--primary-foreground))",
              cursor: "pointer",
            }}
          >
            Agregar material
          </button>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: "0.625rem",
              borderRadius: "0.75rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--card))",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "hsl(var(--foreground))",
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AddMaterialDialog;
