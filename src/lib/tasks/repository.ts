import type Database from "better-sqlite3";
import { getDb } from "@/lib/db/connection";
import { taskInputSchema, type Task, type TaskInput } from "./schema";

/** Shape of a row in the `tasks` table. */
interface TaskRow {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ListTasksOptions {
  /** Case-insensitive substring matched against title and description. */
  query?: string;
  limit: number;
  offset: number;
}

export interface TaskPage {
  tasks: Task[];
  /** Total number of tasks matching the query (ignoring limit/offset). */
  total: number;
}

const COLUMNS = "id, title, description, created_at, updated_at";
const SEARCH_CLAUSE =
  "WHERE title LIKE @pattern ESCAPE '\\' OR description LIKE @pattern ESCAPE '\\'";

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Escapes LIKE wildcards so user input is matched literally. */
function toLikePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

/**
 * Creates a task repository bound to a specific database connection.
 *
 * All statements are prepared once and reused, which is both fast and
 * immune to SQL injection. Input is validated here as well as in the server
 * actions, so the data layer can never store invalid tasks.
 */
export function createTaskRepository(db: Database.Database) {
  const statements = {
    listAll: db.prepare<{ limit: number; offset: number }, TaskRow>(
      `SELECT ${COLUMNS} FROM tasks
       ORDER BY updated_at DESC, id DESC LIMIT @limit OFFSET @offset`,
    ),
    listSearch: db.prepare<
      { pattern: string; limit: number; offset: number },
      TaskRow
    >(
      `SELECT ${COLUMNS} FROM tasks ${SEARCH_CLAUSE}
       ORDER BY updated_at DESC, id DESC LIMIT @limit OFFSET @offset`,
    ),
    countAll: db.prepare<[], { total: number }>(
      "SELECT COUNT(*) AS total FROM tasks",
    ),
    countSearch: db.prepare<{ pattern: string }, { total: number }>(
      `SELECT COUNT(*) AS total FROM tasks ${SEARCH_CLAUSE}`,
    ),
    get: db.prepare<[number], TaskRow>(
      `SELECT ${COLUMNS} FROM tasks WHERE id = ?`,
    ),
    insert: db.prepare<{ title: string; description: string }, TaskRow>(
      `INSERT INTO tasks (title, description) VALUES (@title, @description)
       RETURNING ${COLUMNS}`,
    ),
    update: db.prepare<
      { id: number; title: string; description: string },
      TaskRow
    >(
      `UPDATE tasks
       SET title = @title, description = @description,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = @id
       RETURNING ${COLUMNS}`,
    ),
    delete: db.prepare<[number]>("DELETE FROM tasks WHERE id = ?"),
  };

  /** Counts tasks, optionally filtered by a search query. */
  function count(query?: string): number {
    const q = query?.trim();
    const row = q
      ? statements.countSearch.get({ pattern: toLikePattern(q) })
      : statements.countAll.get();
    return row?.total ?? 0;
  }

  return {
    count,

    /**
     * Returns one page of tasks (most recently updated first) together with
     * the total number of matches. Both reads run in one transaction so the
     * page and total are consistent with each other.
     */
    list: db.transaction(({ query, limit, offset }: ListTasksOptions): TaskPage => {
      const q = query?.trim();
      const rows = q
        ? statements.listSearch.all({ pattern: toLikePattern(q), limit, offset })
        : statements.listAll.all({ limit, offset });
      return { tasks: rows.map(toTask), total: count(q) };
    }),

    /** Returns a task by id, or `null` if it does not exist. */
    get(id: number): Task | null {
      const row = statements.get.get(id);
      return row ? toTask(row) : null;
    },

    /** Validates and inserts a new task. Throws a `ZodError` on invalid input. */
    create(input: TaskInput): Task {
      const data = taskInputSchema.parse(input);
      return toTask(statements.insert.get(data)!);
    },

    /**
     * Validates and updates an existing task.
     * Returns `null` if no task with that id exists.
     */
    update(id: number, input: TaskInput): Task | null {
      const data = taskInputSchema.parse(input);
      const row = statements.update.get({ id, ...data });
      return row ? toTask(row) : null;
    },

    /** Deletes a task. Returns `true` if a task was removed. */
    delete(id: number): boolean {
      return statements.delete.run(id).changes > 0;
    },
  };
}

export type TaskRepository = ReturnType<typeof createTaskRepository>;

let repository: TaskRepository | undefined;

/** Returns the repository bound to the application's database. */
export function getTaskRepository(): TaskRepository {
  repository ??= createTaskRepository(getDb());
  return repository;
}
