# LinkedIn Content Tracker

Use this document to track your LinkedIn posts for each technical article. Update the status to `✅ Posted` and add the date once you've published it.

| Article Title | File | Status | Date Posted |
|---|---|---|---|
| Apollo Cache was my live game bus | `apollo-cache-was-my-live-game-bus.md` | ✅ Posted | 2026-04-24 |
| Building an internship search that remembered what you wanted | `building-an-internship-search-that-remembered-what-you-wanted.md` | ✅ Posted | 2026-04-27 |
| Refactoring a contract decision tree like a Redux reducer | `contract-decision-reducer.md` | ✅ Posted | 2026-05-01|
| Cutting a Rails analytics dashboard from 10 seconds to 2 | `cutting-a-rails-analytics-dashboard-from-10-seconds-to-2.md` | ⬜️ To Do | |
| Designing player and spectator roles into the schema | `designing-player-and-spectator-roles-into-the-schema.md` | ⬜️ To Do | |
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
**Status:** ⬜️ To Do
**Draft:**
Back at AlumniFire, our admin dashboard was taking 10 seconds to load because of sequential Google Analytics API requests.

Instead of a full rewrite, I optimized the 2015-era Rails code by parallelizing the time-slice queries using threaded `pmap` and implementing rounded-time caching. This cut the load time down to 2 seconds without changing the data contract or the UI.

Performance breakdown and code snippets here: https://www.dmitryjum.com/blog/posts/cutting-a-rails-analytics-dashboard-from-10-seconds-to-2

### Designing player and spectator roles into the schema
**Status:** ⬜️ To Do
**Draft:**
Role systems should be core constraints, not just UI toggles. 

While building Intelli Casino, I designed a multi-player system where `PLAYER` and `SPECTATOR` roles are enforced at the Prisma schema level and carried through the GraphQL authorization layer. This prevents sensitive game state leaks and ensures spectators can watch but never act.

Deep dive into the role-aware schema and React context implementation: https://www.dmitryjum.com/blog/posts/designing-player-and-spectator-roles-into-the-schema

### Detecting GTM network requests vs HTML snippets
**Status:** ⬜️ To Do
**Draft:**
Working with third-party tracking tools like Google Tag Manager can be a black box. Sometimes you need to know exactly what GTM is doing under the hood, especially when auditing performance or privacy compliance.

I recently built a mechanism to distinguish between GTM's actual network requests and the HTML snippets it injects. It involved diving deep into browser APIs and request interception, which was both challenging and incredibly revealing.

If you've ever had to debug or monitor third-party scripts, you might find this useful. Here is how I unmasked GTM's behavior: https://www.dmitryjum.com/blog/posts/detecting-gtm-network-vs-html

### Editing arbitrary JSON in React is harder than it looks
**Status:** ⬜️ To Do
**Draft:**
Building a simple text input is easy. Building a robust UI to edit arbitrary, deeply nested JSON structures in React? That’s a different story entirely.

I recently had to build a JSON editor component that could handle dynamic schemas without crashing or losing focus on every keystroke. It forced me to rethink how React handles deeply nested state updates and component reconciliation.

I wrote up a detailed breakdown of the challenges I faced and the patterns I used to make editing arbitrary JSON in React feel smooth and reliable. Check it out: https://www.dmitryjum.com/blog/posts/editing-arbitrary-json-in-react-is-harder-than-it-looks

### When a Rake task is the right place for business logic
**Status:** ⬜️ To Do
**Draft:**
We're often taught to keep business logic out of Rake tasks and strictly within models or service objects. But sometimes, rules are meant to be broken.

I was recently working on a complex eligibility check that didn't neatly fit into a standard web request lifecycle. Putting it in a Rake task wasn't just a shortcut; it was actually the most appropriate architectural boundary for that specific piece of logic.

Here's a look at why I made that choice and how I structured the task to remain testable and maintainable: https://www.dmitryjum.com/blog/posts/eligibility-check-rake-task

