import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import SearchBar from "@/components/SearchBar";
import MapView from "@/components/MapView";
import MaterialsSection from "@/components/MaterialsSection";
import MaterialDialog from "@/components/MaterialDialog";
import RecyclingPoints from "@/components/RecyclingPoints";
import AddPointDialog from "@/components/AddPointDialog";
import { Recycle } from "lucide-react";
import { geocodeAddress, type GeocodeResult } from "@/lib/points";
import { type Material } from "@/lib/materials-data";
import { toast } from "sonner";

const Index = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addPointOpen, setAddPointOpen] = useState(false);
  const [searchLocation, setSearchLocation] = useState<GeocodeResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const handleSearch = async (address: string) => {
    setSearching(true);
    try {
      const result = await geocodeAddress(address);
      if (!result) {
        toast.error("No se encontró esa dirección. Intenta ser más específico.");
        return;
      }
      setSearchLocation(result);
      toast.success("Mostrando puntos de reciclaje más cercanos");
    } catch {
      toast.error("Error al buscar la dirección");
    } finally {
      setSearching(false);
    }
  };

  const handleOpenDialog = (material: Material) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  const handleFilterChange = (filter: string | null) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader onAddPoint={() => setAddPointOpen(true)} />

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
        <SearchBar onSearch={handleSearch} loading={searching} />

        {/* Indicador de filtro activo sobre el mapa */}
        {activeFilter && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl text-sm">
            <span className="text-primary font-semibold">
              🗺️ Mapa filtrado por: <strong>{activeFilter}</strong>
            </span>
            <button
              onClick={() => setActiveFilter(null)}
              className="ml-auto text-xs text-primary hover:underline"
            >
              Limpiar ✕
            </button>
          </div>
        )}

        <MapView searchLocation={searchLocation} materialFilter={activeFilter} />

        <MaterialsSection
          onOpenDialog={handleOpenDialog}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        <div id="puntos-limpios">
          <RecyclingPoints />
        </div>

        <section id="about" className="bg-card rounded-2xl border border-border p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-foreground">Nosotros</h2>
          <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <p className="font-display font-bold text-foreground text-lg">Georecicla</p>
            <p>
              Georecicla es una aplicación web para ayudar a las personas a reciclar, lo que nos llevó al desarrollo de esta idea fue el hecho de aportar en el reciclaje debido que hoy en día la basura y también la contaminación está normalizada debido a que nadie se digna a reciclar y limpiar su espacio.
            </p>
            <p>
              Este proyecto consiste en el reciclaje en nuestro país, su función es simple y fácil de entender para cualquier persona, el usuario solo toma la foto de su producto en este caso "desecho" que pasará por un análisis de la IA para reconocer el material y usando geolocalización le dirá al usuario el punto de reciclaje más cercano.
            </p>
          </div>
        </section>

        <footer className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Recycle className="w-4 h-4 text-primary" />
            <span className="text-sm font-display font-semibold">GeoRecicla</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Reciclar nunca fue tan fácil</p>
        </footer>
      </main>

      <MaterialDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        material={selectedMaterial}
      />
      <AddPointDialog open={addPointOpen} onClose={() => setAddPointOpen(false)} />
    </div>
  );
};

export default Index;
