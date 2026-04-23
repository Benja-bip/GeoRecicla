import { Home, Plus, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Inicio">
          <Home className="w-5 h-5 text-foreground" />
        </button>

        <h1 className="font-display text-2xl font-black italic text-gradient-eco tracking-tight">
          GeoRecicla
        </h1>

        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Agregar">
            <Plus className="w-5 h-5 text-foreground" />
          </button>
          <button
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Menú"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-card"
          >
            <ul className="container mx-auto px-4 py-3 space-y-2">
              {["Inicio", "Mapa", "Materiales", "Puntos Limpios", "Acerca de"].map((item) => (
                <li key={item}>
                  <a href="#" className="block px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AppHeader;
