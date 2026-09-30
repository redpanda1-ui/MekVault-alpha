# MekVault Alpha v0.2

MekVault is a dark, MTG-focused Commander deck and collection companion. The alpha supports the complete local workflow: **search a card → add it to the collection → create or import a deck → validate it → send it to AI Coach → receive structured recommendations**.

## Architecture

```text
.
├── mobile/                       # Expo + React Native + TypeScript
│   └── src/
│       ├── components/           # Shared mobile UI
│       ├── context/              # Persistent vault state
│       ├── screens/              # Five primary app sections
│       ├── services/             # Scryfall client
│       ├── storage/              # AsyncStorage adapter
│       ├── types/                # MTG/deck/collection contracts
│       └── utils/                # Import and Commander validation
└── server/                       # Express + TypeScript + OpenAI
    └── src/
        ├── ai.ts                 # Structured model calls
        ├── schemas.ts            # Input and output schemas
        └── scryfall.ts           # Server-side name verification
```

The mobile app has five bottom sections:

- **Home** — local vault and deck summary.
- **Decks** — deck creation and plain-text imports such as `1 Sol Ring`.
- **Build** — Commander selection, quantity editing, search, deterministic validation, and a constraint-driven AI deck builder.
- **AI Coach** — deck selection, custom coaching constraints, and structured recommendations.
- **Collection** — live Scryfall search with card images, metadata, and available USD prices.

Collection and deck state is saved on-device with AsyncStorage. There is intentionally no authentication, payment handling, scanning, proxy printing, or cloud synchronization in v0.2.

## Commander validation

Legality checks run locally and never rely on AI. The validator uses Scryfall metadata to check:

- Exactly 100 cards, including the commander.
- Singleton quantities, except basic lands and cards whose Oracle text explicitly allows multiple copies.
- Every card's color identity against the commander's color identity.
- Commander-format legality for the commander and deck cards.

AI recommendations remain advisory. The server validates generated builds as exactly one eligible commander plus 99 cards, then checks quantities, singleton rules, color identity, Commander legality, and Scryfall card data. It sets `needsReview` whenever any deterministic check fails. Coach additions receive the same identity and legality checks, while suggested cuts that do not exist in the submitted deck are removed and flagged.

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Expo Go, an Android emulator, or an iOS simulator
- An OpenAI API key, stored only in the server environment

## Setup

```bash
npm install
cp server/.env.example server/.env
cp mobile/.env.example mobile/.env
```

Set `OPENAI_API_KEY` in `server/.env`. Never place it in the Expo environment. Variables beginning with `EXPO_PUBLIC_` are embedded in the client and are not secret.

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to an address the target can reach. `http://localhost:3000` works for the iOS simulator; Android emulators commonly use `http://10.0.2.2:3000`; physical devices generally require the computer's LAN address.

## Run locally

Start the API:

```bash
npm run server
```

Start Expo in a second terminal:

```bash
npm run mobile
```

## APIs

### `POST /api/coach`

Accepts `{ instructions, deck }`. The server sends deck details to OpenAI and returns:

```json
{
  "summary": "...",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "suggestedCuts": [{ "name": "...", "reason": "..." }],
  "suggestedAdds": [{ "name": "...", "reason": "...", "validated": true }],
  "strategy": ["..."],
  "warnings": ["..."],
  "needsReview": false
}
```

### `POST /api/build`

Accepts `commander`, `strategy`, optional `budget`, optional `desiredPower` and/or `bracket`, `mustKeep`, `avoid`, and optional collection card information. It returns one commander and a card array whose quantities must total 99. Generated results are checked against Scryfall and fully validated for Commander before the response is returned. Canonical card names are used to verify that the requested commander is preserved, every must-keep card is present, and no avoided card appears; any violation marks the build as needing review.

### `GET /health`

Returns API status and version without invoking OpenAI.

## Validation

```bash
npm run typecheck
npm test
```

## Security and data boundaries

- Only `.env.example` files belong in source control; real `.env` files are ignored.
- `OPENAI_API_KEY` is read only by the Node server.
- The Expo app calls MekVault's server and Scryfall; it never calls OpenAI directly.
- Requests are schema-validated and size-limited.
- Scryfall is the authority for deterministic card metadata and generated-name verification, not the AI model.
