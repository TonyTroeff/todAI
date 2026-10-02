/** Skeleton shown instantly while the task list loads. */
export default function TasksLoading() {
  return (
    <div aria-busy="true" aria-label="Loading tasks" className="animate-pulse space-y-4">
      <div className="h-4 w-28 rounded bg-border" />
      <div className="h-9 w-40 rounded bg-border" />
      <div className="h-10 rounded-lg bg-border" />
      <ul className="space-y-2">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="h-20 rounded-xl bg-border/60" />
        ))}
      </ul>
    </div>
  );
}
