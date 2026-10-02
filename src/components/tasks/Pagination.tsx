import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Current search query, preserved across pages. */
  query: string;
}

function pageHref(page: number, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/tasks?${qs}` : "/tasks";
}

/** Previous / next links for the paginated task list. */
export function Pagination({ page, pageCount, query }: PaginationProps) {
  if (pageCount <= 1) return null;

  const disabled = "pointer-events-none opacity-50";

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-2">
      <Link
        href={pageHref(page - 1, query)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={buttonClasses("secondary", page <= 1 ? disabled : "")}
      >
        ← Previous
      </Link>
      <span className="text-sm text-muted">
        Page <span className="font-medium text-foreground">{page}</span> of {pageCount}
      </span>
      <Link
        href={pageHref(page + 1, query)}
        aria-disabled={page >= pageCount}
        tabIndex={page >= pageCount ? -1 : undefined}
        className={buttonClasses("secondary", page >= pageCount ? disabled : "")}
      >
        Next →
      </Link>
    </nav>
  );
}
