---
title: "Using a reducer to make a messy decision tree readable"
excerpt: "A contract state decision that started as nested conditionals turned into something that looks a lot like Redux. Here's why that pattern works well beyond the frontend."
date: "2026-02-06T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
---

There's a piece of logic in this project I'm actually proud of. It doesn't look impressive at a glance — it's just a method that returns a symbol. But it replaced something that was genuinely hard to follow, and the shape it landed in reminded me of something I'd seen before on the frontend.

The problem: when a gym member already exists in Mindbody, you can't just create them again. You have to look at their existing contracts and decide what to do. And the states those contracts can be in are surprisingly varied.

---

## The states a contract can be in

A member's contract history in Mindbody might look like any of these:

- No contracts at all → just purchase
- One active contract that's current → skip, they're already enrolled
- An active contract that starts in the future → they're being enrolled for a future period; terminate it and repurchase
- A contract that was terminated → it's gone, repurchase
- A contract that existed and ended, with no active rows → treat as expired, purchase
- An active contract with missing `StartDate` or `EndDate` → can't determine state; treat as active, don't touch

That's a lot of branches. The original implementation handled it inline with nested conditionals. It worked, but reading it required holding several conditions in your head at once to understand any single outcome.

---

## The refactored version

The rewrite pulled all that logic into a single method that reads the current state and returns a plain action symbol:

```ruby
def contract_action_for(contracts:, client_id:, today:)
  segments = Array(contracts)
  return :purchase if segments.empty?

  active_segments = segments.select { |c| c["TerminationDate"].blank? }
  terminated_segments = segments - active_segments

  if active_segments.any? { |c| missing_dates?(c) }
    log_missing_dates(active_segments, client_id: client_id)
    return :skip
  end

  return :skip if active_segments.any? { |c| current_segment?(c, today: today) }

  if terminated_segments.any? { |c| current_segment?(c, today: today) }
    return :terminate_and_purchase
  end

  if active_segments.any? { |c| future_segment?(c, today: today) }
    return :terminate_and_purchase
  end

  return :skip if active_segments.any?

  :purchase
end
```

Each case returns immediately. No nesting. You read it top to bottom and each branch is a complete, self-contained statement.

The caller doesn't think about contracts at all:

```ruby
action = contract_action_for(contracts: target_contracts, client_id: client_id, today: today)

case action
when :terminate_and_purchase
  mb.terminate_active_client_contracts!(...)
  purchase_target_contract!(...)
when :purchase
  purchase_target_contract!(...)
end
```

---

## Why it reminds me of Redux

If you've worked with Redux, the pattern here is familiar. A Redux reducer takes current state and an action, and returns a new state. It doesn't mutate anything. It doesn't have side effects. It's a pure function that maps inputs to outputs.

`contract_action_for` is the same shape. It takes state (the contracts, the date) and produces an action. It doesn't call any APIs, doesn't modify the database, doesn't log anything except in the missing-dates edge case. Everything that actually *does* something is the caller's responsibility.

That separation is what makes it easy to test. You can pass in an array of contract hashes and assert on the returned symbol without mocking an HTTP client:

```ruby
it "returns :skip when there's a current active segment" do
  today = Date.today
  contracts = [{ "TerminationDate" => nil, "StartDate" => (today - 30).to_s, "EndDate" => (today + 30).to_s }]
  expect(contract_action_for(contracts: contracts, client_id: "123", today: today)).to eq(:skip)
end
```

No fixtures, no stubs, no HTTP. Just data in, symbol out.

---

## The missing-dates case

One branch is worth calling out. Mindbody occasionally returns active contract rows with `StartDate` or `EndDate` missing or null. You can't determine whether that contract is current, past, or future — so you can't safely act on it.

The decision: treat it as active and skip the purchase. Log a warning so it's visible. Don't crash, don't silently ignore it.

```ruby
def missing_dates?(contract)
  start_date, end_date = contract_dates(contract)
  start_date.nil? || end_date.nil?
end

def log_missing_dates(contracts, client_id:)
  contracts.each do |contract|
    next if contract["StartDate"].present? && contract["EndDate"].present?
    Rails.logger.warn(
      "[MindbodyAddClientJob] Missing contract dates for ClientContractId #{contract["Id"]} " \
      "(client_id=#{client_id}); treating as active and skipping purchase"
    )
  end
end
```

This is the kind of defensive branch that feels unnecessary until you actually see bad data come back from a third-party API. Then it feels necessary.

---

## The pattern is portable

This isn't a Mindbody-specific idea. Any time you have a decision with multiple distinct outcomes — and the decision logic is getting tangled with the side-effecting code — pulling the decision into a pure function that returns an intent symbol pays off.

Name the actions clearly. Keep the decision function free of side effects. Let the caller handle what each action actually means. You get cleaner code, easier tests, and a method that can be read and understood on its own.

That's the pattern. It showed up on the backend here, but it's the same reason Redux became popular on the frontend. Separating "what should happen" from "making it happen" is just hard to argue with.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
