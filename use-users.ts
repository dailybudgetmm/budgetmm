import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { User } from "@shared/schema";

export function useUsers() {
  return useQuery<User[]>({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const data = await fetchWithAuth(api.users.list.path);
      return api.users.list.responses[200].parse(data);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, defaultCurrency }: { id: number, defaultCurrency: string }) => {
      const url = buildUrl(api.users.update.path, { id });
      const res = await fetchWithAuth(url, {
        method: api.users.update.method,
        body: JSON.stringify({ defaultCurrency }),
      });
      return api.users.update.responses[200].parse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.sync.path] }), // Also invalidates our own user profile
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.users.delete.path, { id });
      await fetchWithAuth(url, { method: api.users.delete.method });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.users.list.path] }),
  });
}
