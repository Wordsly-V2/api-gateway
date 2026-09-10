import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Application, Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { STATUS_CODES, type ServerResponse } from 'node:http';
import { REQUEST_ID_HEADER, getRequestId } from '@/common/request-context';
import {
    PROXY_ROUTES,
    STRIPPED_REQUEST_HEADERS,
    type ServiceKey,
} from '@/proxy/routes';

const logger = new Logger('Proxy');

const HOST_CONFIG_KEY: Record<ServiceKey, string> = {
    auth: 'authService.host',
    vocabulary: 'vocabularyService.host',
    learning: 'learningService.host',
};

const TIMEOUT_CONFIG_KEY: Record<ServiceKey, string> = {
    auth: 'authService.httpTimeout',
    vocabulary: 'vocabularyService.httpTimeout',
    learning: 'learningService.httpTimeout',
};

/**
 * Map a proxy failure to a status.
 *
 * Deliberately not the library's own getStatusCode, which returns 504 for
 * ECONNREFUSED and ENOTFOUND alike: a refused connection is not a timeout. 504
 * is reserved for a service that accepted the connection and then failed to
 * answer in time, so an alert on 504 means something specific.
 */
function statusForError(code: string | undefined): number {
    switch (code) {
        case 'ETIMEDOUT':
        case 'ESOCKETTIMEDOUT':
        case 'ECONNABORTED':
            return 504;
        default:
            // ECONNREFUSED, ENOTFOUND, ECONNRESET, and anything unrecognised:
            // the gateway could not get a valid response from upstream.
            return 502;
    }
}

/** A ServerResponse, as opposed to the raw Socket an upgrade error carries. */
function isResponse(value: unknown): value is ServerResponse {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ServerResponse).writeHead === 'function'
    );
}

/**
 * Wire the route table onto the Express app.
 *
 * Must be registered before any body parser. The proxy streams the request
 * through untouched; once Nest's parser has consumed and re-serialised the
 * body, uploads and streaming break and a POST can hang waiting for a body that
 * has already been read.
 */
export function registerProxyRoutes(
    app: Application,
    configService: ConfigService,
): void {
    for (const route of PROXY_ROUTES) {
        const target = configService.get<string>(
            HOST_CONFIG_KEY[route.service],
        );
        if (!target) {
            throw new Error(
                `No host configured for the ${route.service} service`,
            );
        }

        const httpTimeout = configService.get<number>(
            TIMEOUT_CONFIG_KEY[route.service],
        );

        app.use(
            createProxyMiddleware({
                target,
                pathFilter: route.paths,
                // Paths are identical on both sides, so there is nothing to
                // rewrite. The Host header IS rewritten to the target's host:
                // platforms that route by Host (Render, and any other
                // reverse-proxied host) send a forwarded request carrying the
                // gateway's own hostname straight back to the gateway, which
                // their edge rejects as a routing loop (508, `x-render-routing:
                // loop`). Nothing downstream reads Host, and `xfwd` below still
                // passes the browser's address as X-Forwarded-Host.
                changeOrigin: true,
                // Adds X-Forwarded-For, which is how auth-service recovers the
                // real client IP for its refresh-token network-change logging.
                xfwd: true,
                // Bounds a downstream service that accepts the connection and
                // then never answers; without it a hung service holds a gateway
                // connection open indefinitely. Deliberately NOT paired with
                // `timeout`, which caps the *inbound* client socket instead: a
                // learner flushing a batch of offline answers over a slow mobile
                // link is the normal case here, and cutting them off is the
                // failure this app can least afford.
                proxyTimeout: httpTimeout,
                on: {
                    proxyReq: (proxyReq) => {
                        for (const header of STRIPPED_REQUEST_HEADERS) {
                            proxyReq.removeHeader(header);
                        }
                        // Deliberately NOT in STRIPPED_REQUEST_HEADERS: this one
                        // is meant to travel. The middleware has already
                        // replaced anything a client made up, so what is
                        // forwarded is an id this gateway vouches for.
                        const requestId = getRequestId();
                        if (requestId) {
                            proxyReq.setHeader(REQUEST_ID_HEADER, requestId);
                        }
                        // `Authorization` is deliberately left alone: the
                        // services verify the user's token themselves now.
                    },
                    proxyRes: (proxyRes) => {
                        // CORS is answered once, at the edge. Letting a
                        // downstream copy through as well produces duplicate
                        // Access-Control-Allow-Origin headers, which browsers
                        // reject outright.
                        for (const header of Object.keys(proxyRes.headers)) {
                            if (
                                header
                                    .toLowerCase()
                                    .startsWith('access-control-')
                            ) {
                                delete proxyRes.headers[header];
                            }
                        }
                    },
                    // Defining this handler makes http-proxy-middleware skip its
                    // own errorResponsePlugin (see get-plugins.ts), so this must
                    // answer the request itself. Logging alone left the socket
                    // hanging until the client gave up: a downed service looked
                    // like a network fault rather than a 502.
                    error: (error, req, res) => {
                        const request = req as Request;
                        const code = (error as NodeJS.ErrnoException).code;

                        logger.error(
                            `[${getRequestId() ?? '-'}] ${request.method} ${request.url} -> ${route.service}: ${code ?? error.message}`,
                        );

                        if (!isResponse(res)) {
                            // A websocket upgrade failed; there is no response
                            // to write, only a socket to drop.
                            res?.destroy();
                            return;
                        }

                        if (res.headersSent) {
                            // The downstream already started answering, so the
                            // status is spent. Cut the response rather than
                            // appending an error to a partial body.
                            res.end();
                            return;
                        }

                        const statusCode = statusForError(code);

                        res.writeHead(statusCode, {
                            'Content-Type': 'application/json',
                        });
                        res.end(
                            JSON.stringify({
                                statusCode,
                                error:
                                    STATUS_CODES[statusCode] ?? 'Bad Gateway',
                                message: `The ${route.service} service is unavailable.`,
                            }),
                        );
                    },
                },
            }),
        );

        logger.log(
            `${route.service} -> ${target} (${route.paths.length} path patterns, ${httpTimeout}ms timeout)`,
        );
    }
}
