---
title: "How I built a timed quiz loop with React and GraphQL"
excerpt: "The interesting part of a live quiz game isn't rendering questions. It's keeping every client on the same clock while still letting the player move fast and the server stay authoritative."
date: "2025-07-23T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "React", "GraphQL", "WebSockets"]
---

The hardest part of a quiz game isn't generating questions.

It's the loop.

You need a timer. You need keyboard input. You need manual next-question behavior. You need automatic next-question behavior when time expires. And if spectators are watching, all of that has to stay in sync across multiple clients without turning into "well, it depended on who clicked first."

That's the part I actually enjoyed building in Intelli Casino.

---

## The timer doesn't own the game state

This was the first decision that mattered.

The React timer component only counts down. It doesn't decide what the next question is. It doesn't mutate global state. It just renders time left and fires `onTimerEnd`.

```tsx
export default function StartTimer({ duration, startAt, onTimerEnd, children }: StartTimerProps) {
  const endTimeRef = useRef<Date | null>(null);

  const calculateTimeLeft = () => {
    if (!endTimeRef.current) {
      const startTime = startAt ? new Date(startAt).getTime() : new Date().getTime();
      endTimeRef.current = new Date(startTime + duration * 1000);
    }

    return Math.max(0, differenceInSeconds(endTimeRef.current, new Date()));
  };

  const [timeLeft, setTimeLeft] = useState<number>(calculateTimeLeft());
  // ...
}
```

The important detail is `startAt`.

The timer is not based on "when this component mounted." It's based on a timestamp that comes from game state. That means if another client joins late, reloads, or reconnects, it still computes the same remaining time from the same authoritative question start.

That's the difference between a timer and a live game clock.

---

## Both game modes share the same loop

Multiple-choice questions (MCQ) and open-ended questions feel different in the UI, but the loop is almost identical.

In both [`MCQ.tsx`](/Users/dmitryjum/dev/intelli-casino/components/MCQ.tsx#L27) and [`OpenEnded.tsx`](/Users/dmitryjum/dev/intelli-casino/components/OpenEnded.tsx#L27), the pattern is:

- load the current game through `useGames`
- derive `currentQuestion` from `currentQuestionIndex`
- submit an answer through `/api/checkAnswer`
- if it was the last question, call `finishGame`
- otherwise call `updateGameQuestion`
- wire `handleNext` to both Enter/button input and timer expiry

The open-ended version looks like this:

```tsx
const handleQuestionTimerEnd = React.useCallback(() => {
  if (userRole === Role.PLAYER) handleNext();
}, [handleNext]);

<StartTimer
  key={new Date(game.currentQuestionStartTime).getTime()}
  duration={QUESTION_DURATION}
  startAt={game.currentQuestionStartTime}
  onTimerEnd={handleQuestionTimerEnd}
>
  {(timeLeft) => <div>{formatTimeDelta(timeLeft)}</div>}
</StartTimer>
```

That `key` is doing useful work. When the server advances the question and `currentQuestionStartTime` changes, the timer remounts cleanly for the new round.

The MCQ component does the same thing, just with number keys and multiple-choice state on top:

```tsx
const handleKeyDown = (event: KeyboardEvent) => {
  if (userRole === Role.PLAYER) {
    if (event.key === '1') setSelectedChoice(0);
    else if (event.key === '2') setSelectedChoice(1);
    else if (event.key === '3') setSelectedChoice(2);
    else if (event.key === '4') setSelectedChoice(3);
    else if (event.key === 'Enter') handleNext();
  }
};
```

---

## The server stays authoritative about timing

The player can trigger question advancement from the client, but the timestamps that matter still come from the GraphQL mutations.

When a game opens:

```ts
let updatedData: any = {
  status: 'OPEN',
  openAt: new Date(),
  currentQuestionIndex,
  currentQuestionStartTime: new Date(new Date().getTime() + OPEN_DURATION * 1000)
};
```

When the current question advances:

```ts
const updatedData = {
  currentQuestionIndex,
  currentQuestionStartTime: new Date(currentQuestionStartTime)
};
```

That lives in [`mutationResolvers.ts`](/Users/dmitryjum/dev/intelli-casino/app/api/graphql/resolvers/mutationResolvers.ts#L12). The frontend asks for the transition, but the game record is what broadcasts the new clock to everyone else.

That's what made the loop feel stable. The timer isn't some local animation. It's a view over persisted game state.

---

## Answer checking is separate from question advancement

This split kept responsibilities readable.

The answer-checking API route validates the player, loads the question and game, computes correctness or similarity, and writes a `UserAnswer` row:

```ts
if (question.questionType === 'mcq') {
  isCorrect = question.answer.toLowerCase().trim() === userAnswer.toLocaleLowerCase().trim();
} else if (question.questionType === 'open_ended') {
  percentageCorrect =
    Math.round(compareTwoStrings(userAnswer.toLowerCase().trim(), question.answer.toLowerCase().trim()) * 100);
}

await prisma.userAnswer.create({
  data: { questionId, gameId, userId, answer: userAnswer, isCorrect, percentageCorrect },
});
```

That endpoint doesn't try to advance the game. It just scores the answer and records it. The game loop then decides whether to finish or move to the next question.

That separation helped because the scoring rules differ between MCQ and open-ended play, but the game progression rules don't differ much at all.

---

## Spectators are the pressure test

A solo quiz flow can get away with a lot of sloppy local state.

A live quiz with spectators can't. If the player's timer expires and the question advances, spectators need to see the new state immediately. If the player answers early and moves on, same thing. If the game ends, that also has to propagate cleanly.

The reason this worked is that the loop was built around shared fields:

- `currentQuestionIndex`
- `currentQuestionStartTime`
- `status`
- `timeEnded`

Those are enough to reconstruct the whole round flow from any client.

The app code is here if you want to read through it: [github.com/dmitryjum/intelli-casino](https://github.com/dmitryjum/intelli-casino).

The timer was never the hard part. Making it belong to the game state was.
