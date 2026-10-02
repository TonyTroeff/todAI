import { TaskWorkspacePage, type TaskWorkspacePageProps } from "@/components/tasks/TaskWorkspacePage";

export default function HomePage(props: TaskWorkspacePageProps) {
  return <TaskWorkspacePage {...props} home />;
}