### Hosting Chromium on Vercel
**Status:** ⬜️ To Do
**Draft:**
Running headless browsers in serverless environments is notoriously tricky. Vercel is great for a lot of things, but hosting Chromium isn't its primary use case.

I needed to run some automated browser tasks and decided to see if I could make it work on Vercel. It required navigating strict execution limits and optimizing the bundle size, but I finally got a reliable setup running.

If you're looking to run headless Chromium on a serverless platform, here is a breakdown of how I made it happen on Vercel: https://www.dmitryjum.com/blog/posts/hosting-chromium-on-vercel

### How I built a session timeout warning without being annoying
**Status:** ⬜️ To Do
**Draft:**
Session timeout warnings are often a terrible user experience—they interrupt you, log you out unexpectedly, or just look broken.

I wanted to build a timeout warning that respected the user's workflow. It needed to be visible but unobtrusive, accurately reflect the server state, and handle multiple open tabs gracefully.

I wrote about the approach I took to build a session warning system that actually helps the user instead of annoying them. Here's how it works: https://www.dmitryjum.com/blog/posts/how-i-built-a-session-timeout-warning-without-being-annoying

### How I built a timed quiz loop with React and GraphQL
**Status:** ⬜️ To Do
**Draft:**
Building a timed quiz sounds straightforward until you realize that clock drift, network latency, and rapid state updates can easily ruin the experience.

I recently built a timed quiz loop using React and GraphQL. The biggest challenge was ensuring the timer felt perfectly synchronized with the server without overwhelming the API with constant requests.

Here is a deep dive into the architecture of the quiz loop and how I managed the delicate balance between real-time responsiveness and server load: https://www.dmitryjum.com/blog/posts/how-i-built-a-timed-quiz-loop-with-react-and-graphql

### Fixing a fast autosave race in Generations
**Status:** ⬜️ To Do
**Draft:**
Autosave gets tricky when the same form field can be creating a record one moment and updating it the next. In my project Generations, quick edits exposed a race condition that was corrupting data.

The solution wasn't to add more locks, but to rethink the API contract. I collapsed the create and update operations into a single route and made the write path completely idempotent.

If you're dealing with rapid-fire inputs and autosave logic, here is how I handled the race conditions: https://www.dmitryjum.com/blog/posts/how-i-fixed-a-fast-autosave-race-in-generations

### Keeping IVF data safe during bad connections
**Status:** ⬜️ To Do
**Draft:**
Building an autosave feature for critical healthcare data is high stakes. While working on an IVF data entry tool, I had to ensure that form writes survived unstable internet connections, page reloads, and rapid input.

A simple autosave wasn't enough; the system needed to queue offline changes and sync them reliably when the connection returned, all within a Rails monolith.

Here is a look at the architecture I built to keep this critical data safe during bad connections: https://www.dmitryjum.com/blog/posts/how-i-kept-ivf-data-safe-during-bad-connections

### How I made a Rails weather app feel like a SPA
**Status:** ⬜️ To Do
**Draft:**
You don't always need React to build a snappy, responsive interface. I wanted my Rails weather app, Forecastly, to feel incredibly smooth without the overhead of a full Single Page Application.

By leveraging Turbo Frames, strategic lazy loading, and a few small Stimulus controllers, I was able to achieve a SPA-like feel while keeping the simplicity of a server-rendered Rails app.

If you're building with Hotwire, here's how I approached the architecture: https://www.dmitryjum.com/blog/posts/how-i-made-a-rails-weather-app-feel-like-a-spa

### How I stopped spectators from seeing future questions
**Status:** ⬜️ To Do
**Draft:**
When building a live trivia game, hiding future questions from spectators isn't just a courtesy—it's a core security requirement.

I couldn't just hide the elements via CSS or React state; the data had to be strictly enforced at the API boundary. I implemented a solution that dynamically scoped the GraphQL payload based on whether the user was an active player or a spectator.

Here's how I ensured that spectators only saw what they were supposed to see: https://www.dmitryjum.com/blog/posts/how-i-stopped-spectators-from-seeing-future-questions

