# FieldOps

A Field Service Management platform for service jobs, technicians, and clients.

## Setup Instructions

### 1. Prerequisites
- Node.js (v20+)
- MongoDB Atlas cluster URL (or local MongoDB running)

### 2. Environment Variables

**Backend (`backend/.env`):**
Duplicate the example file to create your local environment configuration:
```bash
cp backend/.env.example backend/.env
```
Ensure the following variables are configured in `backend/.env`:
- `MONGO_URI`: Your MongoDB connection string (e.g., local or MongoDB Atlas).
- `PORT`: The port the backend server will run on (default is 5000).
- `FRONTEND_URL`: The URL of the frontend application (usually `http://localhost:3000`).
- `JWT_SECRET`: A secure, random string used for signing access tokens.
- `JWT_REFRESH_SECRET`: A secure, random string used for signing refresh tokens.
- `JWT_EXPIRES_IN`: Expiration time for access tokens (e.g., `15m`).
- `JWT_REFRESH_EXPIRES_IN`: Expiration time for refresh tokens (e.g., `7d`).

**Frontend (`frontend/.env.local`):**
Duplicate the example file to create your local environment configuration:
```bash
cp frontend/.env.example frontend/.env.local
```
Ensure the following variable is configured in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL`: The URL pointing to your backend API (usually `http://localhost:5000/api`).

### 3. Install Requirements
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Create Initial User
After ensuring MongoDB is accessible, seed the admin account:
```bash
cd backend
node utils/seed.js
```
*Creates `admin@fieldops.com` / `Admin@123`*

### 5. Run the Application
Run the backend (on port 5000):
```bash
cd backend
npm run dev
```

Run the frontend (on port 3000):
```bash
cd frontend
npm run dev
```

## Assumptions Made
1. **Notifications:** Assumed in-app notifications are preferable to email, as it guarantees no paid dependencies.
2. **Technician Scope:** Assumed Technicians should not be able to reassign their own jobs or see other technicians' jobs.
3. **Data Protection:** Assumed jobs are never hard-deleted to preserve accounting/service history.

## Trade-offs
- **Polling vs WebSockets:** I accepted the trade-off of polling for notifications (every 30s) instead of maintaining WebSocket connections to reduce server strain and architecture complexity for this scope.
- **Embedded Logging:** Job activity logs are strictly embedded inside the Job document. This makes loading a job detail extremely fast but means querying system-wide logs (across all jobs) would require an aggregation pipeline.

## What's Missing / Incomplete
- Advanced reporting for Admins. Right now, there isn't a complex high-level reporting dashboard, though they have complete control over standard listings.
- No file upload functionality for jobs (e.g. attaching before/after photos).
