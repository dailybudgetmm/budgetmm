import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { RecurringWithCategory } from "@shared/schema";

const KEY = api.recurring.list.path;

export function useRecurring() {
  return useQuery<RecurringWithCategory[]>({
    queryKey: [KEY],
    queryFn: () => fetchWithAuth(KEY),
  });
}

export function useCreateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth(api.recurring.create.path, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useUpdateRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) =>
      fetchWithAuth(buildUrl(api.recurring.update.path, { id }), { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}

export function useDeleteRecurring() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      fetchWithAuth(buildUrl(api.recurring.delete.path, { id }), { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });
}