### How I used jsonb for a scraper-backed Rails API
**Status:** ⬜️ To Do
**Draft:**
Scraped data is notoriously unstructured and constantly changing. When building a Rails API backed by a scraper, maintaining a rigid database schema quickly becomes a nightmare.

I turned to PostgreSQL's `jsonb` column to store uneven school details. It allowed me to ingest dynamic scraped data without constant migrations, while still keeping the API responses predictable for the frontend.

If you're dealing with messy data in Rails, here's why `jsonb` might be your best friend: https://www.dmitryjum.com/blog/posts/how-i-used-jsonb-for-a-scraper-backed-rails-api

### Treating every background job attempt as a first-class record
**Status:** ⬜️ To Do
**Draft:**
When a background job fails, digging through logs to find out why is painful. I wanted a better way to monitor job execution in a Rails app without relying entirely on external services.

I introduced an `IntakeAttempt` pattern—treating every job execution as a first-class database record. This gave us instant visibility into job status, payloads, and errors directly within our internal tools.

Here's how tracking background jobs as database records improved our observability: https://www.dmitryjum.com/blog/posts/intake-attempt-tracking

### Keeping search context alive on a Rails profile page
**Status:** ⬜️ To Do
**Draft:**
There's nothing more annoying than clicking a search result, viewing a profile, and then losing your entire search context when you try to go back.

While working at Skillit, I needed to ensure that recruiters could seamlessly navigate between search results and candidate profiles without losing their filters. Passing a saved-search context through the profile page allowed Rails to keep the workflow entirely intact.

Here is a look at how I solved this UX challenge within a server-rendered Rails application: https://www.dmitryjum.com/blog/posts/keeping-search-context-alive-on-a-rails-profile-page

### Keeping search state coherent with Redux thunks
**Status:** ⬜️ To Do
**Draft:**
Rendering search results is easy. Keeping the search terms, active filters, pagination, and list updates perfectly in sync? That’s where things get complicated.

In a recent React app, I used Redux thunks to orchestrate the complex state transitions required for a robust search interface. It kept the different pieces of the UI from drifting out of sync and made the logic much easier to reason about.

If you're wrestling with complex frontend state, here is how I kept it coherent with Redux: https://www.dmitryjum.com/blog/posts/keeping-search-state-coherent-with-redux-thunks

### Wrapping the Mindbody API in Rails: what the docs don't tell you
**Status:** ⬜️ To Do
**Draft:**
Integrating with legacy or complex APIs is rarely as straightforward as the documentation suggests. Building a Ruby client for the Mindbody API was a perfect example of this.

Between duplicate clients, phantom records, CamelCase inconsistencies, and bizarre testing requirements (like using a fake credit card for a $0 purchase), it was quite the adventure.

I documented the quirks and the solutions I found while wrapping the Mindbody API in Rails. Read about it here: https://www.dmitryjum.com/blog/posts/mindbody-api-rails-integration

### How I stopped random timeouts from breaking a background job
**Status:** ⬜️ To Do
**Draft:**
Intermittent API timeouts are the silent killers of background jobs. While working on a gym membership migration process, random timeouts kept breaking the entire flow.

Instead of just increasing the timeout threshold, I built a three-layer resilience strategy to handle the failures gracefully, ensuring the integration remained reliable even when the external API wasn't.

If you're dealing with flaky third-party integrations in your background jobs, here is how I tackled the problem: https://www.dmitryjum.com/blog/posts/mindbody-timeouts-resilience

### Building mobile features on top of a Rails monolith
**Status:** ⬜️ To Do
**Draft:**
Building mobile features for a mature Rails monolith is more than just exposing JSON endpoints.

While supporting the Atlas Obscura app, I focused on designing stable API contracts and shared moderation tools for features like 'passport stamps' and user-generated tips. By keeping the core product logic in the monolith, we ensured consistency between web and mobile without fragmenting our architecture.

Key takeaways on mobile-monolith discipline: https://www.dmitryjum.com/blog/posts/mobile-features-on-a-rails-monolith

