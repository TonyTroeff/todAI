import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TaskForm } from "@/components/tasks/TaskForm";
import { createTaskAction } from "@/lib/tasks/actions";

export const metadata: Metadata = { title: "New task" };

/** Create-task page. */
export default function NewTaskPage() {
  return (
    <>
      <PageHeader
        title="New task"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tasks", href: "/tasks" },
          { label: "New" },
        ]}
      />
      <TaskForm
        action={createTaskAction}
        submitLabel="Create task"
        pendingLabel="Creating…"
        cancelHref="/tasks"
      />
    </>
  );
}
