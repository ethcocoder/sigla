import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getCurrentProfile } from "@/lib/backend/profile";
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/domain";

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async (nextSession: Session | null) => {
      if (!nextSession?.user || !mounted) {
        if (mounted) {
          setProfile(null);
          setProfileLoading(false);
        }
        return;
      }
      setProfileLoading(true);
      try {
        const nextProfile = await getCurrentProfile(nextSession.user.id);
        if (mounted) setProfile(nextProfile);
      } catch {
        if (mounted) setProfile(null);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setLoading(false);
        void loadProfile(data.session);
      }
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      void loadProfile(nextSession);
    });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, isAdmin: profile?.role === "ADMIN" && profile.status === "ACTIVE", loading, profileLoading };
}
