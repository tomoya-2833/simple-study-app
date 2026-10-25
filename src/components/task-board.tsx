"use client";

import { useMemo, useState } from "react";
import { CheckIcon, TrashIcon } from "@/components/icons";
import { PageIntro } from "@/components/page-intro";
import {
  STARTER_TASKS,
  TASKS_STORAGE_KEY,
  createId,
  parseTasks,
} from "@/lib/storage";
import type { StudyTask } from "@/lib/types";
import { usePersistentState } from "@/lib/use-persistent-state";

type Filter = "all" | "open" | "done";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "done", label: "Done" },
];

export function TaskBoard() {
  const {
    value: tasks,
    setValue: setTasks,
    hydrated,
  } = usePersistentState(TASKS_STORAGE_KEY, STARTER_TASKS, parseTasks);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const done = tasks.filter((task) => task.done).length;
    return { done, open: tasks.length - done, total: tasks.length };
  }, [tasks]);

  const visibleTasks = tasks.filter((task) => {
    if (filter === "open") return !task.done;
    if (filter === "done") return task.done;
    return true;
  });

  const progress = counts.total === 0 ? 0 : Math.round((counts.done / counts.total) * 100);

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    const task: StudyTask = {
      id: createId(),
      title,
      done: false,
      createdAt: Date.now(),
    };
    setTasks((current) => [task, ...current]);
    setDraft("");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearFinished() {
    setTasks((current) => current.filter((task) => !task.done));
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <PageIntro
        eyebrow="Study list"
        title="What are you studying?"
        description="Add a task, check it off, or remove it. Your list stays in this browser."
      />

      <form onSubmit={addTask} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="task-title">
          New study task
        </label>
        <input
          id="task-title"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a study task"
          maxLength={160}
          autoComplete="off"
          className="h-12 w-full rounded-2xl border border-line bg-surface px-4 text-base text-foreground outline-none ring-accent/40 placeholder:text-muted/80 focus:ring-2"
        />
        <button
          type="submit"
          disabled={draft.trim().length === 0}
          className="h-12 shrink-0 rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add task
        </button>
      </form>

      <section className="panel px-4 py-4 sm:px-5" aria-label="Progress">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">Finished</p>
            <p className="font-display text-3xl tracking-tight">{progress}%</p>
          </div>
          <p className="text-sm text-muted">
            {counts.open} open · {counts.done} done
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Study tasks finished"
        >
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-line bg-surface p-1" role="group" aria-label="Filter tasks">
          {filters.map((item) => {
            const selected = filter === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setFilter(item.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "bg-foreground text-background"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
        {counts.done > 0 ? (
          <button
            type="button"
            onClick={clearFinished}
            className="text-sm font-medium text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Clear finished
          </button>
        ) : null}
      </div>

      {!hydrated ? (
        <div className="space-y-3" aria-hidden="true">
          <p className="sr-only">Loading your study list.</p>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : visibleTasks.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line px-4 py-10 text-center text-muted">
          {tasks.length === 0
            ? "Nothing on your list yet. Add the next thing you want to study."
            : filter === "open"
              ? "Every task is checked off."
              : "No finished tasks yet."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visibleTasks.map((task) => (
            <li
              key={task.id}
              className="flex items-start gap-2 rounded-2xl border border-line bg-surface px-3 py-3 sm:px-4"
            >
              <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  className="peer sr-only"
                />
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-line text-transparent peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 break-words pt-0.5 text-base leading-6 peer-checked:text-muted peer-checked:line-through">
                  {task.title}
                </span>
              </label>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                aria-label={`Remove ${task.title}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition hover:bg-danger/10 hover:text-danger"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
