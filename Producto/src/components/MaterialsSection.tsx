import MaterialCard from "./MaterialCard";

interface MaterialsSectionProps {
  onOpenDialog: () => void;
}

const MaterialsSection = ({ onOpenDialog }: MaterialsSectionProps) => {
  return (
    <section>
      <h2 className="font-display text-xl font-bold text-foreground mb-4">Identifica tu material</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <MaterialCard onOpen={onOpenDialog} />
        {/* Placeholder cards */}
        {["Cartón", "Vidrio", "Aluminio"].map((name) => (
          <button
            key={name}
            onClick={onOpenDialog}
            className="bg-card rounded-2xl border border-border shadow-sm p-4 min-w-[160px] flex flex-col items-center gap-3 hover:shadow-eco transition-shadow"
          >
            <div className="w-24 h-32 rounded-xl bg-secondary flex items-center justify-center">
              <span className="text-3xl">
                {name === "Cartón" ? "📦" : name === "Vidrio" ? "🫙" : "🥫"}
              </span>
            </div>
            <div className="text-center">
              <h3 className="font-display font-bold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground">Material reciclable</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default MaterialsSection;
