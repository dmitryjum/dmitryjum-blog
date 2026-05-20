# LinkedIn Content Tracker

Use this document to track your LinkedIn posts for each technical article. Update the status to `✅ Posted` and add the date once you've published it.

| Article Title | File | Status | Date Posted |
|---|---|---|---|
| Apollo Cache was my live game bus | `apollo-cache-was-my-live-game-bus.md` | ✅ Posted | 2026-04-24 |
| Building an internship search that remembered what you wanted | `building-an-internship-search-that-remembered-what-you-wanted.md` | ✅ Posted | 2026-04-27 |
| Refactoring a contract decision tree like a Redux reducer | `contract-decision-reducer.md` | ✅ Posted | 2026-05-01|
| Cutting a Rails analytics dashboard from 10 seconds to 2 | `cutting-a-rails-analytics-dashboard-from-10-seconds-to-2.md` | ✅ Posted | 2026-05-03 |
| Designing player and spectator roles into the schema | `designing-player-and-spectator-roles-into-the-schema.md` | ✅ Posted | 2026-05-10 |
| Detecting GTM network requests vs HTML snippets | `detecting-gtm-network-vs-html.md` | ⬜️ To Do | |
| Editing arbitrary JSON in React is harder than it looks | `editing-arbitrary-json-in-react-is-harder-than-it-looks.md` | ⬜️ To Do | |
| When a Rake task is the right place for business logic | `eligibility-check-rake-task.md` | ⬜️ To Do | |
| Hosting Chromium on Vercel | `hosting-chromium-on-vercel.md` | ⬜️ To Do | |
| How I built a session timeout warning without being annoying | `how-i-built-a-session-timeout-warning-without-being-annoying.md` | ⬜️ To Do | |
| How I built a timed quiz loop with React and GraphQL | `how-i-built-a-timed-quiz-loop-with-react-and-graphql.md` | ⬜️ To Do | |
| Fixing a fast autosave race in Generations | `how-i-fixed-a-fast-autosave-race-in-generations.md` | ⬜️ To Do | |
| Keeping IVF data safe during bad connections | `how-i-kept-ivf-data-safe-during-bad-connections.md` | ⬜️ To Do | |
| How I made a Rails weather app feel like a SPA | `how-i-made-a-rails-weather-app-feel-like-a-spa.md` | ⬜️ To Do | |
| How I stopped spectators from seeing future questions | `how-i-stopped-spectators-from-seeing-future-questions.md` | ⬜️ To Do | |
| How I used jsonb for a scraper-backed Rails API | `how-i-used-jsonb-for-a-scraper-backed-rails-api.md` | ⬜️ To Do | |
| Treating every background job attempt as a first-class record | `intake-attempt-tracking.md` | ⬜️ To Do | |
| Keeping search context alive on a Rails profile page | `keeping-search-context-alive-on-a-rails-profile-page.md` | ⬜️ To Do | |
| Keeping search state coherent with Redux thunks | `keeping-search-state-coherent-with-redux-thunks.md` | ⬜️ To Do | |
| Wrapping the Mindbody API in Rails: what the docs don't tell you | `mindbody-api-rails-integration.md` | ⬜️ To Do | |
| How I stopped random timeouts from breaking a background job | `mindbody-timeouts-resilience.md` | ⬜️ To Do | |
| Building mobile features on top of a Rails monolith | `mobile-features-on-a-rails-monolith.md` | ⬜️ To Do | |
| Modeling a betting market with Solidity state transitions | `modeling-a-betting-market-with-solidity-state-transitions.md` | ⬜️ To Do | |
| Opening up an Avo admin without opening up everything | `opening-up-an-avo-admin-without-opening-up-everything.md` | ⬜️ To Do | |
| How I built passport stamps on Atlas Obscura | `passport-stamps-atlas-obscura.md` | ⬜️ To Do | |
| Rate limiting without Redis: Rack::Attack with Solid Cache | `rack-attack-solid-cache.md` | ⬜️ To Do | |
| How I made a Rails API safer for a future iOS app | `rails-api-for-a-future-ios-app.md` | ⬜️ To Do | |
| What it takes to glue Rails, Stripe, and Peak15 together without losing bookings | `rails-stripe-peak15-booking-flow.md` | ⬜️ To Do | |
| Restoring auth state in a React app with Redux | `restoring-auth-state-in-a-react-app-with-redux.md` | ⬜️ To Do | |
| How I tried to teach a scraper what not to load | `teaching-a-scraper-what-not-to-load.md` | ⬜️ To Do | |
| The school quiz that doubled as an onboarding funnel | `the-school-quiz-that-doubled-as-an-onboarding-funnel.md` | ⬜️ To Do | |
| The tiny temperature toggle I actually liked building | `the-tiny-temperature-toggle-i-actually-liked-building.md` | ⬜️ To Do | |
| The weather pipeline behind Forecastly | `the-weather-pipeline-behind-forecastly.md` | ⬜️ To Do | |
| Tracking unread messages in a Rails inbox without per-message read receipts | `tracking-unread-messages-in-a-rails-inbox-without-per-message-read-receipts.md` | ⬜️ To Do | |
| Unmasking obfuscated analytics | `unmasking-obfuscated-analytics.md` | ⬜️ To Do | |
| Why I split realtime game updates out of the Next.js app | `why-i-split-realtime-updates-out-of-nextjs.md` | ⬜️ To Do | |
| Writing payout logic in Foundry | `writing-payout-logic-in-foundry.md` | ⬜️ To Do | |

---

## Post Drafts

### Apollo Cache was my live game bus
**Status:** ✅ Posted
**Draft:**
I was working on a browser-based quiz game in Next.js, with players answering questions and spectators watching the game update live.

The app already used GraphQL and Apollo Client, so when I added live updates with subscriptions, I had a choice to make: build a separate frontend pub/sub layer, or let Apollo Cache do more of the work.

I ended up writing the subscription payloads directly into the cache. That kept the game screen and the active-games dashboard in sync without adding another client-side event system on top of React.

A small pub/sub library would have delivered events, but then I still would have needed to translate those events into the state my GraphQL queries were already reading. Apollo Cache gave me that part for free: normalized state, query updates, and fewer places for the same game data to drift apart.

On the server side, the production subscription path could still use Redis/ElastiCache behind GraphQL. On the frontend, Apollo Cache became the place where those live updates turned back into UI state.

I wrote a quick breakdown of how Apollo Cache became the live state layer for this quiz app: https://www.dmitryjum.com/blog/posts/apollo-cache-was-my-live-game-bus

### Building an internship search that remembered what you wanted
**Status:** ✅ Posted
**Draft:**
I was looking back at an internship search feature I built for AlumniFire, a Rails app where students could find employers and send resume drops through the platform.
The search form was only the entry point. The real workflow started after a student had already searched.

A student might pick an industry, choose a city, set a radius, find a set of employers, send a few resumes, and then come back later. If the app treated that as a plain filter form, they would have to rebuild the same search and remember who they already contacted. So I made the search a record in the app database.

The app saved the criteria, restored the unfinished search when the student came back, filtered out employers who had already received a resume, and let the final result set turn directly into outreach.

Some of the implementation is good old Ruby on Rails: serialized hashes, Geocoder, model scopes, and a few places where I had to drop down into SQL. But I still like the product shape as the feature remembered the student's intent and it helped them finish the job.

Read more about it and see the code and its implementation in my blog post at: https://www.dmitryjum.com/blog/posts/building-an-internship-search-that-remembered-what-you-wanted

### Refactoring a contract decision tree like a Redux reducer
**Status:** ✅ Posted
**Draft:**
I was working on a Rails API project that had to migrate business contracts from ABC Financial into Mindbody, and most of the complexity was in deciding what to do with the contract we already had.

If there was an active contract, do one thing. If it was future-dated, do another. If it had already been terminated, do nothing. That kind of logic gets hard to trust once it turns into a pile of branching service code with side effects mixed in.

What helped was borrowing a pattern from React and Redux and treating the decision step like a reducer. I wrote a method that looked at the current contract state and returned the next action to take. Then the rest of the Rails code executed that action.

