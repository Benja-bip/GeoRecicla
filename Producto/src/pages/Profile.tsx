import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut, ArrowLeft, Save, Edit2, X,
  Mail, Phone, MapPin, CheckCircle2, XCircle,
  Recycle, Trophy, Star, Package, Leaf,
  Clock, ChevronRight, Building2, FileText, LayoutDashboard, Plus,
  Trash2, Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AppHeader from "@/components/AppHeader";

const RECYCLING_HISTORY = [
  { id: 1, type: "Plástico", amount: "2.5 kg", points: 25, date: "2025-05-20", icon: "♻️" },
  { id: 2, type: "Vidrio", amount: "1.8 kg", points: 18, date: "2025-05-15", icon: "🫙" },
  { id: 3, type: "Papel", amount: "3.2 kg", points: 16, date: "2025-05-10", icon: "📄" },
  { id: 4, type: "Metal", amount: "0.9 kg", points: 27, date: "2025-05-05", icon: "🥫" },
  { id: 5, type: "Electrónicos", amount: "1 unidad", points: 50, date: "2025-04-28", icon: "📱" },
];

const TOTAL_POINTS = RECYCLING_HISTORY.reduce((acc, r) => acc + r.points, 0);
const TOTAL_KG = RECYCLING_HISTORY.reduce((acc, r) => {
  const n = parseFloat(r.amount);
  return isNaN(n) ? acc : acc + n;
}, 0);

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, isCompany } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline] = useState(true);

  const [profileData, setProfileData] = useState({ fullName: "", phone: "", address: "" });
  const [formData, setFormData] = useState({ fullName: "", phone: "", address: "" });

  const [companyData, setCompanyData] = useState({ companyName: "", phone: "", description: "" });
  const [companyForm, setCompanyForm] = useState({ companyName: "", phone: "", description: "" });

  const [pointCount, setPointCount] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<any[]>([]);
  const [loadingUserPoints, setLoadingUserPoints] = useState(true);

  const loading = authLoading || profileLoading;

  // ── Efecto principal: redirige si no hay usuario, carga datos de perfil ──
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    if (isCompany) {
      const next = {
        companyName: profile?.company_name || "",
        phone: profile?.phone || "",
        description: profile?.description || "",
      };
      setCompanyData(next);
      setCompanyForm(next);

      supabase
        .from("recycling_points")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .then(({ count }) => setPointCount(count ?? 0));
    } else {
      const meta = user.user_metadata || {};
      const next = {
        fullName: profile?.full_name || (meta.full_name as string) || "",
        phone: profile?.phone || (meta.phone as string) || "",
        address: profile?.address || (meta.address as string) || "",
      };
      setProfileData(next);
      setFormData(next);
    }
  }, [user, loading, isCompany, profile, navigate]);

  // ── Carga puntos del usuario normal ──
  useEffect(() => {
    if (!loading && user && !isCompany) loadUserPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isCompany]);

  // ── TODOS los hooks están arriba — recién aquí los returns condicionales ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  // ── Helpers ──
  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      return name.trim().split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    }
    return email.split("@")[0].slice(0, 2).toUpperCase();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: formData.fullName, phone: formData.phone, address: formData.address },
      });
      if (error) throw error;

      await supabase.from("profiles").update({
        full_name: formData.fullName,
        phone: formData.phone,
        address: formData.address,
      }).eq("id", user.id);

      setProfileData(formData);
      setIsEditing(false);
      toast.success("Perfil actualizado correctamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          company_name: companyForm.companyName,
          phone: companyForm.phone,
          description: companyForm.description,
        },
      });
      if (error) throw error;

      await supabase.from("profiles").update({
        company_name: companyForm.companyName,
        phone: companyForm.phone,
        description: companyForm.description,
      }).eq("id", user.id);

      setCompanyData(companyForm);
      setIsEditing(false);
      toast.success("Datos de empresa actualizados correctamente.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadUserPoints = async () => {
    if (!user) return;
    setLoadingUserPoints(true);
    const { data, error } = await supabase
      .from("recycling_points")
      .select("*")
      .eq("user_id", user.id)
      .eq("owner_type", "user")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setUserPoints((data as any[]) ?? []);
    setLoadingUserPoints(false);
  };

  const handleDeleteUserPoint = async (id: string) => {
    if (!confirm("¿Eliminar este punto?")) return;
    const { error } = await supabase.from("recycling_points").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Punto eliminado correctamente.");
      setUserPoints((p) => p.filter((x) => x.id !== id));
      setPointCount((c) => (c !== null ? c - 1 : c));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  const memberSince = new Date(user.created_at || "").toLocaleDateString("es-ES", {
    year: "numeric", month: "long", day: "numeric",
  });

  const avatarSeed = user.email || user.id;

  // ============================
  //  PERFIL DE EMPRESA
  // ============================
  if (isCompany) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </motion.button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 via-card to-card border-blue-500/20">
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-blue-500/15 border-2 border-blue-500/30 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-display font-bold truncate">
                      {companyData.companyName || "Mi empresa"}
                    </h1>
                    <Badge className="bg-blue-500/15 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                      <Building2 className="w-3 h-3 mr-1" /> Empresa
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {isOnline ? (
                      <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs font-medium text-green-600">Activo</span></>
                    ) : (
                      <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-xs font-medium text-muted-foreground">Desconectado</span></>
                    )}
                    <span className="text-muted-foreground mx-1">·</span>
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Registrada desde {memberSince}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
                        <Edit2 className="w-3.5 h-3.5" /> Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
                        <LogOut className="w-3.5 h-3.5" /> Salir
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" onClick={handleSaveCompany} disabled={isSaving} className="gap-1.5">
                        <Save className="w-3.5 h-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setCompanyForm(companyData); setIsEditing(false); }} className="gap-1.5">
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>

            <Link to="/empresa">
              <Card className="p-4 hover:shadow-eco transition-shadow border-blue-500/20 hover:border-blue-500/40">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">Panel de empresa</h3>
                    <p className="text-xs text-muted-foreground">Administra y publica tus puntos verdes</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>

            <Card className="p-6">
              <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Información de la empresa
              </h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="companyName">Nombre de la empresa</Label>
                    <Input id="companyName" name="companyName" value={companyForm.companyName} onChange={handleCompanyInputChange} placeholder="EcoVerde SpA" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Teléfono de contacto</Label>
                    <Input id="phone" name="phone" value={companyForm.phone} onChange={handleCompanyInputChange} placeholder="+56 9 XXXX XXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" name="description" value={companyForm.description} onChange={handleCompanyInputChange} placeholder="A qué se dedica tu empresa" rows={3} />
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email || "—"} />
                  <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={companyData.phone || "No registrado"} />
                  <InfoRow
                    icon={isOnline ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                    label="Estado" value={isOnline ? "Activo" : "Desconectado"}
                    valueClass={isOnline ? "text-green-600 font-semibold" : "text-muted-foreground"}
                  />
                  {companyData.description && (
                    <div className="sm:col-span-2 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Descripción</p>
                        <p className="text-sm font-medium">{companyData.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Resumen
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <StatCard icon={<Recycle className="w-5 h-5 text-blue-500" />} value={pointCount ?? "—"} label="Puntos verdes publicados" color="bg-blue-500/10" />
                <StatCard icon={<MapPin className="w-5 h-5 text-green-500" />} value="Visible" label="Estado en el mapa" color="bg-green-500/10" />
                <StatCard icon={<Star className="w-5 h-5 text-yellow-500" />} value="Verificada" label="Cuenta empresa" color="bg-yellow-500/10" />
              </div>
              <div className="mt-5">
                <Link to="/empresa">
                  <Button className="w-full gap-2">
                    <Plus className="w-4 h-4" /> Publicar nuevo punto verde
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // ============================
  //  PERFIL DE USUARIO NORMAL
  // ============================
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.button
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <div className="relative shrink-0">
                <Avatar className="w-20 h-20 ring-2 ring-primary/30">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} />
                  <AvatarFallback className="text-lg font-bold">
                    {getInitials(profileData.fullName, user.email || "")}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-card ${isOnline ? "bg-green-500" : "bg-gray-400"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-display font-bold truncate">
                  {profileData.fullName || user.user_metadata?.name || "Sin nombre"}
                </h1>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  {isOnline ? (
                    <><CheckCircle2 className="w-4 h-4 text-green-500" /><span className="text-xs font-medium text-green-600">Activo</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-gray-400" /><span className="text-xs font-medium text-muted-foreground">Desconectado</span></>
                  )}
                  <span className="text-muted-foreground mx-1">·</span>
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Miembro desde {memberSince}</span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {!isEditing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-1.5">
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleSignOut} className="gap-1.5">
                      <LogOut className="w-3.5 h-3.5" /> Salir
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
                      <Save className="w-3.5 h-3.5" /> {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setFormData(profileData); setIsEditing(false); }} className="gap-1.5">
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Información de contacto
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Tu nombre completo" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+56 9 XXXX XXXX" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="address">Dirección</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} placeholder="Tu ciudad o dirección" />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email || "—"} />
                <InfoRow icon={<Phone className="w-4 h-4" />} label="Teléfono" value={profileData.phone || "No registrado"} />
                <InfoRow icon={<MapPin className="w-4 h-4" />} label="Dirección" value={profileData.address || "No registrada"} />
                <InfoRow
                  icon={isOnline ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                  label="Estado" value={isOnline ? "Activo" : "Desconectado"}
                  valueClass={isOnline ? "text-green-600 font-semibold" : "text-muted-foreground"}
                />
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Mis estadísticas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={<Star className="w-5 h-5 text-yellow-500" />} value={TOTAL_POINTS} label="Puntos totales" color="bg-yellow-500/10" />
              <StatCard icon={<Recycle className="w-5 h-5 text-green-500" />} value={`${TOTAL_KG.toFixed(1)} kg`} label="Kg reciclados" color="bg-green-500/10" />
              <StatCard icon={<Package className="w-5 h-5 text-blue-500" />} value={RECYCLING_HISTORY.length} label="Entregas" color="bg-blue-500/10" />
              <StatCard icon={<Leaf className="w-5 h-5 text-emerald-500" />} value="Bronce" label="Nivel actual" color="bg-emerald-500/10" />
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progreso a Plata</span>
                <span>{TOTAL_POINTS} / 200 pts</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((TOTAL_POINTS / 200) * 100, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-display font-bold mb-4 flex items-center gap-2">
              <Recycle className="w-4 h-4 text-primary" /> Historial de reciclaje
            </h2>
            {RECYCLING_HISTORY.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">Aún no tienes entregas registradas.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {RECYCLING_HISTORY.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/70 transition-colors"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.amount} · {new Date(item.date).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-bold text-sm shrink-0">
                      <Star className="w-3.5 h-3.5" />{item.points} pts
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-display font-bold flex items-center gap-2">
                <Recycle className="w-4 h-4 text-primary" /> Mis puntos agregados
              </h2>
              <Badge>{userPoints.length}</Badge>
            </div>

            {loadingUserPoints ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : userPoints.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aún no has agregado puntos al mapa.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {userPoints.map((p) => (
                  <div key={p.id} className="p-4 rounded-lg bg-secondary flex gap-4 items-center">
                    <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                      {p.photo_url ? (
                        <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Recycle className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                      {p.address && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />{p.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(Array.isArray(p.materials) ? p.materials : []).map((m: string) => (
                          <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUserPoint(p.id)} aria-label="Eliminar">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

const InfoRow = ({ icon, label, value, valueClass = "" }: { icon: React.ReactNode; label: string; value: string; valueClass?: string }) => (
  <div className="flex items-start gap-2">
    <span className="text-muted-foreground mt-0.5">{icon}</span>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  </div>
);

const StatCard = ({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) => (
  <div className={`rounded-xl p-3 ${color} flex flex-col items-center text-center gap-1`}>
    {icon}
    <p className="text-lg font-bold leading-none">{value}</p>
    <p className="text-xs text-muted-foreground leading-tight">{label}</p>
  </div>
);

export default Profile;