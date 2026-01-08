import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase.config";

export const useAuthStatus = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    // Mark as mounted
    isMounted.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted.current) return;
      if (user) {
        setLoggedIn(true);
        setUser(user);
        const token = await user.getIdToken();
        setIdToken(token);
      } else {
        setLoggedIn(false);
        setUser(null);
        setIdToken(null);
      }
      setCheckingStatus(false);
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  return { loggedIn, checkingStatus, user, idToken };
};

export default useAuthStatus;
