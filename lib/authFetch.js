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

  // Use provided idToken if truthy
  if (idToken) {
    attachToken(idToken);
    return fetch(url, opts);
  }

  // Try to get token from firebase client (if available)
  let clientToken = null;
  try {
    if (auth?.currentUser) {
      clientToken = await auth.currentUser.getIdToken(); // cached if valid
      attachToken(clientToken);
    }
  } catch (err) {
    // ignore and continue without token
    console.debug("authFetch: failed to get cached token", err?.message ?? err);
  }

  let res = await fetch(url, opts);

  // If unauthorized and we have a firebase user, try a single retry with forced refresh
  if (
    auth?.currentUser &&
    res.status === 401 &&
    (!clientToken || clientToken === "")
  ) {
    try {
      const fresh = await auth.currentUser.getIdToken(true); // force refresh
      // attach fresh token and retry
      opts.headers = { ...(opts.headers || {}) };
      attachToken(fresh);
      res = await fetch(url, opts);
    } catch (err) {
      console.debug(
        "authFetch: retry with refresh failed",
        err?.message ?? err
      );
    }
  }

  // If 401 and body indicates token expired, try refresh once (safe retry)
  if (auth?.currentUser && res.status === 401) {
    try {
      const body = await res
        .clone()
        .json()
        .catch(() => null);
      const errCode = body?.error || body?.code || "";
      if (typeof errCode === "string" && errCode.includes("id-token-expired")) {
        const fresh = await auth.currentUser.getIdToken(true);
        opts.headers = { ...(opts.headers || {}) };
        attachToken(fresh);
        res = await fetch(url, opts);
      }
    } catch (e) {
      // ignore
    }
  }

  return res;
}
