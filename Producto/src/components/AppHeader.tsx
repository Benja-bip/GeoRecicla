import { Home, Plus, Menu, X, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface AppHeaderProps {
  onAddPoint?: () => void;
}

const AppHeader = ({ onAddPoint }: AppHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <button onClick={() => window.location.href = '/'} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Inicio">
          <Home className="w-5 h-5 text-foreground" />
        </button>

        <h1 className="font-display text-2xl font-black italic text-gradient-eco tracking-tight">
          GeoRecicla
        </h1>

        <div className="flex items-center gap-1">
          {user ? (
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Cerrar sesión" title={user.email ?? ""}>
              <LogOut className="w-5 h-5 text-foreground" />
            </button>
          ) : (
            <Link to="/auth" className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Iniciar sesión">
              <LogIn className="w-5 h-5 text-foreground" />
            </Link>
          )}
          <button onClick={onAddPoint} className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Agregar punto">
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
              {[
                { label: "Inicio", href: "/" },
                { label: "Materiales", href: "/#materiales" },
                { label: "Puntos Limpios", href: "/#puntos-limpios" },
                { label: "Cómo reciclar", href: "/blog" }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="block px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
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
