import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { fetchTaskCount } from "@/lib/tasks/queries";

/** Home / dashboard. Future sections of the app can surface summaries here. */
export default async function HomePage() {
  const count = await fetchTaskCount();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome to tod<span className="text-accent">AI</span>
        </h1>
        <p className="max-w-prose text-muted">
          Capture what needs doing, keep it organised, and get on with your day.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/tasks"
          className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-colors hover:border-accent/50 hover:bg-surface-hover"
        >
          <p className="text-sm text-muted">Total tasks</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums">{count}</p>
          <p className="mt-3 text-sm font-medium text-accent">View all tasks →</p>
        </Link>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div>
            <p className="font-medium">Got something on your mind?</p>
            <p className="mt-1 text-sm text-muted">Add it as a task before you forget.</p>
          </div>
          <Link href="/tasks/new" className={buttonClasses("primary", "self-start")}>
            + New task
          </Link>
        </div>
      </section>
    </div>
  );
}
