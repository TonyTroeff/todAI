"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import type { TaskFormState } from "@/lib/tasks/actions";
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/lib/tasks/limits";
import { buttonClasses } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/SubmitButton";

type TaskFormAction = (state: TaskFormState, formData: FormData) => Promise<TaskFormState>;

interface TaskFormProps {
  /** Server action that handles the submission (create, or update bound to an id). */
  action: TaskFormAction;
  /** Initial field values (for editing). */
  defaultValues?: { title: string; description: string; priority?: number; dueDate?: string | null };
  submitLabel: string;
  pendingLabel: string;
  /** Where the Cancel link goes. */
  cancelHref: string;
}

const inputClasses =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-base shadow-sm " +
  "placeholder:text-muted/70 focus:border-accent focus:outline-2 focus:outline-accent/30 " +
  "aria-[invalid=true]:border-danger";

/**
 * Shared create/edit form for tasks.
 *
 * Works as a plain HTML form (progressive enhancement); with JavaScript it
 * additionally shows inline validation errors and character counters
 * without a full page reload. Server-side validation is authoritative.
 */
export function TaskForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
  cancelHref,
}: TaskFormProps) {
  const [state, formAction] = useActionState(action, {});
  const values = state.values ?? defaultValues ?? { title: "", description: "", priority: 3, dueDate: null };

  // Tracked only for the character counters; inputs stay uncontrolled.
  // (React resets the form after a submission to `defaultValue`, which is
  // the submitted text on error, so the counters remain accurate.)
  const [lengths, setLengths] = useState({
    title: values.title.length,
    description: values.description.length,
  });

  return (
    <form
      action={formAction}
      noValidate
      className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-6"
    >
      {state.message && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <Field
        id="title"
        label="Title"
        count={lengths.title}
        max={TITLE_MAX_LENGTH}
        errors={state.errors?.title}
      >
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={TITLE_MAX_LENGTH}
          defaultValue={values.title}
          placeholder="What needs to be done?"
          autoFocus
          autoComplete="off"
          aria-invalid={!!state.errors?.title}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
          onChange={(e) => setLengths((l) => ({ ...l, title: e.target.value.length }))}
          className={inputClasses}
        />
      </Field>

      <Field
        id="description"
        label="Description"
        optional
        count={lengths.description}
        max={DESCRIPTION_MAX_LENGTH}
        errors={state.errors?.description}
      >
        <textarea
          id="description"
          name="description"
          rows={8}
          maxLength={DESCRIPTION_MAX_LENGTH}
          defaultValue={values.description}
          placeholder="Add more details…"
          aria-invalid={!!state.errors?.description}
          aria-describedby={state.errors?.description ? "description-error" : undefined}
          onChange={(e) => setLengths((l) => ({ ...l, description: e.target.value.length }))}
          className={`${inputClasses} resize-y`}
        />
      </Field>

      <Field id="priority" label="Priority" optional errors={state.errors?.priority}>
        <select id="priority" name="priority" defaultValue={values.priority ?? 3}
          aria-invalid={!!state.errors?.priority} aria-describedby={state.errors?.priority ? "priority-error" : undefined} className={inputClasses}>
          <option value="1">1 — Most important</option>
          <option value="2">2</option>
          <option value="3">3 — Default</option>
          <option value="4">4 — Least important</option>
        </select>
      </Field>
      <Field id="due-date" label="Due date" optional errors={state.errors?.dueDate}>
        <input id="due-date" name="dueDate" type="date" defaultValue={values.dueDate ?? ""}
          aria-invalid={!!state.errors?.dueDate} aria-describedby={state.errors?.dueDate ? "due-date-error" : undefined} className={inputClasses} />
      </Field>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonClasses("secondary")}>
          Cancel
        </Link>
        <SubmitButton pendingLabel={pendingLabel}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  count?: number;
  max?: number;
  errors?: string[];
  children: React.ReactNode;
}

/** Label + control + character counter + error messages. */
function Field({ id, label, optional, count, max, errors, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {optional && <span className="ml-1 font-normal text-muted">(optional)</span>}
        </label>
        {count !== undefined && max !== undefined && <span
          className={`text-xs tabular-nums ${count > max * 0.9 ? "text-danger" : "text-muted"}`}
        >
          {count}/{max}
        </span>}
      </div>
      {children}
      {errors && errors.length > 0 && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
