import { Logger } from '@nestjs/common';
import type { Application, NextFunction, Request, Response } from 'express';
import rateLimit, { type Options } from 'express-rate-limit';

const logger = new Logger('EdgeProtection');

/**
 * Per-IP limits and a request-size cap, applied at the edge.
 *
 * These are Express middleware rather than Nest's ThrottlerGuard because the
 * proxy is Express middleware too: `registerProxyRoutes` mounts it on the raw
 * adapter, so a proxied request is answered before Nest's router — and any
 * global Nest guard — ever sees it. A ThrottlerGuard here would protect only
 * the gateway's own /health and /ping.
 *
 * Must therefore be registered BEFORE the proxy routes.
 */

/** Generous: normal browsing plus an offline learner flushing a backlog. */
const GLOBAL_WINDOW_MS = 60_000;
const GLOBAL_MAX = 300;

/**
 * Deliberately tighter. `/auth/refresh-token` is unauthenticated by design (an
 * expired access token is the normal reason to be there) and the Google callback
 * is reachable by anyone, so these are the endpoints worth guessing against.
 */
const AUTH_WINDOW_MS = 60_000;
const AUTH_MAX = 20;

/**
 * Cap on a proxied request body.
 *
 * The gateway streams bodies through without parsing, so nothing else bounds
 * them. `POST /word-progress/record-answer/bulk-sync` is the largest legitimate
 * payload and is itself capped at 500 answers server-side, which is far below
 * this.
 */
const MAX_BODY_BYTES = 2 * 1024 * 1024;

const sharedOptions: Partial<Options> = {
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Keying on the resolved client IP. This is why `trust proxy` must be set:
    // behind a load balancer every request otherwise shares one address and the
    // whole user base is throttled as if it were a single caller.
    handler: (req: Request, res: Response) => {
        logger.warn(`Rate limited ${req.ip} ${req.method} ${req.url}`);
        res.status(429).json({
            statusCode: 429,
            error: 'Too Many Requests',
            message: 'Too many requests. Please slow down and try again.',
        });
    },
};

/**
 * Reject an oversized body before it is streamed to a service.
 *
 * Checks the declared length first, then counts actual bytes: Content-Length is
 * absent on a chunked request and is in any case only a claim.
 *
 * The `req.pause()` below is load-bearing. Attaching a 'data' listener puts the
 * request in flowing mode, and http-proxy-middleware's handler is async — it
 * awaits its per-request options before http-proxy reaches `req.pipe(proxyReq)`
 * — so the resume scheduled by that listener runs first and the body is emitted
 * to the byte counter, which discards it, before the pipe exists. The proxied
 * request then carries the original Content-Length with no body: upstream waits
 * for bytes that never arrive until `proxyTimeout` aborts the socket, and the
 * caller gets a 502 (ECONNRESET). Every request with a body 502s; GETs and
 * /health are unaffected, which is what made it look like a network fault.
 * Pausing hands the proxy a stream that has not started flowing; `pipe()`
 * resumes it, and the chunks then reach the counter and the socket alike.
 */
function bodySizeLimit(req: Request, res: Response, next: NextFunction): void {
    const declared = Number(req.headers['content-length']);
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
        res.status(413).json({
            statusCode: 413,
            error: 'Payload Too Large',
            message: 'That request is too large.',
        });
        return;
    }

    let received = 0;
    req.on('data', (chunk: Buffer) => {
        received += chunk.length;
        if (received > MAX_BODY_BYTES) {
            logger.warn(`Body cap exceeded ${req.method} ${req.url}`);
            req.destroy();
        }
    });
    req.pause();

    next();
}

export function registerEdgeProtection(app: Application): void {
    app.use(bodySizeLimit);

    app.use(
        '/auth',
        rateLimit({
            ...sharedOptions,
            windowMs: AUTH_WINDOW_MS,
            limit: AUTH_MAX,
        }),
    );

    app.use(
        rateLimit({
            ...sharedOptions,
            windowMs: GLOBAL_WINDOW_MS,
            limit: GLOBAL_MAX,
        }),
    );

    logger.log(
        `rate limits: ${GLOBAL_MAX}/min global, ${AUTH_MAX}/min on /auth; body cap ${MAX_BODY_BYTES} bytes`,
    );
}
