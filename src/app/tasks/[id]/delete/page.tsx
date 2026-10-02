import { redirect } from "next/navigation";
import { loadTaskOr404 } from "@/lib/tasks/loaders";

export default async function DeleteTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const task = await loadTaskOr404((await params).id);
  redirect(`/tasks?delete=${task.id}`);
}
