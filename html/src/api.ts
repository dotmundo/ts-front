// api.ts — the single place the front-end talks to Drupal.
//
// Architecture: this SPA is served as static files from its own host
// (front.ddev.site, no PHP). Drupal runs on a separate host
// (dtest.ddev.site) and answers cross-origin requests — CORS is configured
// on the Drupal side to allow this origin.
//
// HTTP, not HTTPS: this is a local ddev environment without trusted TLS
// certificates, so a browser fetch() to https://dtest.ddev.site fails the
// handshake. Serve the SPA over http://front.ddev.site so the schemes match.
export const DRUPAL_BASE = 'http://dtest.ddev.site';

/**
 * GET `path` from Drupal and return the parsed JSON body, typed as `T`.
 * Throws on a non-2xx response so callers only deal with resolved data.
 *
 * Each region component calls this with its own endpoint and type:
 *
 *   const data = await getJson<HeaderData>('/ts-demo/header');
 */
export async function getJson<T>(path: string): Promise<T> {
    const response = await fetch(`${DRUPAL_BASE}${path}`);
    if (!response.ok) {
        throw new Error(`Request to ${path} failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
}
