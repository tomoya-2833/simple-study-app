import type { Metadata } from "next";
import { FlashcardDeck } from "@/components/flashcard-deck";

export const metadata: Metadata = {
  title: "Flashcards",
  description: "Add question and answer pairs, then flip the cards to study.",
};

export default function FlashcardsPage() {
  return <FlashcardDeck />;
}
