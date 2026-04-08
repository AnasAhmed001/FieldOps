"use client";

import { useJob, useAddNote } from "@/hooks/useJobs";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, UserIcon, Clock, Send, FileText, Activity, Wrench } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AssignTechnicianDialog } from "@/components/shared/AssignTechnicianDialog";
import { UpdateStatusDialog } from "@/components/shared/UpdateStatusDialog";

export default function AdminJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: job, isLoading } = useJob(id);
  const { mutate: addNote, isPending: addingNote } = useAddNote(id);
  const [noteText, setNoteText] = useState("");

  if (isLoading) {
    return <div className="p-8 space-y-4 max-w-4xl mx-auto"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found.</div>;
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote(noteText, { onSuccess: () => setNoteText("") });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
            <Badge variant="outline" className="text-sm px-3 py-1 bg-muted/50 uppercase">
              {job.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">Job ID: {job._id}</p>
        </div>
        <div className="ml-auto flex gap-2">
           <UpdateStatusDialog jobId={id} currentStatus={job.status} userRole="admin">
             <Button variant="outline">Update Status</Button>
           </UpdateStatusDialog>
           <AssignTechnicianDialog jobId={id} currentTechnicianId={job.assignedTechnician?._id}>
             <Button>
               {job.assignedTechnician ? "Reassign" : "Assign Technician"}
             </Button>
           </AssignTechnicianDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-primary" /> Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{job.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {job.notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No notes added yet.</p>
                ) : (
                  job.notes.map((note) => (
                    <div key={note._id} className="bg-muted/30 p-3 rounded-lg border text-sm">
                      <p className="whitespace-pre-wrap">{note.text}</p>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                        <span className="font-medium">{note.addedBy.name}</span>
                        <span>{new Date(note.addedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Separator />
              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                 <Input 
                   placeholder="Add a new note..." 
                   value={noteText}
                   onChange={e => setNoteText(e.target.value)}
                   disabled={addingNote}
                 />
                 <Button type="submit" size="icon" disabled={addingNote || !noteText.trim()}>
                   <Send className="h-4 w-4" />
                 </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase">People & Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
               <div>
                  <div className="flex items-center text-muted-foreground mb-1">
                    <UserIcon className="h-4 w-4 mr-2" /> Client
                  </div>
                  <div className="font-medium">{job.client.name}</div>
                  <div className="text-muted-foreground text-xs">{job.client.email}</div>
               </div>
               <Separator />
               <div>
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Wrench className="h-4 w-4 mr-2" /> Technician
                  </div>
                  {job.assignedTechnician ? (
                    <>
                      <div className="font-medium">{job.assignedTechnician.name}</div>
                      <div className="text-muted-foreground text-xs">{job.assignedTechnician.email}</div>
                    </>
                  ) : <div className="text-muted-foreground italic">Unassigned</div>}
               </div>
               <Separator />
               <div>
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4 mr-2" /> Scheduled
                  </div>
                  <div className="font-medium">
                    {job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : "TBD"}
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary" /> Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-muted ml-3 space-y-4 pb-2">
                {job.activityLog.slice().reverse().map((log, i) => (
                  <div key={log._id} className="relative pl-6">
                    <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary/50 ring-4 ring-background" />
                    <div className="text-sm">
                      <p className="font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {log.performedBy.name} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
