"use client";

const formatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Renders an ISO timestamp in the viewer's locale and time zone.
 * The server render may differ slightly from the browser's, so hydration
 * warnings for the text are suppressed intentionally.
 */
export function LocalTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {formatter.format(new Date(iso))}
    </time>
  );
}
