import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { api, buildUrl } from "@shared/routes";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TransactionWithCategory } from "@shared/schema";

export default function AdminExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery<TransactionWithCategory[]>({
    queryKey: [api.transactions.list.path, 'admin'],
    queryFn: () => fetchWithAuth(`${api.transactions.list.path}?all=true`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetchWithAuth(buildUrl(api.transactions.delete.path, { id }), {
      method: api.transactions.delete.method,
    }),
    onSuccess: () => {
      toast({ description: "Transaction deleted." });
      queryClient.invalidateQueries({ queryKey: [api.transactions.list.path, 'admin'] });
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">All Transactions</h1>
        <p className="text-muted-foreground">Total: {transactions?.length || 0} records</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No transactions found.</td>
                </tr>
              )}
              {transactions?.map(t => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{format(new Date(t.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{t.category?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{t.description || '-'}</td>
                  <td className={`px-6 py-4 font-bold font-display ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{Number(t.amount).toLocaleString()} {t.currency}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="icon" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(t.id)} className="text-red-500 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
