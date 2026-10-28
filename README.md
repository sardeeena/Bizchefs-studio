# BizChefs Studio — Client Portal

**BizChefs Studio** (`https://studio.bizchefs.com`) is the official, production-grade client portal engineered for BizChefs clients. It provides centralized management for custom-coded websites, domains, Hostinger cloud infrastructure, deployment pipelines, Google Analytics 4 telemetry, Google Search Console search performance, safe source code inspection, and concierge support.

---

## 1. Brand Tokens & Design System

BizChefs Studio inherits the exact visual identity and design tokens of BizChefs:

- **Light Mode Background**: `#fafafa`
- **Dark Mode Background**: `#0c0e12` (Card surface: `#13171f`, container borders: `neutral-800` / `#262626`)
- **Primary Text (Light)**: `#171717`
- **Primary Text (Dark)**: `#f3f4f6` with optical kerning (`letter-spacing: 0.005em`)
- **BizChefs Gold Accent**: `#D39E36`
- **Keyboard Focus Indicator**: `#2563eb` with 2px outline offset
- **Brand Assets**: Authentic emblems (`/BizChefs-emblem-transparent.png`, `/BizChefs-emblem-dark.png`) and official wordmarks in `/public`.
- **Zero-Pill Discipline**: Unboxed metadata typography with subtle `·` separators; interactive buttons with rounded-lg states.

---

## 2. Technical Stack

