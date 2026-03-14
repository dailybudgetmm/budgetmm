import { useAdminStats } from "@/hooks/use-admin";
import { Loader } from "@/components/ui/loader";
import { Users, Receipt, TrendingUp, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of system metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-blue-500/20 group-hover:scale-110 transition-transform"><Users className="w-16 h-16"/></div>
          <h3 className="text-muted-foreground">Total Users</h3>
          <p className="text-4xl font-display font-bold mt-2 text-blue-500">{stats?.totalUsers || 0}</p>
        </div>
        
        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-purple-500/20 group-hover:scale-110 transition-transform"><Receipt className="w-16 h-16"/></div>
          <h3 className="text-muted-foreground">Total Transactions</h3>
          <p className="text-4xl font-display font-bold mt-2 text-purple-500">{stats?.totalExpenses || 0}</p>
        </div>

        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-green-500/20 group-hover:scale-110 transition-transform"><Calendar className="w-16 h-16"/></div>
          <h3 className="text-muted-foreground">Daily Volume (Count)</h3>
          <p className="text-4xl font-display font-bold mt-2 text-green-500">{stats?.dailyExpenses || 0}</p>
        </div>

        <div className="glass p-6 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-4 right-4 text-orange-500/20 group-hover:scale-110 transition-transform"><TrendingUp className="w-16 h-16"/></div>
          <h3 className="text-muted-foreground">Monthly Volume (Count)</h3>
          <p className="text-4xl font-display font-bold mt-2 text-orange-500">{stats?.monthlyExpenses || 0}</p>
        </div>
      </div>
    </div>
  );
}
