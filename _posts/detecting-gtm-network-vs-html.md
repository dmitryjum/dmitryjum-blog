---
title: "Detecting Google Tag Manager: network traffic alone was not enough"
excerpt: "Pixel Probe started as a network inspector. It got much more reliable once I separated code that exists on the page from behavior I could actually observe."
date: "2025-10-06T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["pixel-probe", "nextjs", "puppeteer", "web-scraping", "analytics"]
---

When I started Pixel Probe, I thought GTM detection would be the easy part.

Open the site in Puppeteer. Watch the requests. If `googletagmanager.com` or `google-analytics.com` shows up, mark it as tracked. If `/g/collect` shows up on a custom domain, mark it as obfuscated.

That works on clean demo sites.

It doesn't hold up nearly as well on the real web.

## What the network tab doesn't tell you

A missing request doesn't mean the tracking code isn't there.

Sometimes the page is slow. Sometimes the headless browser gets treated differently. Sometimes consent logic blocks the request. Sometimes the code is present in the HTML but never fires during the browser session you captured.

That problem shows up pretty clearly in the repo history. The early route was almost entirely request-driven. Then a later pass added a fallback that fetches the page HTML separately and inspects script contents with Cheerio.

```ts
const html = await fetch(sanitizedUrl).then((res) => res.text());
const $ = cheerio.load(html);

const gtmDetectedInHtml = $("script").filter((_, el) => {
  const scriptContent = $(el).html() || "";
  return ["dataLayer", "analytics", "gtag"].some((keyword) =>
    scriptContent.includes(keyword)
  );
}).length > 0;
```

The result is simple:

```ts
const hasGTM = gtmRequests.length > 0 || gtmDetectedInHtml;
```

That line fixed more than a bug. It fixed the model.

## Present versus observed

This is the distinction that matters:

- tracking code can be *present* in the source
- tracking behavior can be *observed* at runtime

Those are not the same thing.

If you collapse them into a single yes-or-no answer, your detector ends up lying to you. It reports "nothing found" when the honest answer is "the code is there, but I didn't observe it execute."

Once I separated those states, the output got better immediately.

## Why the fallback happens outside Puppeteer

I like that the HTML pass doesn't depend on the browser session succeeding.

The browser is the fragile part of the pipeline. It's heavier. It's easier to fingerprint. It's the piece most likely to fail in a serverless environment. A plain `fetch()` and a Cheerio parse are cheap by comparison.

So the fallback isn't just a second detection technique. It's also the more stable one.

That's why this pattern works well outside analytics too. If you're building any kind of auditing tool, don't force everything through the most expensive runtime step.

## It also changed the user-facing message

After that change, the route stopped pretending every failure mode meant the same thing.

If runtime requests are captured, the tool says so. If only the HTML signal is present, it says that too. If neither is found, it tells the user the site may be preventing detection.

That's a better product decision than forcing certainty where there isn't any.

## The broader lesson

I built this for a marketer-facing use case, but the lesson is more general.

If you're scraping, auditing, or detecting anything on the web, don't treat the network tab as ground truth. Treat it as one source of truth.

The source code matters too.

And when the two disagree, that's usually where the interesting bugs are.
