---
title: "Designing player and spectator roles into the schema"
excerpt: "The Intelli Casino role system isn't just a frontend toggle. It shows up in Prisma relations, GraphQL authorization, the active-games dashboard, and the play screens themselves."
date: "2025-07-27T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "Prisma", "GraphQL"]
---

Role systems get more interesting once they change the shape of the data, not just the buttons on the page.

Intelli Casino has two roles that matter during a live game: `PLAYER` and `SPECTATOR`. That sounds small, but it affects the whole stack:

- what games you can create
- what active games you can open
- whether you join or spectate
- whether you can submit answers
- whether you can advance game state

The useful part is that those rules aren't floating around as random conditionals. They're built into the schema and then carried upward.

The code for this is in [`intelli-casino`](https://github.com/dmitryjum/intelli-casino).

---

## The Prisma schema already encodes the distinction

The core role enum is tiny:

```prisma
enum Role {
  PLAYER
  SPECTATOR
}
```

The more interesting part is how `User` relates to `Game`:

```prisma
model User {
  id          String @id @default(cuid())
  role        Role   @default(PLAYER)
  spectating  Game[] @relation("SpectatorsOfGame")
  playedGames Game[] @relation("PlayerOfGame")
}

model Game {
  id         String @id @default(cuid())
  playerId   String
  player     User   @relation("PlayerOfGame", fields: [playerId], references: [id], onDelete: Cascade)
  spectators User[] @relation("SpectatorsOfGame")
}
```

That's a good shape because it prevents the role model from collapsing into "user plus some boolean." A game has one player and many spectators. The DB already knows that.

---

## The role moves into React through context

On the client, `UserContext.tsx` takes the session role and turns it into app-wide behavior:

```tsx
const [userRole, setUserRole] = useState(session?.user?.role || Role.SPECTATOR);
const userId = session?.user?.id || '';

useEffect(() => {
  if (session?.user?.role) {
    setUserRole(session.user.role);
  }
}, [session]);
```

That doesn't sound exciting, but it matters because live game components can now make immediate decisions without re-deriving everything from the session every time.

The dashboard and play screens both use that role context to decide what the current user is allowed to do.

---

## The dashboard behaves differently by role

`ActiveGames.tsx` is a good example.

A player can only join the game they started. Other active games are shown, but dimmed and not linked:

```tsx
{userRole === Role.PLAYER && game.playerId !== userId ? (
  <h3 className="font-semibold text-gray-400">{game.quiz.topic}</h3>
) : (
  <Link href={`/play/${game.quiz.gameType.replace(/_/g, '-')}/${game.id}`}>
    {game.quiz.topic}
  </Link>
)}
```

And the action button itself is role-aware:

```tsx
{(userRole === Role.PLAYER && game.playerId === userId ||
  userRole === Role.SPECTATOR && game.playerId !== userId) && (
  <Button>{userRole === Role.PLAYER ? "Join" : "Spectate"}</Button>
)}
```

That’s not just permission logic. It’s product language. Same resource, different intent.

---

## The play screens enforce the role again

Both game components guard against invalid access.

In `MCQ.tsx`, where `MCQ` means multiple-choice question:

```tsx
if (userRole === Role.PLAYER && game.playerId !== userId && !loading && !error) {
  router.push('/');
}

if (userRole === Role.SPECTATOR && game.status !== GameStatus.FINISHED && !isSpectator) {
  addSpectatorToGame({ variables: { gameId, userId } });
}
```

And then the UI itself locks spectator interaction:

```tsx
<Button
  disabled={userRole === Role.SPECTATOR}
  // ...
>
```

That means a spectator can inhabit the same screen and see the same game lifecycle without being allowed to act like the player.

That's exactly the kind of shared-screen, role-aware design I wanted.

---

## GraphQL authorization closes the loop

The server isn't trusting the UI here.

`openGame`, `closeGame`, `finishGame`, and `updateGameQuestion` all inspect `session.user.id` and the game's spectator list before allowing the mutation. So the role model is present in:

- Prisma relations
- session/JWT data
- React context
- component routing and buttons
- GraphQL authorization

That’s a healthy stack shape. If one layer gets sloppy, the others still know what the role is supposed to mean.

One of those checks looks like this:

```ts
const isSpectator = game.spectators.some(spectator => spectator.id === session.user.id);
if (game.playerId !== session.user.id && !isSpectator) {
  throw new GraphQLError('You are not authorized to update this game question', {
    extensions: { code: 'UNAUTHORIZED', http: { status: 403 } }
  });
}
```

The app code is here if you want to read through it: [github.com/dmitryjum/intelli-casino](https://github.com/dmitryjum/intelli-casino).

Good role systems don't start in the navbar. They start in the data model.
