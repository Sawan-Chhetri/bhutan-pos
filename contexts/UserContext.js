"use client";
import { createContext, useState, useEffect } from "react";
import useAuthStatus from "@/hooks/useAuthStatus";
import authFetch from "@/lib/authFetch";
export const UserContext = createContext();

export function UserProvider({ children }) {
  const [userDetails, setUserDetails] = useState(null); // this will store full user object from DB
  const [loading, setLoading] = useState(true);
  const { user, idToken } = useAuthStatus();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user || !idToken) {
        setUserDetails(null);
        setLoading(false);
        return;
      }

      try {
        const res = await authFetch(`/api/user/${user.uid}`, { headers: {} }, idToken);

        if (!res.ok) {
          // If user not found, don't keep retrying
          setUserDetails(null);
          return;
        }
        const data = await res.json();
        setUserDetails(data);
      } catch (err) {
        console.error("UserContext fetch error:", err);
        setUserDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, idToken]);

  return (
    <UserContext.Provider value={{ user: userDetails, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
