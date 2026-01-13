import { useEffect, useState } from "react";
import { onIdTokenChanged } from "firebase/auth";
import { auth } from "@/firebase.config";

// Hook: useAuthStatus
// - Provides `user`, `idToken`, and `loading` booleans for client components
// - Keeps the token cached and refreshed via Firebase client SDK
export default function useAuthStatus() {
  const [idToken, setIdToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase id token changes (handles sign-in, sign-out, token refresh)
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setIdToken(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      try {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } catch (err) {
        console.debug(
          "useAuthStatus: failed to read idToken",
          err?.message ?? err
        );
        setIdToken(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, idToken, loading };
}
