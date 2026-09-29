# MekVault Alpha

MekVault Alpha is organized as a small monorepo containing an Expo React Native client and a Node.js/OpenAI API server.

## Project structure

```text
.
├── mobile/   # Expo React Native app
└── server/   # Express API and OpenAI integration
```

## Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- An OpenAI API key for AI-backed server requests
- Expo Go, an Android emulator, or an iOS simulator for running the mobile app

## Setup

1. Install all workspace dependencies from the repository root:

   ```bash
   npm install
   ```

2. Create local environment files from the committed templates:

   ```bash
   cp server/.env.example server/.env
   cp mobile/.env.example mobile/.env
   ```

3. Add your OpenAI API key to `server/.env`. Never put a secret in an `EXPO_PUBLIC_*` variable: those values are embedded in the client application.

4. Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to an address your simulator or device can reach. `http://localhost:3000` works for the iOS simulator; a physical device usually needs your computer's LAN address.

## Development

Run the API server:

```bash
npm run server
```

In a second terminal, start Expo:

```bash
npm run mobile
```

The server exposes:

- `GET /health` — service health check
- `POST /api/chat` — sends a non-empty `message` to OpenAI and returns the generated reply

Example request:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Help me organize my vault."}'
```

## Validation

```bash
npm run typecheck
```

## Security

Only placeholder `.env.example` files are committed. Local `.env` files, signing credentials, dependencies, and build artifacts are ignored by Git. Keep `OPENAI_API_KEY` on the server; the mobile app talks to the server and never directly to OpenAI.
