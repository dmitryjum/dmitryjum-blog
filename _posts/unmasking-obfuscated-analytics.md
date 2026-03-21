---
title: "Unmasking obfuscated analytics"
excerpt: "How I built Pixel Probe to catch first-party analytics requests that still carry Google Analytics payloads."
date: "2025-10-08T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["pixel-probe", "analytics", "puppeteer", "nextjs", "web-scraping"]
---

A client of mine sells server-side Google Tag Manager setups to marketers.

The pitch is clean: send analytics traffic through a custom subdomain, point it at a GTM server container, and now the request looks first-party instead of obviously going to Google. For a marketer, that's a product. For someone inspecting a site, it's a disguise.

That's why I built Pixel Probe.

The product question was narrow on purpose: can I tell when a site is still sending Google Analytics data, even when the hostname no longer says `google-analytics.com`?

Here's the thing: once the endpoint moves behind `metrics.example.com`, simple domain matching stops being useful. You need to look at the request itself.

## What still gives it away

In Pixel Probe, the main heuristic is simple. Known Google domains count as direct hits. Everything else gets checked for GA-style request shapes, especially `/g/collect`.

```ts
const isGtmRequest = gtmDomains.some((domain) => requestUrl.includes(domain));

if (isGtmRequest) gtmRequests.push(requestUrl);
if (!isGtmRequest && requestUrl.includes('/g/collect')) {
  obfuscatedRequests.push(requestUrl);
}
```

That logic lives in the interception flow in `src/app/api/check-tracking/route.ts`. The important part isn't the exact string check. It's the mindset.

I'm not trying to maintain a giant blacklist of suspicious hosts. I'm checking whether the request still looks like Google Analytics after someone routed it through a first-party domain.

That's a better fit for this kind of tool.

## Why a browser matters here

The first version of Pixel Probe only inspected HTML. That can tell you whether a page contains GTM code, but it can't tell you where the data actually goes after the page runs.

So the route opens a browser, intercepts requests, and records the outgoing URLs while the page loads:

```ts
await page.setRequestInterception(true);

page.on("request", (req) => {
  const requestUrl = req.url();
  const resourceType = req.resourceType();
  loggedRequests.push(requestUrl);

  if (blockedResourcTypes.includes(resourceType)) {
    req.abort();
    return;
  }

  req.continue();
});
```

That's the core of the app. The browser isn't there for theater. It's there because the wire is the evidence.

## Why the scope stays narrow

Pixel Probe doesn't try to detect every tracking platform on earth. It doesn't need to. It exists for a specific family of setups: GTM or GA implementations that are made less obvious by pushing collection behind a custom domain.

That focus helps.

A vague "tracker detector" is easy to talk about and hard to trust. A detector that says, "this request still looks like GA4, even though it doesn't go to a Google hostname anymore" is much more concrete.

That's what made the project useful to the client. His customers weren't asking for a privacy scanner. They wanted a way to check whether another business was using the same kind of setup.

## The part I like most

I like projects where the business story and the implementation story are different views of the same thing.

The marketer says "first-party tracking."
The engineer says "proxy the analytics endpoint."
The browser says "here are the actual requests."

Pixel Probe just lines those up.

Load the page. Watch the requests. Flag the ones that still look like Google Analytics after someone tried to make them blend in.

Pretty cool.

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
