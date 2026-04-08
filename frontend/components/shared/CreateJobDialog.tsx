"use client";

import { useState } from "react";
import { useCreateJob } from "@/hooks/useJobs";
import { useClients } from "@/hooks/useUsers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateJobDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");

  const { data: clients, isLoading: loadingClients } = useClients();
  const { mutate: createJob, isPending } = useCreateJob();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !clientId) return;

    createJob(
      { title, description, client: clientId, scheduledDate: scheduledDate || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setClientId("");
          setScheduledDate("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <select
              id="client"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              required
              disabled={loadingClients}
            >
              <option value="">Select a client...</option>
              {clients?.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.name} ({client.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
              rows={4}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
            <Input
              id="scheduledDate"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !title || !description || !clientId}>
              {isPending ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
