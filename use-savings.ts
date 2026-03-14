import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { SavingsGoal } from "@shared/schema";

const KEY = api.savings.list.path;

export function useSavingsGoals() {
  return useQuery<SavingsGoal[]>({
    queryKey: [KEY],
    queryFn: () => fetchWithAuth(KEY),
  });
}

export function useCreateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<SavingsGoal, 'id' | 'userId' | 'createdAt'>) =>
      fetchWithAuth(api.savings.create.path, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<SavingsGoal> & { id: number }) =>
      fetchWithAuth(buildUrl(api.savings.update.path, { id }), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteSavingsGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(buildUrl(api.savings.delete.path, { id }), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
