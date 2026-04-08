<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FieldOps

## Project Overview
FieldOps is a Field Service Management Platform for managing jobs, technicians, and clients.
Internal tool — not public-facing. Three roles: Admin, Technician, Client.

---

## Repo Structure
```
fieldops/                         
├── backend/
│   ├── config/
│   │   └── dbConfig.js            ← mongoose connection (already created)
│   ├── controllers/               ← one file per resource
│   │   ├── authController.js
│   │   ├── jobController.js
│   │   ├── userController.js
│   │   └── notificationController.js
│   ├── middleware/
│   │   ├── auth.middleware.js     ← protect + authorize
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Job.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── job.routes.js
│   │   ├── user.routes.js
│   │   └── notification.routes.js
│   ├── utils/
│   │   ├── notify.js              ← in-app notification helper
│   │   └── seed.js                ← seed default admin user
│   ├── .env                       ← git-ignored
│   ├── .env.example
│   └── index.js                   ← express app entry (already created)
├── frontend/                      ← Next.js 16.2.2, React 19.2.4, TypeScript
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         ← sidebar + role-aware nav
│   │   │   ├── admin/
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   └── users/page.tsx
│   │   │   ├── technician/
│   │   │   │   ├── jobs/page.tsx
│   │   │   │   └── jobs/[id]/page.tsx
│   │   │   └── client/
│   │   │       └── jobs/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx             ← root layout, AuthProvider wrapper
│   │   └── page.tsx               ← redirect to /login
│   ├── components/
│   │   ├── ui/                    ← shadcn generated components (do not edit)
│   │   └── shared/                ← custom shared components
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   ├── api.ts                 ← axios instance + interceptors
│   │   ├── queryClient.ts         ← React Query client config
│   │   └── utils.ts               ← shadcn cn() helper (auto-generated)
│   ├── hooks/                     ← React Query custom hooks (one file per resource)
│   │   ├── useJobs.ts
│   │   ├── useUsers.ts
│   │   └── useNotifications.ts
│   ├── types/
│   │   └── index.ts               ← shared TS interfaces (User, Job, etc.)
│   ├── proxy.ts               ← Next.js route protection
│   ├── CLAUDE.md                  ← frontend-scoped Claude Code config
│   ├── AGENTS.md
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── .env.local
├── docs/
│   └── ARCHITECTURE.md
├── README.md
└── QUESTIONS.md
```

---

## Tech Stack

| Layer         | Choice                       | Reason                                             |
|---------------|------------------------------|----------------------------------------------------|
| Frontend      | Next.js 16.2.2 (App Router)  | SSR, file-based routing, single repo for all roles |
| React         | React 19.2.4                 | Latest stable, concurrent features                 |
| Language      | TypeScript (strict)          | Type safety across components and API layer        |
| UI            | shadcn/ui + Tailwind CSS v4  | Accessible, composable, no runtime overhead        |
| Server State  | TanStack React Query v5      | Caching, background refetch, mutation lifecycle    |
| Backend       | Node.js + Express            | Familiar, lightweight, MVC-friendly                |
| Database      | MongoDB + Mongoose           | Flexible schema for job notes/activity logs        |
| Auth          | JWT (access + refresh)       | Stateless, secure, no session store needed         |
| HTTP Client   | Axios                        | Interceptors for token refresh, pairs with RQ      |

---

## Architecture Decisions

### Auth
- JWT access token (15min expiry) + refresh token (7d) in httpOnly cookie
- Single `/api/auth/login` endpoint for all roles — role is encoded in JWT payload
- No open registration. Admin creates all accounts (internal platform)
- Middleware: `protect` (verify JWT) + `authorize(...roles)` (role guard)

### Job Status Flow
```
pending → assigned → in_progress → completed
                  ↘ on_hold ↗
any state → cancelled (admin only)
```
- Only Admin can assign/reassign jobs
- Technician can move: `assigned → in_progress`, `in_progress → on_hold`, `in_progress → completed`
- Once `completed` or `cancelled`, status is locked unless Admin overrides

### Role Permissions Summary
| Action                  | Admin | Technician | Client |
|-------------------------|-------|------------|--------|
| Create job              | ✅    | ❌         | ❌     |
| View all jobs           | ✅    | ❌         | ❌     |
| View assigned jobs      | ✅    | ✅         | ❌     |
| View own jobs           | ✅    | ❌         | ✅     |
| Assign technician       | ✅    | ❌         | ❌     |
| Update status           | ✅    | ✅ (limited)| ❌    |
| Add notes               | ✅    | ✅         | ❌     |
| Create users            | ✅    | ❌         | ❌     |

### Notifications
- **Strategy: In-app notifications stored in MongoDB** (no email/webhooks)
- Reason: runs locally, no paid services, sufficient for internal tool
- Triggers: job assigned → notify technician; status changed → notify client + admin
- `utils/notify.js` helper called inside controllers after state changes

### Data Integrity
- Mongoose schema validation as first line of defense
- Job activity log appended (never overwritten) on every status change or note add
- Soft deletes on Users (`isActive: false`) — jobs reference preserved
- Jobs themselves are never hard deleted

---

## Backend Conventions (MVC)

### File Naming
- Models: `User.js`, `Job.js`, `Notification.js` — PascalCase
- Controllers: `authController.js`, `jobController.js` — camelCase
- Routes: `auth.routes.js`, `job.routes.js` — kebab-case with `.routes.js` suffix
- Middleware: `auth.middleware.js`, `error.middleware.js`

### Controller Pattern — always follow this shape
```js
// controllers/jobController.js
export const createJob = async (req, res, next) => {
  try {
    // 1. validate input (express-validator or manual)
    // 2. business logic
    // 3. DB operation
    // 4. trigger notifications if needed
    // 5. return consistent response
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err); // always delegate to error middleware
  }
};
```

