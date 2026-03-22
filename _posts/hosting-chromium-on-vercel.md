---
title: "Hosting Chromium on Vercel without pretending it's simple"
excerpt: "Pixel Probe needed a real browser in a serverless route. The final setup looks tidy, but the path there went through a few dead ends first."
date: "2025-10-07T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["pixel-probe", "Vercel", "Puppeteer", "Serverless"]
---

Pixel Probe only works if it can behave like a browser.

It has to open a site, wait for the page to run, and inspect the actual requests leaving the browser. Parsing HTML helps, but it doesn't replace runtime traffic. The browser isn't a nice-to-have in this app. It's the whole point.

That was fine locally.

It was not fine on Vercel.

## I started with the obvious setup

My first pass used Puppeteer the normal way. That's the easy path when you're building locally because Chromium comes bundled and everything feels straightforward.

Then I tried to deploy it.

That's when the whole thing stopped being a scraping problem and turned into a packaging problem. Vercel will happily run your code right up until the moment you need a full browser inside a serverless function.

I tried a few directions before settling on the one that stuck. I looked at Playwright. I looked at remote-browser options. I tried different ways of hosting or packaging Chromium. None of that felt clean.

The annoying part was that the product requirement never changed. I still needed a real browser because I needed the network requests, not just the page source.

## The setup that finally worked

What I ended up with was a split setup:

- locally, use `puppeteer`
- in production, use `puppeteer-core`
- provide Chromium explicitly with `@sparticuz/chromium-min`

That split is still in the API route:

```ts
if (process.env.NODE_ENV === "production") {
  browser = await puppeteerCore.launch({
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(chromiumPath),
    args: chromium.args,
    headless: chromium.headless
  });
} else {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
}
```

Once I got there, the architecture felt obvious.

Before that, it didn't.

The reason this split matters is more concrete than "this one felt better." Plain `puppeteer` is convenient locally because it downloads a compatible browser for you. That's exactly what I wanted on my machine, where install size wasn't the problem and I just needed things to run.

On Vercel, that convenience becomes baggage. Vercel's current function limits document says the function size limit is 250 MB uncompressed, and that size includes imported libraries and bundled files. So pulling in a package that wants to bring a browser along with it is a very different decision in production than it is locally.

That's why `puppeteer-core` made sense. It gives me the control code without bundling Chromium. And `@sparticuz/chromium-min` exists for this exact class of problem: its README says the `-min` package does not include the Chromium Brotli files and is useful when your host has file size limits. That let me keep the browser setup explicit instead of letting one dependency quietly drag the whole deployment in the wrong direction.

## The hard part wasn't the code

The final code is short. The hard part was figuring out which responsibilities belonged to which environment.

On my machine, bundled Chromium is a feature.
On Vercel, bundled Chromium is baggage.

That sounds obvious in hindsight, but I had to feel the pain first before the shape of the solution became clear. `puppeteer-core` only made sense once I accepted that production needed to be treated as a different runtime, not as a smaller version of local development.

I also ended up keeping browser artifacts around explicitly instead of pretending the platform would sort that part out for me. That was the real shift. Stop expecting the default install story to carry production, and bring the browser yourself.

## I thought about removing the browser

There was a simpler option: drop the runtime inspection and just analyze HTML.

That would have made deployment easier.

It also would have made Pixel Probe less honest.

The whole point of the app is that it can say, "this page emitted these requests." If I remove the browser, then I can only say, "this page contains code that looks like tracking." That's a different product, and a weaker one.

So I kept the browser and solved the deployment problem instead.

## What I took from it

If you need Chromium on Vercel, don't treat it like a normal dependency and hope the platform figures it out for you.

Treat local and production as different environments with different needs. Use the full browser locally when it's convenient. Use `puppeteer-core` in production when you need control. Bring the executable yourself.

That was the part that took me too long to understand.

But once it clicked, the rest fell into place.

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
