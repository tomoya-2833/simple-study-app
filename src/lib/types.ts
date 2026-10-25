export type StudyTask = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
};

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  createdAt: number;
};
