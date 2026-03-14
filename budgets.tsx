import { useState } from "react";
import { useBudgets, useUpsertBudget, useDeleteBudget } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Plus, Trash2, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { BudgetWithCategory } from "@shared/schema";

export default function Budgets() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { data: budgets, isLoading: budgetsLoading } = useBudgets();
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions();
  const upsertBudget = useUpsertBudget();
  const deleteBudget = useDeleteBudget();

  const currency = user?.defaultCurrency || "MMK";
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const expenseCategories = categories?.filter(c => c.type === "expense") || [];
  const myBudgets = budgets?.filter(b => b.currency === currency) || [];

  const getSpent = (categoryId: number) => {
    return (transactions || [])
      .filter(tx =>
        tx.type === "expense" &&
        tx.currency === currency &&
        tx.categoryId === categoryId &&
        isWithinInterval(new Date(tx.date), { start: monthStart, end: monthEnd })
      )
      .reduce((s, tx) => s + Number(tx.amount), 0);
  };

  const handleSave = async () => {
    if (!categoryId || !amount) return;
    try {
      await upsertBudget.mutateAsync({
        categoryId: Number(categoryId),
        amount: String(amount),
        currency,
        period: "monthly",
      });
      toast({ title: "Budget saved!" });
      setOpen(false);
      setCategoryId("");
      setAmount("");
    } catch {
      toast({ title: "Error saving budget", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    await deleteBudget.mutateAsync(id);
    toast({ title: "Budget removed" });
  };

  const fmt = (n: number) => n.toLocaleString();

  if (budgetsLoading) return <Loader />;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("budgets")}</h1>
          <p className="text-muted-foreground text-sm">Set monthly spending limits per category</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-1.5" /> Set Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md glass border-white/10">
            <DialogHeader>
              <DialogTitle>Set Monthly Budget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Budget Amount ({currency})</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="bg-background/50 h-12 text-lg"
                  min="1"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={upsertBudget.isPending || !categoryId || !amount}
                className="w-full bg-primary text-white h-11 rounded-xl"
              >
                Save Budget
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budget list */}
      {myBudgets.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center space-y-3">
          <div className="text-5xl mb-3">💰</div>
          <h3 className="text-lg font-bold font-display">No Budgets Set</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Set monthly spending limits for your categories to track how well you're staying on budget.
          </p>
          <Button
            onClick={() => setOpen(true)}
            className="bg-primary text-white rounded-xl mt-2"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Set Your First Budget
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myBudgets.map(budget => {
            const spent = getSpent(budget.categoryId);
            const limit = Number(budget.amount);
            const pct = Math.min((spent / limit) * 100, 100);
            const remaining = limit - spent;
            const isWarning = pct >= 80 && pct < 100;
            const isExceeded = pct >= 100;

            return (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spent={spent}
                limit={limit}
                pct={pct}
                remaining={remaining}
                isWarning={isWarning}
                isExceeded={isExceeded}
                currency={currency}
                fmt={fmt}
                onDelete={() => handleDelete(budget.id)}
              />
            );
          })}
        </div>
      )}

      {/* Summary */}
      {myBudgets.length > 0 && (
        <div className="glass rounded-2xl p-5 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Budgeted</p>
            <p className="font-bold font-display text-lg">
              {fmt(myBudgets.reduce((s, b) => s + Number(b.amount), 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
            <p className="font-bold font-display text-lg text-red-500">
              {fmt(myBudgets.reduce((s, b) => s + getSpent(b.categoryId), 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">On Track</p>
            <p className="font-bold font-display text-lg text-green-500">
              {myBudgets.filter(b => getSpent(b.categoryId) < Number(b.amount)).length}/{myBudgets.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetCard({
  budget, spent, limit, pct, remaining, isWarning, isExceeded, currency, fmt, onDelete
}: {
  budget: BudgetWithCategory;
  spent: number; limit: number; pct: number; remaining: number;
  isWarning: boolean; isExceeded: boolean; currency: string;
  fmt: (n: number) => string; onDelete: () => void;
}) {
  const barColor = isExceeded
    ? "bg-red-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-primary";

  const statusIcon = isExceeded
    ? <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
    : isWarning
    ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
    : <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;

  const statusText = isExceeded
    ? "Budget exceeded!"
    : isWarning
    ? "Almost at limit"
    : "On track";

  return (
    <div className={`glass rounded-2xl p-5 space-y-4 border ${
      isExceeded ? "border-red-500/30" : isWarning ? "border-amber-500/30" : "border-white/10"
    }`}>
      {/* Category + Delete */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            isExceeded ? "bg-red-500/10" : isWarning ? "bg-amber-500/10" : "bg-primary/10"
          }`}>
            {budget.category?.icon || "💰"}
          </div>
          <div>
            <p className="font-semibold text-base">{budget.category?.name || "Category"}</p>
            <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Spent: <span className="font-medium text-foreground">{fmt(spent)} {currency}</span></span>
          <span className="text-muted-foreground">{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between text-xs mt-1.5">
          <div className="flex items-center gap-1">
            {statusIcon}
            <span className={`${isExceeded ? "text-red-500" : isWarning ? "text-amber-500" : "text-green-500"}`}>
              {statusText}
            </span>
          </div>
          <span className="text-muted-foreground">
            {remaining >= 0 ? `${fmt(remaining)} left` : `${fmt(Math.abs(remaining))} over`}
          </span>
        </div>
      </div>

      {/* Budget amount */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          Monthly limit
        </div>
        <p className="font-bold font-display text-base">{fmt(limit)} <span className="text-xs font-normal text-muted-foreground">{currency}</span></p>
      </div>
    </div>
  );
}
