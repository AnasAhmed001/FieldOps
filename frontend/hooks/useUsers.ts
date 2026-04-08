import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { User } from "@/types";
import { toast } from "sonner";

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const userKeys = {
  all: ["users"] as const,
  list: (filters?: Record<string, string>) => [...userKeys.all, "list", filters ?? {}] as const,
  technicians: () => [...userKeys.all, "technicians"] as const,
  clients: () => [...userKeys.all, "clients"] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: async () => {
      const { data } = await api.get("/users");
      return data.data as User[];
    },
  });
};

export const useTechnicians = () => {
  return useQuery({
    queryKey: userKeys.technicians(),
    queryFn: async () => {
      const { data } = await api.get("/users/technicians");
      return data.data as User[];
    },
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: userKeys.clients(),
    queryFn: async () => {
      const { data } = await api.get("/users/clients");
      return data.data as User[];
    },
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      role: "admin" | "technician" | "client";
    }) => {
      const { data } = await api.post("/users", payload);
      return data.data as User;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User created successfully.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create user.";
      toast.error(msg);
    },
  });
};

export const useDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch(`/users/${userId}/deactivate`);
      return data.data as User;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success("User deactivated.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to deactivate user.";
      toast.error(msg);
    },
  });
};
