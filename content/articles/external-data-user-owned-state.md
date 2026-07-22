---
title: "Synchronizing external data with user-owned state"
slug: external-data-user-owned-state
description: "How Anime Tracker separates AniList metadata, personal progress, optimistic updates, imports, and failure states across a full-stack architecture."
excerpt: "The architecture behind keeping public media metadata and private tracking progress in sync without confusing ownership."
category: Full-stack systems
date: 2026-07-20
readTime: 8 minute read
image: /assets/articles/anime-tracker.png
imageAlt: "Anime Tracker account dashboard with currently watching progress and trending titles"
projectUrl: https://anime-tracker-gray.vercel.app
projectLabel: Explore Anime Tracker
---

A tracking application looks simple until two kinds of truth meet. Public metadata comes from external services: titles, artwork, episode counts, and release schedules. Personal state belongs to the user: watching status, progress, score, comments, and queue order.

Anime Tracker became an exercise in keeping those truths separate while presenting them as one coherent product.

## Model ownership before endpoints

External anime metadata should not be copied blindly into every user record. It changes on a different schedule and may be unavailable temporarily. User progress needs stronger persistence because it represents deliberate input.

The backend therefore treats an anime entry as a user-owned record keyed to an external anime identifier. It stores the fields needed for a stable personal library while service wrappers handle fresh AniList or Jikan data.

Representative ownership looks like this:

```text
AniList / Jikan        Application database
----------------       --------------------
title                  user_id
cover image            anime_id
episode metadata       status
release schedule       episodes_watched
                       score
                       comments
```

This boundary keeps upstream failures from erasing personal state. It also makes permission checks straightforward: every mutation is scoped through the active user.

## Optimistic updates need a reversal plan

Incrementing episode progress is frequent and low risk. Waiting for a complete network round trip after every click would make the dashboard feel heavy, so the interface can update immediately and reconcile with the API in the background.

Optimism is not simply changing the number early. The client needs the previous value, a pending state, and a failure path. Repeated clicks must not race into impossible progress. The API still validates totals and ownership because client state is never the final authority.

The right question is not “Can this be optimistic?” It is “Can this action be reversed clearly if confirmation fails?”

## External APIs need adapters

AniList exposes GraphQL, while Jikan supports MyAnimeList import data through a different API shape. Letting frontend components understand both services would spread dependency details across the product.

Service adapters normalize those responses behind the FastAPI layer. Pydantic schemas define what the frontend can rely on. The interface receives a stable application contract even when upstream field names, pagination, or errors differ.

Adapters also create a place for caching, timeouts, retries, and provider-specific logging. If one service becomes unavailable, the system can preserve local library views and explain which fresh data could not load.

## Imports are synchronization workflows

Importing a MyAnimeList username is not a one-shot insert. Existing entries may need updates, new entries need creation, and duplicates should not multiply. The process needs a stable external identifier and an explicit conflict policy.

A useful import response reports what happened: created, updated, skipped, or failed. That turns a background data operation into understandable product feedback.

The same principle applies to release calendars. Source timestamps should be normalized on the server, then displayed in the user’s browser timezone. Storage and transport need one consistent time representation even though the final interface is local.

## Resilience belongs in the interface

The frontend includes fallback metadata and safe image behavior so one failed poster request does not collapse the page. Major routes have focused responsibilities: dashboard, library, calendar, profile, and account entry.

That structure matters when data availability varies. The library can remain useful with persisted user records while discovery temporarily loses fresh upstream results. A product with external dependencies should degrade by capability, not disappear as one blank screen.

Anime Tracker reinforced a broader full-stack principle: model who owns each piece of data, isolate external contracts, make synchronization observable, and design every optimistic interaction with a recovery path.
