"use client";

import { useState } from "react";
import { useAssignJob } from "@/hooks/useJobs";
import { useTechnicians } from "@/hooks/useUsers";
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

interface AssignTechnicianDialogProps {
  jobId: string;
  currentTechnicianId?: string;
  children: React.ReactNode;
}

export function AssignTechnicianDialog({ jobId, currentTechnicianId, children }: AssignTechnicianDialogProps) {
  const [open, setOpen] = useState(false);
  const [technicianId, setTechnicianId] = useState(currentTechnicianId || "");

  const { data: technicians, isLoading: loadingTechnicians } = useTechnicians();
  const { mutate: assignJob, isPending } = useAssignJob(jobId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianId) return;

    assignJob(technicianId, {
      onSuccess: () => setOpen(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Assign Technician</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="technician">Select Technician</Label>
            <select
              id="technician"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              required
              disabled={loadingTechnicians}
            >
              <option value="">Select a technician...</option>
              {technicians?.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !technicianId || technicianId === currentTechnicianId}>
              {isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
