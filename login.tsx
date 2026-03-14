import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import logo from "@assets/IMG_5473_1773176683690.png";

export default function Login() {
  const { login, user, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading) setLocation("/dashboard");
  }, [user, isLoading, setLocation]);

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast({ title: "Sign-in failed", description: message, variant: "destructive" });
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="glass p-8 sm:p-10 rounded-[2rem] max-w-md w-full text-center space-y-7 shadow-2xl shadow-primary/10">
        <div className="flex flex-col items-center gap-3">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-2xl shadow-lg" />
          <div>
            <h2 className="text-3xl font-display font-bold">Welcome Back</h2>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to My Daily Budget</p>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          size="lg"
          className="w-full rounded-xl bg-white text-gray-800 hover:bg-gray-50 border border-gray-200 shadow h-13 text-base font-medium transition-all hover:-translate-y-0.5 active:scale-95"
          data-testid="button-google-login"
        >
          <svg className="w-5 h-5 mr-3 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