### Modeling a betting market with Solidity state transitions
**Status:** ⬜️ To Do
**Draft:**
Writing smart contracts isn't just about math; it's about strictly controlling how state changes over time.

While building a betting market in Solidity, I realized that the most important part wasn't the payout formula—it was modeling the live game as a robust state machine. Explicit transitions and guardrails were the only way to ensure the contract behaved predictably.

Here is a look at how I modeled complex state transitions in Solidity: https://www.dmitryjum.com/blog/posts/modeling-a-betting-market-with-solidity-state-transitions

### Opening up an Avo admin without opening up everything
**Status:** ⬜️ To Do
**Draft:**
Internal tools often have a permissions problem: you either give someone too little access to do their job, or too much access, creating a security risk.

At Skillit, I needed to let staff use our Avo admin panel for operational work without granting everyone superuser privileges. By integrating Pundit policies, I created a granular permission matrix that was easy to reason about and highly secure.

Here is how I secured our Rails admin panel: https://www.dmitryjum.com/blog/posts/opening-up-an-avo-admin-without-opening-up-everything

### How I built passport stamps on Atlas Obscura
**Status:** ⬜️ To Do
**Draft:**
What started as a small profile feature on Atlas Obscura turned into a fascinating full-stack engineering challenge.

Building the "passport stamps" feature required querying the right geographical data, rendering a highly reusable frontend component, and exposing that same data cleanly to the mobile app team.

I wrote a breakdown of the full-stack architecture behind this feature. Read it here: https://www.dmitryjum.com/blog/posts/passport-stamps-atlas-obscura

### Rate limiting without Redis: Rack::Attack with Solid Cache
**Status:** ⬜️ To Do
**Draft:**
Almost every tutorial on rate limiting in Rails with `Rack::Attack` assumes you are running Redis. But what if you don't want the operational overhead of Redis?

I recently wired up `Rack::Attack` using Solid Cache instead. It works beautifully, but there was one specific boot-order gotcha that completely tripped me up.

If you're looking for a Redis-free rate limiting setup in Rails, here is how I built it: https://www.dmitryjum.com/blog/posts/rack-attack-solid-cache

### How I made a Rails API safer for a future iOS app
**Status:** ⬜️ To Do
**Draft:**
When you know an iOS app is going to consume your API, you have to build it differently.

For Atlas Obscura, the API needed to be much more than a standard set of Rails controllers. We needed highly predictable error formats, rock-solid account linking rules, and a test suite that the mobile team could completely trust.

Here is a look at the patterns I used to make our Rails API safer and more robust for mobile consumption: https://www.dmitryjum.com/blog/posts/rails-api-for-a-future-ios-app

### What it takes to glue Rails, Stripe, and Peak15 together without losing bookings
**Status:** ⬜️ To Do
**Draft:**
A seamless checkout flow often hides a chaotic backend. A recent booking system I worked on required orchestrating data across Rails, Stripe, and a notoriously slow external CRM (Peak15).

To prevent silent failures and lost bookings, I had to build a queue-driven workflow that carefully managed state across all three systems and failed visibly when something went wrong.

Here is a deep dive into the architecture of that complex integration: https://www.dmitryjum.com/blog/posts/rails-stripe-peak15-booking-flow

### Restoring auth state in a React app with Redux
**Status:** ⬜️ To Do
**Draft:**
A stored JWT in `localStorage` is not the same thing as an active, verified session.

When restoring authentication state in a React app, you have to verify that token against the server and dynamically rebuild the UI based on the response. I recently implemented this flow using Redux to ensure the auth state remained perfectly consistent across the app.

Here is a look at the patterns I used to handle auth restoration in React: https://www.dmitryjum.com/blog/posts/restoring-auth-state-in-a-react-app-with-redux

### How I tried to teach a scraper what not to load
**Status:** ⬜️ To Do
**Draft:**
Web scraping is a constant battle for performance. I noticed my project, Pixel Probe, got significantly faster when I started aggressively aborting unnecessary network requests (like images and ads).

