# AI Coding Assistant Instructions

## 1. Project Overview

- **Type**: Next.js 16 (App Router) application.
- **Core Stack**: React 19, Tailwind CSS 4, DaisyUI, Firebase (Auth, Firestore, Storage).
- **Purpose**: Point of Sale (POS) system for Bhutanese businesses, handling inventory, sales, invoicing, and GST reporting.

## 2. Architectural Patterns

### Frontend Architecture

- **State Management**:
  - Global user state via `UserContext` (`contexts/UserContext.js`).
  - Server state/caching via `SWR` (`swr`).
  - Local state for complex forms (e.g., POS cart).
- **Component Pattern**:
  - Prefer "Container/Presenter" pattern. Logic/Fetching in `page.js` or custom hooks; UI in `components/**`.
  - Example: `app/pos/page.js` manages logic, passing props to `components/pos/PosScreen.jsx`.
- **Styling**:
  - Tailwind CSS 4 with DaisyUI.
  - Use `h-screen`, `flex-col` for layout structures.
  - "Brand Pink" is a primary accent color.

### Backend Architecture (API Routes)

- **Location**: `app/api/**/route.js`.
- **Database Access**: Uses `firebase-admin` initialized in `lib/firebaseAdmin.js`. NEVER use the client SDK (`firebase/firestore`) in API routes; always use `admin.firestore()`.
- **Authentication**:
  - Manual verification of Bearer tokens.
  - Pattern:
    ```javascript
    const authHeader = request.headers.get("authorization");
    const idToken = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    ```

## 3. Critical Conventions

### Authentication & API Security

- **Client-Side**:
  - ALWAYS use `authFetch` from `lib/authFetch.js` instead of native `fetch`.
  - usage: `await authFetch('/api/endpoint', options, idToken)`.
  - This handles token refreshing and attaching the Authorization header automatically.
- **Server-Side**:
  - API routes must validate the ID token before processing sensitive actions.

### Data Fetching

- Use **SWR** for reading data on the client.
- Configuration is in `lib/swrConfig.js`.
- Standard fetcher: `import { fetcher } from "@/lib/fetcher"`.

### Business Logic Rules

- **GST Rate**: Hardcoded as `0.05` (5%) in API routes (e.g., `app/api/sales/route.js`). Ensure this consistency when calculating totals.
- **High Value Transactions**: Sales > 50,000 require a Customer CID/Passport Number.
- **Inventory**: Items have `costPrice` (buying) and `sellingPrice`. Margins and GST logic rely on these fields.

## 4. Key Developer Workflows

- **Environment**: Requires `ServiceAccountKey.json` for Firebase Admin (server-side) and standard Firebase config for client.
- **PDF Generation**: Uses `@react-pdf/renderer` or `jspdf` for generating invoices/receipts.
- **Barcode Scanning**: Handled via `useBarcodeScanner.js` hook, listening for global keyboard events (typical for USB scanners).

## 5. Directory Structure

- `app/api/`: Backend endpoints (Purchase, Sales, Inventory, User management).
- `components/pos/`: Core POS interface components.
- `lib/`: Shared utilities (`authFetch`, `firebaseAdmin`, `scanCache`).
- `hooks/`: Custom hooks for Auth (`useAuthGuard`, `useAuthStatus`) and Hardware (`useBarcodeScanner`).
