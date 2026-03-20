---
title: "Detecting Google Tag Manager (and why network requests aren't enough)"
excerpt: "Building Pixel Probe, I thought detecting Google Tag Manager would be straightforward. Intercept the network requests, find the GTM ones, and call it a day. But here is why that doesn't work reliably."
date: "2026-03-20T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["nextjs", "puppeteer", "web-scraping", "analytics"]
---

Building Pixel Probe, I thought detecting Google Tag Manager would be straightforward. Intercept the network requests, find the GTM ones, and call it a day. 

That's just how it works, right?

Not quite. I built [Pixel Probe](https://github.com/dmitryjum/pixel-probe) to analyze websites, detect GTM implementations, and identify custom domain analytics requests. It runs on Next.js, using a headless Chromium instance to inspect outgoing traffic. 

At first, I relied purely on Puppeteer. The server would spin up, navigate to the URL, and watch the network tab. If `gtm.js` fired, we had a match.

But then the edge cases started rolling in.

Sometimes, the network request never fires. Maybe the site was slow. Maybe the headless browser triggered bot protection. Or maybe a built-in ad blocker stopped the tracking script before it could even try to load. The code was there in the HTML, but my network-based detection was coming up empty.

So I added a fallback. 

Instead of just watching the wire, I started parsing the DOM. If the network request failed to catch it, Pixel Probe uses Cheerio to inspect the raw HTML source. It looks for the actual GTM script tags embedded in the page. 

It's a simple change, but an important one. Analytics aren't always about what successfully loads—sometimes they're about what the site *tried* to load. 

I also had to set up some regular user agents to bypass basic bot protection. Headless browsers are notoriously easy to spot. Passing a standard user string helps the initial page load successfully more often.

Between the active network monitoring and the static HTML analysis, the detection rate improved significantly. 

It takes a bit more work, but combining both approaches gives a resilient detection mechanism. Pretty cool.

What about you? Have you had to build reliable web scrapers lately?

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
