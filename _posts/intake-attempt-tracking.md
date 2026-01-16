---
title: "Treating every background job attempt as a first-class record"
excerpt: "A pattern for making background jobs observable: track each attempt as a DB record with status, payload, and email alerts — no external monitoring service required."
date: "2026-01-16T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
---

When I started building the membership migration bridge for this gym client, I knew from experience that background jobs against third-party APIs will eventually fail in ways you don't expect. The question isn't whether a job will fail, it's whether you'll find out quickly and have enough context to fix it.

The client had a limited budget — no Datadog, no Honeybadger, nothing like that. And they wouldn't be reading server logs. I needed visibility that didn't depend on external services and that I could hand off to a non-technical client. So rather than letting the job be a black box, I made each intake attempt a proper database record.

That one decision ended up serving three purposes at once.

---

## The model

`IntakeAttempt` is a regular Rails model with one column that does a lot of the work: a string-based enum for `status`, plus a `response_payload` JSONB column that accumulates context as the attempt progresses.

```ruby
class IntakeAttempt < ApplicationRecord
  enum :status, {
    pending:        "pending",
    found:          "found",
    eligible:       "eligible",
    ineligible:     "ineligible",
    enqueued:       "enqueued",
    mb_success:     "mb_success",
    mb_failed:      "mb_failed",
    member_missing: "member_missing",
    upstream_error: "upstream_error",
    failed:         "failed",
    terminated:     "terminated"
  }
end
```

Each status maps to a real moment in the flow: the member was found in ABC, they were eligible, the job was queued, Mindbody accepted the client, Mindbody rejected it. When something goes wrong, the status tells you exactly which step failed. No log parsing.

---

## How it flows

The controller creates or updates an `IntakeAttempt` on every request, before touching any external API:

```ruby
attempt = IntakeAttempt.find_or_initialize_by(email: email, club: club)
attempt.status = :pending
attempt.request_payload = credentials.to_h
attempt.save!
```

Then, as the request progresses through ABC and Mindbody, the record gets updated:

```ruby
attempt.update!(status: :found, response_payload: member_summary)
# ...
attempt.update!(status: :eligible, response_payload: member_payload)
# ...
attempt.update!(status: :enqueued)
```

The job picks it up by ID and takes it from there:

```ruby
def perform(intake_attempt_id: nil, ...)
  attempt = IntakeAttempt.find_by(id: intake_attempt_id)
  # ...
  attempt.update!(status: :mb_success, response_payload: merged_payload)
end
```

By the time the job finishes (or fails), the `IntakeAttempt` row has a complete picture: what ABC returned, what Mindbody returned, the client ID, the contract ID, whether a password reset was sent.

---

## The payload accumulates context

The `response_payload` column isn't just a final result — it's a running log. The job merges new data on top of what's already there:

```ruby
def update_attempt_success!(attempt, payload, base: nil)
  merged_payload = (attempt.response_payload || {})
  merged_payload = merged_payload.merge(base) if base
  merged_payload = merged_payload.merge(payload)
  attempt.update!(status: :mb_success, response_payload: merged_payload)
end
```

So after a successful run, one row contains the ABC member ID, the Mindbody client ID, the contract purchase receipt, and a flag confirming the password reset was sent. That's the entire audit trail for that member's migration, in a single queryable record.

---

## Failures get recorded too

When something breaks, the failure goes into the same record:

```ruby
attempt&.update!(status: :mb_failed, error_message: e.message)
AdminMailer.mindbody_failure(attempt, e).deliver_later
```

The `AdminMailer` receives the attempt object, so the failure email can include the member's email, the last known status, the full payload, and the error message. No need to cross-reference logs with job IDs. And since the client doesn't want to pay for an error monitoring service, an email is exactly the right delivery mechanism — it lands in their inbox, with enough context to forward to me if they need help.

---

## It's also used for ongoing eligibility checks

The `IntakeAttempt` records don't stop being useful after the initial migration. A background rake task runs periodically to check whether members who were migrated are still eligible. It queries `IntakeAttempt` records where `status = 'mb_success'`, groups them by club, and re-checks their ABC agreements in batch:

```ruby
attempts = IntakeAttempt.where(status: "mb_success")
attempts_by_club = attempts.group_by(&:club)

attempts_by_club.each do |club, club_attempts|
  abc_to_attempt = club_attempts.each_with_object({}) do |attempt, hash|
    abc_id = attempt.response_payload&.dig("abc_member_id")
    hash[abc_id] = attempt if abc_id.present?
  end

  members = abc.get_members_by_ids(abc_to_attempt.keys)
  members.each do |member|
    attempt = abc_to_attempt[member["memberId"]]
    next if AbcClient.eligible_for_contract?(member["agreement"])
    # terminate their Mindbody contract and update status to :terminated
  end
end
```

The ABC member ID is stored in the payload during enrolment. That's what makes the batch lookup possible without any joins or additional tables. One column that was written to during job execution becomes the index key for a completely different periodic task weeks later.

---

## The third purpose: an admin panel

The client needed a way to see what was happening without touching the database directly. So I built a simple admin dashboard on top of `IntakeAttempt` — a filterable list view where you can see every attempt, its current status, when it happened, and expand a row to inspect the full payload.

Because the records are already structured — status as an enum, timestamps, email address, response payload as JSON — the admin UI is mostly just queries. Filter by status, search by email, click to see the raw API response from ABC or Mindbody. No custom logging infrastructure, no third-party dashboard. Just the table rendered in a way a non-engineer can read.

Three jobs, one model: debugging, alerting, and visibility.

---

## What this changes

The status tells you where in the flow something broke. The payload tells you what the APIs actually returned. The email tells you when it happened. And if the client wants to check on a specific member, they can search by email in the admin panel instead of asking me to run a query.

It's a small model. It's not doing anything clever. But it's the kind of decision that makes the whole system feel like it was designed to be operated, not just to run.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
