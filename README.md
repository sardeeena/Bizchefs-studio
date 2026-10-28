# BizChefs Studio — Client Portal

**BizChefs Studio** (`https://studio.bizchefs.com`) is the official, standalone client portal engineered for BizChefs clients. It provides centralized management for custom-coded websites, domains, Hostinger cloud infrastructure, deployment pipelines, Google Analytics 4 telemetry, Google Search Console search performance, safe source code inspection, and concierge support.

---

## 1. Brand Tokens & Design System

BizChefs Studio inherits the exact visual identity and design tokens of BizChefs:

- **Light Mode Background**: `#fafafa`
- **Dark Mode Background**: `#0c0e12`
- **Primary Text (Light)**: `#171717`
- **Primary Text (Dark)**: `#f3f4f6`
- **BizChefs Gold Accent**: `#D39E36`
- **Keyboard Focus Indicator**: `#2563eb` with 2px outline offset
- **Brand Assets**: Authentic emblems (`/BizChefs-emblem-transparent.png`, `/BizChefs-emblem-dark.png`) and official wordmarks in `/public`.
- **Zero-Pill Discipline**: Unboxed metadata typography with subtle `·` separators; interactive buttons with rounded-lg states.

---

## 2. Technical Stack

- **Framework**: Next.js 15 (App Router)
- **UI & Runtime**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom `@custom-variant dark`
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Built-in `node:test` and `node:assert/strict` with `npx --yes tsx --test`

---

## 3. Security Architecture & Client Isolation

### Multi-Tenant Model
Every resource (`Website`, `Domain`, `HostingService`, `Deployment`, `SupportTicket`, `AnalyticsProperty`, `VirtualFileNode`) belongs explicitly to a `clientId`.

### Server-Side Authorization (`lib/auth/session.ts`)
- **Strict Role-Based Access Control (RBAC)**:
  - `super_admin`: Full access across all clients, Hostinger cluster synchronization, master audit log inspector.
  - `client_owner`: Isolated access restricted exclusively to the tenant's own websites, domains, and analytics.
  - `client_member`: Read-only access within their organization.
- **Cross-Tenant Access Denial**:
  - `assertClientAccess(user, clientId)` and `assertWebsiteAccess(user, websiteId)` throw `403 Forbidden` if a user attempts to view or alter another client's resources.
- **Admin Center Restriction (`/admin`)**:
  - Server-side and layout-level gate returning `403 Forbidden` for non-administrative roles.

### Safe File Management (`lib/services/file-manager.ts`)
- **Directory Traversal Defense**: Rejects `../`, null bytes, Windows backslashes, and paths outside the website root.
- **Extension Allowlist**: Only allows safe web source files (`.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.css`, `.html`, `.md`, `.env.example`).
- **Forbidden Targets**: Blocks access to `.env`, `.git`, SSH keys, and system files.
- **Content Size Guard**: Enforces a strict 500 KB limit.

---

## 4. Hostinger Integration Layer

Built against the official [Hostinger API Documentation](https://developers.hostinger.com/):
- **Server-Side Token Storage**: `HOSTINGER_API_TOKEN` is stored strictly in server-side environment variables and is never exposed to browser bundles.
- **Capability Matrix**: Explicitly separates supported endpoints (Site status, DNS sync, edge CDN cache invalidation) from unavailable operations (arbitrary remote file edits).
- **Graceful Fallback**: Reports verified health-check telemetry and informative messages when the external token is not yet provisioned.

---

## 5. Routes Matrix

| Route | Description | Access Level |
|---|---|---|
| `/dashboard` | Client overview, KPI metrics, hosting status, recent deployments | Client & Admin |
| `/websites` | Inventory of custom-coded websites with framework filters | Client & Admin |
| `/websites/[id]` | Website overview, specs, and Hostinger API integration | Tenant Isolated |
| `/websites/[id]/analytics` | Google Analytics 4 & Search Console performance dashboard | Tenant Isolated |
| `/websites/[id]/files` | Safe file explorer and syntax-highlighted code editor | Tenant Isolated |
| `/websites/[id]/deployments`| Git deployment history, live build logs, and rollback action | Tenant Isolated |
| `/domains` | Domain portfolio, auto-renewal toggles, and DNS zone inspector | Tenant Isolated |
| `/services` | Active website care tiers ($100/mo, $300/mo), Hostinger plans, SLAs | Client & Admin |
| `/projects` | Sprints, roadmap milestones, and SOW deliverable tracking | Client & Admin |
| `/support` | Concierge support tickets and interactive messaging thread | Client & Admin |
| `/account` | Organization details, team management, and security audit log | Client & Admin |
| `/admin` | BizChefs staff command center, global client roster, cluster sync | Staff Only (403 Gate) |
| `/login` | Branded login page with one-click demo sandbox personas | Public |
| `/forgot-password` | Password recovery request form | Public |

---

## 6. Development & Testing Commands

```bash
# Install dependencies
npm install

# Run unit tests (Security & Hostinger adapters)
npx --yes tsx --test lib/security.test.ts

# Run development server
npm run dev

# Build standalone production bundle
npm run build

# Start production server
npm run start
```
