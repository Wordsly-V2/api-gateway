# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Wordsly public API gateway (NestJS, port 3000). It is **not** a transparent reverse proxy — it is a hand-wired REST facade: every downstream endpoint has an explicit controller → service → typed axios call. Adding a service endpoint means adding a gateway route that forwards to it.

## Commands

```bash
npm run start:dev    # watch mode on PORT (default 3000)
npm run build        # nest build
npm run lint         # eslint --fix
npm run test         # jest (rootDir=src, *.spec.ts)
npx jest path/to/file.spec.ts   # single test file
```

Config: all env access goes through `src/config/configuration.ts` (never `process.env` in features); required vars validated at boot by `src/config/validate-env.ts`. Swagger at `/api`.

## Architecture

### Downstream HTTP clients

`src/http-clients/http-clients.module.ts` (global) provides three injectable axios instances — `AUTH_SERVICE_HTTP`, `VOCABULARY_SERVICE_HTTP`, `LEARNING_SERVICE_HTTP` — each pre-configured with the service base URL, a default 15s timeout, keep-alive agents, and the `x-service-token` internal auth header. Always inject these; never create ad-hoc axios instances.

### Auth (this gateway owns the browser-facing flow)

- Google OAuth handshake lives here (`src/auth/strategy/google.strategy.ts`, `GET /auth/google` → `/auth/google/redirect`); on callback the gateway calls auth-service `POST /auth/login-oauth` to upsert the user and mint tokens.
- Access tokens are RS256 JWTs verified at the gateway by `JwtAuthGuard` (`src/common/guard/jwt-auth/`) — apply it per controller. The JWT key pair must match auth-service's.
- Refresh tokens arrive via httpOnly cookie (default) or `x-refresh-token` header depending on `REFRESH_TOKEN_DELIVERY` (`cookie` | `body`; body mode exists for cross-origin deployments like Render). `GET /auth/refresh-token` verifies locally then delegates rotation to auth-service.
- Route handlers read the caller's identity from the JWT payload (`userLoginId`) and pass it in the downstream user-scoped path — never trust a client-supplied user id.

### Bootstrap middleware

`src/main.ts` applies CORS (origins from `CORS_ENABLED_ORIGINS`), `cookie-parser`, `compression`, and a global `ValidationPipe` (`transform` + `whitelist`). DTOs with class-validator on every route.

## Conventions

- Path alias `@/*` → `src/*`; feature-based modules; kebab-case folders; controllers thin, logic in services; 4-space indent, single quotes.
- Kafka producing (login events etc.) goes through the messaging module; topic names in `src/messaging/constants.ts`; producer no-ops when `KAFKA_BROKERS` is empty.
