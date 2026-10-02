import Link from "next/link";
import type { Task } from "@/lib/tasks/schema";
import { LocalTime } from "@/components/ui/LocalTime";

/** Compact list item linking to a task's details page. */
export function TaskCard({ task }: { task: Task }) {
  return (
    <li>
      <Link
        href={`/tasks/${task.id}`}
        className="group block rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-accent/50 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-accent"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 truncate font-medium group-hover:text-accent">{task.title}</h2>
          <span className="shrink-0 text-xs text-muted">
            <LocalTime iso={task.updatedAt} />
          </span>
        </div>
        {task.description && (
          <p className="mt-1 line-clamp-2 break-words text-sm text-muted">{task.description}</p>
        )}
      </Link>
    </li>
  );
}
