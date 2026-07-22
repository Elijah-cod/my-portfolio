---
title: "Latency is a UX problem"
slug: latency-is-a-ux-problem
description: "A practical method for connecting backend profiling, API design, perceived performance, and interface feedback into one optimization strategy."
excerpt: "A fast endpoint can still create a slow product. The useful unit of performance is the user’s complete wait."
category: Performance
date: 2026-07-07
readTime: 7 minute read
image: /assets/articles/anime-tracker.png
imageAlt: "Anime Tracker dashboard showing progress cards, navigation, and trending titles"
projectUrl: https://anime-tracker-gray.vercel.app
projectLabel: Open the Anime Tracker
---

Performance work is often divided by team boundary. Backend engineers measure endpoint duration. Frontend engineers measure loading and rendering. Designers decide whether to show a spinner or skeleton. Users experience none of those boundaries. They experience one interval between intent and feedback.

## Measure the path, not only the endpoint

Server response time is one part of the path. A click can trigger validation, network negotiation, authentication middleware, application logic, several database queries, serialization, transfer, state updates, and rendering.

Begin with a trace that follows the interaction. Record when the user acts, when the request starts, where time is spent inside the service, when useful data arrives, and when the interface becomes usable again. That timeline turns a vague complaint into testable causes.

> Users do not care whether a delay belongs to the frontend or backend. The product owns the whole wait.

## Profile before scaling infrastructure

When an API feels slow, adding workers or larger machines can hide the cause without removing it. Common problems are often more local: repeated queries, missing indexes, serial calls to independent services, oversized responses, expensive serialization, or work that should happen outside the request lifecycle.

Profile with realistic data. A query that looks harmless with fifty records can dominate the request with fifty thousand. Inspect query plans, count round trips, and measure external dependencies independently. If calls can run concurrently, make that explicit. If work does not affect the immediate response, consider a background job.

## Return the smallest useful answer

A product does not always need a complete resource before it can move forward. A list may need an identifier, title, status, and thumbnail, not every nested relationship. Smaller contracts reduce database work, serialization, transfer, and client processing at the same time.

This does not require a unique endpoint for every component. It requires intentionally modeled read patterns. Pagination, field selection, and summary resources keep the default response useful without making it expensive.

## Design feedback around certainty

Perceived performance is not decoration. It communicates what the system knows. An immediate pressed state confirms that an action was received. An optimistic update works when reversal is cheap and conflicts are rare. A progress state is better when an operation has meaningful stages.

The Anime Tracker uses optimistic progress interactions because episode updates are small, reversible, and frequent. External metadata is different. AniList or image requests can fail independently, so the interface includes fallback content rather than blocking the whole dashboard.

The product also needs a timeout strategy. If a dependency stalls, the user should not watch an infinite spinner. Define when to retry, when to show partial data, and when to explain that an operation can continue later.

## Set budgets across both layers

A useful performance budget describes the experience, then allocates time across the path. A search interaction might target visible feedback within 100 milliseconds and useful results within one second under normal conditions.

That budget creates constraints for network calls, retrieval, ranking, and rendering. It also makes tradeoffs visible. If richer ranking adds 300 milliseconds, a team can compare the cost with the improvement in result quality.

The fastest-feeling product is not always the one with the smallest measured duration. It is the one that responds promptly, explains its state, preserves the user’s work, and behaves consistently. Backend profiling removes avoidable delay. UI/UX makes the remaining work understandable.
