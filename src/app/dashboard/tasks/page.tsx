import type { Metadata } from "next";
import { CheckSquare } from "lucide-react";
import { getTasks, getProjects } from "@/lib/dashboard/data";
import { TasksBoard } from "@/components/dashboard/tasks/tasks-board";
import { NewTaskButton } from "@/components/dashboard/tasks/new-task-button";

export const metadata: Metadata = {
  title: "Tasks",
  robots: { index: false, follow: false },
};

export default async function TasksPage() {
  const [tasks, projects] = await Promise.all([getTasks(), getProjects()]);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl grid place-items-center bg-signal-400/10 border border-signal-400/20">
            <CheckSquare className="h-5 w-5 text-signal-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Tasks</h1>
            <p className="text-sm text-zinc-500">Your active queue, by stage</p>
          </div>
        </div>
        <NewTaskButton projects={projects.map((p) => ({ id: p.id, name: p.name }))} />
      </header>

      <TasksBoard initialTasks={tasks} />
    </div>
  );
}
