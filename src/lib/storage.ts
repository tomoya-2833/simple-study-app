import type { Flashcard, StudyTask } from "@/lib/types";

export const TASKS_STORAGE_KEY = "study.tasks";
export const CARDS_STORAGE_KEY = "study.cards";

export const STARTER_TASKS: StudyTask[] = [
  {
    id: "seed-task-read",
    title: "Read chapter 3 and mark the key terms",
    done: false,
    createdAt: 3,
  },
  {
    id: "seed-task-practice",
    title: "Work through 8 practice problems",
    done: false,
    createdAt: 2,
  },
  {
    id: "seed-task-review",
    title: "Review yesterday's flashcards",
    done: true,
    createdAt: 1,
  },
];

export const STARTER_CARDS: Flashcard[] = [
  {
    id: "seed-card-repetition",
    question: "What does spaced repetition do?",
    answer:
      "It schedules reviews just before you would forget, so memories stick with fewer sessions.",
    createdAt: 1,
  },
  {
    id: "seed-card-matter",
    question: "Name the three states of matter most textbooks start with.",
    answer: "Solid, liquid, and gas.",
    createdAt: 2,
  },
  {
    id: "seed-card-topic",
    question: "What is a topic sentence?",
    answer: "The sentence that states the main idea of a paragraph.",
    createdAt: 3,
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStudyTask(value: unknown): value is StudyTask {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.done === "boolean" &&
    typeof value.createdAt === "number"
  );
}

function isFlashcard(value: unknown): value is Flashcard {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.question === "string" &&
    typeof value.answer === "string" &&
    typeof value.createdAt === "number"
  );
}

export function parseTasks(value: unknown): StudyTask[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter(isStudyTask);
}

export function parseCards(value: unknown): Flashcard[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter(isFlashcard);
}

export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
