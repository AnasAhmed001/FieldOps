import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Job, JobStatus } from "@/types";
import { toast } from "sonner";

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const jobKeys = {
  all: ["jobs"] as const,
  list: (filters?: Record<string, string>) => [...jobKeys.all, "list", filters ?? {}] as const,
  detail: (id: string) => [...jobKeys.all, "detail", id] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useJobs = (filters?: { status?: JobStatus; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: jobKeys.list(filters as Record<string, string>),
    queryFn: async () => {
      const { data } = await api.get("/jobs", { params: filters });
      return data.data as Job[];
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: jobKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${id}`);
      return data.data as Job;
    },
    enabled: !!id,
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useCreateJob = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      description: string;
      client: string;
      scheduledDate?: string;
    }) => {
      const { data } = await api.post("/jobs", payload);
      return data.data as Job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.all });
      toast.success("Job created successfully.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to create job.";
      toast.error(msg);
    },
  });
};

export const useAssignJob = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (technicianId: string) => {
      const { data } = await api.patch(`/jobs/${id}/assign`, { technicianId });
      return data.data as Job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
      qc.invalidateQueries({ queryKey: jobKeys.all });
      toast.success("Technician assigned.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to assign technician.";
      toast.error(msg);
    },
  });
};

export const useUpdateJobStatus = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (status: JobStatus) => {
      const { data } = await api.patch(`/jobs/${id}/status`, { status });
      return data.data as Job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
      qc.invalidateQueries({ queryKey: jobKeys.all });
      toast.success("Status updated.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to update status.";
      toast.error(msg);
    },
  });
};

export const useAddNote = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      const { data } = await api.post(`/jobs/${id}/notes`, { text });
      return data.data as Job;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: jobKeys.detail(id) });
      toast.success("Note added.");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to add note.";
      toast.error(msg);
    },
  });
};
