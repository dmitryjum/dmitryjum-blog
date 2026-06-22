---
title: "Claude's thorough way to change nothing"
excerpt: "I asked Claude whether a database index still made sense after the feature changed. Claude ran the query plans, said the index only half-fit now, recommended adding a covering column, ran it through — and then, after more digging, realized the original was fine all along. Two migrations for nothing."
date: "2026-06-21T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["Rails", "PostgreSQL", "AI", "Claude Code", "Codex"]
---
> A rabbit sniffed the query plan with care,  
> An index added — then removed — how fair!  
> Claude pondered hard and scanned the heap,  
> But bitmap scans don't need that extra sweep.  
> The original migration hops back in place. 🐇

I've been building a practice interview app for people preparing for the U.S. naturalization civics exam. The app simulates an immigration officer: asks questions verbally, listens to answers, responds in real time. I'm not going to get into details, but it involves a fair amount of session state, turn tracking, and some careful logic around which questions get asked and when.

---

## The feature Codex built

One of the features I had Codex implement was question rotation. The idea is that the app tracks which questions a user has already seen across sessions, and prefers the ones they've seen least — or haven't seen at all.

Codex built it, and as part of that, it added a database index to support the lookup query:

```ruby
add_index :interview_session_questions,
  [:account_id, :question_id, :interview_session_id],
  name: "idx_isq_on_account_question_session_when_asked",
  where: "asked_at IS NOT NULL AND question_id IS NOT NULL"
```

This is a partial index on `interview_session_questions`. It only covers rows where the question was actually asked — filtering out sessions that were abandoned or never finished. That keeps the index small and the scan fast.

The lookup it supported was a single `COUNT(*)` grouped by `question_id`: how many times has this user been asked each question. The index fit that query well. Codex was doing fine.

---

## The feature changed, and I asked Claude to check the index

Later, working with Claude, I added a tie-break to the rotation. When several questions have been seen the same number of times, prefer the one asked longest ago. That tie-break needed one more piece of data per question: the last time it was asked. So alongside the existing count, the code now also ran a `MAX(asked_at)` grouped by `question_id`.

A new query against the same table. So I asked Claude whether the index still fit.

Claude ran `EXPLAIN ANALYZE` on both queries against real data. The count query came back clean:

```text
Index Only Scan using idx_isq_on_account_question_session_when_asked
```

The new `MAX(asked_at)` query did not:

```text
Seq Scan on interview_session_questions
  Filter: asked_at IS NOT NULL AND account_id = ... AND question_id = ANY (...)
```

A full sequential scan, ignoring the index entirely. Claude's read, roughly: *"The EXPLAIN tells a clear story, and the answer is 'half applicable now.' The count query is index-only. But the MAX query reads `asked_at`, and `asked_at` isn't a column in the index — so an index-only scan is impossible, and the planner falls back to a seq scan."*

The fix it proposed was to make the index *cover* `asked_at` — add it as an `INCLUDE` column so the MAX query could read it straight from the index:

```ruby
add_index :interview_session_questions,
  [:account_id, :question_id, :interview_session_id],
  include: [:asked_at],
  name: "idx_isq_on_account_question_session_when_asked",
  where: "asked_at IS NOT NULL AND question_id IS NOT NULL"
```

Same three key columns, plus a covering payload. The reasoning was clean, the explanation was confident, and I ran the migration. (Which, on a multi-database setup, meant a small detour through `db:migrate:down:primary` and back — but it went through.)

Then Claude kept reading the plans.

---

## The part where it figured out it was wrong

After the covering index was live, Claude re-ran `EXPLAIN` on the MAX query — but this time with `enable_seqscan = off`, to see what the planner would do if a sequential scan weren't the cheap option. That's the scenario that actually matters: a real table with millions of rows, not a dev database with a couple thousand.

With seq scan disabled, the MAX query used the index after all:

```text
Bitmap Index Scan on idx_isq_on_account_question_session_when_asked
  Index Cond: account_id = ... AND question_id = ANY (...)
→ Bitmap Heap Scan
```

Two things fell out of that, and both undercut the original recommendation.

First: the seq scan from before was a small-table artifact, not missing coverage. My dev table is around two thousand rows, so Postgres picks a sequential scan purely on cost. At real scale it uses the index — keyed on `account_id` and `question_id`, exactly the columns the *original* index already had.

Second, and worse for the change I'd just made: the covering column buys nothing here. The query filters `question_id = ANY(...)` over a list of question ids. Postgres serves that with a *bitmap* index scan — and bitmap scans always go to the heap. The `INCLUDE` payload only helps a plain index-*only* scan, which this query shape will never choose. So the covering column would sit in the index adding write cost and size, and no query plan would ever use it.

Claude's response when it caught this was close to: *"That output is actually the important finding — and it makes me want to walk back my own recommendation. The seq scan I flagged earlier was a small-table artifact, not missing coverage. And the `INCLUDE` I just added buys essentially nothing — it's a bitmap index scan, and bitmap scans always read the heap. Adding a covering column just in case, without a plan that uses it, is exactly the kind of speculative complexity worth not carrying. I'd revert it."*

To its credit: the catch was right, the explanation was clear, and the work that found it was the same work that should have settled the question the first time.

To no one's credit: I ran two migrations to end up exactly where I started.

---

## Why the original index was actually good

The original `[:account_id, :question_id, :interview_session_id]` index is well-shaped for what both queries do:

- `account_id` narrows the scan to one tenant immediately
- `question_id` narrows further — the queries only care about specific eligible questions, not the whole table
- `interview_session_id` makes the join to `interview_sessions` cheap, because Postgres can satisfy it from the index rather than doing a heap lookup

The partial condition (`asked_at IS NOT NULL`) handles the noise. The count query reads only key columns, so it goes index-only. The `MAX(asked_at)` query finds its rows through the same index and reads the one timestamp it needs from the heap — which, on a set already narrowed to one user's asked questions, is nothing to worry about.

The seq scan that started the whole detour was about table size in development, not about the shape of the index. The index never needed changing.

---

## What I've noticed about how these two work

Codex didn't make this kind of mistake. It built the index, it fit the query, done. Codex tends to be thorough and mechanically correct on the first pass. The problem with Codex is different: it will sometimes over-engineer a solution with considerable confidence, and if you don't push back it will just keep building on top of it. It won't naturally pause and ask whether the complexity is necessary. You have to prompt it to review its own work, and when it does, it often finds things — as if it had no memory of writing any of it.

Claude is good at working through something incrementally, and it does real investigation — it ran the actual query plans instead of guessing, which is more than a lot of advice about indexes bothers to do. BUT unfortunately it's often plain incorrect and admits to it often as well. The failure mode is subtler. It read one measurement, a seq scan on a tiny table, as if it were the whole truth, and recommended a change before the investigation was finished. The premise was wrong, but it was wrong in a way that looked empirical.

The thing that saved it was finishing the same investigation: running the plan one more way, against the conditions that actually matter at scale. That second EXPLAIN is the one that should have come before the recommendation, not after the migration. The first plan wasn't false — it was incomplete, and acted on too early.

Neither of them is a replacement for a second pair of human eyes on anything that touches a migration. I rolled it back. The migration is byte-for-byte what Codex wrote, and the rotation works fine. The most useful work in the whole episode — the query plans, the seqscan comparison, the reasoning about bitmap scans — was also the work that walked me out to a dead end and back. Funny, in hindsight.
