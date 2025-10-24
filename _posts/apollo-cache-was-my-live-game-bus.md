---
title: "Apollo cache was my live game bus"
excerpt: "I didn't build a separate client-side event layer for Intelli Casino. The GraphQL subscription payloads wrote straight into Apollo cache, and that turned out to be enough to drive the whole live UI."
date: "2025-07-25T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "GraphQL", "WebSockets"]
---

One of the nicer things about this project is that I never had to invent a separate live-state system on the client.
The game already had GraphQL queries. It already had a subscription. Apollo already had a normalized cache. So instead of adding another event layer on top, I just used the subscription payloads to rewrite the cache directly.
That was enough to make the game screen and the active-games dashboard move together.

---

## One event, two different client views

The subscription is simple:

```ts
export const GAME_UPDATED = gql`
  subscription onGameUpdated($gameId: String) {
    gameUpdated(gameId: $gameId) {
      ...GameFields
    }
  }
`;
```

The server-side resolver uses `withFilter`, so the same subscription can either:

- listen to one specific game
- or listen to every game update in the system

```ts
subscribe: withFilter(
  () => pubsub.asyncIterator(GAME_UPDATED),
  (payload, variables) => {
    if (variables.gameId) {
      return payload.gameUpdated.id === variables.gameId;
    }
    return true;
  }
)
```

That single event stream powers two very different screens.

---

## The game page rewrites `GET_GAME`

Inside `useGames.ts`, the game screen listens to `GAME_UPDATED` for a specific `gameId`. When an update arrives, it writes the full payload into Apollo cache under `GET_GAME`:

```ts
useSubscription(GAME_UPDATED, {
  variables: { gameId },
  onData: ({ client, data }) => {
    if (!data?.data?.gameUpdated) return;

    client.writeQuery({
      query: GET_GAME,
      data: { game: data.data.gameUpdated }
    });
  },
});
```

That means every mutation that publishes `GAME_UPDATED` automatically refreshes the local game screen without the component needing to manually refetch after `openGame`, `closeGame`, `finishGame`, or `updateGameQuestion`.

The nice part is that the same hook also layers spectator-specific behavior on top. If the current user is a spectator, the subscription callback derives the previous question and shows a toast with the player's answer versus the correct one:

```ts
const userAnswer = updatedGame.userAnswers.find(
  (ua) => ua.questionId === previousQuestion.id
)?.answer;
const correct = userAnswer == previousQuestion.answer;
toast({
  title: "Player's last question answer",
  description: userAnswer || 'No answer available',
  titleTwo: "Correct Answer",
  descriptionTwo: previousQuestion.answer || 'No answer available',
  variant: correct ? "success" : "destructive"
});
```

So Apollo cache isn't just synchronizing data. It's also the trigger for watch-mode UX.

---

## The lobby rewrites `GET_ACTIVE_GAMES`

The dashboard uses the same subscription differently.

`ActiveGames.tsx` subscribes without a `gameId`, so it hears every update. Then it decides whether to:

- replace an existing active game
- remove a finished game
- add a newly active game

```ts
const gameIndex = activeGames.findIndex(gameData => gameData.id === updatedGame.id);

if (gameIndex > -1 && updatedGame.status !== 'FINISHED') {
  const updatedActiveGames = [...activeGames];
  updatedActiveGames[gameIndex] = updatedGame;
  client.writeQuery({ query: GET_ACTIVE_GAMES, data: { activeGames: updatedActiveGames } });
} else if (gameIndex > -1) {
  client.writeQuery({
    query: GET_ACTIVE_GAMES,
    data: { activeGames: activeGames.filter(gameData => gameData.id !== updatedGame.id) },
  });
} else {
  client.writeQuery({
    query: GET_ACTIVE_GAMES,
    data: { activeGames: [...activeGames, updatedGame] },
  });
}
```

This is why I call Apollo cache the live game bus. The same published mutation result updates the in-game screen and the lobby view without a separate client-side pub/sub system.

---

## The GraphQL fragment choice matters

This only works because the subscription payload is rich enough to stand on its own.

The shared fragment includes:

- game status
- current question index
- timestamps
- quiz topic and questions
- user answers
- spectators

That makes `GAME_UPDATED` heavy, but useful. The client doesn't need a follow-up request to understand what just happened. The event payload *is* the new state.

That was the right tradeoff here. A live quiz app benefits more from a self-contained state update than from obsessively minimizing payload size.

---

## Why I used this instead of a custom event layer

Because it kept the mental model short.
Mutations update the game. The server publishes `GAME_UPDATED`. Apollo cache gets rewritten. The UI reacts.
If this project had become much bigger, I might have wanted finer-grained events or stricter cache policies. But for this app, writing straight into cache was exactly the right level of machinery.

The app code is here if you want to inspect it: [github.com/dmitryjum/intelli-casino](https://github.com/dmitryjum/intelli-casino).
