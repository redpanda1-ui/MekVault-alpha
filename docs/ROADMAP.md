# MekVault Master Roadmap

MekVault's product principle: **simple by default, powerful when requested**.

The app should eventually unify the user's physical collection, exact printings, deckbuilding, AI coaching, playtesting, proxies/tokens, printing, and account sync without exposing every advanced control at once.

## Guardrails

- `main` is stable. Do not use it as an experimentation branch.
- `dev` is the active development branch.
- Every behavior change should add or update automated tests when practical.
- Never weaken deterministic Commander validation in favor of AI guesses.
- AI difficulty must change decision quality, never draw quality or hidden-information access.
- Exact printings and physical ownership are distinct from deck display art and proxy art.
- Prefer incremental, testable slices over large rewrites.
- Avoid UI clutter; advanced options belong behind secondary controls.

## Priority 0 — Reliability and developer loop

- Keep CI green: typecheck, unit tests, server build, Android JS bundle.
- Automated Android preview APK builds.
- Expand regression tests as bugs are found.
- Nightly verification and benchmark groundwork.
- Improve error states, network timeouts, and recovery.

## Priority 1 — Core Vault + deck foundation

- Exact printing model: Scryfall printing ID, set, collector number, finish, language, condition.
- Multiple copies of the same card with distinct printings.
- Physical statuses: physical, proxy, borrowed, ordered, missing.
- Collection locations: shelf / binder / page / box / row.
- Strict physical allocation across decks.
- Deck readiness: physical / proxy / missing counts.
- Better deck imports with exact-printing preservation.
- Version history and undo-safe deck edits.
- Universal search across cards, decks, and Vault.

## Priority 2 — AI Coach that makes complete swaps

- Every recommended add should be paired with a recommended cut.
- Explain the role and structural impact of every swap.
- Alternate cut suggestions.
- Budget-aware, bracket-aware, playstyle-aware recommendations.
- Build From My Vault.
- Upgrade With What I Own.
- Deterministically validate every suggested card and resulting deck.
- Track user avoid/must-keep preferences.

## Priority 3 — Product UX + personalization

- Animated MekVault launch experience: “Welcome to your Magic Vault.”
- Settings / Control Center.
- Theme/accent preferences, reduced motion, display preferences.
- Account-ready architecture while preserving local-only mode.
- Clean top-level navigation: Home, Vault, Decks, Arena, Print Studio, Settings/More.
- Keep primary workflows short and hide advanced options until requested.

## Priority 4 — Print Studio

- Official printing selector.
- Independent owned / deck-display / proxy printing.
- Proxy image uploads.
- Token library and custom token uploads.
- Custom image and PDF assets.
- Print Queue.
- Letter/A4 export, exact card sizing, crop marks, bleed, DFC handling.
- Automatic token/emblem detection.
- Reorder and preview before PDF generation.

## Priority 5 — MekVault Arena / MekLab

- Quick Play, Learn, Test, and Lab modes.
- Commander 1v1 / 3-player / 4-player pods.
- Choose exact opponent, precon, archetype, bracket-filtered random, or fully random.
- Five AI decision-skill levels; identical fair RNG for every level.
- Precon library and Precon Lab.
- D99-style visible library RNG mechanism, shrinking/growing with library size.
- Random / best / worst / average opening-hand modes.
- Challenges: mana screw/flood, board wipe recovery, graveyard hate, stax, combo race, archenemy, custom upkeep dice tables.
- Seeded games and exact replay.
- Post-game analysis and suggested swaps.
- Batch simulation and deck A/B tests using identical seeds.

## Priority 6 — Scanner + cloud

- Exact-printing scanner with confidence scores and alternatives.
- Full-art / foil / glare correction.
- Bulk scanning.
- Login and cloud sync across Android, iOS, and web/desktop.
- Conflict-safe sync and backups.
- Privacy controls and local-only mode.

## Priority 7 — Benchmark / competitive moat

- MekVault Gauntlet with large deck-import and rules corpora.
- AI legality, hallucination, budget, must-keep, and avoid-card benchmarks.
- Arena RNG fairness tests.
- Performance benchmarks.
- Competitor complaint backlog from ManaBox, Moxfield, Archidekt, MTG Print, app stores, and community feedback.
- Convert repeated real-world complaints into regression tests or product requirements.

## Current development order

1. Keep CI/build pipeline green.
2. Finish exact-printing/ownership data model.
3. Improve deck import + readiness.
4. Upgrade AI Coach to paired swaps.
5. Add settings/launch UX.
6. Build Print Studio foundation.
7. Build Arena foundation.
8. Add scanner/cloud only after local data is trustworthy.