I like borrowing patterns from other frameworks when they solve the problem cleanly. Redux gave me a straightforward way to model a finite set of states and transitions, and it translated well to Rails here. It put the decision logic in one place and made it simpler to test and change later.

I wrote up the breakdown here: https://www.dmitryjum.com/blog/posts/contract-decision-reducer

### Cutting a Rails analytics dashboard from 10 seconds to 2
**Status:** ✅ Posted
**Draft:**
Back at AlumniFire years ago, I had a Rails admin dashboard, that was used only by a few company internal users, that looked simple on the surface, but took around 10 seconds to load because it was stacking independent Google Analytics requests one after another.

The core issue was hidden network waiting.

The version I shipped back then was very direct: I parallelized the time-slice requests with a threaded `pmap`, let those Google Analytics calls overlap instead of queueing behind each other, and kept the response shape the same so the rest of the dashboard didn't have to care. Then I added rounded-time caching so we stopped recomputing the same answer on every page load.

That got the page down to about 2 seconds without rewriting the UI contract.

One part I still like is how little needed to change. The speedup came from identifying an I/O fan-out problem: several independent remote calls, all answering the same screen, all safe to overlap.

In Ruby today, I'd still solve that same problem the same way in spirit, but with a more explicit bounded worker pool around those requests instead of extending `Enumerable` with a homegrown `pmap`. Same idea, cleaner edges: cap how many remote calls are in flight, keep the business logic unchanged, and return the same data structure the dashboard already expects.

I also wouldn't treat that as a universal Rails pattern. For broader or higher-traffic problems, I'd rather lean on precomputation, background jobs, or stronger caching boundaries than make every request fan out across external APIs.

I revisited that old code recently and wrote a bit about what still holds up, what feels very 2015, and why this kind of performance work is usually more about fixing the call pattern than chasing micro-optimizations inside Rails.

You can see and read the details here: https://www.dmitryjum.com/blog/posts/cutting-a-rails-analytics-dashboard-from-10-seconds-to-2

### Designing player and spectator roles into the schema
**Status:** ✅ Posted
**Draft:**
Most role systems start as a boolean. `isAdmin`, `isSpectator`, `canEdit` — a field on the user, checked in a component or a controller. It works until the role isn't really about *what kind of user* someone is, but about *how they relate to a specific record*.

In a multi-user app, someone can be a player in one session and a spectator in another. A boolean on the user table can't represent that. It collapses a relationship into a property.

The cleaner model is a named relation. Instead of a flag, you define it structurally in the schema: a `Game` has one `player` and many `spectators`, each pointing back to the `User` table as separate relations. Now the database enforces the cardinality — one active player per game, any number of spectators — before any application code runs.

From there, the role has to travel through the stack, and *where* it lands matters. Put it in the session JWT so stateless API requests carry it without a DB round trip. Pull it into React context so the whole component tree can make decisions without re-deriving everything from the session each time.

The step people skip is the server-side gate. UI checks alone mean a determined client can bypass them. When the authorization check lives in the GraphQL resolver — verifying the user is actually that game's player or a registered spectator before any mutation runs — the frontend becomes irrelevant to the security model.

The pattern generalizes: any time a role describes a relationship between a user and a record, it probably belongs in the schema as a relation, not a column on the user.

I built this out for Intelli Casino, a browser-based multiplayer quiz game. The full breakdown of how the schema, React context, and GraphQL auth layer connect: https://www.dmitryjum.com/blog/posts/designing-player-and-spectator-roles-into-the-schema

### Detecting GTM network requests vs HTML snippets
**Status:** ⬜️ To Do
**Draft:**
When I started Pixel Probe, I assumed GTM detection would be the easy part. Open a site in Puppeteer, watch the requests, check for googletagmanager.com or /g/collect.

That works on clean demo sites. On the real web, a site can ship GTM code in its HTML and never emit a single request during the session you happen to capture — slow pages, consent gates, headless-browser fingerprinting, plain bad luck. The detector ends up reporting "nothing found" when the truthful answer is "the code is there, I just didn't observe it execute."

So the model needed two questions instead of one. Tracking code can be present in the source. Tracking behavior can be observed at runtime. Those aren't the same thing, and treating them as one yes/no answer collapses real signal.

The HTML pass runs through Cheerio looking for dataLayer, analytics, and gtag references. The runtime pass is the existing Puppeteer interception. The final result combines them: if either catches a signal, GTM is present.

On a serverless host, the browser is the most likely thing to fail. The HTML pass avoids it entirely — just a plain fetch and a Cheerio parse, no Puppeteer dependency. The cheaper check ends up being the more resilient one.

The response shape changed to match. The route now reports three distinct states: runtime requests captured, HTML signal only, or neither found. That's a more honest output than forcing certainty where there isn't any.

Full breakdown: https://www.dmitryjum.com/blog/posts/detecting-gtm-network-vs-html

### Editing arbitrary JSON in React is harder than it looks
**Status:** ⬜️ To Do
**Draft:**
A fixed form is straightforward. You know the fields, you know the validation, you know which input maps to which property.

Building a UI to edit arbitrary, deeply nested JSON in React is a different class of problem.

I was building the frontend for a Rails API where each record had a flexible details object — the backend was ingesting scraped data with no two pages sharing the same schema. Once the editor lets users add, delete, and rename keys, it stops being a form. It becomes a small data-structure editor, and the rules change.

The hard part is not changing a value. It's changing a key. You can't just update a label. You have to remember the old key, read its value, delete that property, and write the value back under the new key — all while the field name is invalid mid-typing. The identity of a field is unstable while the user is editing it, so the state model can't assume the field name is a permanent identifier.

A few things that came up the hard way:

Add row and delete row are core state transitions, not UI sugar — they change the shape of the object. Dispatching to Redux on every keystroke creates noise; a 500ms timed change helper kept the modal usable. Today I'd keep a local draft object in a reducer with explicit actions for rename_key, set_value, add_row, and delete_row, then dispatch one clean payload on save instead of mutating the global object in place. Search, filter, pagination, and edit state all started fighting each other in Redux. URL-driven state would have saved a lot of pain.

The tools have changed since I wrote this. The underlying problem hasn't: flexible APIs invite flexible UIs, and editing shape is a different problem from editing values.

Code and the longer write-up: https://www.dmitryjum.com/blog/posts/editing-arbitrary-json-in-react-is-harder-than-it-looks

### When a Rake task is the right place for business logic
**Status:** ⬜️ To Do
**Draft:**
A bi-weekly rake task that checks whether thousands of gym members are still eligible for their contracts, and terminates the ones who aren't. The task itself isn't complicated. The patterns inside it are worth pulling out.

Batch external calls by a shared dimension, not per row. The naive version makes one ABC Financial call per member: n calls for n members. Instead, I group attempts by club, collect all ABC member IDs for that club, and make one batch call per club. Then I build an O(1) lookup hash before the loop so per-member lookups inside it don't multiply the call count.

Persist the external ID during the first integration. The ABC member ID was stored in response_payload JSONB during intake. That single column is what makes the batch lookup possible weeks later, with no joins or secondary queries.

Introduce artificial delays when writing to a rate-limited API in a loop. The check is one call per club, but terminations are one call per ineligible member against Mindbody. A configurable delay (default 500ms) keeps the loop inside rate limits without a deploy to tune it.

Rescue at different scopes. Wrap the club-level ABC call in one rescue that skips the entire club on failure. Wrap individual terminations in another that just logs and continues. One club's timeout shouldn't abort the other 30, and one bad member shouldn't abort the rest of the club.

Cache lookups inside the loop. Contract ID resolution falls back to a name lookup if it's missing from the payload — but that lookup hits the API once per club run, not once per member.

None of these are exotic. They're easy to skip when shipping the happy path first, and expensive to retrofit once the task is in production.

Full breakdown with code: https://www.dmitryjum.com/blog/posts/eligibility-check-rake-task

### Hosting Chromium on Vercel
**Status:** ⬜️ To Do
**Draft:**
Pixel Probe needs a real browser. It has to open a site, wait for the page to run, and inspect the actual network requests leaving the browser. Parsing HTML helps, but it doesn't replace runtime traffic.

