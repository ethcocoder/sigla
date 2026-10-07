import { useEffect, useState } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { subscribeCurrentProfile, getCurrentProfile } from "@/lib/backend/profile";
import { firebaseAuth, firestore, onAuthStateChanged } from "@/lib/firebase";
import type { UserProfile } from "@/types/domain";

type AppUser = {
  id: string;
  email: string | null;
  user_metadata: { name?: string; phone?: string };
};
type FirebaseSession = { user: AppUser };

export function useFirebaseAuth() {
  const [session, setSession] = useState<FirebaseSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    let stopProfile: (() => void) | undefined;

    const stopAuth = onAuthStateChanged(firebaseAuth, (user) => {
      stopProfile?.();
      stopProfile = undefined;
      if (!mounted) return;

      const appUser = user
        ? {
            id: user.uid,
            email: user.email,
            user_metadata: {
              name: user.displayName ?? undefined,
              phone: user.phoneNumber ?? undefined,
            },
          }
        : null;
      setSession(appUser ? { user: appUser } : null);
      setLoading(false);

      if (!appUser) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);
      void getCurrentProfile(appUser.id)
        .then(async (existingProfile) => {
          if (existingProfile) return;
          await setDoc(
            doc(firestore, "users", appUser.id),
            {
              name: appUser.user_metadata.name ?? "SIGLA member",
              phone: appUser.user_metadata.phone ?? "",
              role: "USER",
              status: "REGISTERED",
              updatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        })
        .then(() => {
          if (!mounted) return;
          stopProfile = subscribeCurrentProfile(
            appUser.id,
            (nextProfile) => {
              if (!mounted) return;
              setProfile(nextProfile);
              setProfileLoading(false);
            },
            () => {
              if (!mounted) return;
              setProfile(null);
              setProfileLoading(false);
            },
          );
        })
        .catch(() => {
          if (!mounted) return;
          setProfile(null);
          setProfileLoading(false);
        });
    });

    return () => {
      mounted = false;
      stopProfile?.();
      stopAuth();
    };
  }, []);

  return {
    session,
    profile,
    isAdmin: profile?.role === "ADMIN" && profile.status === "ACTIVE",
    loading,
    profileLoading,
  };
}
