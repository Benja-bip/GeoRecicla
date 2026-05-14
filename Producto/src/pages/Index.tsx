import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import SearchBar from "@/components/SearchBar";
import MapView from "@/components/MapView";
import MaterialsSection from "@/components/MaterialsSection";
import MaterialDialog from "@/components/MaterialDialog";
import RecyclingPoints from "@/components/RecyclingPoints";
import { Recycle } from "lucide-react";

const Index = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-6 space-y-8 max-w-5xl">
        <SearchBar />
        <MapView />
        <MaterialsSection onOpenDialog={() => setDialogOpen(true)} />
        <RecyclingPoints />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Recycle className="w-4 h-4 text-primary" />
            <span className="text-sm font-display font-semibold">GeoRecicla</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Reciclar nunca fue tan fácil</p>
        </footer>
      </main>

      <MaterialDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
};

export default Index;
