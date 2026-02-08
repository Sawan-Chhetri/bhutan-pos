export const localStorageProvider = () => {
  if (typeof window === "undefined") return new Map();

  // 1. Initialize from localStorage
  const map = new Map(JSON.parse(localStorage.getItem("pos-cache") || "[]"));

  // 2. Intercept map.set to write to localStorage immediately
  const originalSet = map.set.bind(map);
  map.set = (key, value) => {
    originalSet(key, value);
    // Debounce or just save (localStorage is sync but fast enough for small datasets)
    // For safety, let's catch quotas
    try {
      localStorage.setItem(
        "pos-cache",
        JSON.stringify(Array.from(map.entries())),
      );
    } catch (e) {
      console.warn("LocalStorage full, clearing cache");
      localStorage.removeItem("pos-cache");
    }
    return map;
  };

  // 3. Clear cache if version changes (optional, but good practice)
  return map;
};

// Configuration to reduce reads aggressively but stay safe
export const stablePosOptions = {
  revalidateIfStale: true, // MUST be true so our smart fetcher can check timestamps
  revalidateOnFocus: true, // We want to check for updates when window is focused (cheap 1-read)
  revalidateOnReconnect: true,
  dedupingInterval: 2000, // Small interval (2s) so navigating away and back triggers the timestamp check
  keepPreviousData: true, // UX: Don't flicker data
};
