"use client";

import { useEffect, useRef, useState } from "react";
import type { TaskListPage } from "@/lib/tasks/queries";
import type { Task } from "@/lib/tasks/schema";
import { buttonClasses } from "@/components/ui/button";
import { LocalTime } from "@/components/ui/LocalTime";
import { TaskDialog } from "./TaskDialog";

export type TaskDialogState = { mode: "new" } | { mode: "view" | "edit" | "delete"; task: Task } | null;

export function TaskWorkspace({ initialData, initialQuery, initialDialog, home }: {
  initialData: TaskListPage;
  initialQuery: string;
  initialDialog: TaskDialogState;
  home: boolean;
}) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState(initialQuery);
  const [displayedQuery, setDisplayedQuery] = useState(initialQuery);
  const [page, setPage] = useState(initialData.page);
  const [revision, setRevision] = useState(0);
  const [dialog, setDialog] = useState(initialDialog);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ q: query.trim(), page: String(page) });
      try {
        const response = await fetch(`/api/tasks?${params}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load tasks. Please try again.");
        const next: TaskListPage = await response.json();
        if (controller.signal.aborted) return;
        setData(next);
        setDisplayedQuery(query.trim());
        const url = new URL(window.location.href);
        if (query.trim()) url.searchParams.set("q", query.trim()); else url.searchParams.delete("q");
        if (next.page > 1) url.searchParams.set("page", String(next.page)); else url.searchParams.delete("page");
        window.history.replaceState(null, "", `${url.pathname}${url.search}`);
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load tasks.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, page, revision]);

  function closeDialog() {
    setDialog(null);
    const url = new URL(window.location.href);
    for (const key of ["new", "view", "edit", "delete"]) url.searchParams.delete(key);
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
  }

  function saved(message: string) {
    closeDialog();
    setNotice(message);
    setRevision((value) => value + 1);
    setLoading(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          {home && <p className="text-sm font-medium text-accent">Your day, organised</p>}
          <h1 className="text-3xl font-semibold tracking-tight">{home ? "Your tasks" : "Tasks"}</h1>
          <p className="text-muted">{home ? "A clear space for everything you need to do." : "Find and manage all your tasks in one place."}</p>
        </div>
        <button data-task-create className={buttonClasses("primary")} onClick={() => { setNotice(""); setDialog({ mode: "new" }); }}>+ New task</button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <label htmlFor="task-search" className="mb-2 block text-sm font-medium">Search tasks</label>
        <div className="flex items-center gap-2">
          <input id="task-search" type="search" value={query} placeholder="Search titles and descriptions…" autoComplete="off"
            onChange={(event) => { setQuery(event.target.value); setPage(1); setLoading(true); }}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 focus:outline-2 focus:outline-accent" />
          {query && <button className={buttonClasses("ghost")} onClick={() => { setQuery(""); setPage(1); setLoading(true); }}>Clear</button>}
        </div>
      </div>

      {notice && <p role="status" className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">{notice}</p>}
      {error && <div role="alert" className="flex flex-wrap items-center gap-2 rounded-lg bg-danger-soft p-3 text-sm text-danger">{error}<button className={buttonClasses("secondary")} onClick={() => setRevision((value) => value + 1)}>Retry</button></div>}

      <section aria-label="Task list" aria-busy={loading} className="space-y-3">
        <p aria-live="polite" className="text-sm text-muted">
          {loading ? "Updating tasks…" : `${data.total} ${data.total === 1 ? "task" : "tasks"}${displayedQuery ? ` matching “${displayedQuery}”` : " · Most recently updated first"}`}
        </p>
        {data.tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <h2 className="font-medium">{displayedQuery ? "No matching tasks" : "Make room for your next idea"}</h2>
            <p className="mt-2 text-sm text-muted">{displayedQuery ? "Try another search or clear the filter." : "Add your first task to get started."}</p>
            <button className={buttonClasses("primary", "mt-4")} onClick={() => setDialog({ mode: "new" })}>+ New task</button>
          </div>
        ) : (
          <ul className="space-y-2">
            {data.tasks.map((task) => (
              <li key={task.id} className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center">
                <button className="min-w-0 flex-1 rounded text-left focus-visible:outline-2 focus-visible:outline-accent" onClick={() => setDialog({ mode: "view", task })}>
                  <h2 className="truncate font-medium hover:text-accent">{task.title}</h2>
                  {task.description && <p className="mt-1 line-clamp-2 break-words text-sm text-muted">{task.description}</p>}
                  <p className="mt-2 text-xs text-muted">Priority {task.priority}{task.dueDate && <> · Due <time dateTime={task.dueDate}>{task.dueDate}</time></>}</p>
                  <p className="mt-2 text-xs text-muted">Updated <LocalTime iso={task.updatedAt} /></p>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button className={buttonClasses("secondary")} aria-label={`Edit ${task.title}`} onClick={() => setDialog({ mode: "edit", task })}>Edit</button>
                  <button className={buttonClasses("ghost", "text-danger hover:text-danger")} aria-label={`Delete ${task.title}`} onClick={() => setDialog({ mode: "delete", task })}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {data.pageCount > 1 && <nav aria-label="Task pagination" className="flex items-center justify-between gap-2 pt-3">
          <button className={buttonClasses("secondary")} disabled={loading || data.page <= 1} onClick={() => { setPage(data.page - 1); setLoading(true); }}>Previous</button>
          <span className="text-sm text-muted">Page {data.page} of {data.pageCount}</span>
          <button className={buttonClasses("secondary")} disabled={loading || data.page >= data.pageCount} onClick={() => { setPage(data.page + 1); setLoading(true); }}>Next</button>
        </nav>}
      </section>
      {dialog && <TaskDialog key={dialog.mode + ("task" in dialog ? dialog.task.id : "")} state={dialog} onClose={closeDialog} onChange={setDialog} onSaved={saved} />}
    </div>
  );
}
