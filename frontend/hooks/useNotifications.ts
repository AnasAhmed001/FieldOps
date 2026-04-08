import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Notification, NotificationsResponse } from "@/types";
import { toast } from "sonner";

// ─── Query Key Factory ────────────────────────────────────────────────────────
export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useNotifications = () => {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data.data as NotificationsResponse;
    },
    refetchInterval: 30_000, // poll every 30 seconds
  });
};

// ─── Mutations ────────────────────────────────────────────────────────────────

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data } = await api.patch(`/notifications/${notificationId}/read`);
      return data.data as Notification;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
    },
    onError: () => {
      toast.error("Failed to mark notification as read.");
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.list() });
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read.");
    },
  });
};
