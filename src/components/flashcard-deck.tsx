"use client";

import { useEffect, useState } from "react";
import { TrashIcon } from "@/components/icons";
import { PageIntro } from "@/components/page-intro";
import {
  CARDS_STORAGE_KEY,
  STARTER_CARDS,
  createId,
  parseCards,
} from "@/lib/storage";
import type { Flashcard } from "@/lib/types";
import { usePersistentState } from "@/lib/use-persistent-state";

export function FlashcardDeck() {
  const {
    value: cards,
    setValue: setCards,
    hydrated,
  } = usePersistentState(CARDS_STORAGE_KEY, STARTER_CARDS, parseCards);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const safeIndex = cards.length === 0 ? 0 : Math.min(index, cards.length - 1);
  const card = cards[safeIndex];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const typing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (typing) return;

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((current) =>
          cards.length === 0 ? 0 : (current + 1) % cards.length,
        );
        setFlipped(false);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((current) =>
          cards.length === 0 ? 0 : (current - 1 + cards.length) % cards.length,
        );
        setFlipped(false);
      } else if (
        (event.key === " " || event.key === "Enter") &&
        !target.closest("[data-flip-card], button, a")
      ) {
        if (cards.length === 0) return;
        event.preventDefault();
        setFlipped((current) => !current);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cards.length]);

  function addCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuestion = question.trim();
    const nextAnswer = answer.trim();
    if (!nextQuestion || !nextAnswer) return;

    const next: Flashcard = {
      id: createId(),
      question: nextQuestion,
      answer: nextAnswer,
      createdAt: Date.now(),
    };
    setCards((current) => [...current, next]);
    setIndex(cards.length);
    setFlipped(false);
    setQuestion("");
    setAnswer("");
  }

  function removeCard(id: string) {
    const removeAt = cards.findIndex((item) => item.id === id);
    if (removeAt === -1) return;
    const next = cards.filter((item) => item.id !== id);
    setCards(next);
    setIndex((current) => {
      if (removeAt < current) return current - 1;
      return Math.min(current, Math.max(0, next.length - 1));
    });
    setFlipped(false);
  }

  function showCard(nextIndex: number) {
    setIndex(nextIndex);
    setFlipped(false);
  }

  function move(delta: number) {
    if (cards.length === 0) return;
    setIndex((current) => (current + delta + cards.length) % cards.length);
    setFlipped(false);
  }

  const canAdd = question.trim().length > 0 && answer.trim().length > 0;

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2">
      <div className="lg:col-start-1 lg:row-start-1">
        <PageIntro
          eyebrow="Flashcards"
          title="Ask, then flip."
          description="Add a question and an answer. Click a card to reveal the other side. Cards stay in this browser."
        />
      </div>

      <section
        className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-3 lg:row-start-1"
        aria-label="Card deck"
      >
        <CardStage
          hydrated={hydrated}
          cards={cards}
          card={card}
          safeIndex={safeIndex}
          flipped={flipped}
          onFlip={() => setFlipped((current) => !current)}
          onMove={move}
          onRemove={() => {
            if (card) removeCard(card.id);
          }}
        />
      </section>

      <form
        onSubmit={addCard}
        className="panel flex flex-col gap-4 p-4 sm:p-5 lg:col-start-1 lg:row-start-2"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="card-question" className="text-sm font-medium">
            Question
          </label>
          <textarea
            id="card-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={submitOnModifierEnter}
            placeholder="What do you want to remember?"
            maxLength={400}
            rows={3}
            className="w-full resize-y rounded-2xl border border-line bg-background px-3 py-3 text-base outline-none ring-accent/40 placeholder:text-muted/80 focus:ring-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="card-answer" className="text-sm font-medium">
            Answer
          </label>
          <textarea
            id="card-answer"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            onKeyDown={submitOnModifierEnter}
            placeholder="The answer you want to recall"
            maxLength={400}
            rows={3}
            className="w-full resize-y rounded-2xl border border-line bg-background px-3 py-3 text-base outline-none ring-accent/40 placeholder:text-muted/80 focus:ring-2"
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted">Ctrl or ⌘ Enter adds the card.</p>
          <button
            type="submit"
            disabled={!canAdd}
            className="h-11 rounded-2xl bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add card
          </button>
        </div>
      </form>

      <section
        aria-label="All flashcards"
        className="flex flex-col gap-3 lg:col-start-1 lg:row-start-3"
      >
        <h2 className="text-sm font-medium text-muted">
          {hydrated ? `${cards.length} saved` : "Saved cards"}
        </h2>
        {!hydrated ? (
          <div className="h-24 animate-pulse rounded-2xl bg-surface-muted" aria-hidden="true" />
        ) : cards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            Your deck is empty.
          </p>
        ) : (
          <ul className="space-y-2">
            {cards.map((item, itemIndex) => {
              const selected = item.id === card?.id;
              return (
                <li key={item.id} className="flex items-stretch gap-2">
                  <button
                    type="button"
                    onClick={() => showCard(itemIndex)}
                    aria-current={selected ? "true" : undefined}
                    className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-accent bg-surface"
                        : "border-line bg-surface/70 hover:border-foreground/20"
                    }`}
                  >
                    <span className="block text-xs font-medium text-muted">
                      Card {itemIndex + 1}
                    </span>
                    <span className="mt-1 block line-clamp-2 break-words text-sm leading-5">
                      {item.question}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCard(item.id)}
                    aria-label={`Delete card: ${item.question}`}
                    className="grid w-11 shrink-0 place-items-center rounded-2xl border border-line text-muted transition hover:border-danger/30 hover:bg-danger/10 hover:text-danger"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function CardStage({
  hydrated,
  cards,
  card,
  safeIndex,
  flipped,
  onFlip,
  onMove,
  onRemove,
}: {
  hydrated: boolean;
  cards: Flashcard[];
  card: Flashcard | undefined;
  safeIndex: number;
  flipped: boolean;
  onFlip: () => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  if (!hydrated) {
    return (
      <div className="h-80 animate-pulse rounded-[1.4rem] bg-surface-muted" aria-hidden="true" />
    );
  }

  if (!card) {
    return (
      <div className="panel grid h-80 place-items-center px-6 text-center sm:h-96">
        <div>
          <p className="font-display text-3xl tracking-tight">No cards yet</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Add a question and answer to start the deck.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <p>
          Card {safeIndex + 1} of {cards.length}
        </p>
        <p>{flipped ? "Answer" : "Question"}</p>
      </div>
      <div className="flip-scene h-80 sm:h-96">
        <div
          className={`flip-card ${flipped ? "is-flipped" : ""}`}
          data-flip-card
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          onClick={onFlip}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            onFlip();
          }}
        >
          <span className="flip-face" aria-hidden={flipped} inert={flipped}>
            <span className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              Question
            </span>
            <span className="mt-4 font-display text-3xl leading-tight tracking-tight text-balance">
              {card.question}
            </span>
            <span className="mt-auto pt-6 text-sm text-muted">Click to reveal the answer</span>
          </span>
          <span className="flip-face flip-face-back" aria-hidden={!flipped} inert={!flipped}>
            <span className="text-xs font-semibold tracking-[0.16em] uppercase opacity-80">
              Answer
            </span>
            <span className="mt-4 font-display text-3xl leading-tight tracking-tight text-balance">
              {card.answer}
            </span>
            <span className="mt-auto pt-6 text-sm opacity-80">Click to show the question</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={cards.length < 2}
            className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm font-medium transition hover:border-foreground/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={cards.length < 2}
            className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm font-medium transition hover:border-foreground/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="h-11 rounded-2xl px-3 text-sm font-medium text-danger transition hover:bg-danger/10"
        >
          Delete
        </button>
      </div>
      <p className="text-xs text-muted">Arrow keys move between cards. Space flips the card.</p>
    </div>
  );
}

function submitOnModifierEnter(event: React.KeyboardEvent<HTMLTextAreaElement>) {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  }
}
