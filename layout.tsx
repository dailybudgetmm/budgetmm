import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import {
  Menu, LogOut, Wallet, LayoutDashboard, History, PieChart,
  User as UserIcon, ShieldAlert, Plus, Languages, Mail,
  PiggyBank, Target, RefreshCw, Zap, X, Grid3X3, WifiOff
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "./theme-toggle";
import { SiFacebook, SiTelegram } from "react-icons/si";
import { QuickAddDialog } from "./quick-add-dialog";
import logo from "@assets/IMG_5473_1773176683690.png";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users",     href: "/admin/users" },
  { label: "Expenses",  href: "/admin/expenses" },
  { label: "Categories",href: "/admin/categories" },
  { label: "Messages",  href: "/admin/messages" },
  { label: "Settings",  href: "/admin/settings" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [location] = useLocation();
  const [quickAdd, setQuickAdd] = useState(false);
  const isAdminSection = location.startsWith("/admin");

  const navItems = user
    ? [
        { label: t("dashboard"), href: "/dashboard",  icon: LayoutDashboard },
        { label: t("history"),   href: "/history",    icon: History },
        { label: t("reports"),   href: "/reports",    icon: PieChart },
        { label: t("budgets"),   href: "/budgets",    icon: Target },
        { label: "Savings",      href: "/savings",    icon: PiggyBank },
        { label: "Recurring",    href: "/recurring",  icon: RefreshCw },
        { label: "Categories",   href: "/categories", icon: Grid3X3 },
        { label: t("profile"),   href: "/profile",    icon: UserIcon },
      ]
    : [
        { label: "Home",    href: "/",        icon: Wallet },
        { label: "Contact", href: "/contact", icon: UserIcon },
      ];

  if (user?.role === "admin") {
    navItems.push({ label: t("admin"), href: "/admin/dashboard", icon: ShieldAlert });
  }

  const toggleLang = () => setLang(lang === "en" ? "my" : "en");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  const isProtected = !!user && ["/dashboard","/history","/reports","/budgets","/savings","/recurring","/categories","/add","/profile"].some(p => location === p || location.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 glass-panel border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group shrink-0">
            <img src={logo} alt="My Daily Budget" className="h-8 w-8 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300" />
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">My Daily Budget</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5 flex-1 justify-center">
            {navItems.slice(0, 6).map(item => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  <item.icon className="w-3.5 h-3.5" /> {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={toggleLang} className="hidden md:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2" data-testid="button-language-toggle">
              <Languages className="w-4 h-4" /> {lang === "en" ? "မြန်မာ" : "EN"}
            </Button>
            <ThemeToggle />
            {user ? (
              <>
                <Button size="sm" className="hidden md:flex bg-gradient-to-r from-primary to-accent text-white rounded-xl shadow-lg shadow-primary/20" onClick={() => setQuickAdd(true)} data-testid="button-quick-add-header">
                  <Zap className="w-4 h-4 mr-1" /> Quick Add
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} className="hidden md:flex text-muted-foreground hover:text-red-500" title={t("logout")}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Link href="/login" className="hidden md:inline-flex">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">
                  {t("signIn")}
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" data-testid="button-mobile-menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="glass w-[280px] overflow-y-auto">
                <div className="flex flex-col gap-1.5 mt-8">
                  {navItems.map(item => {
                    const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href} className={`flex items-center gap-3 p-3 rounded-xl text-base font-medium transition-colors ${active ? "bg-primary/10 text-primary" : "hover:bg-white/10"}`}>
                        <item.icon className="w-5 h-5" /> {item.label}
                      </Link>
                    );
                  })}
                  {user && (
                    <button onClick={() => setQuickAdd(true)} className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 text-primary text-base font-medium">
                      <Zap className="w-5 h-5" /> Quick Add
                    </button>
                  )}
                  <button onClick={toggleLang} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-left w-full text-base font-medium">
                    <Languages className="w-5 h-5 text-primary" />
                    {lang === "en" ? "မြန်မာ ဘာသာ" : "Switch to English"}
                  </button>
                  {user ? (
                    <Button variant="destructive" onClick={logout} className="w-full mt-2 gap-2">
                      <LogOut className="w-4 h-4" /> {t("logout")}
                    </Button>
                  ) : (
                    <Link href="/login" className="w-full">
                      <Button className="w-full bg-gradient-to-r from-primary to-accent">{t("signIn")}</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2" data-testid="banner-offline">
          <WifiOff className="w-4 h-4" /> You're offline. Some features may be unavailable.
        </div>
      )}

      {/* Admin sub-nav */}
      {isAdminSection && user?.role === "admin" && (
        <div className="border-b bg-muted/50 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2">
            <span className="text-xs text-muted-foreground font-medium mr-2 shrink-0 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Admin:
            </span>
            {ADMIN_NAV.map(item => {
              const active = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button variant={active ? "default" : "ghost"} size="sm" className={`shrink-0 rounded-lg text-xs h-7 ${active ? "bg-primary text-white" : ""}`}>
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>

      {/* ── FLOATING FAB (mobile only, authenticated pages) ── */}
      {isProtected && (
        <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2 md:hidden">
          <button
            onClick={() => setQuickAdd(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            data-testid="button-fab"
            aria-label="Quick add transaction"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="border-t bg-background/80 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
                <span className="font-display font-bold text-base">My Daily Budget</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">Simple, powerful daily budget tracking for everyone.</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Support</p>
              <div className="flex flex-col gap-2.5">
                <a href="https://facebook.com/mydailybudget" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-blue-500 transition-colors group" data-testid="link-facebook">
                  <span className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors"><SiFacebook className="w-3.5 h-3.5 text-blue-500" /></span>
                  Facebook Page
                </a>
                <a href="https://t.me/MyDailyBudget" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-sky-500 transition-colors group" data-testid="link-telegram">
                  <span className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center group-hover:bg-sky-500/20 transition-colors"><SiTelegram className="w-3.5 h-3.5 text-sky-500" /></span>
                  Telegram Support
                </a>
                <a href="mailto:mydailybudgetmm@gmail.com" className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-rose-500 transition-colors group" data-testid="link-email">
                  <span className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors"><Mail className="w-3.5 h-3.5 text-rose-500" /></span>
                  Email Support
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Quick Links</p>
              <div className="flex flex-col gap-2.5">
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Us</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border/40 pt-6 text-center">
            <p className="text-xs text-muted-foreground">My Daily Budget &copy; {new Date().getFullYear()} — All rights reserved.</p>
          </div>
        </div>
      </footer>

      <QuickAddDialog open={quickAdd} onClose={() => setQuickAdd(false)} />
    </div>
  );
}