That was fine locally. It was not fine on Vercel.

Vercel's function size limit is 250 MB uncompressed, and that includes imported libraries. Plain puppeteer is convenient locally because it bundles a compatible Chromium for you. On Vercel, that bundled browser blows past the limit.

The setup that worked is a split: locally, puppeteer with the bundled browser; in production, puppeteer-core plus @sparticuz/chromium-min, with the executable path resolved at runtime. The chromium-min package strips the Brotli files for hosts with size limits and expects you to provide the executable yourself. That's the real shift — stop expecting the default install story to carry production, and bring the browser yourself.

The wrong instinct is to drop the browser entirely and only analyze HTML. That makes deployment easier and makes the product weaker. You go from "this page emitted these requests" to "this page contains code that looks like tracking." Those are not the same thing.

If you're shipping headless Chrome on a serverless host, treat local and production as different runtimes with different needs, not the same runtime in different sizes.

Full walkthrough: https://www.dmitryjum.com/blog/posts/hosting-chromium-on-vercel

### How I built a session timeout warning without being annoying
**Status:** ⬜️ To Do
**Draft:**
Forced sign-out is one of those features everyone agrees with in theory and hates in practice.

At IVFQC, both Generations and Reflections had screens where users could spend real time entering operational data. The brute-force version — expire the token, let the next request fail — reads as randomness to the user. The app needed to know when the session would expire, warn before it happened, and restart timing cleanly if the user chose to stay.

The first decision was treating expiration as server truth. The browser called a lightweight /auth/session-ping and got back the real expiration timestamp. No hardcoded JS timeout guessing at what the auth layer believed. The client reacted to the real value.

The second decision was two separate timers, not one. The warning timer fires earlier and shows a dismissible alert. The sign-out timer fires at the actual expiration. Closing the alert is the "I'm still here" signal — no modal, just enough friction to prove the user is active.

The bug worth sharing: when the user dismisses the warning, you have to clear the existing sign-out timer before fetching new expiration and rebuilding timers. Otherwise the old timer is still alive in memory, and the user gets signed out anyway when it fires — even though the monitor looks right.

That's the kind of bug that only shows up in tests around simulated clock ticks. The test that matters isn't "alert rendered." It's "after you interacted with the warning, the stale sign-out can no longer fire."

The same monitor ended up working in two different apps (Generations and Reflections) with only the DOM anchor for the alert banner changing. When a feature survives across products with only minor adaptation, the abstraction is covering the real problem, not one page's markup.

Read the full breakdown here: https://www.dmitryjum.com/blog/posts/how-i-built-a-session-timeout-warning-without-being-annoying

### How I built a timed quiz loop with React and GraphQL
**Status:** ⬜️ To Do
**Draft:**
The hardest part of a live quiz game isn't generating questions. It's the loop.

You need a timer, keyboard input, manual next-question behavior, automatic next-question on expiry, and — if spectators are watching — all of it has to stay in sync across multiple clients without becoming "whoever clicked first wins."

The decision that made the rest possible: the React timer component doesn't own the game state. It only counts down. It doesn't decide what the next question is. The timer is built from startAt, a timestamp that comes out of the game record — not from "when this component mounted."

That's the difference between a timer and a live game clock. If a client joins late, reloads, or reconnects, it computes the same remaining time from the same authoritative question start. The key prop makes the timer remount cleanly when the server advances currentQuestionStartTime.

A few more pieces that kept the loop stable:

The server stays authoritative about timing. Mutations like openGame and updateGameQuestion write currentQuestionStartTime back to Postgres, and that's the value every client reacts to. Answer checking is separate from question advancement — the checkAnswer route validates, scores, and writes a UserAnswer row; it doesn't try to move the game forward. The game loop decides whether to finish or advance. MCQ and open-ended modes share the same loop — different scoring rules, same progression rules.

Spectators are the pressure test. A solo quiz can hide a lot of sloppy local state. A live quiz with spectators can't. The loop revolved around four shared fields: currentQuestionIndex, currentQuestionStartTime, status, and timeEnded. Those are enough to reconstruct the whole round from any client.

The timer was never the hard part. Making it belong to the game state was.

Full breakdown and code: https://www.dmitryjum.com/blog/posts/how-i-built-a-timed-quiz-loop-with-react-and-graphql

### Fixing a fast autosave race in Generations
**Status:** ⬜️ To Do
**Draft:**
Autosave bugs are rarely about one request. They're about timing.

In Generations, users could type quickly through secondary parameter fields and rely on autosave to keep up. Most of the time it did. The bug showed up at the boundary between "this value doesn't exist yet" and "this value now exists and should be updated." Quick edits could hit both sides of that boundary too fast.

The frontend was switching forms from POST to PUT after the first successful save — appending a hidden method=put input so subsequent writes would be treated as updates. The problem was the window between those states. If autosave fired again before the UI had fully crossed the boundary, the client and server could disagree about what operation was supposed to happen.

The fix wasn't more retries or more locks. It was to stop asking the client to pick the right verb. I added a single create_or_update endpoint and pointed the form at it. The controller looks up existing values by parameter ID and completion IDs — if rows exist, it updates them; if not, it creates them inside a transaction. That removed the fragile POST-to-PUT handoff in the middle of active typing. The browser no longer had to be perfectly synchronized with record existence to send a valid write.

Two things worth flagging for anyone touching live autosave code:

Side effects belong in the unified path too. This controller didn't just save a value — it recalculated cryopreservation event timestamps and bulk attempt aggregates. A narrow alternate endpoint would have fixed the race and broken the surrounding workflow.

Number fields need keyup input listeners, not just change. Arrow buttons and quick edits fire different events. "Works when you type" is not the same as "works when you use the control normally."

Good autosave work reduces the number of states the client can get wrong. Every extra client-side state transition under speed is a place for timing bugs to hide.

Full write-up: https://www.dmitryjum.com/blog/posts/how-i-fixed-a-fast-autosave-race-in-generations

### Keeping IVF data safe during bad connections
**Status:** ⬜️ To Do
**Draft:**
The easiest way to lose trust in a lab app is to lose someone's data.

At IVFQC, the old autosave depended too much on the request that had just been fired. If the connection dropped, if a request timed out, or if the page refreshed at the wrong moment, the user thought their value was saved and it never made it to the server.

I built a write-ahead log in localStorage. Every autosave action becomes a small request object, persisted before the network gets a chance to fail. Then a queue consumer processes them in order — one in flight at a time, so a burst of keystrokes doesn't create overlapping writes racing each other.

That changed the contract. A request wasn't gone just because the server didn't answer right away. Writes stayed ordered. Failures became recoverable instead of silent.

A few details that mattered more than the queue itself:

The UX had to admit when the internet disappeared. A small "Connection lost. Data will save when reconnected." banner, plus a retry tick every few seconds, plus a recovery message on reload.

Retry transport failures. Don't retry validation failures forever. A 422 from a real business rule gets spliced out of the queue immediately — otherwise the queue becomes a zombie queue.

The queue runs to completion on page load. localStorage is durable across refreshes. The browser remembers unfinished intent and resumes it.

A shared autoSave helper across data entry surfaces keeps different forms from reinventing retry logic.

The tests that mattered weren't happy-path integration. They were the mechanics: creating missing queue buckets, appending in order, splicing on success, resuming on reload. When software deals with health workflows, "probably saved" isn't good enough.

Full breakdown: https://www.dmitryjum.com/blog/posts/how-i-kept-ivf-data-safe-during-bad-connections

### How I made a Rails weather app feel like a SPA
**Status:** ⬜️ To Do
**Draft:**
I wanted Forecastly to feel fast before it was fast. The user is waiting on geocoding, Weather.gov, and whatever the network feels like that day. The moment between "Search" and "Here's your forecast" is where the app either feels smooth or feels cheap.

I didn't build a React app. I let Rails do the job.

The landing page server-renders the shell and uses a lazy-loaded Turbo Frame for the forecast region. The page arrives instantly. The forecast frame requests a default New York forecast after mount. The user doesn't land on an empty shell, and the whole home page response isn't held behind a slow weather lookup.

