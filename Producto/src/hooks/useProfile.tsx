import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface Profile {
  id: string;
  account_type: "user" | "company";
  full_name: string | null;
  phone: string | null;
  address: string | null;
  company_name: string | null;
  description: string | null;
}

export const useProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Error cargando perfil:", error.message);
        setProfile(null);
      } else if (!data) {
        // No existe perfil aún -> crear uno por defecto tipo "user"
        const meta = user.user_metadata || {};
        const accountType = (meta.account_type as string) === "company" ? "company" : "user";

        const { data: created, error: insertErr } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            account_type: accountType,
            full_name: meta.full_name ?? meta.name ?? null,
            phone: meta.phone ?? null,
            address: meta.address ?? null,
            company_name: meta.company_name ?? null,
            description: meta.description ?? null,
          })
          .select()
          .single();

        if (insertErr) {
          console.error("Error creando perfil:", insertErr.message);
          setProfile(null);
        } else {
          setProfile(created as Profile);
        }
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    };

    fetchProfile();

    return () => { cancelled = true; };
  }, [user, authLoading]);

  return {
    profile,
    loading,
    isCompany: profile?.account_type === "company",
  };
};
