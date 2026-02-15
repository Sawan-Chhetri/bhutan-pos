# AI Coding Assistant Instructions

## 1. Project Overview

- **Type**: Next.js 16 (App Router) application.
- **Core Stack**: React 19, Tailwind CSS 4, DaisyUI 5, Firebase (Auth, Firestore, Storage).
- **Purpose**: Point of Sale (POS) system for Bhutanese businesses (Sales, Inventory, GST Reporting).
- **Key Feature**: Offline-capable POS with IndexedDB caching (`idb`).

## 2. Architectural Patterns

### Frontend Architecture

- **State Management**:
  - **Global User**: `UserContext` (`contexts/UserContext.js`) wraps the app.
  - **Server Data**: `SWR` is the standard for fetching. Use `stablePosOptions` from `lib/swrConfig.js` for POS stability (aggressive deduping, revalidate on focus).
  - **Authorization**: `useAuthGuard` hooks protect pages (e.g., `app/pos/page.js`).
- **Offline Inventory**:
  - **Pattern**: `lib/inventorySync.js` syncs Firestore items to local IndexedDB (`idb`).
  - **Logic**: `initDB` creates `SwiftGST_[storeId]`. Sync checks `swiftgst_catalog_version_[storeId]`.
  - **Usage**: POS reads from IndexedDB for speed/offline support; writes go to API.
- **Component Pattern**:
  - Container/Presenter separation (e.g., `app/pos/page.js` -> `components/pos/PosLayout.jsx`).
  - **Styling**: Tailwind 4 + DaisyUI.
    - Global colors in `globals.css`: `--brand-pink`, `--brand-blue`, `--brand-cream`.
    - Use `@theme inline` for custom theme variables.

### Backend Architecture (API Routes)

- **Location**: `app/api/**/route.js`.
- **Database Access**: **Admin SDK Only**. Initialize via `lib/firebaseAdmin.js`.
  - ❌ NEVER use client `firebase/firestore` in API routes.
  - ✅ ALWAYS use `admin.firestore()`.
  - **Env Vars**: `FIREBASE_PRIVATE_KEY` handles newline replacement in `lib/firebaseAdmin.js`.
- **Authentication**:
  - Manual verification of Bearer tokens.
  - Pattern:
    ```javascript
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    ```

## 3. Critical Conventions

### Authentication & API Security

- **Client-Side**:
  - ❌ NEVER use native `fetch`.
  - ✅ ALWAYS use `authFetch` (`lib/authFetch.js`).
  - **Why**: Handles token rotation, retries on 401s, and header injection.
  - **Fetcher**: `lib/fetcher.js` wraps `authFetch` for SWR.
- **Server-Side**:
  - API routes must validate the ID token before processing sensitive actions.

### Hardware Integration

- **Barcode Scanning**:
  - Hook: `useBarcodeScanner.js`.
  - **Logic**: Intercepts global keyboard events.
  - **Refinement**: 
    - Ignores inputs into `<input>`/`<textarea>`.
    - Detects scanner vs typing via timing (<100ms inter-key delay).

### Domain Logic Rules

- **GST Rate**: Hardcoded `0.05` (5%) in API calculations (e.g., `app/api/sales/route.js`).
- **High Value Transactions**: Sales > 50,000 NU require Customer CID/Passport.
- **Inventory Model**: Items have `costPrice` (buying) and `sellingPrice`.

## 4. Developer Workflows

- **Environment**: 
  - Server-side: `ServiceAccountKey.json` or env vars for Firebase Admin.
  - Client-side: standard Firebase config.
- **PDF Generation**: `@react-pdf/renderer` or `jspdf` for invoices.
- **Debugging**:
  - Check `Application > IndexedDB` in dev tools to verify inventory sync (`SwiftGST_[storeId]`).
  - Use `console.debug` in hooks for non-critical flow tracing.

## 5. Directory Highlights

- `lib/inventorySync.js`: Core offline sync logic using `idb`.
- `lib/authFetch.js`: The mandatory fetch wrapper.
- `hooks/useBarcodeScanner.js`: Hardware integration logic.
- `app/api/sales/route.js`: Canonical example of transaction processing & GST logic.
- `lib/swrConfig.js`: SWR configuration for stable POS data.