The search form targets the same frame, so a submission swaps just that region. Header stays put. Layout stays put. The page doesn't blink. That's the part people describe as "SPA-like," and Turbo is enough for this class of app.

A few pieces worth pointing at:

The response is a real partial page, not JSON dressed up as architecture. No client-side state machine, no JSON endpoint plus rendering layer plus frontend cache plus loading-state library. The server returns HTML for the region that needs to change.

A small Stimulus controller swaps a spinner into the forecast area immediately on submit. That changes the feel of the app more than most backend optimizations.

Another tiny Stimulus controller handles debounced typeahead against Nominatim — narrows suggestions to US locations, doesn't hammer the API. The form is still a plain form; the backend still decides the real result.

Successful forecasts are cached for 30 minutes. The current-forecast component shows a "Cached" pill so the app tells the truth about why it's faster on repeat searches.

A lot of frontend complexity comes from solving the wrong problem. If your app mostly asks the server for new HTML, let the server send HTML. For apps like Forecastly, Turbo isn't a halfway measure before "real" frontend architecture. It is the architecture.

Code and the full write-up: https://www.dmitryjum.com/blog/posts/how-i-made-a-rails-weather-app-feel-like-a-spa

### How I stopped spectators from seeing future questions
**Status:** ⬜️ To Do
**Draft:**
One of the easiest mistakes in a live game is treating hidden information like a UI problem. It isn't.

If the backend returns the full quiz and the frontend just chooses not to render the future questions yet, then the future questions are already leaked. Maybe not visibly, but technically. That's fine for a toy app. For a game where fairness eventually matters — especially one that could touch real money — it's not.

Intelli Casino slices the question list on the server before the GraphQL payload goes out. That happens after loading the full set from the database, and before returning the response. Spectators can't inspect the next question in devtools. Players can't preload future questions through the normal game query. Late joiners still get the full visible history of the session so far.

The same protection is duplicated in the spectator-join mutation — not because duplication is good, but because the rule is important enough to enforce at every payload boundary that could expose the quiz.

Realtime systems can fool you here. Because clients are reacting to live updates, it's tempting to think "the current question is what I'm rendering, so I'm safe." But GraphQL fragments quietly pull in more than you might intend — a shared QuestionFields fragment includes answer and blankedAnswer. The lesson isn't "never put sensitive fields in fragments." Once a field is in a shared fragment, you need to be extremely clear about which records are allowed to travel to which clients.

That's the line between "the UI looks fair" and "the system is fair." Fairness rules belong in the payload, not in the component tree.

Full breakdown: https://www.dmitryjum.com/blog/posts/how-i-stopped-spectators-from-seeing-future-questions

### How I used jsonb for a scraper-backed Rails API
**Status:** ⬜️ To Do
**Draft:**
Scraped data doesn't fit neatly into rigid schemas. One Wikipedia school page has an endowment field. Another has president. Another has students, undergraduates, postgraduates, and a half-dozen other details that don't line up.

Running a migration every time the scraper found a new field wasn't the right answer. So the School table got two columns that mattered: a stable title, and a flexible details column backed by Postgres jsonb.

The scraper could keep learning without schema churn. If one page exposed academic staff and another exposed mascot, both landed in details. The ingest path stayed a one-liner: find or create by title, then update details.

A detail worth flagging for anyone going down this road: a little upfront normalization keeps a flexible schema from collapsing into junk. Stripping footnote markers, trailing punctuation, and inconsistent casing on the keys before storing them is the difference between searchable data and a jsonb column you eventually grep through in despair.

A side effect of storing arbitrary keys: the app could inspect what the scraper had actually collected. A top_twenty_keys method counted the most common detail keys, and the frontend turned that list into filter shortcuts. The API could explain its own shape.

The contract to the frontend stayed tighter than the internal model: records, entries_count, pages_per_limit, page. The client didn't need to know that the details came from a flexible document.

What I'd tighten now: stricter JSONB query construction (the interpolated SQL deserved better), index hot search paths up front, and identify earlier which keys had become real product fields worth promoting to columns. Flexible schemas help while you're discovering the shape of the data. They start hurting once certain keys become operationally important.

jsonb is a great "I don't know what this data is yet" tool. It's a worse "I know exactly what this data is" tool.

Full write-up: https://www.dmitryjum.com/blog/posts/how-i-used-jsonb-for-a-scraper-backed-rails-api

### Treating every background job attempt as a first-class record
**Status:** ⬜️ To Do
**Draft:**
Background jobs against third-party APIs will fail in ways you don't expect. The question isn't whether they'll fail — it's whether you'll find out quickly and have enough context to fix it.

For this gym membership migration project, the client had a tight budget: no Datadog, no Honeybadger, no Sentry. They wouldn't be reading server logs. The system needed visibility I could hand off to a non-technical client.

Each intake attempt became a real database record instead of a black box. IntakeAttempt has a string enum status covering every meaningful step — pending, found, eligible, ineligible, enqueued, mb_success, mb_failed, member_missing, upstream_error, terminated — and a JSONB response_payload that accumulates context as the attempt moves through ABC Financial and Mindbody.

The payload isn't just the final result — it's a running log. After a successful run, one row contains the ABC member ID, the Mindbody client ID, the contract purchase receipt, and the password-reset flag. That's the entire audit trail for that member's migration, in a single queryable record.

That one decision ended up serving three jobs at once:

Debugging. The status tells you exactly where the flow broke. No log parsing.

Alerting. Failures email the admin with the attempt object attached — full payload, error message, last status. Email is the right delivery mechanism when the client doesn't want to pay for an error monitoring service.

Periodic eligibility checks. Weeks later, a rake task queries successful attempts, pulls the ABC member ID out of the stored payload, and batch-checks current eligibility. A column written during enrollment becomes the index key for a completely different periodic task.

And a fourth payoff: a simple admin panel filtered by status and email, where the client can answer their own questions without touching the database.

It's a small model. It's not clever. But it's the kind of decision that makes the whole system feel like it was designed to be operated, not just to run.

Full write-up: https://www.dmitryjum.com/blog/posts/intake-attempt-tracking

### Keeping search context alive on a Rails profile page
**Status:** ⬜️ To Do
**Draft:**
Profiles lie when they forget how you got there.

A recruiter runs a search, opens a worker, and the page turns into a generic profile with generic trades, generic skills, generic distance. The back button drops them somewhere vague. That's not a profile bug. That's a workflow bug.

At Skillit, I made worker profiles contextual to the saved search that led to them. The fix didn't need a client-side store or a custom browser-history trick. It just needed one more piece of state in the URL: search_id.

That one param changed the question the profile page could answer. It went from "show me this worker" to "show me this worker in the context of this saved search."

The controller resolved @search once, falling back cleanly to nil if absent. Then the components used it: matched trades highlighted instead of all trades; distance computed from the saved-search location; pay highlighted red when it fell outside the saved-search range; the skills chart became a comparison between what the worker had and what the role needed.

Two details worth pointing at for anyone building this kind of flow:

Make context explicit. A role dropdown on the profile let the recruiter switch between "Full Profile" and any of their saved-search lenses. Each menu item just linked back to the same profile with a different search_id. Contextual pages get mysterious fast if numbers shift based on hidden state — the UI has to admit which lens it's using.

Pass context into lazy-loaded regions too. The "more like this" sidebar is a Turbo Frame, and it carries search_id forward. Otherwise the contextual flow dies at the first detail page.

This is the kind of feature people assume needs a frontend state layer. It doesn't. The state already has a natural home: in the URL as search_id, in the controller as @search, in the component tree as an input.

Full write-up: https://www.dmitryjum.com/blog/posts/keeping-search-context-alive-on-a-rails-profile-page

### Keeping search state coherent with Redux thunks
**Status:** ⬜️ To Do
**Draft:**
Search UIs get messy once they stop being a single text box.

This app had a search term, field-based filters, pagination, a "load more" button, and a record-editing modal. The hard part wasn't rendering results. It was keeping the user's idea of the list coherent as they moved around.

The shape that held up: a small, centralized store and thunks that rebuild the next request from current state instead of from arguments.

