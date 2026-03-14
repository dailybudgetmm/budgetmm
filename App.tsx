import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LanguageProvider } from "./hooks/use-language";
import { Layout } from "./components/layout";
import { Loader } from "./components/ui/loader";
import { SplashScreen } from "./components/splash-screen";
import { useState } from "react";

// Pages
import Home from "./pages/home";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import AddTransaction from "./pages/add-transaction";
import History from "./pages/history";
import Reports from "./pages/reports";
import Profile from "./pages/profile";
import Budgets from "./pages/budgets";
import Savings from "./pages/savings";
import Recurring from "./pages/recurring";
import Categories from "./pages/categories";
import Contact from "./pages/contact";
import Privacy from "./pages/privacy";
import Terms from "./pages/terms";

// Admin pages
import AdminDashboard from "./pages/admin/dashboard";
import AdminUsers from "./pages/admin/users";
import AdminCategories from "./pages/admin/categories";
import AdminMessages from "./pages/admin/messages";
import AdminSettings from "./pages/admin/settings";
import AdminExpenses from "./pages/admin/expenses";

import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loader />;
  if (!user) return <Redirect to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Redirect to="/dashboard" />;
  return <Component />;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        <Route path="/contact" component={Contact}/>
        <Route path="/privacy" component={Privacy}/>
        <Route path="/terms" component={Terms}/>

        <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
        <Route path="/add"><ProtectedRoute component={AddTransaction} /></Route>
        <Route path="/history"><ProtectedRoute component={History} /></Route>
        <Route path="/reports"><ProtectedRoute component={Reports} /></Route>
        <Route path="/profile"><ProtectedRoute component={Profile} /></Route>
        <Route path="/budgets"><ProtectedRoute component={Budgets} /></Route>
        <Route path="/savings"><ProtectedRoute component={Savings} /></Route>
        <Route path="/recurring"><ProtectedRoute component={Recurring} /></Route>
        <Route path="/categories"><ProtectedRoute component={Categories} /></Route>

        <Route path="/admin/dashboard"><ProtectedRoute component={AdminDashboard} adminOnly /></Route>
        <Route path="/admin/users"><ProtectedRoute component={AdminUsers} adminOnly /></Route>
        <Route path="/admin/categories"><ProtectedRoute component={AdminCategories} adminOnly /></Route>
        <Route path="/admin/messages"><ProtectedRoute component={AdminMessages} adminOnly /></Route>
        <Route path="/admin/settings"><ProtectedRoute component={AdminSettings} adminOnly /></Route>
        <Route path="/admin/expenses"><ProtectedRoute component={AdminExpenses} adminOnly /></Route>

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(() => {
    return sessionStorage.getItem("splash-shown") === "true";
  });

  const handleSplashFinish = () => {
    sessionStorage.setItem("splash-shown", "true");
    setSplashDone(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            {!splashDone && <SplashScreen onFinish={handleSplashFinish} />}
            <Router />
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
