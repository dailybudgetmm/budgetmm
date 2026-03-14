import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { fetchWithAuth } from "@/lib/api-client";

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const data = await fetchWithAuth(api.admin.stats.path);
      return api.admin.stats.responses[200].parse(data);
    },
  });
}

export function useMessages() {
  return useQuery({
    queryKey: [api.messages.list.path],
    queryFn: async () => {
      const data = await fetchWithAuth(api.messages.list.path);
      return api.messages.list.responses[200].parse(data);
    },
  });
}

export function useCreateMessage() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetchWithAuth(api.messages.create.path, {
        method: api.messages.create.method,
        body: JSON.stringify(data),
      });
      return api.messages.create.responses[201].parse(res);
    }
  });
}
