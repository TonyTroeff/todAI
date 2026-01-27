export function unixSecondsToDate(unixSeconds: number): Date {
  return new Date(unixSeconds * 1000);
}

export function formatLocalDateTimeFromUnixSeconds(unixSeconds: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(unixSecondsToDate(unixSeconds));
}

// For date-only values stored as UTC midnight. Formats as a UTC calendar date while
// still respecting the user's locale (e.g., 22 Jan 2026 vs 1/22/2026).
export function formatUtcDateFromUnixSeconds(unixSeconds: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(unixSecondsToDate(unixSeconds));
}

export function unixSecondsUtcMidnightFromDateInput(value: string): number {
  // Expected HTML input[type="date"] value: YYYY-MM-DD
  const match = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(value);
  if (!match) {
    throw new Error('Invalid date input value');
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const ms = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  const date = new Date(ms);

  // Guard against overflow (e.g., 2026-02-31).
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error('Invalid calendar date');
  }

  return Math.floor(ms / 1000);
}

export function dateInputFromUnixSecondsUtcMidnight(unixSeconds: number): string {
  return unixSecondsToDate(unixSeconds).toISOString().slice(0, 10);
}
