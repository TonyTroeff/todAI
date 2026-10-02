import { mount } from "cypress/react";
import { TaskWorkspace } from "@/components/tasks/TaskWorkspace";
import type { TaskListPage } from "@/lib/tasks/queries";
import type { Task } from "@/lib/tasks/schema";

// Factories return fresh objects; tests never share mutable task state.
export function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 42,
    title: "Buy groceries",
    description: "Milk and bread",
    createdAt: "2026-10-02T08:00:00.000Z",
    updatedAt: "2026-10-02T09:00:00.000Z",
    ...overrides,
  };
}

export function taskPage(tasks: Task[]): TaskListPage {
  return { tasks, total: tasks.length, page: 1, pageCount: 1 };
}

export function mountWorkspace(tasks: Task[] = []) {
  return mount(
    <TaskWorkspace initialData={taskPage(tasks)} initialQuery="" initialDialog={null} home={false} />,
  );
}

export function mockRefresh(tasks: Task[]) {
  cy.intercept({ method: "GET", pathname: "/api/tasks", query: { q: "", page: "1" } }, {
    statusCode: 200,
    body: taskPage(tasks),
  }).as("refreshTasks");
}
