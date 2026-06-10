import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Recycle, Mail, Lock, Loader2, User, Phone, MapPin, ArrowRight, ArrowLeft, KeyRound, Building2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

const step1Schema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }).max(255),
  password: z.string().min(6, { message: "Mínimo 6 caracteres" }).max(100),
});

const step2UserSchema = z.object({
  fullName: z.string().min(2, { message: "Ingresa tu nombre completo" }).max(100),
  phone: z.string().min(8, { message: "Teléfono inválido" }).max(20),
  address: z.string().min(5, { message: "Ingresa tu dirección" }).max(200),
});

const step2CompanySchema = z.object({
  companyName: z.string().min(2, { message: "Ingresa el nombre de la empresa" }).max(150),
  phone: z.string().min(8, { message: "Teléfono inválido" }).max(20),
  description: z.string().max(500).optional().or(z.literal("")),
});

const getRedirectUrl = (path: string) => {
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const base = isLocal
    ? `${window.location.protocol}//${window.location.host}`
    : "https://proyecto-web-reciclaje-7g6q.vercel.app";
  return `${base}${path}`;
};

type Mode = "signin" | "signup" | "reset";
type AccountType = "user" | "company";

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>("user");
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Datos usuario
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Datos empresa
  const [companyName, setCompanyName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [description, setDescription] = useState("");

  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/profile", { replace: true });
  }, [user, loading, navigate]);

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

    let metadata: Record<string, string> = {};

    if (accountType === "user") {
      const parsed = step2UserSchema.safeParse({ fullName, phone, address });
      if (!parsed.success) {
        toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
        return;
      }
      metadata = { account_type: "user", full_name: fullName, phone, address };
    } else {
      const parsed = step2CompanySchema.safeParse({ companyName, phone: companyPhone, description });
      if (!parsed.success) {
        toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
        return;
      }
      metadata = {
        account_type: "company",
        company_name: companyName,
        phone: companyPhone,
        description: description || "",
      };
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: getRedirectUrl("/"),
          data: metadata,
        },
      });
      if (error) throw error;
      toast({
        title: accountType === "company" ? "¡Empresa registrada!" : "¡Cuenta creada!",
        description: "Revisa tu email para confirmar tu cuenta.",
      });
      setStep(1); setMode("signin");
      setEmail(""); setPassword(""); setFullName(""); setPhone(""); setAddress("");
      setCompanyName(""); setCompanyPhone(""); setDescription("");
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      const low = msg.toLowerCase();
      if (low.includes("already registered") || low.includes("email already exists")) {
        msg = "Ya existe una cuenta con este correo. Intenta iniciar sesión.";
      }
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = step1Schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Datos inválidos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/profile", { replace: true });
    } catch (err) {
      let msg = err instanceof Error ? err.message : String(err);
      const low = msg.toLowerCase();
      if (low.includes("invalid login credentials")) msg = "Email o contraseña incorrectos.";
      else if (low.includes("email not confirmed")) msg = "Revisa tu correo y confirma tu cuenta antes de ingresar.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getRedirectUrl("/profile"),
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (err) {
      toast({ title: "Error con Google", description: err instanceof Error ? err.message : "Error desconocido", variant: "destructive" });
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast({ title: "Ingresa tu email", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: getRedirectUrl("/reset-password"),
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "No se pudo enviar el correo.", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStep(1);
    setAccountType("user");
    setEmail(""); setPassword(""); setFullName(""); setPhone(""); setAddress("");
    setCompanyName(""); setCompanyPhone(""); setDescription("");
    setResetEmail(""); setResetSent(false);
  };

  const GoogleButton = () => (
    <>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">o continúa con</span>
        </div>
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={isLoading}>
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </Button>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <Recycle className="w-8 h-8 text-primary" />
          <h1 className="font-display text-3xl font-black italic text-gradient-eco">GeoRecicla</h1>
        </Link>

        <Card className="p-6 shadow-lg overflow-hidden">
          <div className="mb-6">
            {((mode === "signup" && step === 2) || mode === "reset") && (
              <button type="button" onClick={() => mode === "reset" ? switchMode("signin") : setStep(1)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
            )}
            <h2 className="text-2xl font-display font-bold text-center">
              {mode === "signin" ? "Iniciar sesión"
                : mode === "reset" ? "Recuperar contraseña"
                : step === 1 ? "Crear cuenta" : accountType === "company" ? "Datos de tu empresa" : "Tu información"}
            </h2>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {mode === "signin" ? "Bienvenido de vuelta"
                : mode === "reset" ? "Te enviaremos un enlace a tu correo"
                : step === 1 ? "Paso 1 de 2 — Acceso" : "Paso 2 de 2 — Información"}
            </p>
            {mode === "signup" && (
              <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full bg-primary rounded-full"
                  initial={{ width: "50%" }} animate={{ width: step === 1 ? "50%" : "100%" }} transition={{ duration: 0.3 }} />
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {/* SIGNIN */}
            {mode === "signin" && (
              <motion.form key="signin" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="tu@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <button type="button" onClick={() => switchMode("reset")}
                      className="text-xs text-primary hover:underline flex items-center gap-1">
                      <KeyRound className="w-3 h-3" /> ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••" required minLength={6} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
                </Button>
                <GoogleButton />
              </motion.form>
            )}

            {/* RESET PASSWORD */}
            {mode === "reset" && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {resetSent ? (
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Correo enviado</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Revisa tu bandeja de entrada en <strong>{resetEmail}</strong> y sigue el enlace para crear una nueva contraseña.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">¿No llegó? Revisa tu carpeta de spam.</p>
                    <Button variant="outline" className="w-full" onClick={() => switchMode("signin")}>
                      Volver al inicio de sesión
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Tu email registrado</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="resetEmail" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-9" placeholder="tu@email.com" required />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar enlace de recuperación"}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}

            {/* SIGNUP STEP 1 */}
            {mode === "signup" && step === 1 && (
              <motion.form key="signup-step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onSubmit={handleStep1} className="space-y-4">

                {/* Selector de tipo de cuenta */}
                <Tabs value={accountType} onValueChange={(v) => setAccountType(v as AccountType)} className="mb-2">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="user" className="gap-2">
                      <User className="w-4 h-4" /> Usuario
                    </TabsTrigger>
                    <TabsTrigger value="company" className="gap-2">
                      <Building2 className="w-4 h-4" /> Empresa
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="user" className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Crea una cuenta personal para encontrar puntos limpios y aportar a la comunidad.
                    </p>
                  </TabsContent>
                  <TabsContent value="company" className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Crea una cuenta empresarial para administrar y publicar tus propios puntos verdes.
                    </p>
                  </TabsContent>
                </Tabs>

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
                <GoogleButton />
              </motion.form>
            )}

            {/* SIGNUP STEP 2 — USUARIO */}
            {mode === "signup" && step === 2 && accountType === "user" && (
              <motion.form key="signup-step2-user" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup} className="space-y-4">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear cuenta"}
                </Button>
              </motion.form>
            )}

            {/* SIGNUP STEP 2 — EMPRESA */}
            {mode === "signup" && step === 2 && accountType === "company" && (
              <motion.form key="signup-step2-company" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la empresa</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="pl-9" placeholder="EcoVerde SpA" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Teléfono de contacto</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="companyPhone" type="tel" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="pl-9" placeholder="+56 9 XXXX XXXX" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción (opcional)</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="pl-9" placeholder="A qué se dedica tu empresa" rows={3} />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrar empresa"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {mode !== "reset" && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {mode === "signin" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
                className="text-primary font-semibold hover:underline">
                {mode === "signin" ? "Regístrate" : "Inicia sesión"}
              </button>
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;