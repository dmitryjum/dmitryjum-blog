---
title: "Batch eligibility checks with a rake task: practical patterns for background data sync"
excerpt: "Running a periodic eligibility check across thousands of members involves some interesting tradeoffs: batching API calls, building O(n) lookup maps, and handling failures without crashing the whole task."
date: "2026-02-13T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["Ruby", "Rails", "swing_bridge"]
---

This is about a rake task that runs every two weeks, checks whether gym members who were migrated to Mindbody are still eligible for their contract, and terminates the ones who aren't. The task itself isn't complicated, but it has a few patterns I found genuinely useful that apply beyond this specific domain.

---

## The setup

When members are migrated, an `IntakeAttempt` record gets created with `status: :mb_success`. That's the source of truth for who has been migrated. The eligibility check queries those records, re-checks each member's current agreement in ABC Financial, and terminates their Mindbody contract if they're no longer eligible.

```ruby
task check_eligibility: :environment do
  attempts = IntakeAttempt.where(status: "mb_success")
  attempts_by_club = attempts.group_by(&:club)
  # ...
end
```

Grouping by club is the first meaningful decision. Each club is a separate ABC Financial account and needs a separate API client. Grouping first means you initialize exactly one `AbcClient` per club rather than one per member — which becomes significant at scale.

---

## One API call per club, not per member

The naive approach would be to loop over each attempt, call the ABC API for that member, check eligibility, move on. That's `n` API calls for `n` members.

Instead, I collect all ABC member IDs for a club, make one batch call, then process the results using a lookup hash:

```ruby
abc_to_attempt = {}
club_attempts.each do |attempt|
  abc_id = attempt.response_payload&.dig("abc_member_id")
  abc_to_attempt[abc_id] = attempt if abc_id.present?
end

members = abc.get_members_by_ids(abc_to_attempt.keys)

members.each do |member|
  attempt = abc_to_attempt[member["memberId"]]
  next unless attempt
  # ...
end
```

The `abc_to_attempt` hash is built in O(n). The lookup inside the loop is O(1) per member. The whole club processes in one API call plus local hash lookups.

The ABC member ID comes from the `response_payload` column — it was stored there when the member was first matched during intake. That's the connection that makes this batch lookup possible without any join tables or secondary queries.

---

## Rate limiting the termination side

Checking eligibility is one API call per club. But terminating contracts is one call per ineligible member, against a different API (Mindbody). If you have two hundred ineligible members in one run, you don't want to fire two hundred requests back-to-back.

The `ELIGIBILITY_SUSPEND_DELAY_MS` env variable introduces a configurable delay between terminations:

```ruby
delay_ms = ENV.fetch("ELIGIBILITY_SUSPEND_DELAY_MS", "500").to_i

members.each do |member|
  # ... check eligibility ...
  # ... terminate if ineligible ...
  sleep(delay_ms / 1000.0) if delay_ms > 0
end
```

500ms between calls is enough to stay well within Mindbody's rate limits while still processing a few hundred members in a reasonable time. The value is configurable so you can tune it without a deploy if limits change.

---

## Failure handling: skip the club, not the task

When the ABC API fails for a club — timeout, connection error, unexpected response — you don't want to crash the entire task. You want to log the error, notify someone, and move on to the next club.

```ruby
members =
  begin
    abc.get_members_by_ids(abc_to_attempt.keys)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed, StandardError => e
    error_count += 1
    Rails.logger.error("[EligibilityCheck] ABC ERROR club=#{club} #{e.class}: #{e.message}")
    AdminMailer.eligibility_check_failure(club_attempts.first, e).deliver_later
    next
  end
```

`next` skips to the next club. The task continues. The error is counted, logged, and emailed.

The same pattern applies to individual member terminations. If a termination fails — timeout, API error — the task logs it and emails admins, but keeps processing the remaining members:

```ruby
rescue Faraday::TimeoutError, Faraday::ConnectionFailed => e
  error_count += 1
  Rails.logger.error("[EligibilityCheck] TIMEOUT #{attempt.email} after retries: #{e.message}")
  AdminMailer.eligibility_check_failure(attempt, e).deliver_later
rescue MindbodyClient::ApiError => e
  error_count += 1
  Rails.logger.error("[EligibilityCheck] API ERROR #{attempt.email}: #{e.message}")
  AdminMailer.eligibility_check_failure(attempt, e).deliver_later
end
```

No re-raise here. This is intentional: the task is checking membership status across hundreds of people. One person's termination failing shouldn't stop everyone else's from running.

---

## Lazy contract ID resolution

If the `response_payload` has a contract ID from the original purchase, use it. If not (edge case: purchase receipt was incomplete), look it up once and cache it for the rest of the club:

```ruby
contract_id = attempt.response_payload&.dig("mindbody_contract_purchase", "ContractId")

if contract_id.blank?
  target_contract_id ||= mb.find_contract_by_name(
    MindbodyAddClientJob::TARGET_CONTRACT_NAME,
    location_id: MindbodyAddClientJob::TARGET_LOCATION_ID
  )&.dig("Id")
  contract_id = target_contract_id
end
```

The `||=` means the contract lookup only hits the API once per club run, not once per member. Small optimization, but it adds up.

---

## Summary log at the end

After everything runs, a single log line captures the result:

```ruby
Rails.logger.info(
  "[EligibilityCheck] Complete: checked=#{total_checked} terminated=#{terminated_count} errors=#{error_count}"
)
```

This is the line I look at after a run to know if anything went sideways. If `errors` is non-zero, the emails tell me what happened. If `terminated` is unexpectedly high, something changed with the eligibility criteria or the upstream data.

---

## The broader patterns

Pulling these out:

**Batch external calls by a shared dimension** (club, tenant, partition key) rather than per-row. Build an O(n) lookup map before the loop, use O(1) lookups inside it.

**Persist the external ID** during the first integration. That ID is what makes later batch lookups efficient without secondary queries.

**Introduce artificial delays** when writing to a rate-limited API in a loop. Make the delay configurable. 500ms is usually fine to start.

**Rescue at different scopes**: rescue club-level failures to skip the club, rescue member-level failures to skip the member. Don't let one failure abort unrelated work.

None of these are exotic. They're just easy to skip when you're building the happy path first — and painful to retrofit later.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
