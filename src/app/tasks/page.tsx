import type { Metadata } from "next";
import { TaskWorkspacePage, type TaskWorkspacePageProps } from "@/components/tasks/TaskWorkspacePage";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage(props: TaskWorkspacePageProps) {
  return <TaskWorkspacePage {...props} />;
}
