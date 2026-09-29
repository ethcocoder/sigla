import { useEffect, useState } from "react";
import { getCurrentProfile } from "@/lib/backend/profile";
import { firebaseAuth, onAuthStateChanged } from "@/lib/firebase";
import type { UserProfile } from "@/types/domain";
type AppUser = { id: string; email: string | null; user_metadata: { name?: string; phone?: string } };
type FirebaseSession = { user: AppUser };
export function useSupabaseAuth() {
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  useEffect(() => {
    let mounted = true;
    return onAuthStateChanged(firebaseAuth, (user) => {
      if (!mounted) return;
      const appUser = user ? { id: user.uid, email: user.email, user_metadata: { name: user.displayName ?? undefined, phone: user.phoneNumber ?? undefined } } : null;
      setSession(appUser ? { user: appUser } : null);
      setLoading(false);
      if (!appUser) { setProfile(null); setProfileLoading(false); return; }
      setProfileLoading(true);
      void getCurrentProfile(appUser.id).then((nextProfile) => { if (mounted) setProfile(nextProfile); }).catch(() => { if (mounted) setProfile(null); }).finally(() => { if (mounted) setProfileLoading(false); });
    });
  }, []);
  return { session, profile, isAdmin: profile?.role === "ADMIN" && profile.status === "ACTIVE", loading, profileLoading };
}
