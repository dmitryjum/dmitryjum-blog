---
title: "Why I split realtime game updates out of the Next.js app"
excerpt: "The main reason for the split was simple: I wanted realtime subscriptions, and Vercel wasn't the place to run long-lived WebSocket connections. Once that constraint was clear, the architecture got clearer too."
date: "2025-07-22T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "Next.js", "GraphQL", "WebSockets"]
---

I didn't start this project expecting three repos.

At first it was just the app: Next.js, Prisma, GraphQL, auth, quiz flow. Then realtime updates became a real feature, and one practical constraint forced the architecture to change: Vercel wasn't the place to run the WebSocket side of this cleanly.

That was the real reason for the split.

---

## What the app needed to do

Intelli Casino is a quiz game with two views of the same session.

The player answers questions in real time. Spectators watch the same game and need to see state changes immediately: game opened, question advanced, game closed, final result. That means subscriptions, not polling.

On the frontend, that state lands in a custom hook:

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

That's the core loop. A mutation changes the game, the server publishes `GAME_UPDATED`, and clients update Apollo cache from the subscription payload.

---

## Why the Next.js app stopped being enough

The game state itself lives in the app repo. Mutations like `openGame`, `closeGame`, `finishGame`, and `updateGameQuestion` all follow the same shape:

```ts
const updatedGame = await prisma.$transaction(async (prisma) => {
  // validate user, update game, load related quiz data
  return getGameUpdateData(gameId, updatedData);
});

pubsub.publish(GAME_UPDATED, { gameUpdated: updatedGame });
```

That's clean enough. The mutation updates Postgres through Prisma, fetches the full game payload, and publishes a single event.

But the deployment story was different. The app was on Vercel. I wanted realtime subscriptions. That meant long-lived WebSocket connections, and I didn't want the core game loop to depend on pretending that constraint wasn't there.

So I stopped trying to keep everything inside the Next.js deployment and split the subscription runtime into its own service: [`intelli-casino-gql-server`](https://github.com/dmitryjum/intelli-casino-gql-server).

That service does one job: run Apollo over Express, expose `/api/graphql`, and host the WebSocket server on the same path.

```ts
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api/graphql',
});

const serverCleanup = useServer(
  {
    schema,
    context: async () => ({ pubsub })
  },
  wsServer
);
```

That split isn't elegant in the abstract. It is practical.

---

## Redis is what makes the split real

Once GraphQL subscriptions run in a separate process, in-memory pubsub stops being enough. The frontend app and the websocket server need a shared event bus.

That's where Redis came in.

The GraphQL server uses `graphql-redis-subscriptions` with `ioredis`:

```ts
const options: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ...(isProduction ? { tls: {} } : {}),
  retryStrategy: (times: number) => Math.min(times * 50, 2000)
};

export const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
```

This is one of those details that looks boring until production shows you it isn't. The `tls: {}` branch is there because local Redis assumptions stopped matching AWS reality, and once that happened the pubsub layer had to become a real piece of infrastructure instead of just a development convenience.

---

## The auth part got more awkward too

The app and the GraphQL server both rely on NextAuth-compatible session logic. The server side GraphQL context does this:

```ts
const session = await getServerSession(req, res, authOptions);
if (!session?.user) {
  throw new GraphQLError('Unauthorized', {
    extensions: { code: 'UNAUTHENTICATED' }
  });
}
return { req, res, session, pubsub };
```

That looks straightforward, but it's only straightforward if the cookies actually arrive in a way both services can read.

Once the app and the GraphQL server lived on different hosts, the session cookie setup stopped being a detail and became part of the architecture. If the API host can't read the same session the app issued, your mutations and subscription-adjacent requests look broken even when the socket layer itself is fine.

This is why I don't really buy the clean whiteboard version of full-stack architecture anymore. The real split is often "things that survive deployment friction cleanly" and "things that need their own box."

---

## The spectator flow made subscriptions worth it

Spectators don't just mirror the player screen. They get a reduced, role-aware view of the same game state.

In `useGames`, the subscription handler writes the update straight into Apollo cache and then adds spectator-specific feedback on top:

```ts
useSubscription<{ gameUpdated: GameData['game'] }>(GAME_UPDATED, {
  variables: { gameId },
  onData: ({ client, data}) => {
    if (!data?.data?.gameUpdated) return;
    const updatedGame = data.data.gameUpdated;

    client.writeQuery({
      query: GET_GAME,
      data: { game: updatedGame }
    });

    if (userRole === Role.SPECTATOR) {
      let previousQuestion;
      if (updatedGame.status === GameStatus.FINISHED) {
        previousQuestion = updatedGame.quiz.questions[updatedGame.currentQuestionIndex];
      } else if (updatedGame.currentQuestionIndex > 0 && updatedGame.status === GameStatus.CLOSED) {
        previousQuestion = updatedGame.quiz.questions[updatedGame.currentQuestionIndex - 1];
      }
      if (previousQuestion) {
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
      }
    }
  },
});
```

That would already be useful even if every client got the same payload. But they don't.

There are two server-side guardrails that matter a lot here. The first is the game query itself:

```ts
if (game?.quiz && game?.quiz?.questions) {
  game.quiz.questions = game.quiz.questions.slice(0, game.currentQuestionIndex + 1);
}
```

And the second is the spectator join mutation:

```ts
const updatedTransactionGame = await getGameUpdateData(gameId, updatedData);
if (updatedTransactionGame?.quiz && updatedTransactionGame?.quiz?.questions) {
  updatedTransactionGame.quiz.questions =
    updatedTransactionGame.quiz.questions.slice(0, updatedTransactionGame.currentQuestionIndex + 1);
}
```

That's the part I like most. Realtime state is shared, but not all shared state should be fully visible. Spectators get the live game, not the future.

---

## Deployment is where the abstraction breaks

This is where the architecture stops sounding theoretical.

Once the WebSocket server moved off the main app deployment, it needed to behave like a real standalone service. That means its own HTTP server, its own WebSocket server, its own health endpoint, the right bind address, container-friendly startup, Redis connectivity, and production environment settings that don't quietly assume localhost.

You can build subscriptions in an evening. The harder part is keeping the chain intact across browser, app, API, websocket server, Redis, database, cookies, DNS, and cloud networking.

---

## I don't regret the split

The separate GraphQL/WebSocket service was the more honest architecture for what Intelli Casino had become. The app stayed focused on product flow. The realtime server got its own runtime concerns. Redis became the bridge. AWS forced the rough edges into the open.

If you want to see the code, the app is here: [github.com/dmitryjum/intelli-casino](https://github.com/dmitryjum/intelli-casino) and the standalone realtime server is here: [github.com/dmitryjum/intelli-casino-gql-server](https://github.com/dmitryjum/intelli-casino-gql-server).

The architecture choice itself still makes sense to me. It came from the actual runtime constraint, not from trying to make the system sound more elaborate than it was.
