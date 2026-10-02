import Form from "next/form";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/**
 * Task search box. A GET form targeting `/tasks?q=…`, so results are
 * bookmarkable and work without JavaScript; `next/form` turns submissions
 * into client-side navigations when JavaScript is available.
 */
export function SearchForm({ query }: { query: string }) {
  return (
    <Form action="/tasks" role="search" className="flex gap-2">
      <label htmlFor="q" className="sr-only">
        Search tasks
      </label>
      <input
        // Re-mount when the query changes so the box reflects the URL.
        key={query}
        id="q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder="Search tasks…"
        className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-base shadow-sm placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-accent/30"
      />
      <button type="submit" className={buttonClasses("secondary")}>
        Search
      </button>
      {query && (
        <Link href="/tasks" className={buttonClasses("ghost")}>
          Clear
        </Link>
      )}
    </Form>
  );
}
