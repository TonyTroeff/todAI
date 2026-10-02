import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { buttonClasses } from "@/components/ui/button";
import { LocalTime } from "@/components/ui/LocalTime";
import { loadTaskOr404 } from "@/lib/tasks/loaders";

interface TaskPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TaskPageProps): Promise<Metadata> {
  const task = await loadTaskOr404((await params).id);
  return { title: task.title };
}

/** Task details page. */
export default async function TaskPage({ params }: TaskPageProps) {
  const task = await loadTaskOr404((await params).id);

  return (
    <>
      <PageHeader
        title={task.title}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Tasks", href: "/tasks" },
          { label: task.title },
        ]}
        actions={
          <>
            <Link href={`/tasks/${task.id}/edit`} className={buttonClasses("secondary")}>
              Edit
            </Link>
            <Link
              href={`/tasks/${task.id}/delete`}
              className={buttonClasses("ghost", "text-danger hover:text-danger")}
            >
              Delete
            </Link>
          </>
        }
      />

      <article className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6">
        {task.description ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed">{task.description}</p>
        ) : (
          <p className="italic text-muted">No description.</p>
        )}

        <dl className="mt-6 grid gap-x-6 gap-y-1 border-t border-border pt-4 text-sm text-muted sm:grid-cols-[auto_1fr]">
          <dt>Created</dt>
          <dd className="text-foreground">
            <LocalTime iso={task.createdAt} />
          </dd>
          <dt>Last updated</dt>
          <dd className="text-foreground">
            <LocalTime iso={task.updatedAt} />
          </dd>
        </dl>
      </article>

      <Link href="/tasks" className="mt-6 inline-block text-sm text-muted hover:text-foreground">
        ← Back to all tasks
      </Link>
    </>
  );
}
