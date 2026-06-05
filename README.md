# Issue Management Platform

A minimal but polished issue tracker inspired by Linear and Jira. Track bugs, features, and improvements with filtering, comments, and AI-powered issue analysis via Google Gemini.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18, TailwindCSS, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 14+ |
| ORM | Drizzle ORM |
| AI | Google Gemini API |

## Features

- Create, read, update, and delete issues
- Filter issues by status, priority, label, and search text
- Issue labels: bug, feature, improvement, question
- Priority levels: low, medium, high, critical
- Status workflow: open → in progress → resolved → closed
- Threaded-style comments per issue with author attribution
- AI analysis panel — Gemini generates summary, root cause, suggestions, and sentiment
- Dark-themed, responsive UI with a Linear/Notion-inspired aesthetic
- Seed data script for quick local development

## Prerequisites

- **Node.js** 18+
- **PostgreSQL** 14+
- **Gemini API key** — get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

## Setup & Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd issue_tracker
```

### 2. Backend setup

```bash
cd backend
npm install
cp ../.env.example .env
```

Edit `backend/.env` and fill in your values (see [Environment Variables](#environment-variables) below).

### 3. Run database migrations

```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed sample data

```bash
npm run db:seed
```

### 5. Start the backend

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### 6. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `frontend/.env.local` if your backend runs on a different port.

### 7. Start the frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string (backend) | `postgresql://postgres:pg7110@localhost:5432/issue_tracker` |
| `PORT` | Backend server port | `4000` |
| `GEMINI_API_KEY` | Google Gemini API key for AI analysis | `AIza...` |
| `GEMINI_MODEL` | Gemini model ID (optional) | `gemini-2.5-flash` |
| `NEXT_PUBLIC_API_URL` | Backend API base URL (frontend) | `http://localhost:4000/api` |

### PostgreSQL reference

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` |
| User | `postgres` |
| Password | `pg7110` |
| Database | `issue_tracker` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/issues` | List issues (query: `status`, `priority`, `label`, `search`) |
| GET | `/api/issues/:id` | Get issue with comment count and latest AI analysis |
| POST | `/api/issues` | Create a new issue |
| PUT | `/api/issues/:id` | Update an issue |
| DELETE | `/api/issues/:id` | Delete an issue |
| GET | `/api/comments/:issueId` | List comments for an issue |
| POST | `/api/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |
| GET | `/api/analysis/:issueId` | Get latest AI analysis for an issue |
| POST | `/api/analysis/generate/:issueId` | Generate and save a new AI analysis |

### Response format

- **Success:** `{ "data": ... }`
- **Error:** `{ "error": "message", "status": 400 }`

## Project Structure

```
issue_tracker/
├── backend/          # Express API + Drizzle ORM
│   ├── src/
│   │   ├── db/       # Schema, connection, seed
│   │   ├── routes/   # REST route handlers
│   │   ├── services/ # Business logic + Gemini AI
│   │   └── middleware/
│   └── drizzle/      # SQL migrations
├── frontend/         # Next.js 14 App Router
│   ├── app/          # Pages (issues list, detail, create, edit)
│   ├── components/   # UI components
│   ├── lib/          # API client
│   └── types/        # Shared TypeScript types
└── .env.example
```

## Useful Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Apply migrations to the database |
| `npm run db:seed` | Insert sample issues and comments |
| `npm run db:studio` | Open Drizzle Studio (DB browser) |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |

## Live Demo

Run locally:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend:** [http://localhost:4000/api/health](http://localhost:4000/api/health)

## License

MIT