### Response Shape — use this everywhere
```js
// Success
{ success: true, data: <payload> }

// Error (handled by error middleware)
{ success: false, message: "Human readable error" }
```

### Error Middleware — single handler in index.js (registered last)
```js
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message });
});
```

### Route Registration Pattern
```js
// routes/job.routes.js
router.get('/', protect, authorize('admin'), getJobs);
router.post('/', protect, authorize('admin'), createJob);
router.patch('/:id/assign', protect, authorize('admin'), assignJob);
router.patch('/:id/status', protect, authorize('admin', 'technician'), updateStatus);
```

---

## Frontend Conventions (Next.js 16 App Router + React 19 + React Query v5)

### React 19 Notes
- Prefer Server Components by default — add `"use client"` only when needed (hooks, events, context)
- Do NOT use `useEffect` for data fetching — use React Query hooks in Client Components instead
- `AuthContext.tsx` must be `"use client"` since it holds state

### React Query — Rules
- All server state lives in React Query. Never store API response data in `useState`
- One custom hook file per resource: `hooks/useJobs.ts`, `hooks/useUsers.ts`, `hooks/useNotifications.ts`
- Query key factory pattern — define keys at top of each hook file:
```ts
// hooks/useJobs.ts
export const jobKeys = {
  all: ['jobs'] as const,
  list: () => [...jobKeys.all, 'list'] as const,
  detail: (id: string) => [...jobKeys.all, 'detail', id] as const,
};
```
- `useQuery` for GET, `useMutation` for POST/PATCH with `onSuccess` cache invalidation:
```ts
const { mutate: assignJob } = useMutation({
  mutationFn: (data) => api.patch(`/jobs/${id}/assign`, data),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: jobKeys.list() }),
});
```
- Error handling: React Query `onError` → toast via shadcn `useToast`
- Loading states: use `isPending` (v5 — not `isLoading`) for mutations

### QueryClient Setup
```ts
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
});
```
- Wrap root `layout.tsx` with `QueryClientProvider` — must be a `"use client"` provider component

### TypeScript — define all shared types in `frontend/types/index.ts`
```ts
export interface User { _id: string; name: string; email: string; role: 'admin' | 'technician' | 'client'; isActive: boolean; }
export interface Job { _id: string; title: string; description: string; status: JobStatus; client: User; assignedTechnician?: User; scheduledDate?: string; notes: Note[]; activityLog: ActivityEntry[]; }
export type JobStatus = 'pending' | 'assigned' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
```

### Directory Rules
- Route groups: `(auth)` for public, `(dashboard)` for protected
- Page logic in `page.tsx`, layout chrome in `layout.tsx`
- Shared components in `components/shared/` — use shadcn as base, extend don't override
- All API call functions in `lib/api.ts` — hooks in `hooks/` import from there, never inline fetch

### API Layer Pattern
```ts
// lib/api.ts — single axios instance, imported by all hooks
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL, withCredentials: true });
// Response interceptor: on 401 → call /auth/refresh → retry request once
export default api;
```

### Auth Context
```ts
// context/AuthContext.tsx  ("use client")
// Exposes: user, role, login(), logout(), isLoading
// On mount: call /auth/me to rehydrate session from httpOnly cookie
// login() stores access token in memory (not localStorage)
```

### Middleware (route protection)
```ts
// middleware.ts — reads role from JWT in cookie, redirects:
// /dashboard/admin/* → admin only
// /dashboard/technician/* → technician only
// /dashboard/client/* → client only
```

### Component Conventions
- Use shadcn `DataTable` for all job listings
- Use shadcn `Dialog` for create/edit modals — keep form + mutation inside modal component
- Use shadcn `Badge` for job status — map status → color variant
- No prop drilling beyond 2 levels — use React Query cache or context

---

## Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fieldops
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Endpoints Reference

```
Auth
  POST   /api/auth/login
  POST   /api/auth/refresh
  POST   /api/auth/logout
  GET    /api/auth/me

Users (Admin only)
  GET    /api/users
  POST   /api/users
  GET    /api/users/technicians

Jobs
  GET    /api/jobs            (scoped by role)
  POST   /api/jobs            (admin)
  GET    /api/jobs/:id        (scoped by role)
  PATCH  /api/jobs/:id/assign (admin)
  PATCH  /api/jobs/:id/status (admin + technician)
  POST   /api/jobs/:id/notes  (admin + technician)

Notifications
  GET    /api/notifications
  PATCH  /api/notifications/:id/read
```

---

## MongoDB Models — Key Fields

**User**: `name, email, password, role (admin|technician|client), isActive`

**Job**: `title, description, status, client(ref), assignedTechnician(ref), scheduledDate, notes[{text, addedBy, addedAt}], activityLog[{action, performedBy, timestamp}]`

**Notification**: `recipient(ref), message, type, jobRef(ref), isRead`

---

## What NOT to Build (Scope Boundaries)
- ❌ Email notifications — in-app is sufficient, no paid services
- ❌ Real-time WebSockets — polling on page load is acceptable for this scope  
- ❌ File attachments on jobs — out of scope
- ❌ Multi-tenant support — single company use case only
- ❌ Public client registration — admin-invite only

---

## Dev Commands
```bash
# Backend (from /backend)
npm run dev          # nodemon index.js

# Frontend (from /frontend)
npm run dev          # next dev --turbopack

# Seed default admin user (run once after DB is up)
node utils/seed.js
```

---

## Build Order
1. Backend: DB connection → Models → Auth routes → Job routes → Notification utility
2. Frontend: Login page → Auth context → Dashboard layout → Admin job flow → Technician view → Client view
3. Docs: ARCHITECTURE.md → README.md → QUESTIONS.md
