---
title: "How I tried to teach a scraper what not to load"
excerpt: "Pixel Probe got faster once I started aborting the right requests. Then I tried to make that blocklist learn on its own."
date: "2025-10-09T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["pixel-probe", "puppeteer", "nextjs", "prisma", "openai"]
---

Scrapers are funny.

You spend a bunch of time trying to load a page, then you realize the real trick is not loading most of it.

That happened to me with [Pixel Probe](https://github.com/dmitryjum/pixel-probe). The app uses Puppeteer to inspect outgoing requests and figure out whether a site is running Google Tag Manager directly or hiding analytics behind a custom domain. For that to work, the browser has to get far enough into the page lifecycle to actually emit the requests I care about.

Images, fonts, media players, ad scripts, and random WordPress junk don't help with that. They just burn time.

So the first optimization was the obvious one: start aborting requests I don't need.

## The first pass was blunt, and that was fine

Before I got fancy, I just hardcoded the things that kept getting in the way.

Some of that was resource type based:

```ts
const blockedResourcTypes = [
  "image",
  "stylesheet",
  "font",
  "media",
  "other"
];
```

Some of it was domain and path based:

```ts
if (
  blockedResourcTypes.includes(resourceType) ||
  blockedDomains.some((domain) => requestUrl.includes(domain)) ||
  blockedPaths.some((path) => requestUrl.includes(path))
) {
  req.abort();
  return;
}
```

That lived right inside the request interception flow. No clever architecture. Just a list of things I knew weren't helping the page reach the analytics requests I actually cared about.

And it worked.

This is one of those cases where a blunt tool is still a good tool. If the goal is to catch GTM or GA requests before a timeout window closes, blocking `image`, `font`, and `media` requests is not subtle, but it is effective.

## Then I had the more interesting idea

The hardcoded list was useful, but it had an obvious ceiling. Every new site came with new junk. I could keep growing the blocklist by hand, or I could try to teach the app what not to load.

That's where the `block-useless-urls-learning` branch came from.

The first change was to log every outgoing request and replace the hardcoded domain/path lists with values loaded from the database:

```ts
const loggedRequests: string[] = [];
const blockedValues = await BlockedResources.getBlockedValues();

if (
  blockedResourcTypes.includes(resourceType) ||
  blockedValues.some((value) => requestUrl.includes(value))
) {
  req.abort();
  return;
}
```

The backing store was tiny:

```prisma
model BlockedResource {
  id        Int      @id @default(autoincrement())
  value     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

That was the whole trick. Keep a list of previously learned values, use it on the next run, and make the scraper a little more opinionated over time.

Pretty cool.

## The OpenAI pass was the experimental part

After a run completed, I sent the recorded requests to OpenAI and asked it to suggest domains or paths that could be blocked safely on future runs:

```ts
const OpenAIResponseSchema = z.object({
  values: z.array(z.string()),
});
```

The prompt was plain on purpose:

```ts
const prompt = `Analyze the following list of outgoing requests and suggest
 domains or paths that can be safely blocked
 without breaking the page functionality in order to make sure that the page fully loads Google Analytics or Google Tag Manager
 scripts and makes those requests. As an example: we're trying to track the requests to following domains: ${gtmDomains.join(", ")}
 and we want to make sure the page will load and make requests to those domains.
 Return the result as an array of strings according to the submitted schema.\nRequests:\n${loggedRequests.join("\n")}`;
```

Then the request itself looked like this:

```ts
const { object } = await generateObject({
  model: openai.responses("gpt-4o"),
  prompt,
  schema: OpenAIResponseSchema,
});

await BlockedResources.addBlockedValues(object.values);
```

The idea was simple.

If the page made fifty requests and only two of them mattered to my detector, maybe the model could spot the repeat offenders and hand me back a shortlist of junk I could skip next time. Over enough runs, the scraper would stop wasting time on things that were never useful in the first place.

That's the part I liked most. It turns performance tuning into a feedback loop instead of a pile of one-off exceptions.

## Why I didn't ship it

My client didn't need it badly enough.

The current version was already fast enough for the actual workload, and the learned version introduced a new cost layer because every run now had an LLM call hanging off the end of it. That's an easy trade to justify in a research project. It's a worse trade when the existing product is already doing the job.

There was also a trust problem.

Hardcoded blocking is dumb, but predictable. A learned blocklist is more interesting, but it needs guardrails. If a model decides some request pattern looks useless and it's wrong, then I don't just lose performance. I risk losing the exact signal the product exists to find.

So I left the idea on the branch.

I still think the direction is good. I just think it needed a tighter reason to exist.

## What I took from it

The part that shipped taught me something simple: most scraping speed problems are really prioritization problems. You don't need the whole page. You need the tiny slice of the page that produces the signal you're after.

The part that didn't ship taught me something else: not every clever optimization deserves to become product behavior.

Sometimes the hand-tuned blocklist is enough.

And sometimes that's the better engineering decision.

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
