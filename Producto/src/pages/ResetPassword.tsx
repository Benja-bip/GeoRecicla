import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Recycle, Lock, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Supabase maneja el token del hash automáticamente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      else navigate("/auth", { replace: true });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Contraseña muy corta", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Las contraseñas no coinciden", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => navigate("/profile", { replace: true }), 3000);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo actualizar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!validSession) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Recycle className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-black italic text-gradient-eco">GeoRecicla</h1>
        </Link>

        <Card className="p-6 shadow-lg">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold">¡Contraseña actualizada!</h2>
              <p className="text-sm text-muted-foreground">Serás redirigido a tu perfil en unos segundos...</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-display font-bold text-center mb-1">Nueva contraseña</h2>
              <p className="text-sm text-muted-foreground text-center mb-6">Ingresa tu nueva contraseña</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="pl-9" placeholder="Mínimo 6 caracteres" required minLength={6} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      className="pl-9" placeholder="Repite la contraseña" required minLength={6} />
                  </div>
                </div>
                {password && confirm && password !== confirm && (
                  <p className="text-xs text-destructive">Las contraseñas no coinciden</p>
                )}
                <Button type="submit" className="w-full" disabled={loading || (!!confirm && password !== confirm)}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualizar contraseña"}
                </Button>
              </form>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
