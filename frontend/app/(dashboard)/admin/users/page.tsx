"use client";

import { useUsers } from "@/hooks/useUsers";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users as UsersIcon, Search, PlusCircle } from "lucide-react";
import { CreateUserDialog } from "@/components/shared/CreateUserDialog";

export default function AdminUsersPage() {
  const { data: users, isLoading } = useUsers();

  const roleColors: Record<string, string> = {
    admin: "bg-slate-800",
    technician: "bg-blue-600",
    client: "bg-emerald-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage system access and roles.</p>
        </div>
        <CreateUserDialog>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </CreateUserDialog>
      </div>

      <div className="flex items-center gap-4 bg-background p-4 rounded-lg border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                </TableRow>
              ))
            ) : users && users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${roleColors[user.role]} text-white border-0 capitalize`}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <span className="text-sm text-green-600 font-medium flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-600 mr-2" /> Active
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium flex items-center">
                        <span className="h-2 w-2 rounded-full bg-muted-foreground mr-2" /> Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <UsersIcon className="h-8 w-8 mb-2 opacity-20" />
                    <p>No users found.</p>
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
