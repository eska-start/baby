import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

function getFirebaseApp() {
  const missing = Object.entries(config).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    throw new Error(`Firebase env 누락: ${missing.join(", ")}. .env.local 또는 배포 환경변수를 확인하세요.`);
  }
  return getApps().length ? getApp() : initializeApp(config);
}

// Lazy Proxy — safe to import in SSR/build; initializes only when accessed in browser
export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_, prop) { return Reflect.get(getAuth(getFirebaseApp()), prop); },
});
export const provider = new GoogleAuthProvider();
export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_, prop) { return Reflect.get(getFirestore(getFirebaseApp()), prop); },
});
