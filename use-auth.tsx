import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { api } from "@shared/routes";
import { User } from "@shared/schema";
import { fetchWithAuth } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          // Sync with backend
          const backendUser = await fetchWithAuth(api.users.sync.path, {
            method: api.users.sync.method,
            body: JSON.stringify({
              firebaseUid: fUser.uid,
              email: fUser.email,
              displayName: fUser.displayName,
              photoURL: fUser.photoURL,
            }),
          });
          setUser(backendUser);
        } catch (error) {
          console.error("Failed to sync user with backend", error);
          toast({
            title: "Authentication Error",
            description: "Could not sync user profile. Missing API?",
            variant: "destructive",
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const login = async () => {
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "You have been logged out successfully." });
    } catch (error: any) {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
