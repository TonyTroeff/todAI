/** Visual variants shared by `<button>` and `<Link>` elements. */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium " +
  "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
  secondary: "border border-border bg-surface hover:bg-surface-hover",
  danger: "bg-danger text-white hover:bg-danger-hover dark:text-background",
  ghost: "text-muted hover:bg-surface-hover hover:text-foreground",
};

/** Returns the class list for a button-styled element. */
export function buttonClasses(variant: ButtonVariant = "primary", extra = ""): string {
  return `${base} ${variants[variant]} ${extra}`.trim();
}
