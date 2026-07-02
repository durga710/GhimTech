import type { Metadata } from "next";
import { CheckSquare } from "lucide-react";
import { getTasks, getProjects } from "@/lib/dashboard/data";
import { TasksBoard } from "@/components/dashboard/tasks/tasks-board";
import { NewTaskButton } from "@/components/dashboard/tasks/new-task-button";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";

export const metadata: Metadata = {
  title: "Tasks",
  robots: { index: false, follow: false },
};

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Work queue"
        icon={CheckSquare}
        title="Tasks"
        description="Your active queue, sorted by stage, now framed as a command surface rather than a utility list."
        tone="vital"
        action={<NewTaskButton projects={projects.map((p) => ({ id: p.id, name: p.name }))} />}
      />

      <TasksBoard initialTasks={tasks} />
    </div>
  );
}
