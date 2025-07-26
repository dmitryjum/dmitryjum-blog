---
title: "Writing payout logic in Foundry"
excerpt: "The betting contract got interesting once the payout math had to line up with actual tests. Foundry was useful here because it made the state changes and emitted values easy to pin down."
date: "2025-07-26T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intelli-casino.png"
tags: ["intelli-casino", "Solidity", "Foundry", "Smart Contracts"]
---

The betting part of Intelli Casino is unfinished at the product level, but the contract repo got far enough to become concrete.

What made it interesting wasn't just writing the contract. It was getting the payout math, state transitions, and failure paths into a shape I could test repeatedly with Foundry.

---

## The payout math is simple enough to test directly

The settlement function starts by taking a 3% commission:

```solidity
uint256 commission = (game.totalBetPool * 3) / 100;
uint256 totalWinnings = game.totalBetPool - commission;
```

Then it derives a payout ratio from the losing side against the winning side:

```solidity
if (playerWon) {
    payoutRatio = (game.casinoBetsTotal * 10000) / game.playerBetsTotal;
} else {
    payoutRatio = (game.playerBetsTotal * 10000) / game.casinoBetsTotal;
}
```

And each winner gets principal plus upside, minus the same commission cut:

```solidity
uint256 winnings = (bet.amount * (10000 + payoutRatio)) / 10000;
winnings = winnings - ((winnings * 3) / 100);
```

That isn't fancy math. Which is good. Contracts benefit from readable arithmetic.

---

## Foundry made the event values easy to pin down

The strongest test in the suite is the payout test:

```solidity
function test_distributeWinnings() public {
    vm.expectEmit(true, true, true, true);
    emit WinningsDistributed(gameId, 1.94 ether, 1);

    distributeWinnings(gameId, true);

    (, IntelliCasinoBetting.GameState state,,,) = betting.games(gameId);
    assertEq(uint(state), uint(IntelliCasinoBetting.GameState.FINISHED));
}
```

That assertion is doing two useful things:

- checking the emitted business value, `1.94 ether`
- checking the state transition to `FINISHED`

So the test isn't just "the function didn't revert." It's checking the contract's public story.

---

## The revert paths are part of the payout story

The test file also covers cases that matter just as much as the happy path:

```solidity
function test_distributeWinningsGameNotClosed() public {
    createGame(2);
    vm.expectRevert(IntelliCasinoBetting.GameNotClosed.selector);
    distributeWinnings(2, true);
}

function test_distributeWinningsFailedTransfer() public {
    vm.deal(address(betting), betAmount - 1);
    vm.expectRevert(IntelliCasinoBetting.TransferFailed.selector);
    distributeWinnings(gameId, true);
}
```

That’s the kind of coverage I wanted from the repo. Payout logic isn't trustworthy just because the math works once. It has to fail cleanly too.

---

## Why Foundry fit this repo well

The test file is organized by lifecycle:

- `CreateGameTest`
- `PlaceBetTest`
- `WithdrawBetTest`
- `CloseGameTest`
- `DistributeWinningsTest`

That was a good fit for this contract because each function changes the meaning of what can happen next. Foundry made it easy to stand up a small scenario, fund accounts with `hoax` or `vm.deal`, assert events, and check reverts without a lot of framework noise.

The setup is compact:

```solidity
function setUp() public virtual {
    betting = new IntelliCasinoBetting(owner);
}

function placeBet(uint256 _gameId, bool _bettingOnPlayer, uint256 _betAmount) internal {
    betting.placeBet{value: _betAmount}(_gameId, _bettingOnPlayer);
}
```

---

## The unfinished part is integration, not the contract shape

The contract still wasn't fully wired into the product. Wallet flow, live app integration, and deployment confidence were still ahead of it. But the contract itself got to a good place: readable payout rules, explicit transitions, and tests that prove more than just compilation.

The contract code is here if you want to inspect it: [github.com/dmitryjum/intelli-casino-dapp](https://github.com/dmitryjum/intelli-casino-dapp).

The nice thing about a testable contract is that when you come back later, you don't have to rediscover the rules. They're already written down in code and assertions.
