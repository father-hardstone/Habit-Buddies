# Habit Buddies

Social habit-tracking app with a Next.js frontend and NestJS backend.

## Monorepo layout

```
/
├── frontend/           Next.js app (user + admin routes)
├── backend/
│   ├── databases/      JSON seed data (temporary; Supabase next)
│   └── src/            NestJS API
└── package.json
```

## Environment setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Variable | Location | Purpose |
|----------|----------|---------|
| `FRONTEND_URL` | backend/.env | CORS for the app |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | backend/.env | Admin login credentials |
| `NEXT_PUBLIC_API_URL` | frontend/.env.local | Backend API URL |
| `JWT_SECRET` | backend/.env | JWT signing secret |

Default URLs (fixed ports):
- App: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`

Set `NEXT_PUBLIC_API_URL=http://localhost:3001/api` in `frontend/.env.local` to match the backend port.

## Getting started

```bash
npm install
```

Run each server in its own terminal:

```bash
npm run dev:backend    # http://localhost:3001/api
npm run dev:frontend   # http://localhost:3000
```

Optional:

```bash
npm run genkit:dev     # AI features
```

### Admin routes

Admin pages live in the same Next.js app:

1. Open `http://localhost:3000/admin/login`
2. Sign in with credentials from `backend/.env` (default: `admin@habitbuddies.com` / `adminpassword123`)
3. Dashboard at `/admin/dashboard` — stats, users, and groups

### User app auth

1. Sign up or log in at `http://localhost:3000/login`
2. Use a demo email from `backend/databases/users.json` (e.g. `ibrahim@email.com`) for sample data

## API overview

**User auth** — `/api/auth/*`  
**User data** — `/api/data/*` (JWT required)  
**Admin** — `/api/admin/*` (admin JWT required)

| Admin endpoint | Description |
|----------------|-------------|
| `POST /api/admin/login` | Admin sign in |
| `GET /api/admin/stats` | Platform overview |
| `GET /api/admin/users` | Registered users (SQLite) |
| `GET /api/admin/demo-users` | Demo users (JSON) |
| `GET /api/admin/groups` | Groups (JSON) |

## Tech stack

- **Frontend:** Next.js 15, TypeScript, Tailwind, Shadcn UI, Genkit
- **Backend:** NestJS, TypeORM + SQLite, JSON databases, JWT

## License

MIT
