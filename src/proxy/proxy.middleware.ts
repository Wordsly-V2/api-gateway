import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Application, Request } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
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
        const target = configService.get<string>(HOST_CONFIG_KEY[route.service]);
        if (!target) {
            throw new Error(
                `No host configured for the ${route.service} service`,
            );
        }

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
                on: {
                    proxyReq: (proxyReq) => {
                        for (const header of STRIPPED_REQUEST_HEADERS) {
                            proxyReq.removeHeader(header);
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
                            if (header.toLowerCase().startsWith('access-control-')) {
                                delete proxyRes.headers[header];
                            }
                        }
                    },
                    error: (error, req) => {
                        logger.error(
                            `${(req as Request).method} ${(req as Request).url} -> ${route.service}: ${JSON.stringify(error)}`,
                        );
                    },
                },
            }),
        );

        logger.log(
            `${route.service} -> ${target} (${route.paths.length} path patterns)`,
        );
    }
}
