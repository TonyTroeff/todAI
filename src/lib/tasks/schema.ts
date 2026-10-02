import { z } from "zod";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "./limits";

export { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH };

/** A task as stored in the database. Timestamps are ISO-8601 UTC strings. */
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: number;
  /** Calendar date (YYYY-MM-DD), without a time or time zone. */
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation rules for user-provided task data (create and edit share them).
 * Values are trimmed before length checks.
 */
export const taskInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters.`),
  description: z
    .string()
    .trim()
    .max(
      DESCRIPTION_MAX_LENGTH,
      `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`,
    )
    .default(""),
  priority: z.number().int().min(1).max(4).default(3),
  dueDate: z.iso.date("Provide a valid due date (YYYY-MM-DD).").nullable().default(null),
});

export type TaskInput = z.input<typeof taskInputSchema>;

/** Body accepted when marking a task as completed or not completed. */
export const taskCompletionSchema = z.object({
  completed: z.boolean("Completed must be true or false."),
});

/** Parses a route segment such as `/tasks/[id]` into a positive integer id. */
export function parseTaskId(raw: string): number | null {
  if (!/^\d+$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
