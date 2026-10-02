import { revalidatePath } from "next/cache";
import { z } from "zod";
import { taskCompletionSchema, taskInputSchema } from "./schema";

async function readJson(request: Request): Promise<{ body?: unknown; response?: Response }> {
  try {
    return { body: await request.json() };
  } catch {
    return { response: Response.json({ message: "Provide a valid JSON body." }, { status: 400 }) };
  }
}

/** Malformed JSON and field validation both produce useful client errors. */
export async function readTaskInput(request: Request) {
  const { body, response } = await readJson(request);
  if (response) return { response };
  const parsed = taskInputSchema.safeParse(body);
  if (!parsed.success) {
    return { response: Response.json({ message: "Please check the task fields.", errors: z.flattenError(parsed.error).fieldErrors }, { status: 400 }) };
  }
  return { data: parsed.data };
}

/** Reads a `{ completed: boolean }` body for toggling task completion. */
export async function readTaskCompletion(request: Request) {
  const { body, response } = await readJson(request);
  if (response) return { response };
  const parsed = taskCompletionSchema.safeParse(body);
  if (!parsed.success) {
    return { response: Response.json({ message: "Please check the task fields.", errors: z.flattenError(parsed.error).fieldErrors }, { status: 400 }) };
  }
  return { data: parsed.data };
}

export function taskNotFound() {
  return Response.json({ message: "This task no longer exists. It may have been deleted." }, { status: 404 });
}

export function refreshTaskPages() {
  revalidatePath("/", "layout");
}
