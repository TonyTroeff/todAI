import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/** Shown when the task list (or a search) has no results. */
export function EmptyState({ query }: { query: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
      {query ? (
        <>
          <p className="font-medium">No tasks match “{query}”.</p>
          <p className="mt-1 text-sm text-muted">Try a different search term.</p>
          <Link href="/tasks" className={buttonClasses("secondary", "mt-4")}>
            Show all tasks
          </Link>
        </>
      ) : (
        <>
          <p className="font-medium">No tasks yet.</p>
          <p className="mt-1 text-sm text-muted">Create your first task to get started.</p>
          <Link href="/tasks/new" className={buttonClasses("primary", "mt-4")}>
            Create a task
          </Link>
        </>
      )}
    </div>
  );
}
