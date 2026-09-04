/**
 * The gateway's entire routing table.
 *
 * Public paths are identical to the paths the services expose, so there is no
 * rewriting anywhere: what a browser asks for is what the service receives. That
 * is the point of the table — it is a map, not a translation layer, and adding a
 * service endpoint no longer means writing a matching gateway endpoint.
 *
 * Matching is on the first path segment. It used to have to look at the *third*,
 * because every user-scoped route began `users/:userLoginId/` and so all three
 * services shared the `/users/**` prefix. Routes no longer name a user at all —
 * each service reads the id from the caller's token — which leaves the first
 * segment unambiguous again. Order matters only in that the first match wins;
 * the patterns are disjoint.
 *
 * These are plain prefix paths, not globs, and http-proxy-middleware will not
 * let the two be mixed in one list — `['/courses', '/courses/**']` throws
 * ERR_CONTEXT_MATCHER_INVALID_ARRAY at request time, not at boot. A plain path
 * already matches its whole subtree (it is an `indexOf(path) === 0` test), so
 * `'/courses'` covers `/courses` and `/courses/:id/lessons` alike and the `/**`
 * form is not just unnecessary but harmful. The route-table spec pins this.
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
            '/.well-known',
            // The whole browser-facing auth flow, forwarded untouched. The
            // Google callback URL points here, so the handshake keeps working
            // with no change in the Google console.
            '/auth',
            '/profile',
        ],
    },
    {
        service: 'vocabulary',
        paths: ['/courses', '/words', '/dictionary'],
    },
    {
        service: 'learning',
        paths: [
            '/word-progress',
            '/daily-habit',
            '/learning-report',
            '/learning-settings',
            '/preferences',
            '/notifications',
            '/level',
        ],
    },
];

/**
 * Headers stripped from every inbound request.
 *
 * Each of these once told a service who the caller was without any signature to
 * back it up: `x-service-token` marked a request as coming from a peer and
 * skipped every per-user check, and the `x-user-*` pair named the user outright.
 * None of them mean anything downstream any more — identity comes from the
 * access token's signature, and the user id from its subject. They are still
 * stripped rather than merely ignored, so that a retired trust header cannot be
 * revived by a client that simply sends one.
 */
export const STRIPPED_REQUEST_HEADERS = [
    'x-service-token',
    'x-internal-call',
    'x-user-id',
    'x-user-login-id',
];
