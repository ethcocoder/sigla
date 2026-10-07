import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, doc, getFirestore, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithEmailAndPassword, signInWithPopup, createUserWithEmailAndPassword, signOut as firebaseSignOut, updateProfile, type User } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export const firebaseConfig = { apiKey: "AIzaSyCGADNHj1xiQ1sYRSkSK9ejojfR1KKI3tI", authDomain: "sigla-1e1cf.firebaseapp.com", projectId: "sigla-1e1cf", messagingSenderId: "659363204170", appId: "1:659363204170:web:8cdd9ff8a69b95e934eab3", measurementId: "G-HC1DGFEMDL" };
export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
export { onAuthStateChanged, type User };

export async function signOut() {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseAuthentication.signOut();
    } catch {
      // Firebase JS sign-out must still run if the native cache is unavailable.
    }
  }
  await firebaseSignOut(firebaseAuth);
}

export async function signInWithEmail(email: string, password: string) { return signInWithEmailAndPassword(firebaseAuth, email.trim(), password); }

export async function signUpWithEmail(email: string, password: string, name: string, phone = "") {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  const displayName = name.trim();
  if (displayName) await updateProfile(credential.user, { displayName });
  await setDoc(doc(collection(firestore, "users"), credential.user.uid), { name: displayName || "SIGLA member", phone: phone.trim(), role: "USER", status: "REGISTERED", createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
  return credential;
}

export async function signInWithGoogle() {
  // Capacitor serves the Expo web bundle inside the native WebView, so
  // Platform.OS is still "web" on Android/iOS. Check Capacitor first or the
  // browser popup path will always win inside the native app.
  if (!Capacitor.isNativePlatform()) {
    return signInWithPopup(firebaseAuth, googleProvider);
  }

  // Use the native Google Play Services account chooser instead of Credential Manager's
  // one-tap flow. Some Android devices time out inside Credential Manager before the
  // account picker appears. This path remains fully native and does not open Chrome.
  const nativeResult = await FirebaseAuthentication.signInWithGoogle({
    skipNativeAuth: true,
    useCredentialManager: false,
  });
  const idToken = nativeResult.credential?.idToken;
  if (!idToken) throw new Error("Google did not return a native ID token.");
  return signInWithCredential(firebaseAuth, GoogleAuthProvider.credential(idToken));
}