But manually maintaining a blocklist is tedious. I experimented with ways to make the blocklist learn dynamically and adapt to new domains on its own.

Here's a look at my attempts to build a smarter, faster web scraper: https://www.dmitryjum.com/blog/posts/teaching-a-scraper-what-not-to-load

### The school quiz that doubled as an onboarding funnel
**Status:** ⬜️ To Do
**Draft:**
At AlumniFire, we built a school quiz that doubled as our core onboarding engine.

It wasn't just trivia—the Rails backend handled complex scoring logic that fed into custom subdomain redirects, signup attribution, and automated sharing flows. We turned a simple interaction into a high-value growth tool by aligning the technical architecture with our onboarding funnel.

Breakdown of the onboarding logic and Rails implementation: https://www.dmitryjum.com/blog/posts/the-school-quiz-that-doubled-as-an-onboarding-funnel

### The tiny temperature toggle I actually liked building
**Status:** ⬜️ To Do
**Draft:**
Sometimes the smallest features are the most satisfying to build.

The Fahrenheit/Celsius toggle in my weather app, Forecastly, is incredibly simple, but it draws a very useful architectural line: keep presentation state entirely in the browser, and keep data ownership strictly on the server.

Here's why I enjoyed building this tiny feature and the technical decisions behind it: https://www.dmitryjum.com/blog/posts/the-tiny-temperature-toggle-i-actually-liked-building

### The weather pipeline behind Forecastly
**Status:** ⬜️ To Do
**Draft:**
Building a weather app is rarely as simple as hitting a single API endpoint.

For Forecastly, the backend has to geocode an address, walk through the complex Weather.gov API, reshape multiple nested responses into a clean format, and cache the result exactly where it matters.

I wrote a deep dive into the data pipeline that powers Forecastly. Read about the architecture here: https://www.dmitryjum.com/blog/posts/the-weather-pipeline-behind-forecastly

### Tracking unread messages in a Rails inbox without per-message read receipts
**Status:** ⬜️ To Do
**Draft:**
Building an inbox feature sounds easy until you have to track unread message counts accurately across multiple users.

At Skillit, I needed unread counts to stay perfectly correct for both workers and employers. Instead of tracking read receipts for every individual message, I implemented a per-conversation read counter. It ended up being simpler, faster, and far more reliable.

Here is a look at the architecture behind our Rails inbox: https://www.dmitryjum.com/blog/posts/tracking-unread-messages-in-a-rails-inbox-without-per-message-read-receipts

### Unmasking obfuscated analytics
**Status:** ⬜️ To Do
**Draft:**
Analytics providers are getting incredibly good at hiding their tracks. I wanted to see exactly what data was being sent, even when the requests were heavily obfuscated.

I built Pixel Probe, a tool designed to catch first-party analytics requests that secretly carry Google Analytics payloads. It was a fascinating deep dive into network interception and data unmasking.

If you're interested in privacy tech and network analysis, check out how I built it: https://www.dmitryjum.com/blog/posts/unmasking-obfuscated-analytics

### Why I split realtime game updates out of the Next.js app
**Status:** ⬜️ To Do
**Draft:**
Next.js and Vercel are incredible for many things, but hosting long-lived WebSocket connections is not one of them.

While building a real-time game, I quickly realized that the main app needed to be decoupled from the real-time update infrastructure. Once I accepted that constraint, splitting the architecture made the entire system much clearer and more resilient.

Here is why I separated the real-time logic and how I structured the new architecture: https://www.dmitryjum.com/blog/posts/why-i-split-realtime-updates-out-of-nextjs

### Writing payout logic in Foundry
**Status:** ⬜️ To Do
**Draft:**
When writing smart contracts, the payout math has to be absolutely flawless.

While working on a betting contract, I found that Foundry was an incredible tool for testing complex payout logic. It made tracking state changes and validating emitted values incredibly straightforward, giving me total confidence in the contract's execution.

If you're writing Solidity, here is why Foundry might be exactly what you need for testing: https://www.dmitryjum.com/blog/posts/writing-payout-logic-in-foundry
