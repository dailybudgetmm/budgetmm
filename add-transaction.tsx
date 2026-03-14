import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

const CURRENCIES = ["MMK", "USD", "THB", "SGD", "MYR", "KRW", "JPY", "TWD", "SAR", "AED"];

export default function AddTransaction() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { mutate: createTx, isPending } = useCreateTransaction();
  const { data: categories, isLoading: loadingCats } = useCategories();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(user?.defaultCurrency || "MMK");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !amount || !categoryId) return;

    createTx({
      userId: user.id,
      amount: amount,
      currency,
      categoryId,
      description,
      type
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Record added successfully" });
        setLocation("/dashboard");
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (loadingCats) return <Loader />;

  const filteredCats = categories?.filter(c => c.type === type) || [];

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("addRecordTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("trackNew")}</p>
      </div>

      <div className="glass p-6 sm:p-8 rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => { setType("expense"); setCategoryId(null); }}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-semibold transition-all",
                type === "expense"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-expense-type"
            >
              💸 {t("expense")}
            </button>
            <button
              type="button"
              onClick={() => { setType("income"); setCategoryId(null); }}
              className={cn(
                "py-3 px-4 rounded-lg text-sm font-semibold transition-all",
                type === "income"
                  ? "bg-green-500 text-white shadow-md shadow-green-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="button-income-type"
            >
              💰 {t("income")}
            </button>
          </div>

          {/* Amount + Currency */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("amount")}</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="text-lg bg-background/50 h-13 flex-1 font-display"
                data-testid="input-amount"
              />
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-[100px] h-13 bg-background/50 border border-input rounded-md px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                data-testid="select-currency"
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category grid */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("category")}</Label>
            {filteredCats.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">{t("noCategories")}</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filteredCats.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    data-testid={`button-category-${cat.id}`}
                    className={cn(
                      "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
                      categoryId === cat.id
                        ? type === "expense"
                          ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
                          : "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-transparent bg-muted/40 hover:bg-muted/60 text-foreground"
                    )}
                  >
                    <span className="text-2xl leading-none">{cat.icon}</span>
                    <span className="text-xs font-medium leading-tight line-clamp-2">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("description")} <span className="text-muted-foreground font-normal">({t("optional")})</span>
            </Label>
            <Input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              className="bg-background/50 h-11"
              data-testid="input-description"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !categoryId || !amount}
            className={cn(
              "w-full h-12 text-base font-semibold rounded-xl shadow-lg transition-all",
              type === "expense"
                ? "bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white"
                : "bg-green-500 hover:bg-green-600 shadow-green-500/20 text-white"
            )}
            data-testid="button-save-transaction"
          >
            {isPending ? t("saving") : type === 'expense' ? t("saveExpense") : t("saveIncome")}
          </Button>
        </form>
      </div>
    </div>
  );
}
