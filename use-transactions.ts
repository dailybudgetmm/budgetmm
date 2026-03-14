import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { TransactionWithCategory, InsertTransaction } from "@shared/schema";
import { z } from "zod";

export function useTransactions() {
  return useQuery<TransactionWithCategory[]>({
    queryKey: [api.transactions.list.path],
    queryFn: async () => {
      const data = await fetchWithAuth(api.transactions.list.path);
      return api.transactions.list.responses[200].parse(data);
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTransaction) => {
      const validated = api.transactions.create.input.parse(data);
      const res = await fetchWithAuth(api.transactions.create.path, {
        method: api.transactions.create.method,
        body: JSON.stringify(validated),
      });
      return api.transactions.create.responses[201].parse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertTransaction>) => {
      const validated = api.transactions.update.input.parse(updates);
      const url = buildUrl(api.transactions.update.path, { id });
      const res = await fetchWithAuth(url, {
        method: api.transactions.update.method,
        body: JSON.stringify(validated),
      });
      return api.transactions.update.responses[200].parse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.transactions.delete.path, { id });
      await fetchWithAuth(url, { method: api.transactions.delete.method });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.transactions.list.path] }),
  });
}
