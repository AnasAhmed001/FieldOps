"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname, redirect } from "next/navigation";
import { LogOut, LayoutDashboard, Users, UserCircle2, Bell, Wrench } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { data: notificationData } = useNotifications();

  // Role protection & unauthenticated redirect
  useEffect(() => {
    if (!isLoading && user) {
      if (pathname.startsWith("/admin") && user.role !== "admin") {
        router.replace(`/${user.role}/jobs`);
      } else if (pathname.startsWith("/technician") && user.role !== "technician") {
        router.replace(`/${user.role}/jobs`);
      } else if (pathname.startsWith("/client") && user.role !== "client") {
        router.replace(`/${user.role}/jobs`);
      }
    } else if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    {
      href: `/${user.role}/jobs`,
      label: "Jobs",
      icon: LayoutDashboard,
      roles: ["admin", "technician", "client"],
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      roles: ["admin"],
    },
  ];

  const allowedLinks = navLinks.filter((link) => link.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Wrench className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight">FieldOps</span>
          <Badge variant="outline" className="ml-auto capitalize text-xs">
            {user.role}
          </Badge>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {allowedLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-9 w-9 text-muted-foreground" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-end px-6 border-b bg-background shrink-0">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationData && notificationData.unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {notificationData && notificationData.unreadCount > 0 && (
                    <Badge variant="secondary">{notificationData.unreadCount} new</Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto">
                  {notificationData?.notifications?.length ? (
                    notificationData.notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`p-3 text-sm border-b last:border-0 ${
                          n.isRead ? "opacity-60" : "bg-muted/50 font-medium"
                        }`}
                      >
                        <p>{n.message}</p>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No notifications
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6" />

            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </main>
    </div>
  );
}
