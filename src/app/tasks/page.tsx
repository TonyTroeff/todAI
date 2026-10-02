import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/tasks/EmptyState";
import { Pagination } from "@/components/tasks/Pagination";
import { SearchForm } from "@/components/tasks/SearchForm";
import { TaskCard } from "@/components/tasks/TaskCard";
import { buttonClasses } from "@/components/ui/button";
import { fetchTaskPage } from "@/lib/tasks/queries";

export const metadata: Metadata = { title: "Tasks" };

interface TasksPageProps {
  searchParams: Promise<{ q?: string | string[]; page?: string | string[] }>;
}

/** Reads a single string value from a search param that may be repeated. */
function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Paginated, searchable list of all tasks. */
export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const query = first(params.q).trim();
  const requestedPage = Number.parseInt(first(params.page), 10) || 1;

  const { tasks, total, page, pageCount } = await fetchTaskPage(query, requestedPage);

  return (
    <>
      <PageHeader
        title="Tasks"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Tasks" }]}
        actions={
          <Link href="/tasks/new" className={buttonClasses("primary")}>
            + New task
          </Link>
        }
      />

      <div className="space-y-4">
        <SearchForm query={query} />

        <p className="text-sm text-muted" aria-live="polite">
          {query
            ? `${total} ${total === 1 ? "result" : "results"} for “${query}”`
            : `${total} ${total === 1 ? "task" : "tasks"}`}
        </p>

        {tasks.length === 0 ? (
          <EmptyState query={query} />
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </ul>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} query={query} />
    </>
  );
}
