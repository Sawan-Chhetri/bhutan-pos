/**
 * Lightweight helper to attach Authorization header only when a valid idToken exists.
 * Behavior:
 *  - If `idToken` is provided, use it.
 *  - Otherwise, if firebase client `auth.currentUser` is available, try to obtain a token
 *    using `getIdToken()` (cached if valid).
 *  - If server responds with 401 / token-expired, retry once with a forced refresh
 *    (getIdToken(true)).
 *
 * This prevents sending `Bearer null` and reduces occurrences of "ID token expired" errors
 * by retrying with a fresh token when needed.
 */
import { auth } from "@/firebase.config";

export default async function authFetch(url, options = {}, idToken) {
  const opts = { ...options };
  opts.headers = { ...(opts.headers || {}) };

  // Helper to set header if token present
  const attachToken = (token) => {
    if (token) opts.headers.Authorization = `Bearer ${token}`;
  };

  // Determine initial token to use
  let tokenToUse = idToken;

  // If no explicit token provided, try to get from firebase client
  if (!tokenToUse && auth?.currentUser) {
    try {
      tokenToUse = await auth.currentUser.getIdToken(); // cached if valid
    } catch (err) {
      console.debug(
        "authFetch: failed to get cached token",
        err?.message ?? err,
      );
    }
  }

  // Attach token if we have one
  if (tokenToUse) {
    attachToken(tokenToUse);
  }

  let res = await fetch(url, opts);

  // If unauthorized and we have a firebase user, try a single retry with forced refresh
  // This handles cases where the passed idToken was stale, OR the cached token was stale
  if (auth?.currentUser && res.status === 401) {
    try {
      // Check if it's a token expiry issue (optional optimization, but good practice)
      // Some APIs might return 401 for other reasons, but refreshing token usually doesn't hurt (except latency)

      const fresh = await auth.currentUser.getIdToken(true); // force refresh

      // Update header with fresh token
      opts.headers = { ...opts.headers }; // clone again to be safe
      opts.headers.Authorization = `Bearer ${fresh}`;

      res = await fetch(url, opts);
    } catch (err) {
      console.debug(
        "authFetch: retry with refresh failed",
        err?.message ?? err,
      );
    }
  }

  return res;
}
