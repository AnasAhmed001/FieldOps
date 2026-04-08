# FieldOps Architecture

## Overview
FieldOps is an internal Field Service Management platform designed for managing service jobs, technicians, and clients. It is built as a modular monolithic application with a clear separation between the Next.js client and the Node.js/Express backend API.

## Tech Stack & Justification

### Frontend
- **Framework:** Next.js 16.2.2 (App Router)
  *Reason:* Provides a robust file-based routing system and a fast React environment. Wait times and initial load speeds are reduced even though the site is single-page app-like, thanks to Next.js's Server-Side Rendering (SSR) options if needed inside the app router.
- **Library:** React 19.2.4
  *Reason:* Latest stable release allowing use of concurrent features.
- **Language:** TypeScript
  *Reason:* Provides strict static typing, crucial for ensuring data integrity when dealing with multiple roles (Admin, Technician, Client) and a complex Job state machine.
- **Server State Management:** TanStack React Query v5
  *Reason:* Removes the need for complex Redux setups. Caches API responses, manages background refetching, and provides built-in mutation states.
- **UI Components:** shadcn/ui + Tailwind CSS v4
  *Reason:* Highly customizable, accessible (Radix UI primitives), and produces zero runtime overhead because the code is localized. 

### Backend
- **Runtime & Framework:** Node.js + Express (ES Modules)
  *Reason:* A standard, lightweight, MVC-friendly approach that allows rapid development. Express is unopinionated, meaning we can structure it precisely how we need for the roles.
- **Database:** MongoDB via Mongoose
  *Reason:* A NoSQL database is ideal for FieldOps because the `Job` entity requires flexible, append-only arrays for both `notes` and `activityLog`. A relational schema would require 3+ tables for what is a single logical document in MongoDB.

## Database Schema Design

The datastore revolves around three primary collections:

1. **User:** Represents Admins, Technicians, and Clients.
   - Distinctive trait: Uses soft delete (`isActive: false`) to ensure that jobs previously performed or requested by deactivated users are preserved.
2. **Job:** The core entity.
   - Statuses follow a strict state machine defined per role.
   - Embeds `notes` (array of objects) directly to avoid extra joins.
   - Embeds `activityLog` (array of objects) to maintain a chronological history of changes to the job. This acts as a localized audit trail.
3. **Notification:** Stored in MongoDB instead of relying on external services (like SendGrid).
   - Serves the requirement of keeping a local system without paid cloud integrations.

## Auth Strategy

- **Stateless JWT:** Uses JSON Web Tokens.
- **Access Token:** Short-lived (15 minutes), kept entirely in memory on the client. Never securely exposed in headers outside the API logic.
- **Refresh Token:** Long-lived (7 days), stored in an `httpOnly`, `sameSite: strict` cookie. 
- **Security:** This configuration prevents XSS attacks from stealing the long-lived token, while maintaining the stateless nature of the backend.

## Job State Machine

To enforce data integrity, the system restricts status transitions:
- Admins can transition to any status except out of `completed` or `cancelled`.
- Technicians can only perform linear progress steps: `assigned` -> `in_progress` -> `completed` (or `on_hold`).

## What Was Deliberately Not Built
- **Real-Time WebSockets:** Implementing WebSockets for notifications or job updates was deliberately excluded. Polling every 30 seconds via React Query is sufficient for an internal application and drastically reduces backend complexity (no need for Redis pub/sub or socket memory management).
- **Email Notifications / Twilio SMS:** Deliberately skipped external notification services. In-app notifications fulfill the requirements while adhering tightly to the "No cloud deployment required / paid services" constraint constraint.
