// ─── User ───────────────────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "technician" | "client";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Job ────────────────────────────────────────────────────────────────────
export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";

export interface Note {
  _id: string;
  text: string;
  addedBy: Pick<User, "_id" | "name" | "role">;
  addedAt: string;
}

export interface ActivityEntry {
  _id: string;
  action: string;
  performedBy: Pick<User, "_id" | "name" | "role">;
  timestamp: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  status: JobStatus;
  client: Pick<User, "_id" | "name" | "email">;
  assignedTechnician?: Pick<User, "_id" | "name" | "email"> | null;
  scheduledDate?: string | null;
  notes: Note[];
  activityLog: ActivityEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Notification ────────────────────────────────────────────────────────────
export type NotificationType =
  | "job_assigned"
  | "status_changed"
  | "note_added"
  | "general";

export interface Notification {
  _id: string;
  recipient: string;
  message: string;
  type: NotificationType;
  jobRef?: Pick<Job, "_id" | "title" | "status"> | null;
  isRead: boolean;
  createdAt: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface PaginatedJobs {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser extends User {}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