The initial state tracked the current records, the current page, the page size, the active filter, the active search term, and the total page count. That was enough to rebuild the next request from the current UI state.

The reducer made a few important decisions explicit. A new search reset to page one. A new filter did the same. "Load more" appended rather than replaced. Mix up append and replace, or forget to reset the page on a new query, and the list starts lying.

The thunks did the actual coordination. Instead of components knowing which API to call and how to merge query state, they dispatched intent — search with a term, findByKey with a filter, addMoreSchools — and the thunk pulled current state out of the store and rebuilt the request from scratch.

One line that quietly mattered: the load-more thunk checked whether a search term was present before deciding which API endpoint to call. That preserved the active mode — "load more" continued whichever flow the user was actually in, filtered browse or search. Easy to break when query state is spread across components instead of reconstructed in one place.

Editing records made the real state problem obvious. After an edit: keep the search term? Keep the filter? Keep the page? Replace the list, or append? The actual challenge is preserving user context while the underlying collection changes.

What I'd change now: URL-driven state for search, filter, and page so refreshes and back buttons survive. A reload drops back to page one with no filters. That's the gap.

Full breakdown: https://www.dmitryjum.com/blog/posts/keeping-search-state-coherent-with-redux-thunks

### Wrapping the Mindbody API in Rails: what the docs don't tell you
**Status:** ⬜️ To Do
**Draft:**
There isn't much Ruby content about integrating with the Mindbody API. Their docs cover the surface, but once you actually wire things up, you hit a pile of quirks that aren't documented anywhere. This post is what I wish existed before I started.

Context: I built a Rails bridge that migrates eligible gym members from ABC Financial into Mindbody — create or update a client, purchase a contract. The update-an-existing-one case is the hard one.

A few things to know going in:

Timeouts are real. Their API is genuinely slow under load. Requests can take 45+ seconds during development. Set Faraday's timeout to 60 seconds and open_timeout to 10. Defaults will kill you.

Tokens last roughly an hour — cache them. Store the token in memory with a 60-second safety buffer before expires_at, and support a static token env var for local dev.

CamelCase everywhere, and inconsistently. FirstName, LastName, ClientId — but ContractID (ID not Id on some fields). Symbol keys won't work; you have to use the exact casing the API expects in both directions.

Email isn't unique. A member might exist because staff added them manually. Check for duplicates using GET client/clientduplicates. Prefer an exact email match, fall back to the first result. Then check if they're active and reactivate before doing anything else.

The phantom contract record. When you call POST sale/purchasecontract, Mindbody creates two records — the real contract, and a phantom with a different Id but the same ContractID. Termination logic that filters by ContractID where TerminationDate is blank will catch both, which is correct, but it's deeply confusing until you understand what Mindbody is doing.

Different endpoints return different keys. Always handle multiple possible response key names as a fallback chain rather than assuming one fixed key.

Even $0 contracts require credit card info. Mindbody validates the card field format before accepting. The standard test card number works with a dynamically computed future expiry.

Normalize contract names before matching. Names get entered with inconsistent whitespace, casing, and punctuation. Lowercase plus strip non-alphanumerics plus squeeze whitespace plus substring fallback saved me from a production bug caused by an extra space mid-word.

Full write-up with code: https://www.dmitryjum.com/blog/posts/mindbody-api-rails-integration

### How I stopped random timeouts from breaking a background job
**Status:** ⬜️ To Do
**Draft:**
Intermittent failures are the worst kind to debug. The integration isn't broken, it's just unreliable. One job succeeds, the next one fails, same run.

That's where my Rails membership migration bridge ended up after Mindbody started timing out unpredictably. The fix wasn't one big change. It was three layers, each doing a different job.

The first layer: give the HTTP client room to breathe. Default Faraday timeouts are sized for typical web requests. A background integration against a slow third-party API needs different numbers. Setting timeout to 60 and open_timeout to 10 reduced random failures, but didn't eliminate them.

The second layer: retries, but only for safe calls. A request would time out, the next one in the same job would succeed. That's the pattern for retries — but only for idempotent ones. Exponential backoff for GET requests only, with a maximum of two attempts. POSTs don't get this treatment. Silently retrying writes against a payment-adjacent system is the wrong call.

The third layer: job-level backoff for true transient failures. Even with client retries, the job queue is the final safety net. Retry on timeout and connection errors, three attempts with exponential wait. Every retry is observable — the retry block records the failure and emails admins. Inside the job, transient errors get re-raised explicitly so the retry system picks them up. Everything else goes through the regular failure path.

Tighter timeouts and a single retry block aren't enough on their own. The combination — HTTP-level patience, client-level retries for safe reads, job-level backoff for everything else — is what made the integration go from "check the logs and hope" to something I could actually trust.

Full breakdown: https://www.dmitryjum.com/blog/posts/mindbody-timeouts-resilience

### Building mobile features on top of a Rails monolith
**Status:** ⬜️ To Do
**Draft:**
People talk about "building for mobile" like it's a frontend project. Sometimes it is. In a mature Rails app, it usually isn't.

The hard part isn't exposing a new endpoint. It's deciding how app behavior maps onto an existing product, an existing data model, and an existing operations team that now has to support whatever you ship.

At Atlas Obscura, place submissions, tips, Firebase auth, passport stamps, and moderation all touched each other. A few patterns held up.

A mobile feature usually means backend shape first. When the app lets a user submit a new place, the server has to answer: who can create it, what status it starts in, how much data comes back, how moderation works downstream. Place create returns 201 with app_ugc_status set to submitted — not live, not a mystery state. That's a product rule expressed in code, not just an implementation detail.

Moderation states have to agree on both sides of the API. Tips look like a small feature — a user comment on a place. But it needed a model, validation, an API create path, and a publication rule. New tips come in as submitted. The place API then has to be just as disciplined on the way back out. If you only think about creation, you leak unfinished moderation states back to users.

Mobile features create admin work whether you plan for it or not. Once users can flag content, staff need a real review surface. Skipping the staff tooling doesn't make the work smaller — it makes it invisible. I built a filterable flags admin with explicit "mark addressed / not relevant" actions. It bought time back for the team and made the product safer to expand.

The best app features reused the same business logic as web. Passport stamps got a dedicated API endpoint that reused the same country-eligibility logic as the web profile. Same with auth. Same with platform tracking. Don't let every client invent a parallel product model — put the rules in one place and expose clean contracts around them.

The "monolith" conversation is often lazy. The interesting question isn't scale or framework age. It's discipline. Can you add app-facing capabilities without scattering logic everywhere? When the answer is yes, the monolith is the advantage — the core data, the product rules, the admin surfaces, and the API are all in one place.

Full write-up: https://www.dmitryjum.com/blog/posts/mobile-features-on-a-rails-monolith

### Modeling a betting market with Solidity state transitions
**Status:** ⬜️ To Do
**Draft:**
The betting contract in Intelli Casino is small enough to read in one sitting. That matters here.

It doesn't try to be a protocol. It models one specific thing: a game opens, people place bets, they can withdraw while the game is still open, the game closes, winnings get distributed, the round ends. That's a state machine disguised as a betting contract.

Two enums answer the questions that matter. BetState: PENDING, WON, LOST. GameState: OPEN, CLOSED, FINISHED. Can a bet still be changed? Can funds still be withdrawn? Has the result been settled? If the states are clear, the rest of the contract gets easier to reason about.

A few choices worth preserving in any rewrite:

Functions don't blur across states. placeBet only works when the game is OPEN. withdrawBet only when OPEN and the bet is PENDING. distributeWinnings only when CLOSED. Illegal transitions fail immediately and loudly.

Custom errors instead of require strings. GameNotOpen, GameNotClosed, BetDoesNotExist, BetNotPending, TransferFailed. The contract has a small set of invalid states, and they all have names. That turns it into a rule system, not a wall of conditionals.

Storage is laid out for the operations you actually need. A mapping of bets plus an array of bettors. The mapping gives indexed access; the array gives you something iterable for finding an existing bettor, looping winners during payout, and compacting after a withdrawal.

Withdrawals use swap-and-pop. Bettors can withdraw while the game is open, so the contract has to remove live bets safely. Swap the slot to remove with the last slot, then pop. No expensive shifting, no gaps in the bettor list, and payout iteration still works later.

