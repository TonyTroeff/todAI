import { redirect } from "next/navigation";
import { loadTaskOr404 } from "@/lib/tasks/loaders";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const task = await loadTaskOr404((await params).id);
  redirect(`/tasks?edit=${task.id}`);
}
