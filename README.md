# Design System Monorepo

Turborepo monorepo featuring:

- `apps/admin`: Enterprise Admin Portal built with Remix v2, Vite v8, React 19, Tailwind CSS v4, Web Workers, and strict security hardening. See [apps/admin/README.md](apps/admin/README.md) for full architectural, performance, and security documentation.
- `apps/web`: Remix Framework with Tailwind CSS v4 and the 13-breakpoint Container Query Test Suite.
- `apps/docs`: Vite + React documentation application.
- `packages/ui`: Shared pure stateless Atomic Design System atoms, molecules, and organisms.
- `packages/eslint-config`: Shared ESLint configurations.
- `packages/typescript-config`: Shared TypeScript configurations.

---

## 🛠️ Monorepo Quick Start

```bash
# Install dependencies
pnpm install

# Run all apps in development mode
pnpm run dev

# Run type-checks across all workspaces
pnpm run check-types

# Run linting across all workspaces
pnpm run lint

# Build all packages and applications
pnpm run build

# Run end-to-end tests
pnpm run test:e2e
```

---

## 🔒 Security & Performance Highlights (Admin Portal)

- **Strict Security Headers**: Injects Content-Security-Policy (CSP), COOP (`same-origin`), HSTS, `X-Frame-Options: DENY`, and `X-Content-Type-Options: nosniff`.
- **Session Hardening**: Cryptographically signed `httpOnly`, `sameSite: "lax"`, and mandatory production secret validations.
- **High Performance**: Streaming SSR (`defer()`), DOM virtualization (`@tanstack/react-virtual`), code-splitting, and Web Worker offloading for computationally intensive tasks.
