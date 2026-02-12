import { openDB } from "idb";
import authFetch from "./authFetch";

const STORE_NAME = "items";
const DB_VERSION = 2;

/**
 * Initialize IndexedDB for specific store
 */
export const initDB = async (storeId) => {
  if (!storeId) {
    console.warn("[IndexedDB] storeId missing for initDB");
    return null;
  }
  const dbName = `SwiftGST_${storeId}`;
  return openDB(dbName, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // If store exists, we might want to clear it or it might be incompatible
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }

      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("n", "n", { unique: false }); // name index
      store.createIndex("b", "b", { unique: false }); // barcode index
      store.createIndex("c", "c", { unique: false }); // category index
    },
  });
};

/**
 * Syncs full inventory from Server to Local IndexedDB
 * @param {string} idToken - Auth Token
 * @param {string} storeId - Store ID
 * @param {boolean} force - Ignore version check and force download
 */
export const syncInventory = async (idToken, storeId, force = false) => {
  try {
    if (!storeId) return 0;
    
    const db = await initDB(storeId);
    if (!db) return 0;

    // 1. VERSION CHECK (Lightweight - 1 Read)
    // We check if the server has a newer version of the catalog than we do.
    const versionKey = `swiftgst_catalog_version_${storeId}`;
    const localVersion = parseInt(localStorage.getItem(versionKey) || '0', 10);
    
    let shouldSync = force;
    let serverVersion = 0;

    if (!force) {
      try {
        const vRes = await authFetch('/api/sync-version', {}, idToken);
        if (vRes.ok) {
           const vData = await vRes.json();
           serverVersion = vData.version;
           
           if (serverVersion > localVersion) {
              console.log(`[SmartSync] 📣 New content available (Server: ${serverVersion} > Local: ${localVersion}). Syncing...`);
              shouldSync = true;
           } else {
              // Even if versions match, check if DB is actually empty (e.g. cleared cache)
              const count = await db.count(STORE_NAME);
              if (count === 0) {
                 console.log(`[SmartSync] ⚠️ Versions match but DB is empty. Forcing Sync.`);
                 shouldSync = true;
              } else {
                 console.log(`[SmartSync] ✅ Local cache up-to-date (Version: ${localVersion}). Skipping download.`);
                 return count;
              }
           }
        } else {
           // If version check fails, maybe safer to sync? Or assume offline if res.status=0?
           // For now, if version check fails but we have data, let's skip sync to be safe/offline-friendly?
           // But if it's 401/500, we might want to retry.
           // Let's assume on error we fall through to "try sync" if we have no data, 
           // but if we have data, we stay with it.
           const currentCount = await db.count(STORE_NAME);
           if (currentCount > 0) return currentCount; 
           shouldSync = true; 
        }
      } catch (err) {
        console.warn("[SmartSync] Version check failed (Offline?):", err);
        // If offline, just return what we have
        const currentCount = await db.count(STORE_NAME);
        return currentCount;
      }
    }

    if (!shouldSync) return await db.count(STORE_NAME);

    // 2. FETCH (Full or Delta)
    const storedLastSync = localStorage.getItem(`swiftgst_last_sync_${storeId}`);
    const since = force ? 0 : parseInt(storedLastSync || '0', 10);
    
    // Safety: If it's been > 7 days, force full sync to catch any drifts
    const MAX_DELTA_AGE = 7 * 24 * 60 * 60 * 1000;
    const isTooOld = (Date.now() - since) > MAX_DELTA_AGE;
    const effectiveSince = isTooOld ? 0 : since;

    let url = `/api/sync-index?since=${effectiveSince}`;
    console.log(`[SmartSync] 🔄 Sync Initiated (Mode: ${effectiveSince > 0 ? "Delta" : "Full"})`);

    const res = await authFetch(url, {}, idToken);
    if (!res.ok) throw new Error("Sync failed");
    const data = await res.json();
    
    // 3. APPLY UPDATES
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // If Full Sync, Clear First
    if (data.mode === 'full') {
        await store.clear();
        console.log(`[SmartSync] 🧹 Full Sync - Cleared DB.`);
    }

    let updatedCount = 0;
    let deletedCount = 0;

    for (const item of data.items) {
      if (item.del === 1) {
          // Soft Delete logic
          await store.delete(item.id);
          deletedCount++;
      } else {
          await store.put(item);
          updatedCount++;
      }
    }

    await tx.done;
    
    // Update Local Version & Timestamp
    if (serverVersion > 0) {
      localStorage.setItem(versionKey, serverVersion.toString());
    } else {
      localStorage.setItem(versionKey, Date.now().toString());
    }
    // Update Sync Time
    localStorage.setItem(`swiftgst_last_sync_${storeId}`, data.timestamp.toString());

    // Get final count
    const finalCount = await db.count(STORE_NAME);

    console.log(
      `[SmartSync] ✅ Sync Complete. Updated: ${updatedCount}, Deleted: ${deletedCount}. Total Local: ${finalCount}.`,
    );
    return finalCount;
  } catch (err) {
    console.error("Inventory Sync Error:", err);
    return 0;
  }
};

