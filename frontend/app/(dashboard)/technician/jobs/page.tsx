"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { JobStatus } from "@/types";
import { Input } from "@/components/ui/input";
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
import { useRouter } from "next/navigation";
import { Wrench, Search } from "lucide-react";

export default function TechnicianJobsPage() {
  const [statusFilter, setStatusFilter] = useState<JobStatus | "">("");
  const { data: jobs, isLoading } = useJobs(statusFilter ? { status: statusFilter as JobStatus } : undefined);
  const router = useRouter();

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
          <h1 className="text-3xl font-bold tracking-tight">My Assigned Jobs</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage your service jobs.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." className="pl-9" />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-background"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map((status) => (
            <option key={status} value={status}>
              {status.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <TableRow
                  key={job._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/technician/jobs/${job._id}`)}
                >
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{job.title}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                        {job.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{job.client.name}</span>
                      <span className="text-xs text-muted-foreground">{job.client.email}</span>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Wrench className="h-8 w-8 mb-2 opacity-20" />
                    <p>No assigned jobs found.</p>
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
