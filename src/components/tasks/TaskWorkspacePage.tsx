import { notFound } from "next/navigation";
import { fetchTask, fetchTaskPage } from "@/lib/tasks/queries";
import { parseTaskId } from "@/lib/tasks/schema";
import { TaskWorkspace, type TaskDialogState } from "./TaskWorkspace";

export interface TaskWorkspacePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export async function TaskWorkspacePage({ searchParams, home = false }: TaskWorkspacePageProps & { home?: boolean }) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const rawPage = first(params.page);
  const requestedPage = /^\d+$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Number(rawPage) : 1;
  const data = await fetchTaskPage(query, requestedPage);
  let dialog: TaskDialogState = first(params.new) === "1" ? { mode: "new" } : null;
  for (const mode of ["view", "edit", "delete"] as const) {
    if (!params[mode]) continue;
    const id = parseTaskId(first(params[mode]));
    const task = id === null ? null : await fetchTask(id);
    if (!task) notFound();
    dialog = { mode, task };
    break;
  }
  return <TaskWorkspace key={JSON.stringify([query, data.page, dialog])} initialData={data} initialQuery={query} initialDialog={dialog} home={home} />;
}
