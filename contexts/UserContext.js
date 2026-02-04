// "use client";
// import { createContext, useState, useEffect } from "react";
// import useAuthStatus from "@/hooks/useAuthStatus";
// import authFetch from "@/lib/authFetch";
// export const UserContext = createContext();

// export function UserProvider({ children }) {
//   const [userDetails, setUserDetails] = useState(null); // this will store full user object from DB
//   const [loading, setLoading] = useState(true);
//   const { user, idToken } = useAuthStatus();

//   useEffect(() => {
//     const fetchUserDetails = async () => {
//       if (!user || !idToken) {
//         setUserDetails(null);
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await authFetch(
//           `/api/user/${user.uid}`,
//           { headers: {} },
//           idToken,
//         );

//         if (!res.ok) {
//           // If user not found, don't keep retrying
//           setUserDetails(null);
//           return;
//         }
//         const data = await res.json();
//         setUserDetails(data);
//       } catch (err) {
//         console.error("UserContext fetch error:", err);
//         setUserDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserDetails();
//   }, [user, idToken]);

//   return (
//     <UserContext.Provider value={{ user: userDetails, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// }

// export default UserProvider;

"use client";
import { createContext, useState, useEffect } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
import { auth } from "@/firebase.config";
import { signOut } from "firebase/auth";
import { toast } from "react-toastify";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Destructure 'checkingStatus' or 'loading' from your auth hook
  // Assuming useAuthStatus returns a loading state for the Firebase side
  const { user, idToken, loading: authLoading } = useAuthStatus();

  useEffect(() => {
    const fetchUserDetails = async () => {
      // 1. Wait for Firebase to finish its initial check
      if (authLoading) return;

      // 2. If Firebase finished and there's no user, stop loading
      if (!user || !idToken) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      // 3. If we have a user, fetch the DB details
      try {
        setLoading(true); // Ensure it's true while fetching
        const res = await authFetch(
          `/api/user/${user.uid}`,
          { headers: {} },
          idToken,
        );

        if (res.ok) {
          const data = await res.json();

          // --- DEVICE LOCKING CHECK (Specific to Restaurant/Lite Users) ---
          if (data?.type === "restaurants") {
            const localSessionId = localStorage.getItem("activeSessionId");
            if (
              data.activeSessionId &&
              localSessionId &&
              data.activeSessionId !== localSessionId
            ) {
              toast.error("ACCOUNT IN USE: Logged out from this device.");
              await signOut(auth);
              setUserDetails(null);
              setLoading(false);
              return;
            }
          }

          setUserDetails(data);
        } else {
          setUserDetails(null);
        }
      } catch (err) {
        console.error("UserContext fetch error:", err);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, idToken, authLoading]);

  return (
    <UserContext.Provider value={{ user: userDetails, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