State before value transfer. Totals and the bettor list get updated before ETH gets sent out.

Solidity forces explicitness in a way most web code doesn't. You don't get to wave hands about who owns the transition. You don't get to ignore storage layout. You don't get to treat edge cases as UI annoyances. Everything that matters has to become a state, an error, a guard, or a value transfer.

The payout math is interesting. The state machine underneath it is the real design.

Full breakdown with code: https://www.dmitryjum.com/blog/posts/modeling-a-betting-market-with-solidity-state-transitions

### Opening up an Avo admin without opening up everything
**Status:** ⬜️ To Do
**Draft:**
Admin panels get dangerous fast. Not because the gem is bad — because once a team relies on the admin for daily operations, the easiest permission model becomes "just let staff do it." That works right up until it doesn't.

At Skillit, I tightened access in an Avo-based admin so staff could do their actual work without turning every staff account into a soft superuser. The pattern is portable to any Rails app using Pundit.

The base policy stays strict. Staff can browse, search, and run safe operational actions. Mutation is locked to superusers by default. That one decision makes the rest easier — every resource starts secure, and you only open the cases you can justify.

Then the exceptions get specific instead of broad. A company-linked admin should be able to edit their own company record without inheriting global write powers. The policy question isn't "is this user important?" It's "what is this user allowed to do to this record?"

A few details worth flagging:

Wire each Avo resource to a specific policy. The policy design doesn't help if every resource quietly falls back to the wrong default.

Three buckets, not two. Staff-mutable, staff-readable, and superuser-only. "Restricted" still needs to be useful — search, show, and safe actions matter for ops people.

Show controls and resource policies are different layers. Mixing them creates the worst kind of admin bug: the UI looks allowed but the request dies later, or worse, hides something the backend would have permitted.

The most valuable code from this work isn't the policies. It's the tests. Permission bugs don't show up as red exceptions in happy-path flows — they show up as quiet overreach, or a support team blocked during a live issue. The policy specs read like a contract: staff can browse workers but not destroy them; company admins can edit their own company, not someone else's; guests and regular users stay out.

Internal tools deserve the same discipline as customer-facing code. They're where teams move fast, bypass guardrails, and normalize "just this once" permissions.

Full breakdown: https://www.dmitryjum.com/blog/posts/opening-up-an-avo-admin-without-opening-up-everything

### How I built passport stamps on Atlas Obscura
**Status:** ⬜️ To Do
**Draft:**
Some features matter because they make money. Some matter because they make the product feel like itself. Passport stamps were in the second category.

At Atlas Obscura, users could mark places they'd visited. The action already existed — it needed a better payoff. A raw count is fine. A country stamp that turns travel history into something collectible is better.

It looks small from the outside, and stops being small once you build it properly. It needed a reusable visual component, backend logic to decide which countries a user had earned, and an API shape the mobile app could consume without reimplementing business rules.

The visual side was a ViewComponent — markup, an SVG icon, configurable border color, a fallback default. The harder part was answering the product question in SQL terms: when does a user actually deserve a country stamp?

At AO, stamps came from real place activity, not from manually selecting countries. So the rule stayed tied to visited places and lived in one place — the Geo model. The query only considers published places, ties eligibility to recorded activity, and returns country-level rows with only the fields the UI and API need. Once the rule lives in one place, the rest of the feature gets easier. The web profile doesn't need custom filtering. The mobile app doesn't need to guess. If the definition of an "earned stamp" changes, there's one place to change it.

The API endpoint stayed deliberately narrow. The native app didn't need the whole Geo object — it needed a list of country name and color pairs. Nothing else. That made the endpoint easier to test, harder to misuse, and meant the app team could move without pulling web concerns into native code.

The mistake people make on mobile-feature API work is thinking the app just needs "the same data." Usually it needs a smaller, cleaner contract.

Full breakdown: https://www.dmitryjum.com/blog/posts/passport-stamps-atlas-obscura

### Rate limiting without Redis: Rack::Attack with Solid Cache
**Status:** ⬜️ To Do
**Draft:**
Almost every Rack::Attack tutorial assumes Redis. Add the gem, point it at Redis, define your throttles, done.

The app runs on a single Postgres database, traffic is low, and adding a cache server just for rate limiting felt like overkill. Solid Cache — backed by whatever DB you're already running — was already there.

It almost just worked. The throttles themselves are straightforward: one by IP, one by email, both scoped to the intake endpoint. Throttling by both matters. IP-only is easy to work around with different IPs. Email-only doesn't protect from someone registering a new address each attempt. Together they cover the main abuse patterns.

The gotcha was elsewhere: boot order.

If you assign the cache store at the top level of an initializer, it runs during app boot — before the database is necessarily ready. If Solid Cache tries to check for its table before migrations have run, the app errors at startup. First deploys especially.

The fix is to defer until after the app is fully initialized and add a table existence check with a MemoryStore fallback. The after_initialize hook runs after all initializers, when the DB connection is stable. The MemoryStore fallback means the app still starts and rate limiting still works in development or on a fresh deploy — it just doesn't persist counts across processes. Acceptable for the scenarios where Solid Cache isn't ready.

One useful addition: log the actual cache store class at boot. If MemoryStore shows up in production logs instead of SolidCache::Store, something is off. That's the kind of thing that's invisible until it matters.

For a single-server, single-DB app: Solid Cache over Postgres is more than enough for Rack::Attack. No Redis to provision, monitor, or pay for.

Full breakdown: https://www.dmitryjum.com/blog/posts/rack-attack-solid-cache

### How I made a Rails API safer for a future iOS app
**Status:** ⬜️ To Do
**Draft:**
An API can look fine from inside a Rails app and still be miserable to build against.

If you're the only consumer, a controller that "mostly works" feels acceptable. Once a native app starts depending on it, "mostly works" stops being good enough fast. The client needs stable auth, stable error shapes, and responses that make sense without reading server code to guess what happened.

That was the cleanup at Atlas Obscura when we expanded API support for the app.

Error handling first. Before this, a bad request could fail in ways that were technically correct and still annoying to consume. Validation errors, missing records, and generic exceptions all came back differently. I added a RequestErrorHandler object that turned exceptions into consistent payloads — RecordInvalid becomes 422 with a top-level message and a validation_errors object; RecordNotFound becomes a clean 404; everything else gets a standardized 500 shape. Wired into a global rescue_from in the base API controller. The response contract is the point. Once the base contract gets better, every endpoint that raises usual Rails exceptions gets easier to reason about.

Then account linking. AO used an external identity provider for app flows, so the server had to: reject invalid app credentials consistently, map authenticated app users back to the right AO account, support first-time linking without creating duplicates, and track whether the user came from iOS or Android. Auth became a shared foundation, the same way error handling did.

Platform tracking with discipline. A small touch_signin_or_add_missing! helper on User handled the rules: if the user already has a row for that platform, just touch last_signin_at; if this is their first app platform ever, preserve signup_source; if they already have some other platform on file, don't incorrectly mark the new one as the signup source. That last rule is the one that keeps platform-attribution data honest later.

Tests as contract. When you're building API behavior for another client team, tests stop being just a backend safety net — they become the contract. First-time linking, normal sign-in for a linked user, new user creation, correct platform recording. Not vague confidence. Specific confidence.

This work didn't ship a dramatic new UI. It produced something worth more on cross-team work: fewer unknowns.

Full write-up: https://www.dmitryjum.com/blog/posts/rails-api-for-a-future-ios-app

### What it takes to glue Rails, Stripe, and Peak15 together without losing bookings
**Status:** ⬜️ To Do
**Draft:**
Third-party integrations always look cleaner on diagrams than they do in production. Three boxes — Rails, Stripe, external booking system. Arrows. Done.

The real problem starts after the payment goes through and you still need all the right records to exist in all the right places, without charging someone twice, dropping a booking on the floor, or leaving support to manually reconstruct what happened from logs.

At Atlas Obscura, that was the world around Peak15 trip bookings. It wasn't "call an API." It was workflow engineering across the local database, Stripe events, background jobs, and a CRM slow enough to deserve code comments warning other engineers not to call it from blocking code.

