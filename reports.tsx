import { useState } from "react";
import { useTransactions } from "@/hooks/use-transactions";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line
} from "recharts";
import { format, startOfMonth, subMonths, isWithinInterval, endOfMonth } from "date-fns";

const COLORS = ['#8b5cf6', '#d946ef', '#0ea5e9', '#eab308', '#22c55e', '#ef4444', '#f97316', '#06b6d4', '#84cc16', '#fb923c'];

type Period = "thisMonth" | "last3" | "last6" | "all";

export default function Reports() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: transactions, isLoading } = useTransactions();
  const [period, setPeriod] = useState<Period>("thisMonth");

  if (isLoading) return <ReportsSkeleton />;

  const currency = user?.defaultCurrency || "MMK";
  const now = new Date();

  const getRange = (): { start: Date; end: Date } => {
    if (period === "thisMonth") return { start: startOfMonth(now), end: endOfMonth(now) };
    if (period === "last3") return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
    if (period === "last6") return { start: startOfMonth(subMonths(now, 5)), end: endOfMonth(now) };
    return { start: new Date(0), end: now };
  };

  const range = getRange();
  const all = transactions?.filter(tx =>
    tx.currency === currency &&
    isWithinInterval(new Date(tx.date), range)
  ) || [];

  const expenses = all.filter(t => t.type === 'expense');
  const incomes = all.filter(t => t.type === 'income');
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = incomes.reduce((s, t) => s + Number(t.amount), 0);

  // Category pie
  const byCategory = expenses.reduce((acc, t) => {
    const name = `${t.category?.icon || ''} ${t.category?.name || 'Other'}`;
    acc[name] = (acc[name] || 0) + Number(t.amount);
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Monthly bar chart
  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  const monthsToShow = period === "thisMonth" ? 1 : period === "last3" ? 3 : period === "last6" ? 6 : 12;
  for (let i = monthsToShow - 1; i >= 0; i--) {
    const m = subMonths(now, i);
    const key = format(m, 'MMM yy');
    monthlyMap[key] = { income: 0, expense: 0 };
  }
  all.forEach(tx => {
    const key = format(new Date(tx.date), 'MMM yy');
    if (monthlyMap[key]) {
      if (tx.type === 'expense') monthlyMap[key].expense += Number(tx.amount);
      else monthlyMap[key].income += Number(tx.amount);
    }
  });
  const barData = Object.entries(monthlyMap).map(([month, vals]) => ({ month, ...vals }));

  const periods: { key: Period; label: string }[] = [
    { key: "thisMonth", label: "This Month" },
    { key: "last3", label: "3 Months" },
    { key: "last6", label: "6 Months" },
    { key: "all", label: "All Time" },
  ];

  const fmt = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}k` : `${n}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold">{t("reportsTitle")}</h1>
        <p className="text-muted-foreground text-sm">Showing data in {currency}</p>
      </div>

      {/* Period filter */}
      <div className="flex gap-2 flex-wrap">
        {periods.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              period === p.key
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-1">Income</p>
          <p className="font-bold text-green-500 text-base sm:text-lg">{fmt(totalIncome)}</p>
          <p className="text-xs text-muted-foreground">{currency}</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-1">Expenses</p>
          <p className="font-bold text-red-500 text-base sm:text-lg">{fmt(totalExpense)}</p>
          <p className="text-xs text-muted-foreground">{currency}</p>
        </div>
        <div className="glass p-4 rounded-2xl text-center">
          <p className="text-xs text-muted-foreground mb-1">Balance</p>
          <p className={`font-bold text-base sm:text-lg ${totalIncome - totalExpense >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
            {fmt(totalIncome - totalExpense)}
          </p>
          <p className="text-xs text-muted-foreground">{currency}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="text-base font-bold mb-4">{t("spendingByCategory")}</h3>
          {pieData.length === 0 ? (
            <p className="text-muted-foreground text-center py-10 text-sm">{t("noData")}</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius="30%"
                    outerRadius="60%"
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Income vs Expense bar */}
        <div className="glass p-5 rounded-2xl">
          <h3 className="text-base font-bold mb-4">{t("incomeVsExpense")}</h3>
          {barData.every(d => d.income === 0 && d.expense === 0) ? (
            <p className="text-muted-foreground text-center py-10 text-sm">{t("noData")}</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ left: -20, right: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toLocaleString()} ${currency}`, '']}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category breakdown table */}
      {pieData.length > 0 && (
        <div className="glass p-5 rounded-2xl">
          <h3 className="text-base font-bold mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {pieData.map((item, i) => {
              const pct = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.value.toLocaleString()} {currency} <span className="text-xs">({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="flex gap-2">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1,2,3].map(i => (
          <div key={i} className="glass p-4 rounded-2xl text-center space-y-2">
            <Skeleton className="h-3 w-14 mx-auto" />
            <Skeleton className="h-6 w-20 mx-auto" />
            <Skeleton className="h-3 w-10 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-5 rounded-2xl space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
        <div className="glass p-5 rounded-2xl space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-[280px] w-full rounded-xl" />
        </div>
      </div>
      <div className="glass p-5 rounded-2xl space-y-3">
        <Skeleton className="h-5 w-44" />
        {[1,2,3,4].map(i => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
