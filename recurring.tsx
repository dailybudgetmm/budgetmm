import { useState } from "react";
import { useRecurring, useCreateRecurring, useUpdateRecurring, useDeleteRecurring } from "@/hooks/use-recurring";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw, Play, CheckCircle2 } from "lucide-react";
import { format, addDays, addWeeks, addMonths, addYears } from "date-fns";
import { RecurringWithCategory } from "@shared/schema";

const CURRENCIES = ["MMK","USD","THB","SGD","MYR","KRW","JPY","TWD","SAR","AED"];
const FREQ_LABELS: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
const FREQ_COLORS: Record<string, string> = { daily: 'text-blue-400', weekly: 'text-purple-400', monthly: 'text-primary', yearly: 'text-amber-400' };

function nextDueAfter(current: Date, freq: string): Date {
  if (freq === 'daily') return addDays(current, 1);
  if (freq === 'weekly') return addWeeks(current, 1);
  if (freq === 'monthly') return addMonths(current, 1);
  return addYears(current, 1);
}

export default function Recurring() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: recurring, isLoading } = useRecurring();
  const { data: categories } = useCategories();
  const createRecurring = useCreateRecurring();
  const deleteRecurring = useDeleteRecurring();
  const createTx = useCreateTransaction();

  const currency = user?.defaultCurrency || "MMK";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: 'expense', categoryId: '', amount: '', currency,
    description: '', frequency: 'monthly', nextDue: format(new Date(), 'yyyy-MM-dd')
  });

  const allRecurring = recurring || [];
  const filteredCats = categories?.filter(c => c.type === form.type) || [];

  const handleCreate = async () => {
    if (!form.categoryId || !form.amount) return;
    try {
      await createRecurring.mutateAsync({
        type: form.type,
        categoryId: Number(form.categoryId),
        amount: form.amount,
        currency: form.currency,
        description: form.description,
        frequency: form.frequency,
        nextDue: new Date(form.nextDue),
      });
      toast({ title: 'Recurring transaction created!' });
      setOpen(false);
      setForm({ type: 'expense', categoryId: '', amount: '', currency, description: '', frequency: 'monthly', nextDue: format(new Date(), 'yyyy-MM-dd') });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleLog = async (r: RecurringWithCategory) => {
    if (!user) return;
    try {
      await createTx.mutateAsync({
        userId: user.id,
        type: r.type,
        categoryId: r.categoryId,
        amount: String(r.amount),
        currency: r.currency,
        description: r.description || r.category?.name,
        date: new Date(),
      });
      toast({ title: `Logged: ${r.description || r.category?.name}` });
    } catch {
      toast({ title: 'Error logging transaction', variant: 'destructive' });
    }
  };

  const fmt = (n: number) => n.toLocaleString();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground text-sm">Manage repeating income and expenses</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20" onClick={() => setOpen(true)} data-testid="button-new-recurring">
          <Plus className="w-4 h-4 mr-1.5" /> Add Recurring
        </Button>
      </div>

      {allRecurring.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center space-y-3">
          <div className="text-5xl">🔄</div>
          <h3 className="text-lg font-bold font-display">No Recurring Transactions</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Add recurring income and expenses like salary, rent, Netflix subscriptions, or loan payments.</p>
          <Button className="bg-primary text-white rounded-xl mt-2" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Create First Recurring
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {allRecurring.map(r => {
            const isDue = new Date(r.nextDue) <= new Date();
            return (
              <div key={r.id} className={`glass rounded-2xl p-4 flex items-center gap-4 border ${isDue ? 'border-amber-500/30' : 'border-white/10'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${r.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {r.category?.icon || (r.type === 'income' ? '💰' : '💸')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{r.description || r.category?.name}</p>
                    <Badge variant="outline" className={`text-xs border-0 bg-white/10 ${FREQ_COLORS[r.frequency]}`}>
                      <RefreshCw className="w-2.5 h-2.5 mr-1" />{FREQ_LABELS[r.frequency]}
                    </Badge>
                    {isDue && <Badge className="text-xs bg-amber-500/20 text-amber-400 border-0">Due now</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Next: {format(new Date(r.nextDue), 'MMM d, yyyy')} · {r.category?.name}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <p className={`font-bold font-display ${r.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {r.type === 'income' ? '+' : '-'}{fmt(Number(r.amount))} <span className="text-xs font-normal opacity-60">{r.currency}</span>
                  </p>
                  <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg border-primary/30 hover:bg-primary/10 text-primary" onClick={() => handleLog(r)} title="Log now">
                    <Play className="w-3 h-3 mr-1" /> Log
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteRecurring.mutate(r.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass border-white/10">
          <DialogHeader><DialogTitle>New Recurring Transaction</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-2">
              {(['expense', 'income'] as const).map(tp => (
                <button key={tp} onClick={() => setForm(f => ({ ...f, type: tp, categoryId: '' }))}
                  className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${form.type === tp ? (tp === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white') : 'bg-white/10 hover:bg-white/20'}`}>
                  {tp === 'expense' ? '💸 Expense' : '💰 Income'}
                </button>
              ))}
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger className="bg-background/50 mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{filteredCats.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount</Label>
                <Input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="bg-background/50 mt-1" min="1" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
                  <SelectTrigger className="bg-background/50 mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Frequency</Label>
              <div className="grid grid-cols-4 gap-2 mt-1">
                {Object.entries(FREQ_LABELS).map(([k, v]) => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, frequency: k }))}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${form.frequency === k ? 'bg-primary text-white' : 'bg-white/10 hover:bg-white/20'}`}>{v}</button>
                ))}
              </div>
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Input placeholder="e.g. Netflix, Salary..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-background/50 mt-1" />
            </div>
            <div>
              <Label>First Due Date</Label>
              <Input type="date" value={form.nextDue} onChange={e => setForm(f => ({ ...f, nextDue: e.target.value }))} className="bg-background/50 mt-1" />
            </div>
            <Button onClick={handleCreate} disabled={createRecurring.isPending || !form.categoryId || !form.amount} className="w-full bg-primary text-white h-11 rounded-xl">
              Create Recurring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
