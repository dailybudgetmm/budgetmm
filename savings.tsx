import { useState } from "react";
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal } from "@/hooks/use-savings";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, PiggyBank, CalendarDays } from "lucide-react";
import { differenceInDays, format, addMonths } from "date-fns";
import { SavingsGoal } from "@shared/schema";

const GOAL_ICONS = ['🎯','💰','🏠','✈️','📱','🚗','🎓','💊','👶','🏖️','💍','📺','🏋️','🎮','🐶'];

export default function Savings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: goals, isLoading } = useSavingsGoals();
  const createGoal = useCreateSavingsGoal();
  const updateGoal = useUpdateSavingsGoal();
  const deleteGoal = useDeleteSavingsGoal();

  const currency = user?.defaultCurrency || "MMK";
  const [open, setOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState("");

  const [form, setForm] = useState({ name: '', icon: '🎯', targetAmount: '', currentAmount: '', targetDate: '' });

  const myGoals = goals?.filter(g => g.currency === currency) || [];

  const resetForm = () => setForm({ name: '', icon: '🎯', targetAmount: '', currentAmount: '', targetDate: '' });

  const handleOpen = (goal?: SavingsGoal) => {
    if (goal) {
      setEditGoal(goal);
      setForm({
        name: goal.name,
        icon: goal.icon,
        targetAmount: String(goal.targetAmount),
        currentAmount: String(goal.currentAmount),
        targetDate: goal.targetDate ? format(new Date(goal.targetDate), 'yyyy-MM-dd') : ''
      });
    } else {
      setEditGoal(null);
      resetForm();
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.targetAmount) return;
    try {
      const payload: any = {
        name: form.name,
        icon: form.icon,
        targetAmount: form.targetAmount,
        currentAmount: form.currentAmount || '0',
        currency,
        targetDate: form.targetDate ? new Date(form.targetDate) : null,
      };
      if (editGoal) {
        await updateGoal.mutateAsync({ id: editGoal.id, ...payload });
        toast({ title: 'Goal updated!' });
      } else {
        await createGoal.mutateAsync(payload);
        toast({ title: 'Goal created! 🎯' });
      }
      setOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Error saving goal', variant: 'destructive' });
    }
  };

  const handleDeposit = async () => {
    if (!depositGoal || !depositAmount) return;
    try {
      const newAmount = Number(depositGoal.currentAmount) + Number(depositAmount);
      await updateGoal.mutateAsync({ id: depositGoal.id, currentAmount: String(newAmount) });
      toast({ title: `Added ${depositAmount} to ${depositGoal.name}!` });
      setDepositOpen(false);
      setDepositAmount('');
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const fmt = (n: number) => n.toLocaleString();
  const now = new Date();

  if (isLoading) return <Loader />;

  const totalSaved   = myGoals.reduce((s, g) => s + Number(g.currentAmount), 0);
  const totalTarget  = myGoals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const completed    = myGoals.filter(g => Number(g.currentAmount) >= Number(g.targetAmount)).length;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">Savings Goals</h1>
          <p className="text-muted-foreground text-sm">Track your financial milestones</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20" onClick={() => handleOpen()} data-testid="button-new-goal">
          <Plus className="w-4 h-4 mr-1.5" /> New Goal
        </Button>
      </div>

      {/* Summary */}
      {myGoals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass p-4 rounded-2xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
            <p className="font-bold font-display text-lg text-primary">{fmt(totalSaved)}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Target</p>
            <p className="font-bold font-display text-lg">{fmt(totalTarget)}</p>
            <p className="text-xs text-muted-foreground">{currency}</p>
          </div>
          <div className="glass p-4 rounded-2xl text-center">
            <p className="text-xs text-muted-foreground mb-1">Completed</p>
            <p className="font-bold font-display text-lg text-green-500">{completed}/{myGoals.length}</p>
            <p className="text-xs text-muted-foreground">goals</p>
          </div>
        </div>
      )}

      {/* Goals list */}
      {myGoals.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center space-y-3">
          <div className="text-5xl">🐷</div>
          <h3 className="text-lg font-bold font-display">No Savings Goals Yet</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Create goals for things you're saving towards — emergency fund, vacation, new gadget, anything!</p>
          <Button className="bg-primary text-white rounded-xl mt-2" onClick={() => handleOpen()}>
            <Plus className="w-4 h-4 mr-1.5" /> Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {myGoals.map(goal => {
            const pct = Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100);
            const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
            const done = pct >= 100;
            const daysLeft = goal.targetDate ? differenceInDays(new Date(goal.targetDate), now) : null;
            const estDate = goal.targetDate ? null : null;

            return (
              <div key={goal.id} className={`glass rounded-2xl p-5 space-y-4 border ${done ? 'border-green-500/30' : 'border-white/10'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${done ? 'bg-green-500/15' : 'bg-primary/10'}`}>{goal.icon}</div>
                    <div>
                      <p className="font-bold text-base">{goal.name}</p>
                      {done
                        ? <span className="text-xs text-green-500 font-semibold">🎉 Goal Achieved!</span>
                        : goal.targetDate && (
                          <span className={`text-xs ${daysLeft !== null && daysLeft < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                            {daysLeft !== null && daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`} · {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                          </span>
                        )
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleOpen(goal)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => deleteGoal.mutate(goal.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-700 ${done ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-accent'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1.5">
                    <span className="text-muted-foreground">{fmt(Number(goal.currentAmount))} {currency} saved</span>
                    <span className="font-medium">{Math.round(pct)}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Target: </span>
                    <span className="font-bold font-display">{fmt(Number(goal.targetAmount))} {currency}</span>
                    {!done && <span className="text-xs text-muted-foreground ml-2">({fmt(remaining)} to go)</span>}
                  </div>
                  {!done && (
                    <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => { setDepositGoal(goal); setDepositOpen(true); }} data-testid={`button-deposit-${goal.id}`}>
                      <PiggyBank className="w-3 h-3 mr-1" /> Add Savings
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md glass border-white/10">
          <DialogHeader>
            <DialogTitle>{editGoal ? 'Edit Goal' : 'New Savings Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm">Goal Name</Label>
              <Input placeholder="e.g. Emergency Fund, New Phone..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-background/50 mt-1" />
            </div>
            <div>
              <Label className="text-sm">Icon</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {GOAL_ICONS.map(icon => (
                  <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))} className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${form.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-white/10 hover:bg-white/20'}`}>{icon}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Target Amount ({currency})</Label>
                <Input type="number" placeholder="10000" value={form.targetAmount} onChange={e => setForm(f => ({ ...f, targetAmount: e.target.value }))} className="bg-background/50 mt-1" min="1" />
              </div>
              <div>
                <Label className="text-sm">Current Saved</Label>
                <Input type="number" placeholder="0" value={form.currentAmount} onChange={e => setForm(f => ({ ...f, currentAmount: e.target.value }))} className="bg-background/50 mt-1" min="0" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Target Date (Optional)</Label>
              <Input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className="bg-background/50 mt-1" />
            </div>
            <Button onClick={handleSave} disabled={createGoal.isPending || updateGoal.isPending || !form.name || !form.targetAmount} className="w-full bg-primary text-white h-11 rounded-xl">
              {editGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-sm glass border-white/10">
          <DialogHeader>
            <DialogTitle>Add to {depositGoal?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Amount ({currency})</Label>
              <Input type="number" placeholder="Enter amount..." value={depositAmount} onChange={e => setDepositAmount(e.target.value)} className="bg-background/50 mt-1 h-12 text-lg" min="1" autoFocus />
            </div>
            {depositGoal && (
              <p className="text-xs text-muted-foreground">
                Current: {Number(depositGoal.currentAmount).toLocaleString()} → After: {(Number(depositGoal.currentAmount) + Number(depositAmount || 0)).toLocaleString()} {currency}
              </p>
            )}
            <Button onClick={handleDeposit} disabled={updateGoal.isPending || !depositAmount} className="w-full bg-primary text-white h-11 rounded-xl">
              <PiggyBank className="w-4 h-4 mr-2" /> Add Savings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
