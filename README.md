# todAI

A task manager built with **Next.js 15**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **SQLite** (`better-sqlite3`). Tasks have a title and optional description.

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is created automatically at `data/todai.db` (git-ignored). Set `TODAI_DB_PATH` for a different location.

| Script | Description |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript checks |
| `npm test` | Repository and API tests |
| `npm run seed -- 1000` | Insert sample tasks |

## Task workspace

Home (`/`) lists tasks with search, pagination, creation, editing and deletion. The **todAI** logo returns home; the header retains **Tasks** (`/tasks`) for the dedicated section and future navigation alongside projects/categories.

Both pages share the task workspace. Search matches titles and descriptions as you type (250 ms debounce), and lists contain 20 tasks per page, most recently updated first. Each task has direct Edit and Delete controls. Click a task to read its full details.

Creation, viewing and editing open a side panel. Deletion opens a confirmation dialog. Save/delete refresh the list in place, preserving search and pagination; stale pages clamp to the last available page. Dialogs trap focus, support Escape/backdrop dismissal, restore focus, and prevent duplicate submissions while saving. Validation and request errors preserve entered text and allow retrying. The interactive controls require JavaScript; the initial list renders on the server.

Search/pagination are reflected in `?q=` and `?page=`. Dialog deep links use `?new=1`, `?view=ID`, `?edit=ID`, or `?delete=ID`. Legacy `/tasks/new`, `/tasks/[id]`, `/tasks/[id]/edit`, and `/tasks/[id]/delete` URLs redirect to the appropriate dialog on `/tasks`.

## JSON API

| Method | Endpoint | Result |
|---|---|---|
| GET | `/api/tasks?q=term&page=1` | `{ tasks, total, page, pageCount }` |
| POST | `/api/tasks` | Created task, 201, Location header |
| GET | `/api/tasks/[id]` | Task or 404 |
| PUT | `/api/tasks/[id]` | Updated task or 404 |
| DELETE | `/api/tasks/[id]` | 204 (idempotent for valid IDs) |

POST and PUT accept JSON `{ "title": "Buy milk", "description": "Two litres" }`. Description defaults to an empty string when omitted. Title is required, with a 200-character limit; description has a 5,000-character limit. Fields are trimmed before validation. Malformed JSON or invalid fields return 400 with a `message` and optional field `errors`. Invalid IDs return 404. Invalid page values default to 1; pages beyond the last page clamp to the last page.

## Architecture

- `src/components/tasks/TaskWorkspacePage.tsx`: server-rendered initial data and dialog deep links.
- `TaskWorkspace.tsx`: shared list, debounced search, pagination and in-place refresh.
- `TaskDialog.tsx`: accessible dialogs and API-backed task forms.
- `src/app/api/tasks/`: JSON CRUD handlers.
- `src/lib/tasks/schema.ts`: shared Zod validation and task types.
- `repository.ts`: prepared SQL statements and database validation.
- `queries.ts`: dynamic reads and pagination.
- `src/lib/db/`: shared connection and versioned migrations.

Reads render initially through server components; subsequent list requests and writes use the JSON API. Successful writes invalidate server-rendered task pages. SQLite uses WAL mode, prepared statements and schema constraints.

To add a section, create a route under `src/app/` and add a `NavLink` to `SiteHeader.tsx`. To add task fields, append a migration, then update the schema, repository and dialog form.

For live backups, use SQLite's online backup API, for example `sqlite3 data/todai.db ".backup backup.db"`; copying only the database file can miss writes still in its WAL file.