A user payment succeeding doesn't mean the downstream booking is done. Treating those as one action is how teams end up with hidden failures.

The booking became a staged process: record payment completion locally as a Peak15Booking; create the contact booking in Peak15 in an async job; associate the payment with that booking in another async job; notify humans after retries fail. Each stage had its own job with retries and an explicit failure mailer in the retry block. The follow-up job only enqueues if the previous one finished cleanly.

A few patterns worth carrying to any integration that crosses system boundaries:

Failure handling is part of the feature. Retries alone aren't reliability. After exhausted retries, real humans need to hear about it. The jobs mail internal staff with the Peak15Booking attached.

Be honest in code about which calls are slow. The Peak15Booking model has comments warning that some CRM calls are slow and must not run inline. Design around that fact instead of blaming production later.

Sometimes the right move is a targeted repair, not a redesign. One snippet falls back to deriving a field from a related record when an old enqueued job is missing the argument. Not elegant. It unblocked production and left the system safer than before.

Integration work gets judged by what doesn't happen. Users complete checkout. Support doesn't get weird edge cases. Finance lines up. Engineers know where to look when something fails.

Full write-up: https://www.dmitryjum.com/blog/posts/rails-stripe-peak15-booking-flow

### Restoring auth state in a React app with Redux
**Status:** ⬜️ To Do
**Draft:**
A stored JWT in localStorage is not the same thing as an active, verified session.

That's the trap with frontend auth restoration. After a reload, the token is still there. The UI doesn't yet know whether to trust it. The app has to decide whether the user is really signed in before it shows edit controls or protected screens.

In us_schools_ui, the app had to verify the stored token with the Rails API before deciding the user was still signed in.

On startup, the layout mounts and dispatches getCurrentUser. That action reads the token from localStorage — and instead of trusting it, calls the API to verify. A successful response rebuilds the user session in Redux. A failed response clears it. A bad login and an expired stored token both lead to the same place: unauthenticated. No need for two different error shapes.

Auth wasn't only navigation state. It also gated what the user could do. The "New School" button and per-row "Edit School" buttons only rendered when isAuthenticated was true. UI auth isn't just chrome — it's the surface decision about what features even exist for the current user.

What I'd change if I rebuilt this:

Three explicit auth phases instead of a boolean. unknown, authenticated, unauthenticated. App startup is much easier to reason about with a phase for "we haven't checked the token with the server yet." A boolean conflates "no" with "not yet."

Avoid putting the raw token in Redux unless something in the UI actually needs it there. Keep it in localStorage, attach it in the API client, and let the store carry user identity instead of credentials.

Server-side verification on every restore — that part I'd keep exactly as-is.

A stored token isn't the session. The server's answer is.

Full breakdown: https://www.dmitryjum.com/blog/posts/restoring-auth-state-in-a-react-app-with-redux

### How I tried to teach a scraper what not to load
**Status:** ⬜️ To Do
**Draft:**
Scrapers are funny. You spend time trying to load a page, then you realize the real trick is not loading most of it.

In Pixel Probe, I needed Puppeteer to get far enough into the page lifecycle to capture analytics requests. Images, fonts, media, ad scripts, random WordPress junk — none of it helped. It just burned time before the requests I cared about could fire.

The first optimization was blunt and effective: a hardcoded list of resource types — image, stylesheet, font, media — plus domain and path matches. Abort anything on those lists before it consumes bandwidth. A blunt tool is still a good tool when the goal is to reach GTM/GA requests before a timeout window closes.

Then came a more interesting idea: teach the scraper. I moved the blocklist from constants into Postgres (a tiny BlockedResource model), logged every outgoing request during a run, and at the end sent the list to OpenAI with a structured-output schema asking which domains and paths could be safely blocked without breaking the page's ability to load GA/GTM. The model's suggestions got persisted, and the next run started with a slightly smarter blocklist.

Over enough runs, the scraper would stop wasting time on patterns that were never useful in the first place. Performance tuning as a feedback loop, not a pile of one-off exceptions.

I didn't ship it. Two reasons:

The current version was fast enough. The client's workload didn't justify adding an LLM call to every run.

Trust. Hardcoded blocking is dumb but predictable. A learned blocklist is more interesting but needs guardrails. If the model decides some request pattern looks useless and it's wrong, I don't just lose performance — I risk losing the exact signal the product exists to find.

So I left it on a branch.

Two lessons from what did and didn't ship: most scraping speed problems are really prioritization problems — you need the tiny slice of the page that produces the signal, not the whole page. And not every clever optimization deserves to become product behavior.

Full write-up: https://www.dmitryjum.com/blog/posts/teaching-a-scraper-what-not-to-load

### The school quiz that doubled as an onboarding funnel
**Status:** ⬜️ To Do
**Draft:**
Trivia features are easy to underestimate.

At AlumniFire, in 2015, the school quiz wasn't there to keep people busy for thirty seconds. It was there to make a school network feel real before someone joined it. Each school had its own subdomain and its own community, so a school-knowledge quiz did two jobs at once: gave people something school-specific to engage with, and pulled them toward signup without feeling like a signup wall.

The implementation has some very 2015 Rails habits, but the product loop still holds up.

The quiz was scoped to the current school from the start. Controllers only exposed active quizzes for current_school, and guard methods redirected on school mismatch. A Columbia quiz belonged on Columbia's subdomain, not in some global catalog.

Questions were weighted, not just counted. Each question had a value, and the score engine used it directly. That let editorial decide which questions mattered more, which fits a school-identity quiz better than raw correct-answer counts.

Checkboxes got partial credit in an honest way. The question's value was split evenly across all answer options. You earned points both for selecting correct answers and for leaving incorrect ones unselected. That measures actual recognition, not lucky over-clicking.

The score page kept the loop going. Show the user's result, show the average for that quiz, offer Facebook sharing, push toward signup, offer an email reminder.

Attribution was wired in cleanly. The reminder email linked back to the school subdomain with a quiz query param. The school controller stashed a session variable. Account creation copied that onto the new User. The admin side then had real funnel reporting — profiles created from quizzes, profiles validated from quizzes — not just completion counts.

The quiz wasn't engagement bait. It was the front of an onboarding funnel, with measurable signup intent at every stage.

Full breakdown: https://www.dmitryjum.com/blog/posts/the-school-quiz-that-doubled-as-an-onboarding-funnel

### The tiny temperature toggle I actually liked building
**Status:** ⬜️ To Do
**Draft:**
Forecastly only has one obvious piece of front-end state. Fahrenheit or Celsius. That's it.

That forced a solution at the right size.

No settings model. No persistence. No second round trip to the server for a different representation of the same forecast. Just a fast toggle that updates the current weather and the five-day cards together — built with one Stimulus controller and a small markup contract.

The contract is the interesting part. Both the current forecast component and the daily forecast component emit temperatures in the same shape: a span with the Fahrenheit source value in a data-original attribute and a temperature-target hook. The Stimulus controller doesn't care which component produced the node.

One detail worth carrying into similar work: store original values once in JS state, don't recompute from whatever text happens to be visible in the DOM. The source of truth stays fixed, and the page can flip back and forth without accumulating rounding errors or parsing display text.

The toggle has to underline the active unit. State changes need a visible cue. Without that, the math is right and the feature feels broken anyway. That interaction is the feature — not just the formula.

Why no server round trip? The server already did its job. By the time the page is rendered, the user has everything needed for a unit switch. Asking the server for a second render adds latency to a pure presentation concern.

A useful line to draw in Hotwire apps: if the state changes data ownership or persistence, let the server handle it. If the state only changes presentation, keep it in the browser. The unit toggle is firmly the second category.

Full write-up: https://www.dmitryjum.com/blog/posts/the-tiny-temperature-toggle-i-actually-liked-building

### The weather pipeline behind Forecastly
**Status:** ⬜️ To Do
**Draft:**
Forecastly looks simple from the outside. Type a city, get current weather, get a five-day forecast. The actual app has to build the answer in stages — there's no friendly endpoint that already matches the UI.

