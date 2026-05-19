import { Home, Plus, Menu, X, LogIn, LogOut as LogOutIcon, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import AddPointDialog from "./AddPointDialog";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AppHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [addPointOpen, setAddPointOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Obtener iniciales del email para el avatar
  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0].toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleAddPoint = () => {
    if (!user) {
      toast.error("Debes iniciar sesión para agregar un punto");
      navigate("/auth");
      return;
    }
    setAddPointOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

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
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Perfil de usuario">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback className="text-xs">{getInitials(user.email || "")}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                    <AvatarFallback>{getInitials(user.email || "")}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">Mi Perfil</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleViewProfile} className="cursor-pointer gap-2">
                  <Settings className="w-4 h-4" />
                  Ver Mi Perfil
                </DropdownMenuItem>
                <div className="px-2 py-2 text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="font-semibold">Estado:</span> Activo
                  </p>
                  <p>
                    <span className="font-semibold">Miembro desde:</span> {new Date(user.created_at || "").toLocaleDateString("es-ES")}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Iniciar sesión">
              <LogIn className="w-5 h-5 text-foreground" />
            </Link>
          )}
          <button className="p-2 rounded-lg hover:bg-secondary transition-colors" aria-label="Agregar" onClick={handleAddPoint}>
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
              <li>
                <Link to="/" className="block px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/blog" className="block px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors">
                  Blog
                </Link>
              </li>
              {user && (
                <li>
                  <button onClick={() => setAddPointOpen(true)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary text-foreground font-medium transition-colors">
                    Agregar Punto
                  </button>
                </li>
              )}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
      
      <AddPointDialog open={addPointOpen} onClose={() => setAddPointOpen(false)} />
    </header>
  );
};

export default AppHeader;
