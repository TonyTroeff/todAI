"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { buttonClasses } from "@/components/ui/button";
import { LocalTime } from "@/components/ui/LocalTime";
import { TITLE_MAX_LENGTH, DESCRIPTION_MAX_LENGTH } from "@/lib/tasks/limits";
import type { TaskDialogState } from "./TaskWorkspace";

type OpenDialog = NonNullable<TaskDialogState>;

export function TaskDialog({ state, onClose, onChange, onSaved }: {
  state: OpenDialog;
  onClose: () => void;
  onChange: (state: TaskDialogState) => void;
  onSaved: (message: string) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const deleted = useRef(false);
  const task = "task" in state ? state.task : null;
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ title?: string[]; description?: string[] }>({});
  const heading = { new: "New task", edit: "Edit task", delete: "Delete task?", view: "Task details" }[state.mode];

  useEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    // React autofocus runs before the native dialog opens; focus again when visible.
    if (titleRef.current) titleRef.current.focus();
    else if (cancelRef.current) cancelRef.current.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (!deleted.current && trigger?.isConnected) trigger.focus();
      else document.querySelector<HTMLButtonElement>("[data-task-create]")?.focus();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    setErrors({});
    try {
      const response = await fetch(task ? `/api/tasks/${task.id}` : "/api/tasks", {
        method: state.mode === "delete" ? "DELETE" : task ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(state.mode === "delete" ? {} : { body: JSON.stringify({ title, description }) }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        setErrors(error.errors ?? {});
        throw new Error(error.message ?? "Unable to save your changes. Please try again.");
      }
      deleted.current = state.mode === "delete";
      onSaved(state.mode === "delete" ? "Task deleted." : task ? "Task updated." : "Task created.");
    } catch (failure) {
      setMessage(failure instanceof Error ? failure.message : "Unable to save your changes.");
      setPending(false);
    }
  }

  return (
    <dialog ref={ref} aria-labelledby="task-dialog-title" aria-describedby={state.mode === "delete" ? "delete-description" : undefined}
      className={`task-dialog ${state.mode === "delete" ? "task-dialog-confirm" : "task-dialog-panel"}`}
      onCancel={(event) => { event.preventDefault(); if (!pending) onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || pending) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
        <h2 id="task-dialog-title" className="text-xl font-semibold">{heading}</h2>
        <button aria-label="Close dialog" disabled={pending} className={buttonClasses("ghost", "px-2")} onClick={onClose}>✕</button>
      </div>
      {state.mode === "view" && task ? (
        <div className="space-y-6 pt-6">
          <h3 className="break-words text-2xl font-semibold">{task.title}</h3>
          <p className="whitespace-pre-wrap break-words text-muted">{task.description || "No description."}</p>
          <dl className="space-y-2 border-t border-border pt-4 text-sm">
            <div><dt className="text-muted">Created</dt><dd><LocalTime iso={task.createdAt} /></dd></div>
            <div><dt className="text-muted">Last updated</dt><dd><LocalTime iso={task.updatedAt} /></dd></div>
          </dl>
          <div className="flex gap-2">
            <button className={buttonClasses("primary")} onClick={() => onChange({ mode: "edit", task })}>Edit task</button>
            <button className={buttonClasses("ghost", "text-danger hover:text-danger")} onClick={() => onChange({ mode: "delete", task })}>Delete</button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5 pt-6">
          {message && <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">{message}</p>}
          {state.mode === "delete" ? (
            <p id="delete-description" className="break-words">Delete <strong>“{task?.title}”</strong>? <span className="mt-2 block text-sm text-muted">This action cannot be undone.</span></p>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between gap-2"><label htmlFor="task-title" className="text-sm font-medium">Title</label><span className="text-xs text-muted">{title.length}/{TITLE_MAX_LENGTH}</span></div>
                <input ref={titleRef} id="task-title" name="title" autoFocus required maxLength={TITLE_MAX_LENGTH} value={title} disabled={pending} autoComplete="off" placeholder="What needs to be done?"
                  aria-invalid={!!errors.title} aria-describedby={errors.title ? "task-title-error" : undefined} onChange={(event) => setTitle(event.target.value)} className={inputClasses} />
                {errors.title && <p id="task-title-error" className="text-sm text-danger">{errors.title.join(" ")}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-2"><label htmlFor="task-description" className="text-sm font-medium">Description <span className="font-normal text-muted">(optional)</span></label><span className="text-xs text-muted">{description.length}/{DESCRIPTION_MAX_LENGTH}</span></div>
                <textarea id="task-description" name="description" rows={8} maxLength={DESCRIPTION_MAX_LENGTH} value={description} disabled={pending} placeholder="Add more details…"
                  aria-invalid={!!errors.description} aria-describedby={errors.description ? "task-description-error" : undefined} onChange={(event) => setDescription(event.target.value)} className={`${inputClasses} resize-y`} />
                {errors.description && <p id="task-description-error" className="text-sm text-danger">{errors.description.join(" ")}</p>}
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button ref={cancelRef} type="button" autoFocus={state.mode === "delete"} disabled={pending} onClick={onClose} className={buttonClasses("secondary")}>Cancel</button>
            <button type="submit" disabled={pending} className={buttonClasses(state.mode === "delete" ? "danger" : "primary")}>
              {pending ? state.mode === "delete" ? "Deleting…" : "Saving…" : state.mode === "delete" ? "Delete task" : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

const inputClasses = "w-full rounded-lg border border-border bg-background px-3 py-2 focus:outline-2 focus:outline-accent aria-[invalid=true]:border-danger disabled:opacity-60";
