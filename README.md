# todAI

A fast, simple multi-page task manager built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** and **SQLite** (via `better-sqlite3`).

Tasks currently have a **title** and an optional **description**, and can be created, viewed, edited, deleted and searched.

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev        # http://localhost:3000
```

The SQLite database is created automatically on first request at `data/todai.db` (git-ignored). Set `TODAI_DB_PATH` to use a different location.

### Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type check |
| `npm test` | Unit tests (Vitest) |
| `npm run seed -- 1000` | Insert N sample tasks (useful for performance checks) |

## Pages

The app is a multi-page application — every screen has its own URL, and the browser's back/forward buttons work as expected.

| Route | Page |
|---|---|
| `/` | Home / dashboard |
| `/tasks` | Task list with search (`?q=`) and pagination (`?page=`) |
| `/tasks/new` | Create a task |
| `/tasks/[id]` | Task details |
| `/tasks/[id]/edit` | Edit a task |
| `/tasks/[id]/delete` | Confirm deletion |

## Architecture

```
src/
  app/                    Routes (one folder per page), layout, loading/error/404 pages
  components/
    layout/               Site header, navigation, page header + breadcrumbs
    tasks/                Task-specific UI (form, card, search, pagination, empty state)
    ui/                   Generic UI building blocks (buttons, submit button, time)
  lib/
    db/
      connection.ts       Opens SQLite, sets pragmas, caches the shared connection
      migrations.ts       Versioned schema migrations (PRAGMA user_version)
    tasks/
      limits.ts           Field length limits (shared by server and client)
      schema.ts           Task type + zod validation
      repository.ts       All SQL for tasks (prepared statements)
      queries.ts          Read helpers for Server Components
      loaders.ts          Route-param → task (or 404) helper
      actions.ts          Server Actions for create / update / delete
scripts/seed.ts           Sample-data generator
```

Data flows in one direction:

- **Reads:** page (Server Component) → `queries.ts` → `repository.ts` → SQLite
- **Writes:** `<form action>` → `actions.ts` (validate) → `repository.ts` → revalidate → redirect

### Design notes

- **Fast & responsive:** pages render on the server and ship little JavaScript. `<Link>` prefetching makes navigation feel instant, and `loading.tsx` skeletons appear immediately while data loads. Submit buttons show a pending state and disable themselves to prevent double submits.
- **Scales to many tasks:** the list is paginated (20 per page) and searched in SQL, so pages stay light no matter how many tasks exist. A composite index backs the default sort order.
- **No freezes:** database work happens on the server, so the browser's main thread is never blocked. Seeding runs in a single transaction.
- **Data safety:** SQLite runs in WAL mode (atomic, crash-safe commits). All queries use prepared statements. Input is validated with zod in the server actions *and* in the repository, and the schema has `CHECK` constraints as a final guard. Schema changes are versioned migrations applied in a transaction.
- **Progressive enhancement:** all forms are real HTML forms backed by Server Actions, so they work even before JavaScript loads.
- **Responsive & accessible:** mobile-first layout, dark mode via `prefers-color-scheme`, labelled controls, visible focus styles and ARIA attributes for errors, breadcrumbs and pagination.

### Extending the app

- **New page/section:** add a folder under `src/app/`, and a `NavLink` in `src/components/layout/SiteHeader.tsx`.
- **New task field:** append a migration in `src/lib/db/migrations.ts` (never edit existing ones), then update `schema.ts`, `repository.ts` and `TaskForm.tsx`.

### Backups

`data/todai.db` is a regular SQLite file. To back it up safely while the app is running, use SQLite's online backup, e.g. `sqlite3 data/todai.db ".backup backup.db"`. Copying the file while the app is running can miss recent writes that are still in the `-wal` file.
