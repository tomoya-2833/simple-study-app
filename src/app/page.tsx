import type { Metadata } from "next";
import { TaskBoard } from "@/components/task-board";

export const metadata: Metadata = {
  title: "Tasks",
  description: "Add study tasks, mark them done, and remove the ones you finish.",
};

export default function HomePage() {
  return <TaskBoard />;
}
