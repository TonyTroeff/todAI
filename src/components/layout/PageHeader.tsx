import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  /** Trail of parent pages; the last crumb is usually the current page. */
  breadcrumbs?: Crumb[];
  /** Buttons or links shown next to the title. */
  actions?: React.ReactNode;
}

/** Standard page heading with optional breadcrumbs and action buttons. */
export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
            {breadcrumbs.map((crumb, i) => (
              <li key={i} className="flex min-w-0 items-center gap-1">
                {i > 0 && <span aria-hidden>/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="truncate hover:text-foreground hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="max-w-[16rem] truncate">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