The shape that held up: the controller does almost nothing, and a plain Ruby WeatherFetcher does the real work. The fetcher geocodes the user's address, calls the Weather.gov points endpoint, pulls forecast and forecastHourly URLs out of that response, calls both forecast endpoints, and reshapes the payloads into the structure the view renders directly.

The design admits the shape of the external API instead of hiding it behind vague method names. Weather.gov genuinely requires an indirection step — points first, then forecast URLs — and pretending otherwise just buries the complexity somewhere worse.

A few patterns worth carrying to any similar integration:

Error handling is part of the contract. The fetcher returns a hash with either forecast data or an error message. No exceptions leak into the controller for routine failures. Distinct errors cover: ungeocodable address, points lookup failure, missing forecast URLs, downstream forecast failure. The UI doesn't spin forever.

Caching at the result boundary, not the intermediate HTTP responses. The key is the address; the value is the final shaped payload. That stores something stable — the contract between backend and view — not raw API noise.

Geocoder shares the same Rails.cache backend with its own prefix. Two layers of practical caching: geocoder lookups and finished forecast payloads.

Different endpoints for different views. Current weather uses the hourly payload's first period. Daily uses the daytime-only forecast periods, first five. Don't force one upstream payload to power both.

Small Rails apps get worse when every external API call turns into a mini-framework of adapters, serializers, facades, and concerns. One class with one job is usually enough.

Full breakdown: https://www.dmitryjum.com/blog/posts/the-weather-pipeline-behind-forecastly

### Tracking unread messages in a Rails inbox without per-message read receipts
**Status:** ⬜️ To Do
**Draft:**
Unread badges look small until they start lying.

At Skillit, once messaging became part of the hiring flow, the unread count in the header stopped being decoration. If it said 2, it had to mean 2.

The obvious design is a join table that says "user X has read message Y." That creates a lot of rows and turns the basic question "how many unread messages does this user have?" into a query problem you have to answer in three places: the header badge, the conversation list, and the open thread.

The simpler approach: a counter cache on the conversation, and one read-status row per participant per conversation. The row stores a read_messages_count. If the conversation has 10 messages and your row says 8, you have 2 unread. No per-message receipts. No expensive diffing.

The aggregate badge for the navbar is total_messages minus read_messages across the user's conversations — two sums and a subtraction. Employer participants reach conversations through their company; workers own conversations directly. The unread calculation splits on role, but the math underneath stays boring.

The detail that's easy to miss: a conversation has to be marked as read in two places — when you open it, AND when you send a reply. Without the second one, the message count increases when you send a message, but your own read count stays behind. The badge lies by one. Those are the bugs that make a messaging feature feel sloppy even when everything else looks fine.

A few more pieces:

Preload read statuses before rendering a list of conversations. Otherwise the sidebar turns into an N+1.

A missing read-status row should mean "nothing read yet," not "zero unread." The tests forced this rule to stay explicit.

If you need "Alice read message 41 at 10:32:18," build the heavier thing. But a lot of product inboxes don't need that. They need correct badges, correct unread styling, and cheap aggregate counts.

Full breakdown: https://www.dmitryjum.com/blog/posts/tracking-unread-messages-in-a-rails-inbox-without-per-message-read-receipts

### Unmasking obfuscated analytics
**Status:** ⬜️ To Do
**Draft:**
A client of mine sells server-side Google Tag Manager setups to marketers. The pitch is clean: route analytics traffic through a custom subdomain, point it at a GTM server container, and now the request looks first-party instead of obviously going to Google.

For a marketer, that's a product. For someone inspecting a site, it's a disguise.

That's why I built Pixel Probe. The question was narrow on purpose: can I tell when a site is still sending GA data, even when the hostname no longer says google-analytics.com?

Once the endpoint moves behind a custom domain, simple domain matching stops working. You have to look at the request itself. The main heuristic in Pixel Probe is small: known Google domains count as direct hits; everything else gets checked for GA-style request shapes — specifically /g/collect.

That's not maintaining a giant blacklist of suspicious hosts. It's checking whether the request still looks like Google Analytics after someone routed it through a first-party domain.

The browser matters here. The first version only inspected HTML, which can tell you whether a page contains GTM code — but not where the data goes after the page runs. The current version uses Puppeteer with request interception, so the wire becomes the evidence.

A vague "tracker detector" is easy to talk about and hard to trust. A detector that says "this request still looks like GA4 even though it doesn't go to a Google hostname anymore" is concrete. Concrete is the part that made it useful.

The business story and the implementation story are different views of the same thing here. The marketer says "first-party tracking." The engineer says "proxy the analytics endpoint." The browser says "here are the actual requests." Pixel Probe lines those up.

Full write-up: https://www.dmitryjum.com/blog/posts/unmasking-obfuscated-analytics

### Why I split realtime game updates out of the Next.js app
**Status:** ⬜️ To Do
**Draft:**
I didn't start Intelli Casino expecting three repos.

At first it was one Next.js app — Prisma, GraphQL, auth, quiz flow. Then realtime updates for spectators became a real feature, and a single practical constraint forced an architecture change: Vercel wasn't the place to run long-lived WebSocket connections.

That was the real reason for the split. Not an elegance argument.

GraphQL subscriptions need a long-lived process. The Next.js app on Vercel doesn't give you one. So I lifted the subscription runtime into its own service — Apollo Server over Express, with a WebSocket server mounted on /api/graphql, deployed separately. The main app keeps Prisma, auth, and the quiz UI. The standalone GQL server hosts the WebSocket and the pub/sub bridge.

That immediately makes in-memory pubsub insufficient. Two processes, two deployments — they need a shared event bus. That meant Redis via graphql-redis-subscriptions and ioredis. The TLS configuration branch is the kind of detail that looks boring until production shows you it isn't — local Redis assumptions stop matching AWS reality, and pubsub becomes real infrastructure instead of a development convenience.

The other thing that got more awkward once two services existed: auth. The app and the GQL server both rely on NextAuth-compatible session logic. That looks fine on paper, but only if the cookies actually arrive in a way both services can read. Once the app and the API live on different hosts, cookie and session setup becomes part of the architecture, not a detail.

The real split isn't "monolith vs microservices." It's "things that survive deployment friction cleanly" and "things that need their own box."

The spectator flow is where the split paid off. Realtime state is shared, but the game query and the spectator-join mutation both slice questions on the server before sending the payload. That guardrail lives in the GraphQL resolvers, not in the frontend.

You can build subscriptions in an evening. The harder part is keeping the chain intact across browser, app, API, websocket server, Redis, database, cookies, DNS, and cloud networking.

Full breakdown: https://www.dmitryjum.com/blog/posts/why-i-split-realtime-updates-out-of-nextjs

### Writing payout logic in Foundry
**Status:** ⬜️ To Do
**Draft:**
The betting part of Intelli Casino is unfinished at the product level. The contract repo got far enough to be concrete — and the part worth highlighting isn't the math, it's the testing shape.

The payout function is simple on purpose. Take a 3% commission off the total pool, derive a payout ratio from the losing side against the winning side, then pay each winner their principal plus upside minus the same commission cut. Boring arithmetic. Contracts benefit from boring arithmetic.

The interesting part is what Foundry lets you assert. The strongest payout test isn't "it didn't revert" — it's two things at once: verify the emitted event carries the correct payout amount, and verify the game transitioned to the FINISHED state. Not "the function returned." The contract told its public story correctly.

The revert paths get tested with the same precision. Expect a specific custom error when distributing winnings on a game that isn't closed yet. Expect a specific transfer error when the contract is short on ETH. Payout logic isn't trustworthy just because the happy-path math works once — it has to fail cleanly too.

The test file is organized by lifecycle: CreateGameTest, PlaceBetTest, WithdrawBetTest, CloseGameTest, DistributeWinningsTest. That fits because each function changes the meaning of what can happen next. Foundry's hoax, vm.deal, vm.expectEmit, and vm.expectRevert make those scenarios cheap to write without framework noise.

The nice thing about a testable contract: when you come back later, you don't rediscover the rules. They're already written down in assertions.

Full breakdown: https://www.dmitryjum.com/blog/posts/writing-payout-logic-in-foundry
