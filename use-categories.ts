import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";
import { Category, InsertCategory } from "@shared/schema";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const data = await fetchWithAuth(api.categories.list.path);
      return api.categories.list.responses[200].parse(data);
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCategory) => {
      const validated = api.categories.create.input.parse(data);
      const res = await fetchWithAuth(api.categories.create.path, {
        method: api.categories.create.method,
        body: JSON.stringify(validated),
      });
      return api.categories.create.responses[201].parse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCategory>) => {
      const validated = api.categories.update.input.parse(updates);
      const url = buildUrl(api.categories.update.path, { id });
      const res = await fetchWithAuth(url, {
        method: api.categories.update.method,
        body: JSON.stringify(validated),
      });
      return api.categories.update.responses[200].parse(res);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.categories.delete.path, { id });
      await fetchWithAuth(url, { method: api.categories.delete.method });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.categories.list.path] }),
  });
}