- **Framework**: Next.js 15 (App Router)
- **UI & Runtime**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 with custom `@custom-variant dark`
- **Database**: Supabase PostgreSQL with strict Row Level Security (RLS)
- **Authentication**: Supabase Auth with cookie-based SSR sessions (`@supabase/ssr`)
- **Cryptographic Security**: Authenticated AES-256-GCM token encryption (`crypto`)
- **Hostinger Adapter**: Modular client built against the official [Hostinger API](https://developers.hostinger.com/)
- **Icons**: Lucide React
- **Validation**: Zod
- **Testing**: Built-in `node:test` and `node:assert/strict` with `npx --yes tsx --test`

---

## 3. Database Architecture & Row Level Security (RLS)

SQL migrations are located in `supabase/migrations/`:
- **`20261028_01_init_schema.sql`**: Full schema definition with tables:
  - `profiles`, `clients`, `client_memberships`, `websites`, `projects`, `tasks`, `support_tickets`, `ticket_messages`, `google_connections`, `google_analytics_properties`, `google_search_console_properties`, `activity_logs`.
- **RLS Rules Enforced in PostgreSQL**:
  1. A client can only access records associated with workspaces where `client_id IN (SELECT client_id FROM client_memberships WHERE user_id = auth.uid())`.
  2. A client cannot assign themselves to another workspace.
  3. A client cannot change their own role to admin (self-promotion strictly blocked).
  4. Ordinary clients cannot read OAuth refresh tokens from `google_connections`.
  5. Only authorized administrators (`public.is_admin()`) can execute cross-tenant queries.

### Applying Migrations
```bash
# Link to your Supabase project:
npx supabase link --project-ref <your-supabase-project-id>

# Apply schema migrations:
npx supabase db push
```
Alternatively, copy the SQL from `supabase/migrations/20261028_01_init_schema.sql` into the Supabase Dashboard **SQL Editor** and run it.

---

## 4. Google Analytics 4 & Search Console Integration

Implemented using the official [Google OAuth 2.0 Web Server Flow](https://developers.google.com/identity/protocols/oauth2/web-server):
- **Scopes Requested**:
  - `https://www.googleapis.com/auth/analytics.readonly`
  - `https://www.googleapis.com/auth/webmasters.readonly`
- **CSRF Defense**: Generates cryptographically random 32-byte state stored in a `SameSite=Lax`, `HttpOnly` cookie.
- **Token Vault Encryption**: Refresh tokens are encrypted with authenticated **AES-256-GCM** using `GOOGLE_TOKEN_ENCRYPTION_KEY` before database storage. Plain tokens are never logged or sent to the browser.
- **Authorized Redirect URI**:
  ```
  https://studio.bizchefs.com/api/integrations/google/callback
  ```

---

## 5. Hostinger Node.js Application Deployment Guide

BizChefs Studio is designed to run seamlessly on Hostinger's Node.js application hosting (Cloud or VPS plans):

### Hostinger hPanel Configuration Steps:
1. In Hostinger hPanel, go to **Websites** $\rightarrow$ **Add Website** or **Subdomain** $\rightarrow$ enter `studio.bizchefs.com`.
2. Under **Advanced** / **Node.js**:
   - **Node.js Version**: Select `20.x LTS` (or compatible `18.x/20.x`).
   - **Application Root**: `/public_html/studio`
   - **Application Startup File**: `node_modules/next/dist/bin/next` or standard custom runner script.
   - **Run Mode**: `Production`
3. Set the Environment Variables in Hostinger hPanel:
   - `NODE_ENV=production`
   - `APP_URL=https://studio.bizchefs.com`
   - `NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-publishable-key>`
   - `SUPABASE_SECRET_KEY=<your-secret-or-service-role-key>`
   - `GOOGLE_CLIENT_ID=<your-google-oauth-client-id>`
   - `GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>`
   - `GOOGLE_REDIRECT_URI=https://studio.bizchefs.com/api/integrations/google/callback`
   - `GOOGLE_TOKEN_ENCRYPTION_KEY=<generated-32-byte-hex-string>`
   - `HOSTINGER_API_TOKEN=<your-hostinger-api-token>`
4. Deploy code and build:
   ```bash
   npm install --production=false
   npm run build
   npm run start
   ```

---

## 6. Four-Role Role-Based Access Control (RBAC) Architecture

BizChefs Studio implements an enterprise-grade four-role access control model:

| Role | Hierarchy | Workspace Scoping | Privileges & Key Responsibilities |
|---|---|---|---|
| **`superadmin`** | Level 100 | **Global** (All Tenants) | Full platform control. Create/archive clients, assign and manage all roles, configure system settings, execute cross-tenant Hostinger cluster sync, view master security audit logs. Protected against removal of the last active superadmin. |
| **`admin`** | Level 80 | **Assigned** Workspaces | Operational management. Manage assigned client workspaces, onboarding, websites, tasks, and support tickets. Cannot promote users to `superadmin` or modify `superadmin`/`admin` accounts. Cannot delete clients. |
| **`tech`** | Level 50 | **Assigned** Workspaces | Technical runtime telemetry, deployment pipelines, PM2/Node.js telemetry, sprint task status toggles, technical tickets. No billing access, cannot create/delete websites, no role management authority. |
| **`owner`** | Level 10 | **Single** Client Workspace | Business and care plan oversight. View websites, domains, hosting specs, deployments, analytics, roadmap progress, support conversations. Cannot modify technical configuration, trigger server mutations, alter DNS, or edit role assignments. Read-only infrastructure access. |

### Last-Superadmin Protection
Enforced at both the database level (PostgreSQL `check_last_superadmin_guard()` trigger) and application layer (`canModifyUserRole` in `lib/auth/authorize.ts`):
- Demoting or deleting the final active superadmin is strictly rejected with a 403 Security Constraint error.
- At least one active superadmin must remain in the platform at all times.

---

## 7. Development & Automated Testing Commands

```bash
# Install dependencies
npm install

# Run automated security and Four-Role RBAC test suite (17 automated test suites)
npx --yes tsx --test lib/security.test.ts

# Run ESLint validation
npm run lint

# Compile standalone production build
npm run build
```

---

## 8. Routes Directory & RBAC Access Matrix

| Route | Functionality | Permitted Roles | Notes |
|---|---|---|---|
| `/dashboard` | Client overview, KPI metrics, hosting status, recent deployments | `superadmin`, `admin`, `tech`, `owner` | Role-tailored view & actions |
| `/websites` | Inventory of custom-coded websites with framework filters | `superadmin`, `admin`, `tech`, `owner` | Workspace scoped |
| `/websites/[id]` | Website overview, specs, and Hostinger API integration | `superadmin`, `admin`, `tech`, `owner` | Workspace scoped |
| `/websites/[id]/analytics` | Google Analytics 4 & Search Console performance dashboard | `superadmin`, `admin`, `tech`, `owner` | Read-only |
| `/websites/[id]/files` | Safe file explorer and syntax-highlighted code editor | `superadmin`, `admin`, `tech` (Edit), `owner` (Read-only) | Strict path-traversal shield |
| `/websites/[id]/deployments`| Git deployment history, live build logs, and rollback action | `superadmin`, `admin`, `tech` (Deploy), `owner` (Read-only) | Deployments restricted to staff |
| `/domains` | Domain portfolio, auto-renewal toggles, and DNS zone inspector | `superadmin`, `admin`, `tech`, `owner` | Workspace scoped |
| `/services` | Active website care tiers ($100/mo, $300/mo), Hostinger plans, SLAs | `superadmin`, `admin`, `tech`, `owner` | Workspace scoped |
| `/projects` | Sprints, roadmap milestones, and task delivery board | `superadmin`, `admin`, `tech` (Manage), `owner` (View-only) | Owner has view-only access |
| `/support` | Concierge support tickets and interactive messaging thread | `superadmin`, `admin`, `tech`, `owner` | Workspace scoped |
| `/account` | Organization details, team management, and security audit log | `superadmin`, `admin`, `tech`, `owner` | Audit entries scoped |
| `/admin` | BizChefs staff command center, global client roster, cluster sync, RBAC | `superadmin`, `admin` ONLY | Tech & Owner get 403 Forbidden |
| `/login` | Branded login page with one-click demo sandbox personas | Public | 4-Role Persona Switcher |
| `/forgot-password` | Password recovery request form | Public | Clean state flow |
| `/api/health` | Operational health-check probe returning status 200 OK | Public | Health probe |

