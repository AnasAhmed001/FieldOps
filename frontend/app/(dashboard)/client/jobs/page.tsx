"use client";

import { useJobs } from "@/hooks/useJobs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wrench } from "lucide-react";

export default function ClientJobsPage() {
  const { data: jobs, isLoading } = useJobs();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500 hover:bg-yellow-600",
    assigned: "bg-blue-500 hover:bg-blue-600",
    in_progress: "bg-purple-500 hover:bg-purple-600",
    on_hold: "bg-orange-500 hover:bg-orange-600",
    completed: "bg-green-500 hover:bg-green-600",
    cancelled: "bg-red-500 hover:bg-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Service Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">View the status of your requests.</p>
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Technician</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                </TableRow>
              ))
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{job.title}</span>
                      <span className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {job.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[job.status]} text-white border-0`}>
                      {job.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "TBD"}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {job.assignedTechnician ? job.assignedTechnician.name : "Will be assigned soon"}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mb-2 opacity-20" />
                    <p>You have no active service jobs.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
