import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import { Zap, Loader2 } from "lucide-react";

interface QuickAddDialogProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddDialog({ open, onClose }: QuickAddDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { mutate: createTx, isPending } = useCreateTransaction();

  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");

  const currency = user?.defaultCurrency || "MMK";
  const filteredCats = categories?.filter(c => c.type === type) || [];

  const reset = () => {
    setAmount("");
    setCategoryId(null);
    setDescription("");
  };

  const handleSave = () => {
    if (!user || !amount || !categoryId) return;
    createTx({
      userId: user.id,
      amount,
      currency,
      categoryId,
      description,
      type,
      date: new Date(),
    }, {
      onSuccess: () => {
        toast({ title: "✅ Added!", description: `${type === 'expense' ? '-' : '+'}${Number(amount).toLocaleString()} ${currency} recorded` });
        reset();
        onClose();
      },
      onError: () => toast({ title: "Error", variant: "destructive" }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm glass border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Quick Add
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(["expense", "income"] as const).map(tp => (
              <button
                key={tp}
                onClick={() => { setType(tp); setCategoryId(null); }}
                className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${type === tp ? (tp === "expense" ? "bg-red-500 text-white" : "bg-green-500 text-white") : "bg-white/10 hover:bg-white/20"}`}
              >
                {tp === "expense" ? "💸 Expense" : "💰 Income"}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <Label>Amount ({currency})</Label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="bg-background/50 h-12 text-xl font-bold mt-1"
              autoFocus
              min="1"
              data-testid="input-quick-amount"
            />
          </div>

          {/* Category grid */}
          <div>
            <Label>Category</Label>
            <div className="grid grid-cols-5 gap-1.5 mt-1 max-h-36 overflow-y-auto">
              {filteredCats.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-xs transition-all ${categoryId === cat.id ? "bg-primary/20 ring-1 ring-primary" : "bg-white/10 hover:bg-white/20"}`}
                  data-testid={`cat-${cat.id}`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="truncate w-full text-center text-[10px] leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <Label>Note (optional)</Label>
            <Input
              placeholder="What was this for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="bg-background/50 mt-1"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={isPending || !amount || !categoryId}
            className="w-full bg-primary text-white h-11 rounded-xl font-medium"
            data-testid="button-quick-save"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 mr-2" /> Save Record</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
