import { useAuth } from "@/hooks/use-auth";
import { useUpdateUser } from "@/hooks/use-users";
import { useTransactions } from "@/hooks/use-transactions";
import { useLanguage } from "@/hooks/use-language";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { Languages, Moon, Bell, Download, LogOut } from "lucide-react";
import { format } from "date-fns";

const CURRENCIES = ["MMK", "USD", "THB", "SGD", "MYR", "KRW", "JPY", "TWD", "SAR", "AED"];

export default function Profile() {
  const { user, logout } = useAuth();
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { data: transactions } = useTransactions();
  const { toast } = useToast();
  const { lang, setLang, t } = useLanguage();
  const [currency, setCurrency] = useState(user?.defaultCurrency || "MMK");
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem("notifications-enabled");
    if (stored !== null) return stored === "true";
    if (typeof Notification !== "undefined") return Notification.permission === "granted";
    return false;
  });

  const handleSave = () => {
    if (!user) return;
    updateUser({ id: user.id, defaultCurrency: currency }, {
      onSuccess: () => toast({ title: "Success", description: "Profile updated successfully." }),
      onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });
  };

  const handleNotificationToggle = async () => {
    if (typeof Notification === "undefined") {
      toast({ description: "Notifications not supported in this browser", variant: "destructive" });
      return;
    }
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem("notifications-enabled", "false");
      toast({ description: "Notifications disabled" });
      return;
    }
    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast({ description: "Permission denied. Enable in browser settings.", variant: "destructive" });
        return;
      }
    }
    setNotificationsEnabled(true);
    localStorage.setItem("notifications-enabled", "true");
    toast({ description: "Notifications enabled" });
  };

  const handleExportAll = () => {
    if (!transactions || transactions.length === 0) {
      toast({ description: "No transactions to export" });
      return;
    }
    const headers = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
    const csvRows = transactions.map(t => [
      format(new Date(t.date), "yyyy-MM-dd"),
      t.type,
      t.category?.name || "Unknown",
      `"${(t.description || "").replace(/"/g, '""')}"`,
      Number(t.amount),
      t.currency,
    ]);
    const csv = [headers.join(","), ...csvRows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-daily-budget-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ description: `Exported ${transactions.length} transactions as CSV` });
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300 pb-24 md:pb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("profile")}</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences</p>
      </div>

      <div className="glass p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex items-center gap-5 pb-5 border-b border-border/50">
          <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="Avatar" className="w-16 h-16 rounded-2xl shadow-lg object-cover" />
          <div>
            <h2 className="text-xl font-bold">{user.displayName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="mt-1 inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary uppercase">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Default Currency</Label>
            <p className="text-xs text-muted-foreground mb-1">Used as the primary currency for your dashboard and reports.</p>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-11 bg-background/50 max-w-[200px]" data-testid="select-currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Languages className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Language</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "English" : "မြန်မာ"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLang(lang === "en" ? "my" : "en")} className="rounded-xl h-9 px-4" data-testid="button-toggle-language">
              {lang === "en" ? "မြန်မာ" : "English"}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Moon className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle light/dark theme</p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">{notificationsEnabled ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleNotificationToggle} className="rounded-xl h-9 px-4" data-testid="button-toggle-notifications">
              {notificationsEnabled ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Download className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Export Data</p>
                <p className="text-xs text-muted-foreground">CSV, Excel, or PDF</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleExportAll} className="rounded-xl h-9 px-4" data-testid="button-export-data">
              Export
            </Button>
          </div>

          <Button onClick={handleSave} disabled={isPending} className="w-full mt-2 bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-semibold" data-testid="button-save-settings">
            {isPending ? "Saving..." : "Save Settings"}
          </Button>

          <Button variant="outline" onClick={logout} className="w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl h-11" data-testid="button-logout">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
