---
title: "CitizenMate: Building a Voice-First AI Interview Simulator in Rails"
excerpt: "How I co-founded and built CitizenMate, a voice-first practice platform for the U.S. citizenship interview, and the product and architecture decisions behind it."
date: "2026-11-09T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/citizen_mate_recent_work.webp"
tags: ["CitizenMate", "Rails", "AI", "Hotwire"]
---
<img src="/stellar/images/companies/citizenmate_screenshot.png" alt="CitizenMate interview session" style="width: 75%; min-width: 280px; margin: 1.8rem auto 0.6rem;" />

<p style="text-align: center;"><em>A Study session: the officer reveals the accepted answer and offers notes before moving on.</em></p>

CitizenMate helps people prepare for the U.S. naturalization interview. I co-founded the company and spent most of 2026 building the product, from the idea and UX/UI to architecture and all of the code. It launched in the fall of 2026 and is live in production, with paid plans open to everyone.

**[VISIT CITIZENMATE AT: CITIZENMATE.COM](https://citizenmate.com)**

## The idea

The civics part of the citizenship interview isn't a written test. An officer asks questions out loud, and the applicant answers out loud, in English, often while nervous. Most prep tools are flashcards or quizzes. They help people memorize, but they don't prepare anyone to hear a question and say the answer to a person.

So CitizenMate is built around speaking. You practice with an AI interview officer, and you're graded the way a real officer would grade you.

## What it does

- **Voice-first sessions.** The officer asks each question aloud, and you answer by voice, with typing as a fallback.
- **Three modes.** *Study* teaches as you go. *Practice* is supportive, with hints and retries. *Strict Exam* behaves like the real interview.
- **Personal answers.** Questions about your own senators or representative are answered for your address and kept current from official sources.
- **Feedback.** Each answer gets a short explanation, and each session ends with coaching on what to review next.
- **Study library and progress tracking**, plus a one-question demo before sign-up.
- **An interface in English, Spanish, and Russian.** The interview itself stays in English, as it does at USCIS.

## How it's built

It's a Ruby on Rails monolith with Hotwire and PostgreSQL, deployed with Kamal. Speech-to-text, text-to-speech, and LLM providers plug into it, and Stripe handles payments. One codebase and one database keep a small team fast, and Turbo makes the server-rendered pages feel responsive.

A few decisions shaped most of the product.

### Grading is deterministic, and AI handles only the close calls

Sending every answer to an LLM would be slower and more expensive, and it wouldn't be consistent: the same answer could pass one day and fail the next. A test-prep product can't work like that.

So grading is rule-based by default. Each question is modeled as a set of accepted ideas, not a single "correct" string, and answers are normalized the way people actually speak ("eighteen twelve" counts as 1812). Clear answers are decided instantly. Only true near-misses, like "religious freedom" for "freedom of religion", go to an AI reviewer, and if that call fails, the rule-based grade stands.

### The AI officer suggests, and the app decides

The officer should feel human. It can ask you to try again, give a hint, or respond when you say "sorry, I'm nervous." It must never give away an answer during an exam or change a grade.

So the model only *proposes* what to say and what to do next, from a small set of allowed actions. The app checks that proposal against the current mode and its rules before anything happens. Small talk and retries never touch the score. A question is graded only when the app decides it's finished.

### Nothing gets stuck

Voice products depend on many services, and any of them can be slow or down. Every answer has one time budget. A failed call gets a retry, then a backup provider, then a safe pre-written officer reply, so the interview always keeps going. Every call is also tracked for speed, reliability, and cost. That data is what made fair per-question pricing possible.

### Audio that feels natural

Browsers and devices handle microphones very differently. The app records only when it expects you to speak, shows what it heard before grading it, and falls back to typing if the microphone fails. Common officer lines are pre-recorded, so playback is instant, and only truly dynamic replies are generated on the fly.

### Billing you can trust

Practice runs on credits from monthly plans or top-ups. Every credit movement is a permanent ledger entry. Credit is reserved when a session starts, so two sessions can't spend the same balance, and payment events are processed exactly once.

## My role

As co-founder and engineer, I owned product decisions, UX/UI design, architecture, the full-stack build, billing, internationalization, and deployment. I used AI coding tools throughout to move faster on the parts I already understood. Design, review, and testing stayed with me.

## Building something similar?

If you're working on voice interaction, AI features that need to behave predictably, or usage-based billing, I've spent most of this year on exactly those problems. I'm happy to talk, whether you're hiring for your team or looking for someone to build it with you. [Get in touch](/#footer).
