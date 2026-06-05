# IssueFlow — Issue Management Platform

A minimal, full-stack issue tracking platform built as a coding challenge for Zartek Technologies. Designed with clean architecture, type safety, and AI-powered analysis.

## Live Demo

| | URL |
|---|---|
| 🌐 Frontend | https://issue-tracker-psi-rosy.vercel.app |
| ⚙️ Backend API | https://issue-tracker-backend-f167.onrender.com/api |
| 💚 Health Check | https://issue-tracker-backend-f167.onrender.com/api/health |

> **Note:** Backend is hosted on Render's free tier and may take 20–30 seconds to respond on the first request after a period of inactivity.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TailwindCSS, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Render managed) |
| ORM | Drizzle ORM |
| AI | Google Gemini API |
| Deployment | Vercel (frontend), Render (backend + DB) |

---

## Architecture

```mermaid
graph TB
    subgraph Client["🌐 Frontend (Vercel)"]
        A[Next.js 14 App Router]
        B[TailwindCSS UI]
        C[TypeScript]
    end

    subgraph Server["⚙️ Backend (Render)"]
        D[Express.js REST API]
        E[Drizzle ORM]
        F[Zod Validation]
    end

    subgraph Database["🗄️ Database (Render)"]
        G[(PostgreSQL)]
        H[issues table]
        I[comments table]
        J[ai_analyses table]
    end

    subgraph AI["🤖 AI Layer"]
        K[Google Gemini API]
    end

    A -->|REST API calls| D
    D --> E
    E --> G
    G --> H
    G --> I
    G --> J
    D -->|Issue + Comments| K
    K -->|Summary, Root Cause,\nSuggestions, Sentiment| D
```

## Database Schema

```mermaid
erDiagram
    issues {
        uuid id PK
        varchar title
        text description
        varchar status
        varchar priority
        varchar label
        timestamp created_at
        timestamp updated_at
    }
    comments {
        uuid id PK
        uuid issue_id FK
        text content
        varchar author
        timestamp created_at
    }
    ai_analyses {
        uuid id PK
        uuid issue_id FK
        text summary
        text root_cause
        text suggestions
        varchar sentiment
        timestamp generated_at
    }

    issues ||--o{ comments : "has many"
    issues ||--o| ai_analyses : "has one"
```

## API Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend
    participant Database
    participant Gemini

    User->>Frontend: Create Issue
    Frontend->>Backend: POST /api/issues
    Backend->>Database: Insert issue
    Database-->>Backend: Issue created
    Backend-->>Frontend: Issue object
    Frontend-->>User: Redirect to issue detail

    User->>Frontend: Generate AI Analysis
    Frontend->>Backend: POST /api/analysis/generate/:id
    Backend->>Database: Fetch issue + comments
    Database-->>Backend: Issue data
    Backend->>Gemini: Send prompt
    Gemini-->>Backend: JSON analysis
    Backend->>Database: Save analysis
    Backend-->>Frontend: Analysis result
    Frontend-->>User: Show insights
```

## Features

- Create, view, edit, and delete issues
- Filter issues by status, priority, and label
- Search issues by title
- View full issue detail with discussion thread
- Add and delete comments on issues
- Trigger Gemini AI analysis — generates summary, root cause, suggestions, and sentiment
- Responsive design, works on mobile and desktop

---

## Project Structure

```
issue-tracker/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts        # Drizzle schema (issues, comments, ai_analyses)
│   │   │   └── index.ts         # DB connection
│   │   ├── routes/
│   │   │   ├── issues.ts        # CRUD endpoints for issues
│   │   │   ├── comments.ts      # CRUD endpoints for comments
│   │   │   └── analysis.ts      # AI analysis endpoints
│   │   ├── services/
│   │   │   ├── issueService.ts
│   │   │   ├── commentService.ts
│   │   │   └── aiService.ts     # Gemini integration
│   │   ├── middleware/
│   │   │   └── errorHandler.ts
│   │   └── index.ts
│   └── drizzle/migrations/
└── frontend/
    ├── app/
    │   ├── page.tsx             # Issues list
    │   ├── issues/new/          # Create issue
    │   └── issues/[id]/         # Issue detail + edit
    ├── components/
    └── lib/api.ts               # All API calls
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/issues` | List all issues (supports ?status, ?priority, ?label, ?search) |
| GET | `/api/issues/:id` | Get single issue |
| POST | `/api/issues` | Create issue |
| PUT | `/api/issues/:id` | Update issue |
| DELETE | `/api/issues/:id` | Delete issue |
| GET | `/api/comments/:issueId` | Get comments for an issue |
| POST | `/api/comments` | Add a comment |
| DELETE | `/api/comments/:id` | Delete a comment |
| GET | `/api/analysis/:issueId` | Get latest AI analysis |
| POST | `/api/analysis/generate/:issueId` | Generate new AI analysis |

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Gemini API key — get free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone https://github.com/sallu09876/issue_tracker.git
cd issue_tracker
```

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/issue_tracker
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```

Run migrations and seed data:
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

### Backend
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/issue_tracker` |
| `PORT` | Server port | `4000` |
| `GEMINI_API_KEY` | Google Gemini API key | `Abcd...` |

### Frontend
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:4000/api` |

---

## Database Schema

- **issues** — id, title, description, status, priority, label, created_at, updated_at
- **comments** — id, issue_id, content, author, created_at
- **ai_analyses** — id, issue_id, summary, root_cause, suggestions, sentiment, generated_at

---

## Docker Setup

### Prerequisites
- Docker Desktop installed and running

### Run with Docker Compose

1. Clone the repo
```bash
   git clone https://github.com/sallu09876/issue_tracker.git
   cd issue_tracker
```

2. Create a `.env` file in the project root:
```env
   GEMINI_API_KEY=your_gemini_api_key_here
```

3. Start all services:
```bash
   docker-compose up --build
```

4. Open the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000/api
   - Health check: http://localhost:4000/api/health

5. Stop all services:
```bash
   docker-compose down
```

> Database data is persisted in a Docker volume. To reset:
> `docker-compose down -v`
