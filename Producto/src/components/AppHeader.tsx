import { Home, Plus, Menu, X, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AppHeaderProps {
  onAddPoint?: () => void;
}

const AppHeader = ({ onAddPoint }: AppHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.trim().split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const fullName = (user?.user_metadata?.full_name as string) || "";
  const avatarSeed = user?.email || user?.id || "default";

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
            <button
              onClick={() => navigate("/profile")}
              className="rounded-full hover:ring-2 hover:ring-primary/50 transition-all"
              aria-label="Mi perfil"
              title={fullName || user.email || "Mi perfil"}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                <AvatarFallback className="text-xs font-bold">
                  {getInitials(fullName, user.email || "")}
                </AvatarFallback>
              </Avatar>
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
                { label: "Cómo reciclar", href: "/blog" },
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
              {user && (
                <li>
                  <button
                    onClick={() => { navigate("/profile"); setMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors"
                  >
                    Mi Perfil
                  </button>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AppHeader;
