"use client";
import { useContext, useEffect } from "react";
import { UserContext } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

/** Allowed user types for different routes
 * @param {string[]} allowedRoles - e.g., ["pos"], ["other"], or ["pos", "other"]
 */

export default function useAuthGuard(allowedRoles = []) {
  const { user, loading } = useContext(UserContext);
  const router = useRouter();

  // Determine if the user has one of the required roles
  const isAuthorized = user && allowedRoles.includes(user.type);

  useEffect(() => {
    if (loading) return;
    // Only act when loading is finished
    if (!loading) {
      if (!user) {
        router.replace("/");
        return;
      }

      // Check License
      if (user.isActive === false) {
        router.replace("/expired");
        return;
      }

      // Check Role
      if (!isAuthorized) {
        router.replace("/");
      }
    }
  }, [user, loading, router, isAuthorized]);

  // Return the status so the page knows whether to render content
  return { isAuthorized, isLoading: loading };
}