/**
 * Searches local IndexedDB for items matching query
 * @param {string} storeId - Store ID
 * @param {string} query - Search term
 * @param {number} limit - Max results
 */
export const searchLocalInventory = async (storeId, query, limit = 20) => {
  if (!query || query.length < 1 || !storeId) return [];

  console.log(`[LocalSearch] 🔍 Searching for "${query}" in ${storeId}`);
  const db = await initDB(storeId);
  if (!db) return [];

  const lowerQ = query.toLowerCase();
  const terms = lowerQ.split(/\s+/).filter((t) => t.length > 0);

  // Get all items (Option A: for <2000 items, scanning array in memory is fastest)
  const allItems = await db.getAll(STORE_NAME);

  // OPTIMIZATION: If local DB is empty/un-synced, return null to trigger API fallback.
  // If DB has items but no match found, return [], preventing unnecessary API cost.
  if (allItems.length === 0) {
    console.log(`[LocalSearch] ⚠️ Database empty. Skipping local search.`);
    return null;
  }

  const results = allItems.filter((item) => {
    const itemText = (item.n + " " + (item.b || "")).toLowerCase();
    return terms.every((term) => itemText.includes(term));
  });

  console.log(`[LocalSearch] ✅ Found ${results.length} matches locally.`);
  return results.slice(0, limit).map(unminifyItem); // Return 20 max
};

/**
 * Get all items for a specific category from Local DB
 * @param {string} storeId
 * @param {string} category
 */
export const getLocalItemsByCategory = async (storeId, category) => {
  console.log(
    `[LocalFetch] 📂 Requesting category: "${category}" for store ${storeId}`,
  );
  const db = await initDB(storeId);
  if (!db) return null;

  const allItems = await db.getAll(STORE_NAME);

  if (!allItems || allItems.length === 0) {
    console.log(`[LocalFetch] ⚠️ Database empty. Returning null.`);
    return null; // Signal to try API if needed or emptiness
  }

  // If category is "All" or null, maybe return all?
  // But typically POS has categories.
  // Assuming strict category match.
  const filtered = allItems.filter((i) => i.c === category);

  if (filtered.length === 0) {
    // Debug helper: Check if it's a casing issue or just empty
    const uniqueCategories = [...new Set(allItems.map((i) => i.c))];
    console.debug(
      `LocalDB: No items for '${category}'. Available:`,
      uniqueCategories,
    );
  }

  console.log(
    `[LocalFetch] ✅ Returning ${filtered.length} items for "${category}"`,
  );
  return filtered.map(unminifyItem);
};

/**
 * Get item by barcode from Local DB
 * @param {string} storeId
 * @param {string} barcode
 */
export const getLocalItemByBarcode = async (storeId, barcode) => {
  if (!barcode || !storeId) return null;
  console.log(`[LocalScan] 📸 Looking up barcode: "${barcode}" in ${storeId}`);
  const db = await initDB(storeId);
  if (!db) return null;

  // Guard: Check if DB has any items using count (fast)
  const count = await db.count(STORE_NAME);
  if (count === 0) {
    console.log(`[LocalScan] ⚠️ Database empty.`);
    return null; // DB is empty -> Signal Fallback
  }

  // Try exact lookup from 'b' index
  const item = await db.getFromIndex(STORE_NAME, "b", barcode);

  if (item) {
    console.log(`[LocalScan] ✅ Found locally: ${item.n}`);
    return unminifyItem(item);
  }

  console.log(`[LocalScan] ❌ Not found in local DB.`);
  return false; // DB checked, Item not found.
};

/**
 * Get distinct categories from Local DB
 * @param {string} storeId
 */
export const getLocalCategories = async (storeId) => {
  if (!storeId) return null;
  const db = await initDB(storeId);
  if (!db) return null;
  const count = await db.count(STORE_NAME);
  if (count === 0) return null;

  // Since categories are not indexed as unique keys, we must scan
  // But we can use the 'c' index to walk distinct keys?
  // IDB doesn't support "SELECT DISTINCT".
  // For <2000 items, getAllKeys('c') or cursor is fast enough.

  // Option 1: GetAll is fast enough in memory for 2000 items (approx 2ms)
  const allItems = await db.getAll(STORE_NAME);
  const categories = new Set();

  allItems.forEach((i) => {
    if (i.c) categories.add(i.c);
  });

  return Array.from(categories)
    .sort()
    .map((name, index) => ({
      id: `local-${index}`,
      name: name,
    }));
};

/**
 * Unminifies the keys back to full property names for the UI to use
 */
const unminifyItem = (i) => ({
  id: i.id,
  name: i.n,
  barcode: i.b,
  price: i.p,
  discountPercent: i.d,
  category: i.c,
  isGSTExempt: i.x === 1,
  unitType: i.u,
  stock: i.s,
});
