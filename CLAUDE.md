# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Wordsly public API gateway (NestJS, port 3000). It is a **pure reverse proxy** — nine source files, no controllers, no credentials, no business logic. `src/proxy/routes.ts` is its entire routing table; adding a service endpoint means adding nothing here unless it introduces a new top-level path segment.

It used to be a hand-wired REST facade (a controller → service → axios call per downstream endpoint) that also ran the Google OAuth handshake, held a copy of the JWT verification key, and decoded refresh tokens on auth-service's behalf. All of that moved into auth-service. Docs or code elsewhere describing `src/http-clients/`, `JwtAuthGuard`, or a messaging module here are stale — none of it exists.

## Commands

```bash
npm run start:dev    # watch mode on PORT (default 3000)
npm run build        # nest build
npm run lint         # eslint --fix
npm run test         # jest (rootDir=src, *.spec.ts)
```

Config: all env access goes through `src/config/configuration.ts` (never `process.env` in features); required vars validated at boot by `src/config/validate-env.ts` — the three service hosts plus `CORS_ENABLED_ORIGINS`, which is required rather than optional because an empty value used to silently disable CORS instead of failing.

## Architecture

### The routing table is the whole thing

`src/proxy/routes.ts` maps a first path segment to a service. Public paths are identical to the paths the services expose, so there is no rewriting: what a browser asks for is what the service receives. Matching used to have to look at the *third* segment, because every user-scoped route began `users/:userLoginId/` and all three services shared that prefix — routes no longer name a user at all, so the first segment is unambiguous again.

Collection roots are listed alongside the `/**` form (`'/courses'` *and* `'/courses/**'`): a glob ending in `/**` does not match the bare collection path.

### What it deliberately does not do

- **No token verification.** Each service verifies the caller's access token itself against auth-service's published key set. The gateway forwards `Authorization` untouched and holds no key material.
- **No credentials of its own.** No JWT key, no Google client secret, no internal service token. It cannot authenticate to its peers because it never needs to — it forwards the caller's own.
- **No body parsing** (`bodyParser: false` in `main.ts`, and the proxy is registered before any parser). The request body streams straight through; parsing it here would consume the stream, break uploads, and hang a POST waiting for a body already read.

### Header hygiene

`STRIPPED_REQUEST_HEADERS` (`routes.ts`) removes `x-service-token`, `x-internal-call`, `x-user-id` and `x-user-login-id` from every inbound request. None of these mean anything downstream any more — identity comes from the token's signature and the user id from its subject — but they are stripped rather than merely ignored so a client cannot revive a retired trust header by sending one.

CORS is answered once at the edge (`main.ts`), which is why the proxy also strips any `Access-Control-*` a service sends back. The `Host` header **is** rewritten to the target's host: platforms that route by Host reject a forwarded request carrying the gateway's own hostname as a routing loop. `xfwd` still passes the browser's address as `X-Forwarded-Host`.

## Conventions

- Path alias `@/*` → `src/*`; kebab-case folders; 4-space indent, single quotes.
- Changes here should be rare. If a task seems to need a controller in this repo, it almost certainly belongs in the service that owns the data.
