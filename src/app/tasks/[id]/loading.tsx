/** Skeleton shown instantly while a single task (details/edit/delete) loads. */
export default function TaskLoading() {
  return (
    <div aria-busy="true" aria-label="Loading task" className="animate-pulse space-y-4">
      <div className="h-4 w-40 rounded bg-border" />
      <div className="h-9 w-2/3 rounded bg-border" />
      <div className="h-48 rounded-xl bg-border/60" />
    </div>
  );
}
