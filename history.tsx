import { useState, useMemo, useEffect } from "react";
import { useTransactions, useDeleteTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isThisWeek, isThisMonth } from "date-fns";
import { Trash2, Search, Download, FileSpreadsheet, FileText, Filter, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithCategory } from "@shared/schema";
import { cn } from "@/lib/utils";

const CURRENCIES = ["MMK", "USD", "THB", "SGD", "MYR", "KRW", "JPY", "TWD", "SAR", "AED"];

type DateFilter = "all" | "today" | "week" | "month";

async function exportToExcel(rows: TransactionWithCategory[]) {
  const XLSX = await import("xlsx");
  const data = rows.map(t => ({
    Date: format(new Date(t.date), "yyyy-MM-dd HH:mm"),
    Type: t.type,
    Category: t.category?.name || "Unknown",
    Description: t.description || "",
    Amount: Number(t.amount),
    Currency: t.currency,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");
  XLSX.writeFile(wb, `my-daily-budget-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}

async function exportToPdf(rows: TransactionWithCategory[]) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("My Daily Budget — Transaction Report", 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on ${format(new Date(), "PPP")}`, 14, 28);
  autoTable(doc, {
    head: [["Date", "Type", "Category", "Description", "Amount"]],
    body: rows.map(t => [
      format(new Date(t.date), "MMM d, yyyy"),
      t.type, t.category?.name || "Unknown",
      t.description || "-",
      `${t.type === "income" ? "+" : "-"}${Number(t.amount).toLocaleString()} ${t.currency}`,
    ]),
    startY: 35,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [139, 92, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 248, 248] },
  });
  doc.save(`my-daily-budget-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

function exportToCSV(rows: TransactionWithCategory[]) {
  const headers = ["Date", "Type", "Category", "Description", "Amount", "Currency"];
  const csvRows = rows.map(t => [
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
  a.download = `my-daily-budget-${format(new Date(), "yyyy-MM-dd")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function HistorySkeleton() {
  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-20 hidden sm:block" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
      </div>
      <div className="flex gap-2">
        {[1,2,3].map(i => <Skeleton key={i} className="h-8 w-24 rounded-xl" />)}
      </div>
      <div className="space-y-2">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="glass rounded-xl p-3.5 flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-20 ml-auto" />
              <Skeleton className="h-3 w-10 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditTransactionDialog({
  tx, open, onClose, categories,
}: {
  tx: TransactionWithCategory | null;
  open: boolean;
  onClose: () => void;
  categories: { id: number; name: string; icon: string; type: string }[];
}) {
  const { mutate: updateTx, isPending } = useUpdateTransaction();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MMK");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (tx && open) {
      setAmount(String(Number(tx.amount)));
      setCurrency(tx.currency);
      setCategoryId(tx.categoryId);
      setDescription(tx.description || "");
      setType(tx.type as "income" | "expense");
      setDate(format(new Date(tx.date), "yyyy-MM-dd'T'HH:mm"));
    }
  }, [tx?.id, open]);

  const filteredCats = categories.filter(c => c.type === type);

  const handleSave = () => {
    if (!tx || !amount || !categoryId) return;
    updateTx({ id: tx.id, amount, currency, categoryId, description, type, date: date ? new Date(date) : undefined }, {
      onSuccess: () => {
        toast({ description: "Transaction updated" });
        handleClose();
      },
      onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
    });
  };

  const handleClose = () => {
    setAmount(""); setCategoryId(null); setDescription(""); setDate(""); onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3 p-1 bg-muted/50 rounded-xl">
            <button type="button" onClick={() => { setType("expense"); setCategoryId(null); }}
              className={cn("py-2.5 rounded-lg text-sm font-semibold transition-all", type === "expense" ? "bg-red-500 text-white shadow-md" : "text-muted-foreground")}
              data-testid="edit-button-expense-type">
              💸 Expense
            </button>
            <button type="button" onClick={() => { setType("income"); setCategoryId(null); }}
              className={cn("py-2.5 rounded-lg text-sm font-semibold transition-all", type === "income" ? "bg-green-500 text-white shadow-md" : "text-muted-foreground")}
              data-testid="edit-button-income-type">
              💰 Income
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Amount</Label>
            <div className="flex gap-2">
              <Input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 h-11 bg-background/50" data-testid="edit-input-amount" />
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-[90px] h-11 bg-background/50 border border-input rounded-md px-2 text-sm" data-testid="edit-select-currency">
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Category</Label>
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {filteredCats.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                  data-testid={`edit-button-category-${cat.id}`}
                  className={cn("flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center",
                    categoryId === cat.id
                      ? type === "expense" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"
                      : "border-transparent bg-muted/40 hover:bg-muted/60"
                  )}>
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-xs font-medium leading-tight line-clamp-1">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Date & Time</Label>
            <Input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="h-11 bg-background/50" data-testid="edit-input-date" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Description (optional)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} className="h-11 bg-background/50" data-testid="edit-input-description" />
          </div>

          <Button onClick={handleSave} disabled={isPending || !categoryId || !amount}
            className={cn("w-full h-11 font-semibold rounded-xl text-white", type === "expense" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600")}
            data-testid="edit-button-save">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function History() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const { mutate: deleteTx, isPending: isDeleting } = useDeleteTransaction();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [editTx, setEditTx] = useState<TransactionWithCategory | null>(null);

  const handleDelete = (id: number) => {
    if (!confirm("Delete this record?")) return;
    deleteTx(id, { onSuccess: () => toast({ description: "Record deleted" }) });
  };

  const hasActiveFilters = dateFilter !== "all" || typeFilter !== "all" || categoryFilter !== "all";

  const filtered = useMemo(() => {
    return (transactions || [])
      .filter(tx => {
        const d = new Date(tx.date);
        if (dateFilter === "today") return isToday(d);
        if (dateFilter === "week") return isThisWeek(d, { weekStartsOn: 1 });
        if (dateFilter === "month") return isThisMonth(d);
        return true;
      })
      .filter(tx => typeFilter === "all" ? true : tx.type === typeFilter)
      .filter(tx => categoryFilter === "all" ? true : String(tx.categoryId) === categoryFilter)
      .filter(tx => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (tx.category?.name?.toLowerCase().includes(q) ?? false) ||
          (tx.description?.toLowerCase().includes(q) ?? false) ||
          tx.amount.toString().includes(q);
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, dateFilter, typeFilter, categoryFilter, search]);

  const totalExpense = filtered.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0);
  const totalIncome  = filtered.filter(x => x.type === 'income').reduce((s, x) => s + Number(x.amount), 0);
  const net = totalIncome - totalExpense;

  const expenseCats = categories?.filter(c => c.type === 'expense') || [];
  const incomeCats  = categories?.filter(c => c.type === 'income') || [];
  const allCats = typeFilter === 'expense' ? expenseCats : typeFilter === 'income' ? incomeCats : (categories || []);

  if (isLoading) return <HistorySkeleton />;

  const dateButtons: { key: DateFilter; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "today", label: t("filterToday") },
    { key: "week", label: t("filterWeek") },
    { key: "month", label: t("filterMonth") },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-24 md:pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("expenseHistory")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} records found</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(v => !v)} className={`gap-1.5 h-9 ${hasActiveFilters ? 'border-primary text-primary' : ''}`}>
            <Filter className="w-3.5 h-3.5" /> Filters {hasActiveFilters && <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered)} disabled={filtered.length === 0} className="hidden sm:flex gap-1.5 h-9" data-testid="button-export-csv">
            <Download className="w-3.5 h-3.5 text-blue-500" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(filtered)} disabled={filtered.length === 0} className="hidden sm:flex gap-1.5 h-9" data-testid="button-export-excel">
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportToPdf(filtered)} disabled={filtered.length === 0} className="hidden sm:flex gap-1.5 h-9" data-testid="button-export-pdf">
            <FileText className="w-3.5 h-3.5 text-red-500" /> PDF
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search by note, category, amount..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-background/50 h-10" data-testid="input-search" />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>}
      </div>

      <div className="flex gap-2 flex-wrap">
        {dateButtons.map(f => (
          <button key={f.key} onClick={() => setDateFilter(f.key)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${dateFilter === f.key ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-muted/50 text-muted-foreground hover:text-foreground"}`} data-testid={`button-filter-${f.key}`}>
            {f.label}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className="glass rounded-2xl p-4 space-y-3 border border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Advanced Filters</p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { setTypeFilter("all"); setCategoryFilter("all"); }}>
                <X className="w-3 h-3 mr-1" /> Clear filters
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <Select value={typeFilter} onValueChange={(v: string) => { setTypeFilter(v as "all" | "income" | "expense"); setCategoryFilter("all"); }}>
                <SelectTrigger className="h-9 bg-background/50 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">💸 Expense</SelectItem>
                  <SelectItem value="income">💰 Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-9 bg-background/50 text-sm"><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCats.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.icon} {c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex gap-2 text-sm flex-wrap">
          <span className="glass px-3 py-1.5 rounded-xl text-green-500 font-medium">+{totalIncome.toLocaleString()}</span>
          <span className="glass px-3 py-1.5 rounded-xl text-red-500 font-medium">-{totalExpense.toLocaleString()}</span>
          <span className={`glass px-3 py-1.5 rounded-xl font-medium ${net >= 0 ? 'text-blue-500' : 'text-red-500'}`}>={net.toLocaleString()}</span>
          <span className="glass px-3 py-1.5 rounded-xl text-muted-foreground text-xs flex items-center">{filtered.length} records</span>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="flex gap-2 sm:hidden">
          <Button variant="outline" size="sm" onClick={() => exportToCSV(filtered)} className="gap-1 text-xs h-8"><Download className="w-3 h-3 text-blue-500" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={() => exportToExcel(filtered)} className="gap-1 text-xs h-8"><FileSpreadsheet className="w-3 h-3 text-green-600" /> Excel</Button>
          <Button variant="outline" size="sm" onClick={() => exportToPdf(filtered)} className="gap-1 text-xs h-8"><FileText className="w-3 h-3 text-red-500" /> PDF</Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-muted-foreground">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium">{t("noTransactionsFound")}</p>
          <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id} className="glass rounded-xl p-3.5 flex items-center gap-3 hover:shadow-md transition-all group" data-testid={`card-transaction-${tx.id}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${tx.type === 'income' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{tx.description || tx.category?.name || 'Unknown'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tx.type === 'income' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    {tx.category?.name}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(tx.date), 'MMM d, yyyy · h:mm a')}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-bold text-sm font-display ${tx.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                  {tx.type === 'income' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{tx.currency}</p>
              </div>
              <div className="flex gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => setEditTx(tx)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8" data-testid={`button-edit-${tx.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" disabled={isDeleting} onClick={() => handleDelete(tx.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8" data-testid={`button-delete-${tx.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EditTransactionDialog
        tx={editTx}
        open={!!editTx}
        onClose={() => setEditTx(null)}
        categories={(categories || []).map(c => ({ id: c.id, name: c.name, icon: c.icon || "⚪", type: c.type }))}
      />
    </div>
  );
}
