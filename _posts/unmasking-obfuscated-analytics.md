---
title: "Unmasking obfuscated analytics"
excerpt: "How tracking platforms bypass ad-blockers by routing through first-party subdomains, and how Pixel Probe identifies these hidden streams."
date: "2026-03-20T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["analytics", "puppeteer", "nextjs", "web-scraping"]
---

Ad-blockers are better than ever at stopping third-party tracking scripts. If a browser sees a request to `google-analytics.com` or `facebook.com/tr`, it blocks it instantly. 

But tracking platforms adapted. They started hiding.

When building [Pixel Probe](https://github.com/dmitryjum/pixel-probe), I wanted to detect not just the obvious Google Tag Manager setups, but the obfuscated ones too. These are the custom domain analytics setups—where tracking requests are routed through a first-party subdomain (like `metrics.yourdomain.com`) to bypass standard blocklists.

Detecting these requests is trickier than matching a simple list of known tracking domains.

To find them, Pixel Probe uses Puppeteer to intercept all outbound network requests as the page loads. Instead of just looking at the domain, it parses the request URLs and query parameters. 

Most tracking payloads have a signature. Even if the domain is custom, the structure of the data often gives it away. It might be a specific query parameter combination, or a known base64-encoded payload format indicating a tracking event. By inspecting the shape of the request rather than just its destination, we can surface these hidden streams.

It's a cat-and-mouse game. Trackers try to blend in with normal application traffic, and tools like Pixel Probe look for the behavioral patterns that give them away.

But seeing those hidden requests pop up in the analysis dashboard? That's the best part. 

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
