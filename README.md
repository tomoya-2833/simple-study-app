# Study

A small study app built with Next.js (App Router), TypeScript, React, and Tailwind CSS. Track what you need to study, then practice with flashcards. There is no backend: tasks and cards are stored in the browser with `localStorage`.

## Prerequisites

- Node.js 20 or newer
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` is the study task list. Add a task, mark it done, or remove it.
- `/flashcards` is the deck. Add a question and answer, then click a card to flip it.

## Production

```bash
npm run build
npm start
```

## Checks

```bash
npm run lint
```

## Data

Tasks are stored under `study.tasks` and flashcards under `study.cards` in `localStorage`. Clearing site data for this origin removes them. The first visit seeds a few example tasks and cards; deleting them leaves the lists empty.

## Project layout

```text
src/app/page.tsx                 Task list homepage
src/app/flashcards/page.tsx      Flashcard page
src/components/task-board.tsx    Add, complete, and remove tasks
src/components/flashcard-deck.tsx Add cards and flip them
src/lib/storage.ts               Storage keys, seeds, and parsers
```
