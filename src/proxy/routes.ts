/**
 * The gateway's entire routing table.
 *
 * Public paths are identical to the paths the services expose, so there is no
 * rewriting anywhere: what a browser asks for is what the service receives. That
 * is the point of the table — it is a map, not a translation layer, and adding a
 * service endpoint no longer means writing a matching gateway endpoint.
 *
 * `/users/**` is shared by all three services, so matching is on the *third*
 * segment rather than the first. Order matters only in that the first match
 * wins; the patterns are disjoint.
 */

export type ServiceKey = 'auth' | 'vocabulary' | 'learning';

export interface ProxyRoute {
    service: ServiceKey;
    /** Glob patterns, matched by http-proxy-middleware's pathFilter. */
    paths: string[];
}

export const PROXY_ROUTES: ProxyRoute[] = [
    {
        service: 'auth',
        paths: [
            // Discovery and the published key set: how every other service
            // learns which keys to trust.
            '/.well-known/**',
            // The whole browser-facing auth flow, forwarded untouched. The
            // Google callback URL points here, so the handshake keeps working
            // with no change in the Google console.
            '/auth/**',
            '/users/*/profile',
        ],
    },
    {
        service: 'vocabulary',
        paths: [
            // Collection roots are listed alongside the `/**` form: a glob
            // ending in `/**` does not match the bare collection path, and
            // `GET /users/:id/courses` is exactly that.
            '/users/*/courses',
            '/users/*/courses/**',
            '/users/*/words',
            '/users/*/words/**',
            '/dictionary/**',
        ],
    },
    {
        service: 'learning',
        paths: [
            '/users/*/word-progress',
            '/users/*/word-progress/**',
            '/users/*/daily-habit',
            '/users/*/daily-habit/**',
            '/users/*/learning-report',
            '/users/*/learning-report/**',
            '/users/*/learning-settings',
            '/users/*/preferences',
            '/users/*/notifications',
            '/users/*/notifications/**',
            '/users/*/level',
        ],
    },
];

/**
 * Headers stripped from every inbound request.
 *
 * This is the single most important line in the gateway. Downstream services
 * treat a valid `x-service-token` as proof that the caller is a peer service and
 * skip every per-user ownership check. A proxy that forwarded a client-supplied
 * one — or attached its own, as the old hand-wired clients did — would turn that
 * into a bypass of every guard in the system for anyone who could guess or leak
 * the value. The gateway holds no such token any more, and refuses to relay one.
 */
export const STRIPPED_REQUEST_HEADERS = [
    'x-service-token',
    'x-internal-call',
    'x-user-id',
    'x-user-login-id',
];
