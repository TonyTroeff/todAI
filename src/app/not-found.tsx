import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/** 404 page, also rendered when a task id does not exist. */
export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted">
        The page or task you’re looking for doesn’t exist or was deleted.
      </p>
      <Link href="/tasks" className={buttonClasses("primary", "mt-6")}>
        Go to tasks
      </Link>
    </div>
  );
}
