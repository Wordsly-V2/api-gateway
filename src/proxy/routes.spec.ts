import { matchPathFilter } from 'http-proxy-middleware/dist/path-filter';
import type { Request } from 'express';
import { PROXY_ROUTES, STRIPPED_REQUEST_HEADERS } from './routes';

/**
 * The real matcher. Its third argument is only read for function filters, which
 * this table does not use, so there is nothing meaningful to pass.
 */
const matches = (paths: string[], path: string): boolean =>
    matchPathFilter(paths, path, undefined as unknown as Request);

/**
 * The routing table is the whole gateway, and nothing else checks it: a path the
 * frontend asks for but the table does not cover is a 404 that only shows up in
 * a browser. These cases run the *real* matcher, so they also pin the two ways
 * this table can be wrong in a way that boots fine and fails per request.
 */
describe('PROXY_ROUTES', () => {
    const serviceFor = (path: string): string | undefined =>
        PROXY_ROUTES.find((route) => matches(route.paths, path))?.service;

    describe('every path the frontend builds reaches the right service', () => {
        // Mirrors frontend/lib/api-paths.ts. Kept as literals rather than
        // imported: the point is to notice when the two drift apart.
        it.each([
            ['/profile', 'auth'],
            ['/auth/logout', 'auth'],
            ['/auth/refresh-token', 'auth'],
            ['/auth/google', 'auth'],
            ['/auth/google/redirect', 'auth'],
            ['/.well-known/jwks.json', 'auth'],
            ['/.well-known/openid-configuration', 'auth'],

            ['/courses', 'vocabulary'],
            ['/courses/total-stats', 'vocabulary'],
            ['/courses/course-1', 'vocabulary'],
            ['/courses/course-1/words', 'vocabulary'],
            ['/courses/course-1/words/bulk-delete', 'vocabulary'],
            ['/courses/course-1/words/bulk-move', 'vocabulary'],
            ['/courses/course-1/lessons', 'vocabulary'],
            ['/courses/course-1/lessons/reorder', 'vocabulary'],
            ['/courses/course-1/lessons/lesson-1', 'vocabulary'],
            ['/courses/course-1/lessons/lesson-1/words', 'vocabulary'],
            ['/courses/course-1/lessons/lesson-1/words/bulk', 'vocabulary'],
            [
                '/courses/course-1/lessons/lesson-1/words/word-1/move',
                'vocabulary',
            ],
            ['/words/hydrate-by-ids', 'vocabulary'],
            ['/dictionary/pronunciation/hello', 'vocabulary'],
            ['/dictionary/search/hello', 'vocabulary'],
            ['/dictionary/words/search/hello', 'vocabulary'],

            ['/word-progress/record-answer/bulk-sync', 'learning'],
            ['/word-progress/due-word-ids', 'learning'],
            ['/word-progress/stats', 'learning'],
            ['/word-progress/stats/by-course-ids', 'learning'],
            ['/word-progress/stats/by-lesson-ids', 'learning'],
            ['/word-progress/by-word-ids', 'learning'],
            ['/word-progress/leeches', 'learning'],
            ['/word-progress/words/word-1', 'learning'],
            ['/word-progress/words/word-1/reset', 'learning'],
            ['/word-progress/words/word-1/unsuspend', 'learning'],
            ['/daily-habit', 'learning'],
            ['/daily-habit/record-practice', 'learning'],
            ['/daily-habit/record-practice/batch', 'learning'],
            ['/daily-habit/goal', 'learning'],
            ['/learning-report', 'learning'],
            ['/learning-report/forecast', 'learning'],
            ['/learning-report/activity-calendar', 'learning'],
            ['/learning-settings', 'learning'],
            ['/preferences', 'learning'],
            ['/level', 'learning'],
            ['/notifications/subscriptions', 'learning'],
            ['/notifications/preferences', 'learning'],
            ['/notifications/vapid-public-key', 'learning'],
        ])('%s → %s', (path, service) => {
            expect(serviceFor(path)).toBe(service);
        });
    });

    it('routes a collection root and its subtree to the same service', () => {
        // A plain path is a prefix test, so the bare collection and everything
        // under it are covered by one entry. The `/**` form some tables use
        // does NOT match the bare path, which is why it is not used here.
        expect(serviceFor('/courses')).toBe('vocabulary');
        expect(serviceFor('/courses/c1/lessons/l1/words')).toBe('vocabulary');
    });

    it('never mixes plain paths and globs in one list', () => {
        // http-proxy-middleware refuses a list containing both, and it throws
        // per request rather than at boot — so a mixed list looks completely
        // healthy until someone hits the route.
        for (const route of PROXY_ROUTES) {
            expect(() => matches(route.paths, '/anything')).not.toThrow();
        }
    });

    it('keeps the services disjoint, so first-match-wins cannot bite', () => {
        const seen = new Map<string, string>();
        for (const route of PROXY_ROUTES) {
            for (const path of route.paths) {
                const other = PROXY_ROUTES.find(
                    (r) =>
                        r.service !== route.service && matches(r.paths, path),
                );
                expect(other).toBeUndefined();
                expect(seen.has(path)).toBe(false);
                seen.set(path, route.service);
            }
        }
    });

    it('does not route anything under the retired /users prefix', () => {
        // Nothing names a user in a URL any more. If one of these starts
        // matching again, a route has reintroduced a client-supplied user id.
        expect(serviceFor('/users/some-other-user/courses')).toBeUndefined();
        expect(serviceFor('/users/me/profile')).toBeUndefined();
        expect(serviceFor('/users')).toBeUndefined();
    });

    it('strips every header that used to assert identity without a signature', () => {
        expect(STRIPPED_REQUEST_HEADERS).toEqual(
            expect.arrayContaining([
                'x-service-token',
                'x-internal-call',
                'x-user-id',
                'x-user-login-id',
            ]),
        );
    });
});
