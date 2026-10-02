import { fetchTaskPage } from "@/lib/tasks/queries";
import { getTaskRepository } from "@/lib/tasks/repository";
import { readTaskInput, refreshTaskPages } from "@/lib/tasks/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawPage = params.get("page") ?? "1";
  const page = /^\d+$/.test(rawPage) && Number.isSafeInteger(Number(rawPage))
    ? Math.max(1, Number(rawPage)) : 1;
  return Response.json(await fetchTaskPage((params.get("q") ?? "").trim(), page));
}

export async function POST(request: Request) {
  const input = await readTaskInput(request);
  if (input.response) return input.response;
  const task = getTaskRepository().create(input.data!);
  refreshTaskPages();
  return Response.json(task, { status: 201, headers: { Location: `/api/tasks/${task.id}` } });
}
