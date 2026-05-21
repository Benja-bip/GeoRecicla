import MaterialCard from "./MaterialCard";

interface MaterialsSectionProps {
  onOpenDialog: () => void;
}

const MaterialsSection = ({ onOpenDialog }: MaterialsSectionProps) => {
  return (
    <section id="materiales">
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Identifica tu material</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <MaterialCard onOpen={onOpenDialog} />
        {/* Placeholder cards */}
        {[
          { name: "Cartón", emoji: "📦", desc: "Material reciclable" },
          { name: "Vidrio", emoji: "🫙", desc: "Material reciclable" },
          { name: "Aluminio", emoji: "🥫", desc: "Material reciclable" },
        ].map((m) => (
          <button
            key={m.name}
            onClick={onOpenDialog}
            className="bg-card rounded-2xl border border-border shadow-sm p-4 min-w-[160px] flex flex-col items-center gap-3 hover:shadow-eco transition-shadow"
          >
            <div className="w-24 h-32 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-3xl">{m.emoji}</span>
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-foreground">{m.name}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </div>
          </button>
        ))}
        {/* "Agrega otro" large add card */}
        <button
          onClick={onOpenDialog}
          className="bg-card rounded-2xl border border-dashed border-border shadow-sm p-4 min-w-[160px] min-h-[200px] flex flex-col items-center justify-center gap-3 hover:border-primary hover:shadow-eco transition-all"
        >
          <div className="w-24 h-32 rounded-xl bg-secondary flex items-center justify-center">
            <span className="text-5xl text-primary">+</span>
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground">Agrega otro</h3>
          </div>
        </button>
      </div>
    </section>
  );
};

export default MaterialsSection;
