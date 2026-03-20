---
title: "Hosting Chromium on Vercel"
excerpt: "Serverless functions are great until you need to run a browser in them. The deployment limits will stop you before you even start. Here's a custom lightweight binary approach."
date: "2026-03-20T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["vercel", "nextjs", "puppeteer", "serverless"]
---

Serverless functions are great until you need to run a browser in them.

[Pixel Probe](https://github.com/dmitryjum/pixel-probe) needs to load websites and intercept their network requests. To do that, it uses Puppeteer. But you can't just install standard Puppeteer on Vercel. It's too big. The deployment limits will stop you before you even start.

I needed a lightweight option. 

Instead of regular Puppeteer, I used `puppeteer-core`. It doesn't download Chromium by default. That leaves it up to you to provide the binary. 

For a while, the standard approach was using `chrome-aws-lambda` or similar packages, but maintaining those across different Node versions gets tricky.

I ended up hosting the binary myself. 

I grabbed a minimal Chromium build specifically for Amazon Linux 2 (which is what Vercel runs under the hood). I compressed it using Brotli to keep the size down—you'll see files like `chromium.br` and `swiftshader.tar.br` in the initial attempts. Eventually, I put the complete tarball in an S3 bucket and pointed a `CHROMIUM_URL` environment variable to it.

When the Next.js API route spins up, it checks if it's in production. If it is, it pulls that binary, unpacks it, and launches the browser. 

Locally, `puppeteer` just works with its bundled browser. In production, we run the custom lightweight build. 

It handles the deployment limits while still giving Pixel Probe the full browser capabilities it needs to analyze network traffic. It's a bit of a dance to get it configured right. 

But once you do? It's good fun seeing a headless browser spin up on a serverless function.

---

The full source for this project is on GitHub: [github.com/dmitryjum/pixel-probe](https://github.com/dmitryjum/pixel-probe)
