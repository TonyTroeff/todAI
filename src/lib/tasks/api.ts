import { revalidatePath } from "next/cache";
import { z } from "zod";
import { taskInputSchema } from "./schema";

/** Malformed JSON and field validation both produce useful client errors. */
export async function readTaskInput(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: Response.json({ message: "Provide a valid JSON body." }, { status: 400 }) };
  }
  const parsed = taskInputSchema.safeParse(body);
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
