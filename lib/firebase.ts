import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCGADnhJ1xiQ1sYRSkSK9ejojfR1KKI3tI",
  authDomain: "sigla-1e1cf.firebaseapp.com",
  projectId: "sigla-1e1cf",
  storageBucket: "sigla-1e1cf.firebasestorage.app",
  messagingSenderId: "659363204170",
  appId: "1:659363204170:web:8cdd9ff8a69b95e934eab3",
  measurementId: "G-HC1DGFEMDL",
};

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged, signOut, type User };

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  if (name.trim()) await updateProfile(credential.user, { displayName: name.trim() });
  return credential;
}

export async function signInWithGoogle() {
  if (Platform.OS === "web") return signInWithPopup(firebaseAuth, googleProvider);
  return signInWithRedirect(firebaseAuth, googleProvider);
}
