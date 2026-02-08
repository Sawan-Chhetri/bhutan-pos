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
  revalidateIfStale: false, // Don't auto-fetch on mount if we have data
  revalidateOnFocus: false, // Don't fetch when clicking back to window
  revalidateOnReconnect: true,
  dedupingInterval: 60000 * 5, // 5 minutes (User can switch categories freely without reads)
  keepPreviousData: true, // UX: Don't flicker data
};
