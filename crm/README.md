# Enterprise CRM (Next.js + Prisma + MongoDB)

Production-ready SaaS CRM starter with multi-tenant isolation, role-based access, leads/tasks automation, activity logs, notifications, and live dashboard metrics.

## Tech Stack

- Next.js (App Router)
- TypeScript
- MongoDB + Prisma (MongoDB connector)
- NextAuth (JWT sessions)
- Tailwind CSS + shadcn-style components
- React Query
- Zod

## Folder Structure

- `src/app` - App router pages and API routes
- `src/components` - UI and reusable components
- `src/lib` - db, auth, services, validators
- `src/hooks` - React Query hooks
- `src/types` - shared TS types
- `prisma` - schema + seed

## Features Implemented

1. Multi-tenant organization isolation (`organizationId` enforced in services and query layer)
2. Role support (`ADMIN`, `MANAGER`, `AGENT`) with middleware + API checks
3. Auth (`/login`, `/signup`, NextAuth credentials JWT)
4. Leads CRUD flow:
   - create/list/update
   - auto follow-up task on lead creation
5. Tasks CRUD flow:
   - create/list/update/delete
   - assignment and reassignment
   - completion marking
   - tabs: today/upcoming/overdue/completed
   - filters by priority, assigned user, search
6. Dashboard metrics:
   - tasks due today
   - overdue tasks
   - lead count
   - completion rate
7. Activity log on key actions (lead/task create/update/complete/assign)
8. Notifications in DB for assignments and reminders
9. Background job endpoint (`POST /api/jobs/run`) for overdue + reminders

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env template

```bash
cp .env.example .env
```

3. Run Prisma generate and push schema

```bash
npm run prisma:generate
npm run prisma:push
```

4. Seed demo data

```bash
npm run prisma:seed
```

5. Start app

```bash
npm run dev
```

## Vercel Deployment

1. Import this repository in Vercel.
2. Set project root to `crm` (if deploying from monorepo root).
3. Keep default build command:

```bash
npm run build
```

4. Add required environment variables in Vercel Project Settings:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your production domain, e.g. `https://your-app.vercel.app`)
   - `CRON_SECRET` (if using `/api/jobs/run`)
5. Optional provider keys (only if integrations are enabled):
   - `SMS_PROVIDER_KEY`
   - `WHATSAPP_PROVIDER_KEY`
   - `EMAIL_PROVIDER_KEY`
   - `IVR_PROVIDER_KEY`
6. Redeploy after environment variables are set.

### Deployment Notes

- Prisma client generation is handled via `postinstall`.
- API routes are Node runtime compatible for Vercel serverless functions.
- Build currently skips linting (`next.config.ts`) but still enforces TypeScript checks.

## Demo Credentials

- Admin: `admin@acmecrm.com` / `Admin@123`
- Manager: `manager@acmecrm.com` / `Manager@123`
- Agent: `agent@acmecrm.com` / `Agent@123`

## API Endpoints

- `POST /api/tasks`
- `GET /api/tasks`
- `PUT /api/tasks/[id]`
- `DELETE /api/tasks/[id]`

- `POST /api/leads`
- `GET /api/leads`
- `PUT /api/leads/[id]`

- `GET /api/dashboard`
- `GET /api/notifications`
- `GET /api/users`
- `POST /api/jobs/run`

