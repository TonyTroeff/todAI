import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { deleteTaskAction } from "@/lib/tasks/actions";
import { loadTaskOr404 } from "@/lib/tasks/loaders";

interface DeleteTaskPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DeleteTaskPageProps): Promise<Metadata> {
  const task = await loadTaskOr404((await params).id);
  return { title: `Delete: ${task.title}` };
}

/** Delete confirmation page — deletion only happens on explicit confirm. */
export default async function DeleteTaskPage({ params }: DeleteTaskPageProps) {
  const task = await loadTaskOr404((await params).id);

  return (
    <>
      <PageHeader
        title="Delete task"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tasks", href: "/tasks" },
          { label: task.title, href: `/tasks/${task.id}` },
          { label: "Delete" },
        ]}
      />

      <form
        action={deleteTaskAction.bind(null, task.id)}
        className="space-y-5 rounded-xl border border-danger/40 bg-surface p-4 shadow-sm sm:p-6"
      >
        <div className="space-y-1">
          <p>
            Are you sure you want to delete{" "}
            <strong className="break-words">“{task.title}”</strong>?
          </p>
          <p className="text-sm text-muted">This action cannot be undone.</p>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Link href={`/tasks/${task.id}`} className={buttonClasses("secondary")}>
            Cancel
          </Link>
          <SubmitButton variant="danger" pendingLabel="Deleting…">
            Delete task
          </SubmitButton>
        </div>
      </form>
    </>
  );
}
