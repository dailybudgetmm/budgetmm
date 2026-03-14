import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: projectId ? `${projectId}.firebaseapp.com` : undefined,
  projectId: projectId,
  storageBucket: projectId ? `${projectId}.firebasestorage.app` : undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set reCAPTCHA token for phone auth
auth.settings.appVerificationDisabledForTesting = false;

export const googleProvider = new GoogleAuthProvider();

// Make auth.tenantId accessible if needed
export function setAuthDomain(domain: string) {
  // This is handled automatically by Firebase based on authDomain in config
}
