// LRU Cache (or simple Map) for globally scanned items
// We store items here if they were successfully fetched via search but are not in the current category
export const scanCache = new Map();

export const addToScanCache = (key, item) => {
  if (!key || !item) return;
  // Limit size to prevent memory leaks (e.g. 50 items)
  if (scanCache.size > 50) {
    const firstKey = scanCache.keys().next().value;
    scanCache.delete(firstKey);
  }
  scanCache.set(key, item);
};

export const getFromScanCache = (key) => {
  return scanCache.get(key);
};

export const clearScanCache = () => {
  scanCache.clear();
};
