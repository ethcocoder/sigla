import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, doc, getFirestore, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, createUserWithEmailAndPassword, signOut, updateProfile, type User } from "firebase/auth";
import { Platform } from "react-native";

export const firebaseConfig = { apiKey: "AIzaSyCGADNHj1xiQ1sYRSkSK9ejojfR1KKI3tI", authDomain: "sigla-1e1cf.firebaseapp.com", projectId: "sigla-1e1cf", messagingSenderId: "659363204170", appId: "1:659363204170:web:8cdd9ff8a69b95e934eab3", measurementId: "G-HC1DGFEMDL" };
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged, signOut, type User };

export async function signInWithEmail(email: string, password: string) { return signInWithEmailAndPassword(firebaseAuth, email.trim(), password); }

export async function signUpWithEmail(email: string, password: string, name: string, phone = "") {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  const displayName = name.trim();
  if (displayName) await updateProfile(credential.user, { displayName });
  await setDoc(doc(collection(firestore, "users"), credential.user.uid), { name: displayName || "SIGLA member", phone: phone.trim(), role: "USER", status: "REGISTERED", createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  return credential;
}

export async function signInWithGoogle() { if (Platform.OS === "web") return signInWithPopup(firebaseAuth, googleProvider); return signInWithRedirect(firebaseAuth, googleProvider); }
