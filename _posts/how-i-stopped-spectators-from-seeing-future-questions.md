---
title: "How I stopped spectators from seeing future questions"
excerpt: "For a game that could eventually involve real money, hiding future questions can't be a frontend courtesy. It has to be enforced in the GraphQL payload itself."
date: "2025-07-24T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "GraphQL", "Security", "WebSockets"]
---

One of the easiest mistakes in a live game is treating hidden information like a UI problem.

It isn't.

If the backend returns the full quiz and the frontend just chooses not to render the future questions yet, then the future questions are already leaked. Maybe not visibly, but definitely technically. That’s fine for a toy app. It’s not fine for a game where fairness matters.

So Intelli Casino does something simple and important: it slices the question list on the server before the payload goes out.

---

## The main guard lives in the game query

When a client asks for a game, the server fetches the quiz, the current questions, spectators, and user answers. Then it trims the quiz payload:

```ts
if (game?.quiz && game?.quiz?.questions) {
  game.quiz.questions = game.quiz.questions.slice(0, game.currentQuestionIndex + 1);
} else {
  throw new GraphQLError('Invalid quiz or questions data in game', {
    extensions: { code: 'INVALID_GAME_DATA', http: { status: 400 } }
  });
}
```

That's in [`queryResolvers.ts`](/Users/dmitryjum/dev/intelli-casino/app/api/graphql/resolvers/queryResolvers.ts#L35).

The key point is that the slice happens *after* loading the full question set from the database and *before* returning the GraphQL response. So the client only gets questions up to the current index.

That means:

- spectators can't inspect the next question in devtools
- players can't preload future questions through the normal game query
- late joiners still get the full visible history of the session so far

That's the right balance.

---

## I duplicated the same protection when a spectator joins

There's a second place where this matters.

When a spectator gets attached to a game, the mutation also slices the questions before returning the updated game:

```ts
const updatedTransactionGame = await getGameUpdateData(gameId, updatedData);

if (updatedTransactionGame?.quiz && updatedTransactionGame?.quiz?.questions) {
  updatedTransactionGame.quiz.questions =
    updatedTransactionGame.quiz.questions.slice(0, updatedTransactionGame.currentQuestionIndex + 1);
}
```

That's in [`mutationResolvers.ts`](/Users/dmitryjum/dev/intelli-casino/app/api/graphql/resolvers/mutationResolvers.ts#L205).

I duplicated that rule on purpose. Not because duplication is inherently good, but because the rule is important enough to enforce at every payload boundary that could expose the quiz. The more money or competitive value a game has, the less I want to rely on a single lucky code path staying intact forever.

---

## The role model is part of the same story

The Prisma schema already treats spectators as a first-class relation on `Game`:

```prisma
model Game {
  id                       String     @id @default(cuid())
  playerId                 String
  status                   GameStatus @default(OPEN)
  currentQuestionIndex     Int        @default(0)
  currentQuestionStartTime DateTime?
  spectators               User[]     @relation("SpectatorsOfGame")
  userAnswers              UserAnswer[]
}
```

And on the frontend, the role affects behavior immediately.

In both [`MCQ.tsx`](/Users/dmitryjum/dev/intelli-casino/components/MCQ.tsx#L37) and [`OpenEnded.tsx`](/Users/dmitryjum/dev/intelli-casino/components/OpenEnded.tsx#L34), where `MCQ` means multiple-choice question, a spectator gets connected to the game if they aren't already in it:

```ts
if (userRole === Role.SPECTATOR && game.status !== GameStatus.FINISHED && !isSpectator) {
  addSpectatorToGame({ variables: { gameId, userId } });
}
```

That means spectator access isn't just a different button label. It's a distinct path through the game model, and the payload rules have to respect that.

---

## Broadcasts make hidden-state bugs easier to miss

Realtime systems can fool you here.

Because clients are reacting to live updates, it’s tempting to think "the current question is what I’m rendering, so I’m safe." But GraphQL fragments can quietly pull in more than you intended. In this project, the shared fragment includes question fields like `answer` and `blankedAnswer`:

```ts
export const QUESTION_FRAGMENT = gql`
  fragment QuestionFields on Question {
    id
    question
    options
    answer
    blankedAnswer
  }
`;
```

That makes server-side slicing even more important.

The actual lesson isn't "never put sensitive fields in GraphQL." The lesson is that once a field is in a shared fragment, you need to be extremely clear about which *records* are allowed to travel to which clients.

This project solves that mostly by limiting the question array itself.

That's a good pattern for games, auctions, interviews, exams, and anything else where the future state has value.

---

## Fairness rules belong in the payload

If I rewrote this project, I'd keep this idea exactly as-is.

Not the specific GraphQL schema. Not necessarily the fragment layout. But definitely the rule that hidden game state must be enforced on the server response, not just hidden in React.

That's the line between "the UI looks fair" and "the system is fair."

The app code is here if you want to look through it: [github.com/dmitryjum/intelli-casino](https://github.com/dmitryjum/intelli-casino).

Future questions aren't a styling concern. They're protected state.
