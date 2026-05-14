import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, LogOut, Save, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import AppHeader from "@/components/AppHeader";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  // Simulados - en una aplicación real, vendrían de la base de datos
  const [profileData, setProfileData] = useState({
    fullName: "",
    bio: "Amante del reciclaje y la sostenibilidad",
    location: "Buin, Región Metropolitana",
    phone: "+56 9 XXXX XXXX",
  });

  const [formData, setFormData] = useState(profileData);

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }

    const userMetadata = user.user_metadata || {};
    const nextProfile = {
      fullName: (userMetadata.full_name as string) || "",
      bio: (userMetadata.bio as string) || "Amante del reciclaje y la sostenibilidad",
      location: (userMetadata.location as string) || "Buin, Región Metropolitana",
      phone: (userMetadata.phone as string) || "+56 9 XXXX XXXX",
    };

    setProfileData(nextProfile);
    setFormData(nextProfile);
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0].toUpperCase())
      .join("")
      .slice(0, 2);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          bio: formData.bio,
          location: formData.location,
          phone: formData.phone,
        },
      });

      if (error) {
        throw error;
      }

      setProfileData(formData);
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Tus cambios se guardaron correctamente.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        title: "Error",
        description: errorMessage || "No se pudo guardar tu perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Botón volver */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Encabezado del perfil */}
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} />
                  <AvatarFallback className="text-lg">{getInitials(user.email || "")}</AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors shadow-lg">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Información básica */}
              <div className="flex-1">
                <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                  {profileData.fullName || "Mi Perfil"}
                </h1>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                <p className="text-sm text-foreground mb-4">{profileData.bio}</p>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Editar Perfil
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleSignOut}
                        className="gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Fecha de registro */}
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Miembro desde</p>
                <p className="font-semibold text-foreground">
                  {new Date(user.created_at || "").toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Información de contacto y ubicación */}
          <Card className="p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Información de Contacto</h2>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nombre Completo
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Tu nombre completo"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Descripción / Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Cuéntanos sobre ti..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Ubicación
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Tu ciudad, región"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+56 9 XXXX XXXX"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                  <p className="font-medium text-foreground">{profileData.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                  <p className="font-medium text-foreground">{profileData.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Estado</p>
                  <p className="font-medium text-foreground text-green-600">Activo</p>
                </div>
              </div>
            )}
          </Card>

          {/* Estadísticas */}
          <Card className="p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Mis Estadísticas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground mt-1">Puntos Reciclados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground mt-1">Kg Reciclados</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground mt-1">Contribuciones</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-xs text-muted-foreground mt-1">Logros</p>
              </div>
            </div>
          </Card>

          {/* Información adicional */}
          <Card className="p-6">
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Mi Actividad</h2>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">Aún no tienes actividad registrada</p>
              <p className="text-xs text-muted-foreground">
                Comienza a reciclar y tus puntos aparecerán aquí
              </p>
            </div>
          </Card>

          {/* Botón cerrar sesión adicional */}
          {isEditing ? null : (
            <div className="text-center pt-4">
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
