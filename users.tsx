import { useUsers, useDeleteUser } from "@/hooks/use-users";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const { data: users, isLoading } = useUsers();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Manage Users</h1>
        <p className="text-muted-foreground">Total users: {users?.length || 0}</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 border-b border-border">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-white/5">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName}`} className="w-8 h-8 rounded-full" alt="avatar" />
                    <span className="font-medium">{u.displayName}</span>
                  </td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4">{u.createdAt ? format(new Date(u.createdAt), 'MMM dd, yyyy') : '-'}</td>
                  <td className="px-6 py-4">
                    {u.role === 'admin' ? <span className="flex items-center gap-1 text-primary"><Shield className="w-3 h-3"/> Admin</span> : 'User'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" disabled={isDeleting || u.role === 'admin'} onClick={() => deleteUser(u.id)} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" /> Delete
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
