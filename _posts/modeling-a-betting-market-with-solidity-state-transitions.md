---
title: "Modeling a betting market with Solidity state transitions"
excerpt: "The most useful part of the Intelli Casino betting contract isn't the payout formula. It's the way the contract turns a live game into a small state machine with explicit transitions and guardrails."
date: "2025-07-28T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "Solidity", "Smart Contracts", "Betting Smart Contract"]
---

The betting contract in Intelli Casino is small enough to read in one sitting, which matters here.

It doesn't try to be a protocol. It models one specific thing: a game opens, people place bets, they can withdraw while the game is still open, the game closes, winnings get distributed, and the round is over.

That's really a state machine disguised as a betting contract.

---

## Start with the states, not the functions

The two enums tell you almost everything:

```solidity
enum BetState {PENDING, WON, LOST}
enum GameState {OPEN, CLOSED, FINISHED}
```

That already answers the important questions:

- can a bet still be changed?
- can funds still be withdrawn?
- has the result been settled?

If the states are clear, the rest of the contract gets easier to reason about.

---

## The `Game` struct is doing more than just storing totals

This is the core shape:

```solidity
struct Game {
    uint256 id;
    GameState state;
    uint256 playerBetsTotal;
    uint256 casinoBetsTotal;
    uint256 totalBetPool;
    mapping(uint256 => Bet) bets;
    address[] bettors;
}
```

The interesting part is the combination of a mapping plus an address array.

The mapping gives indexed access to stored bets. The array gives you something iterable so you can:

- find an existing bettor
- loop through winners during payout
- compact the collection after a withdrawal

That's a very normal Solidity pattern, but it becomes more interesting once you use it to model an actual market instead of a toy list.

---

## Opening, closing, and settling are explicit transitions

The contract doesn't let functions blur across states.

`placeBet` only works when the game is open:

```solidity
if (game.state != GameState.OPEN) revert GameNotOpen();
if (msg.value == 0) revert NotEnoughBetAmount();
```

`withdrawBet` also only works when the game is open:

```solidity
if (game.state != GameState.OPEN) revert GameNotOpen();
if (bet.state != BetState.PENDING) revert BetNotPending();
```

And `distributeWinnings` only works when the game is closed:

```solidity
if (game.state != GameState.CLOSED) revert GameNotClosed();
game.state = GameState.FINISHED;
```

That’s the part I’d preserve in any rewrite. Good contract design gets a lot easier when illegal transitions fail immediately and loudly.

---

## Withdrawals are where the storage model gets interesting

The contract lets bettors withdraw while the game is still open, which means it can't just append forever and settle later. It has to remove live bets safely.

This part is my favorite:

```solidity
uint256 lastIndex = game.bettors.length - 1;
if (betIndex != lastIndex) {
    game.bettors[betIndex] = game.bettors[lastIndex];
    game.bets[betIndex] = game.bets[lastIndex];
}
game.bettors.pop();
delete game.bets[lastIndex];
```

That's the standard swap-and-pop pattern, and it fits well here. No expensive shifting, no gaps in the active bettor list, and payout iteration still works later.

The function also updates totals before sending funds:

```solidity
if (bet.bettingOnPlayer) {
    game.playerBetsTotal -= betAmount;
} else {
    game.casinoBetsTotal -= betAmount;
}

game.totalBetPool -= betAmount;
```

That ordering matters. State first, external value transfer after.

---

## Custom errors make the contract easier to read

There are a bunch of custom errors:

```solidity
error InvalidGameId();
error GameAlreadyExists();
error GameNotOpen();
error GameNotClosed();
error BetDoesNotExist();
error BetNotPending();
error TransferFailed();
```

I prefer this to vague `require` strings scattered everywhere. The contract has a small set of invalid states, and they all have names.

That turns the contract into something closer to a rule system:

- you can't bet on a closed game
- you can't withdraw a missing bet
- you can't settle an open game
- you can't operate on a game that doesn't exist

Those rules are the product.

---

## This is why smart contracts feel different

What makes Solidity work like this interesting is that it forces you to be more explicit than most web code does.

You don't get to wave your hands about who owns the transition. You don't get to ignore storage layout. You don't get to treat edge cases like UI annoyances. Everything that matters has to become a state, an error, a guard, or a value transfer.

That's what makes the contract satisfying to read now.

The contract code is here if you want to read through it: [github.com/dmitryjum/intelli-casino-dapp](https://github.com/dmitryjum/intelli-casino-dapp).

The payout math is interesting. The state machine underneath it is the real design.
