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
  const [fullName, setFullName] = useState("");
  const [filter, setFilter] = useState("");
  const [info, setInfo] = useState("");
  const [tips, setTips] = useState(["", "", ""]);
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
    if (tips.length < 5) setTips([...tips, ""]);
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
    if (!name.trim()) { toast.error("El nombre del material es obligatorio"); return; }
    if (!filter.trim()) { toast.error("El filtro es obligatorio"); return; }
    const validTips = tips.filter((t) => t.trim());
    if (validTips.length === 0) { toast.error("Agrega al menos un tip"); return; }

    onAdd({
      name: name.trim(),
      emoji,
      desc: desc.trim() || "Material personalizado",
      fullName: fullName.trim() || name.trim(),
      filter: filter.trim(),
      info: info.trim() || `Material personalizado: ${name}`,
      tips: validTips,
      recyclable,
    });

    toast.success(`✓ Material "${name}" agregado exitosamente`);
    setName(""); setEmoji("🧴"); setDesc(""); setFullName("");
    setFilter(""); setInfo(""); setTips(["", "", ""]); setRecyclable(true);
    onClose();
  };

  if (!open) return null;

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
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
              Agregar Material
            </h2>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
              Completa la información para crear un nuevo material personalizado
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "0.25rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "hsl(var(--muted-foreground))",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
              marginLeft: "1rem",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: "auto", flex: 1, padding: "1.25rem 1.5rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Emoji picker */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.625rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Ícono del material
              </label>
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
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nombre del material *
              </label>
              <Input placeholder="Ej: Plástico PVC" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
            </div>

            {/* Descripción corta */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Descripción corta
              </label>
              <Input placeholder="Ej: Plástico tipo 3" value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-secondary border-border" />
            </div>

            {/* Nombre completo */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Nombre completo (para diálogo)
              </label>
              <Input placeholder="Ej: Plástico PVC - Tipo 3" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border" />
            </div>

            {/* Filtro */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Valor de filtro (para mapa) *
              </label>
              <Input
                placeholder="Ej: PVC"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-secondary border-border"
                disabled={name.length === 0}
              />
              <p style={{ fontSize: "0.75rem", color: "hsl(var(--muted-foreground))", marginTop: "0.25rem" }}>
                El mapa buscará exactamente este valor en los puntos
              </p>
            </div>

            {/* Información */}
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Información detallada
              </label>
              <textarea
                placeholder="Descripción completa para el diálogo..."
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  background: "hsl(var(--secondary))",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "0.875rem",
                  color: "hsl(var(--foreground))",
                  resize: "none",
                  minHeight: "80px",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  outline: "none",
                }}
              />
            </div>

            {/* Tips */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tips para reciclar *
                </label>
                <button
                  onClick={handleAddTip}
                  disabled={tips.length >= 5}
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "hsl(var(--primary))",
                    background: "none",
                    border: "none",
                    cursor: tips.length >= 5 ? "not-allowed" : "pointer",
                    opacity: tips.length >= 5 ? 0.5 : 1,
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
                      placeholder={`Tip ${i + 1}`}
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
            Agregar Material
          </button>
          <button
            onClick={onClose}
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