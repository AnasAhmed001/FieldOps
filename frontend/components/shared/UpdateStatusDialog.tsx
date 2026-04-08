"use client";

import { useState } from "react";
import { useUpdateJobStatus } from "@/hooks/useJobs";
import { JobStatus } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UpdateStatusDialogProps {
  jobId: string;
  currentStatus: JobStatus;
  userRole: "admin" | "technician" | "client";
  children: React.ReactNode;
}

export function UpdateStatusDialog({ jobId, currentStatus, userRole, children }: UpdateStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<JobStatus>(currentStatus);

  const { mutate: updateStatus, isPending } = useUpdateJobStatus(jobId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!status || status === currentStatus) return;

    updateStatus(status, {
      onSuccess: () => setOpen(false),
    });
  };

  // Technician restrictions based on backend
  const techTransitions: Record<string, JobStatus[]> = {
    assigned: ["in_progress"],
    in_progress: ["on_hold", "completed"],
    on_hold: ["in_progress"],
  };

  const allStatuses: JobStatus[] = ["pending", "assigned", "in_progress", "on_hold", "completed", "cancelled"];
  const lockedStatuses = ["completed", "cancelled"];

  let allowedStatuses: JobStatus[] = [];

  if (userRole === "admin") {
     allowedStatuses = allStatuses;
  } else if (userRole === "technician") {
     allowedStatuses = techTransitions[currentStatus] || [];
  }

  const isLocked = lockedStatuses.includes(currentStatus);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Job Status</DialogTitle>
        </DialogHeader>
        {isLocked ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            This job is {currentStatus} and its status cannot be changed.
          </div>
        ) : allowedStatuses.length === 0 ? (
           <div className="py-4 text-center text-sm text-muted-foreground">
            You do not have permission to transition from the current status.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <select
                id="status"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background uppercase"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                required
              >
                <option value={currentStatus} disabled>
                   Current: {currentStatus.replace("_", " ")}
                </option>
                {allowedStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || status === currentStatus}>
                {isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
