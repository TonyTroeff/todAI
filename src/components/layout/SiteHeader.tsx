import Link from "next/link";
import { NavLink } from "./NavLink";

/**
 * Global header shown on every page. Add links for new top-level
 * sections of the app to the `<nav>` below.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center gap-2 px-4 sm:gap-4">
        <Link href="/" className="mr-auto flex items-center gap-2 text-lg font-semibold">
          <span
            aria-hidden
            className="grid size-7 place-items-center rounded-md bg-accent text-sm font-bold text-accent-foreground"
          >
            t
          </span>
          <span>
            tod<span className="text-accent">AI</span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <NavLink href="/tasks">Tasks</NavLink>
        </nav>
      </div>
    </header>
  );
}
