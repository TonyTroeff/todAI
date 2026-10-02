import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { updateTaskAction } from "@/lib/tasks/actions";
import { loadTaskOr404 } from "@/lib/tasks/loaders";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditTaskPageProps): Promise<Metadata> {
  const task = await loadTaskOr404((await params).id);
  return { title: `Edit: ${task.title}` };
}

/** Edit-task page. */
export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const task = await loadTaskOr404((await params).id);

  return (
    <>
      <PageHeader
        title="Edit task"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tasks", href: "/tasks" },
          { label: task.title, href: `/tasks/${task.id}` },
          { label: "Edit" },
        ]}
      />
      <TaskForm
        action={updateTaskAction.bind(null, task.id)}
        defaultValues={{ title: task.title, description: task.description }}
        submitLabel="Save changes"
        pendingLabel="Saving…"
        cancelHref={`/tasks/${task.id}`}
      />
    </>
  );
}
