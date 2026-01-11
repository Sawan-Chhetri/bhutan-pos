// import { useEffect, useState } from "react";
// import { getAuth, onIdTokenChanged } from "firebase/auth";

// export default function useAuthStatus() {
//   const [idToken, setIdToken] = useState(null);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     const auth = getAuth();

//     const unsubscribe = onIdTokenChanged(auth, async (user) => {
//       if (!user) {
//         setUser(null);
//         setIdToken(null);
//       } else {
//         setUser(user);
//         const token = await user.getIdToken(); // auto refreshed
//         setIdToken(token);
//       }
//     });

//     return unsubscribe;
//   }, []);

//   return { user, idToken };
// }

import { useEffect, useState } from "react";
import { getAuth, onIdTokenChanged } from "firebase/auth";
import { auth } from "@/firebase.config";

export default function useAuthStatus() {
  const [idToken, setIdToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Get a fresh token
        const token = await firebaseUser.getIdToken(true); // force refresh
        setIdToken(token);

        // Refresh token automatically before it expires (every 50 min)
        const interval = setInterval(async () => {
          const freshToken = await firebaseUser.getIdToken(true);
          setIdToken(freshToken);
        }, 50 * 60 * 1000);

        return () => clearInterval(interval);
      } else {
        setUser(null);
        setIdToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user, idToken };
}
