# Enterprise Admin Portal (`apps/admin`)

The `apps/admin` workspace is an enterprise management portal built using **Remix v2**, **Vite v8**, **React 19**, **Tailwind CSS v4**, and the shared `@repo/ui` design system.

---

## 🏗️ Architecture & Modules Built

### 1. Core Modules & Routes

- **SSO Authentication (`/auth`)**:
  - Enterprise login flow with signed cookie sessions.
  - Interactive theme selection (`ThemeDropdownOrganism`) and language selector.
- **Root Shell & Layout (`/app/root.tsx` & `entry.server.tsx`)**:
  - Responsive layout integrated with the `@repo/ui` design system.
  - 6-theme engine (`dark`, `light`, `corporate`, `neon`, etc.).
  - Tri-lingual internationalization (`en`, `hi`, `gu`) with persistent language selection (`/api/set-language`).
  - PWA offline detection and banner modal (`OfflineStatusModal`).
- **Dashboard (`/dashboard`)**:
  - Real-time and deferred streaming metrics via Remix `defer()`.
  - Lazy-loaded drawer modals (`AppSettingsModal`, `PaymentActionCard`, `FormFieldAction`).
- **Customers (`/customers`)**:
  - Virtualized table records powered by `@tanstack/react-virtual` (`AppVirtualTable`).
  - Slide-over inspection drawers (`CustomerProfileSidebar`, `AddCustomerDrawer`).
- **Employees (`/employees`)**:
  - Virtualized staff directory with search, filter, and drawer actions (`EmployeeProfileSidebar`, `AddEmployeeDrawer`).
- **Leads (`/leads`)**:
  - Lead lifecycle tracking and stage management.
- **Health Heartbeat (`/api/health`)**:
  - Lightweight endpoint for uptime and connectivity checks.

### 2. Web Workers & Offline PWA

- **Background API Worker (`app/workers/api.worker.ts`)**:
  - Offloads CPU-intensive operations (search, large dataset filtering, background health polling) from the main UI thread.
  - Client interface via `apiWorkerClient.ts` and React hook `useApiWorker()`.
- **Progressive Web App (PWA)**:
  - Service Worker (`sw.js`) and web manifest (`manifest.webmanifest`).
  - Offline fallback view (`offline.html`).

---

## ⚡ Performance Engineering

1. **Streaming SSR**:
   - Leverages React 19's `renderToPipeableStream` and Remix `defer()` to send initial HTML quickly while streaming secondary analytics via `<Suspense>` and `<Await>`.
2. **DOM Virtualization**:
   - High-volume data tables in `/customers` and `/employees` render only visible rows using `@tanstack/react-virtual`, preventing memory degradation.
3. **Dynamic Code Splitting**:
   - Drawer sidebars, action cards, and management modals are dynamically imported (`React.lazy`), keeping the initial entry chunk lightweight.
4. **Main-Thread Offloading**:
   - In-memory search filtering and periodic health checks execute inside Web Workers.

---

## 🔒 Security Policies & Hardening

### 1. HTTP Security Response Headers (`entry.server.tsx`)

Injected into every server-rendered response:

- **`Content-Security-Policy (CSP)`**: Restricts unauthorized script, worker (`blob:`), style, and font injection.
- **`Cross-Origin-Opener-Policy (COOP)`**: Configured to `same-origin` to isolate top-level browsing contexts.
- **`X-XSS-Protection`**: Set to `1; mode=block`.
- **`X-Content-Type-Options`**: `nosniff` prevents MIME type sniffing.
- **`X-Frame-Options`**: `DENY` prevents clickjacking in iframes.
- **`Referrer-Policy`**: `strict-origin-when-cross-origin`.
- **`Permissions-Policy`**: Restricts sensitive APIs (`camera=(), microphone=(), geolocation=(), payment=()`).
- **`Strict-Transport-Security (HSTS)`**: `max-age=31536000; includeSubDomains; preload` enforced in production.

### 2. Session Cookie Hardening (`session.server.ts`)

- **Strict Production Secrets**: Enforces runtime checks preventing deployment without an explicit `SESSION_SECRET` environment variable.
- **Cookie Flags**:
  - `httpOnly: true` (shields cookies against JavaScript access / XSS theft).
  - `sameSite: "lax"` (mitigates CSRF vulnerabilities).
  - `secure: true` in production (enforces HTTPS transmission).
  - Cryptographically signed with secret keys.

---

## 🧪 Verification & Commands

```bash
# Typecheck
pnpm --filter admin run check-types

# ESLint validation
pnpm --filter admin run lint

# Production build
pnpm --filter admin run build

# Playwright E2E test suite (PWA, Web Worker, and responsive viewports)
pnpm exec playwright test e2e/pwa-and-worker.spec.ts
```
