# FieldOps

A Field Service Management platform for service jobs, technicians, and clients.

## Setup Instructions

### 1. Prerequisites
- Node.js (v20+)
- MongoDB Atlas cluster URL (or local MongoDB running)

### 2. Environment Variables
In the `backend` directory, duplicate the example file:
```bash
cp backend/.env.example backend/.env
```
In the `frontend` directory, create a `.env.local` file:
```bash
cp frontend/.env.example frontend/.env.local
```
*(Make sure to populate `MONGO_URI` in the backend `.env` file.)*

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
