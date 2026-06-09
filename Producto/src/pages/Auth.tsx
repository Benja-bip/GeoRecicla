import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Recycle, Mail, Lock, Loader2, User, Phone, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const step1Schema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }).max(100),
});

const step2Schema = z.object({
  fullName: z.string().min(2, { message: "Ingresa tu nombre completo" }).max(100),
  phone: z.string().min(8, { message: "Teléfono inválido" }).max(20),
  address: z.string().min(5, { message: "Ingresa tu dirección" }).max(200),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = step1Schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = step2Schema.safeParse({ fullName, phone, address });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            phone,
            address,
          },
        },
      });
      if (error) throw error;
      toast({ title: "¡Cuenta creada!", description: "Revisa tu email para confirmar tu cuenta." });
      setStep(1);
      setMode("signin");
      setEmail("");
      setPassword("");
      setFullName("");
      setPhone("");
      setAddress("");
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : String(err);
      let errorTitle = "Error";
      const errMsg = errorMessage.toLowerCase();
      if (errMsg.includes("user already registered") || errMsg.includes("already registered") || errMsg.includes("email already exists")) {
        errorTitle = "Email en uso";
        errorMessage = "Ya existe una cuenta con este correo. Intenta iniciar sesión.";
      } else if (errMsg.includes("invalid email")) {
        errorTitle = "Email inválido";
        errorMessage = "El correo que ingresaste no es válido.";
      }
      toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = step1Schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/profile", { replace: true });
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : String(err);
      let errorTitle = "Error";
      const errMsg = errorMessage.toLowerCase();
      if (errMsg.includes("invalid login credentials")) {
        errorTitle = "Credenciales inválidas";
        errorMessage = "Email o contraseña incorrectos.";
      } else if (errMsg.includes("email not confirmed")) {
        errorTitle = "Email no confirmado";
        errorMessage = "Revisa tu correo y confirma tu cuenta antes de ingresar.";
      }
      toast({ title: errorTitle, description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
      redirectTo: `https://proyecto-web-reciclaje-7g6q.vercel.app/profile`},
      });
    if (error) {
      toast({ title: "Error con Google", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setStep(1);
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setAddress("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Recycle className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-black italic text-gradient-eco">GeoRecicla</h1>
        </Link>

        <Card className="p-6 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            {mode === "signup" && step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            )}

            <h2 className="text-2xl font-display font-bold text-center">
              {mode === "signin" ? "Iniciar sesión" : step === 1 ? "Crear cuenta" : "Tu información"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {mode === "signin"
                ? "Bienvenido de vuelta"
                : step === 1
                ? "Paso 1 de 2 — Acceso"
                : "Paso 2 de 2 — Datos personales"}
            </p>

            {/* Progress bar for signup */}
            {mode === "signup" && (
              <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "50%" }}
                  animate={{ width: step === 1 ? "50%" : "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* SIGNIN */}
            {mode === "signin" && (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="tu@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
              </motion.form>
            )}

            {/* SIGNUP STEP 1 */}
            {mode === "signup" && step === 1 && (
              <motion.form
                key="signup-step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep1}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email2">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="tu@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="Mínimo 6 caracteres" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2">
                  Continuar <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google
                </Button>
              </motion.form>
            )}

            {/* SIGNUP STEP 2 */}
            {mode === "signup" && step === 2 && (
              <motion.form
                key="signup-step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-9" placeholder="Tu nombre completo" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9" placeholder="+56 9 XXXX XXXX" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="pl-9" placeholder="Tu ciudad o dirección" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "signin" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button type="button" onClick={switchMode} className="text-primary font-semibold hover:underline">
              {mode === "signin" ? "Regístrate" : "Inicia sesión"}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
