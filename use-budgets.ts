import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { BudgetWithCategory, InsertBudget } from "@shared/schema";

export function useBudgets() {
  return useQuery<BudgetWithCategory[]>({
    queryKey: [api.budgets.list.path],
    queryFn: async () => {
      return await fetchWithAuth(api.budgets.list.path);
    },
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<InsertBudget, 'userId'>) => {
      return await fetchWithAuth(api.budgets.upsert.path, {
        method: api.budgets.upsert.method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] }),
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.budgets.delete.path, { id });
      await fetchWithAuth(url, { method: api.budgets.delete.method });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.budgets.list.path] }),
  });
}
