# Supabase PostgreSQL Migrations Guide — BizChefs Studio

This directory contains version-controlled SQL migrations for the BizChefs Studio client portal database (`studio.bizchefs.com`).

---

## 1. Migration Overview

### Migration 1: `20261028_01_init_schema.sql`
- Creates core multi-tenant tables: `profiles`, `clients`, `client_memberships`, `websites`, `projects`, `tasks`, `support_tickets`, `ticket_messages`, `google_connections`, `google_analytics_properties`, `google_search_console_properties`, `activity_logs`.
- Enables **Row Level Security (RLS)** across all tables.
- Implements helper functions `is_admin()` and `is_member_of(client_id)` with `SECURITY DEFINER` and safe search paths.
- Enforces client isolation, self-promotion prevention, and OAuth token encapsulation.

### Migration 2: `20261028_02_four_role_rbac.sql` (Four-Role RBAC Refactor)
- **Role System Migration**:
  - Replaces legacy 2-role enum with exact 4-role enum: `'superadmin'`, `'admin'`, `'tech'`, `'owner'`.
  - Migrates legacy data (`admin` $\rightarrow$ `superadmin`, `client` $\rightarrow$ `owner`).
- **Last-Superadmin Protection Trigger**:
  - Implements `check_last_superadmin_guard()` trigger on `public.profiles`.
  - Enforces at the database engine level that the final active `superadmin` cannot be demoted, deactivated, or deleted.
- **Granular Helper Functions**:
  - `public.is_superadmin()`: Checks if current session is `superadmin`.
  - `public.is_admin_or_superadmin()`: Checks if current session is `superadmin` or `admin`.
  - `public.is_tech_or_higher()`: Checks if current session is `superadmin`, `admin`, or `tech`.
  - `public.has_workspace_scope(target_client_id)`: Implements workspace scoping (global for superadmin, membership-scoped for admin, tech, and owner).
- **Hardened RLS Policies Across All Tables**:
  - `profiles`: Superadmin can manage all roles; admins can manage users in assigned workspaces; self-promotion to `superadmin` blocked.
  - `clients`: Superadmin can create/delete; admins can update assigned clients; tech and owner have scoped read-only access.
  - `websites`: Superadmin and admin can create/delete; tech can update technical configurations; owner has view-only access.
  - `tasks`: Superadmin, admin, and tech can create and update task statuses; owner has view-only roadmap access.
  - `support_tickets` & `ticket_messages`: All roles can view and participate in tickets within their workspace scope; tech and admins can view internal operational notes.

---

## 2. Applying Migrations

### Method A: Supabase CLI (Recommended)

```bash
# Link to your existing Supabase project
npx supabase link --project-ref <your-supabase-project-id>

# Run pending migrations in chronological order
npx supabase db push
```

### Method B: Supabase Dashboard SQL Editor

1. Open your project dashboard at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor**.
3. Create a **New Query**.
4. Run `supabase/migrations/20261028_01_init_schema.sql` (if bootstrapping a fresh instance).
5. Run `supabase/migrations/20261028_02_four_role_rbac.sql` to upgrade to the Four-Role RBAC system.

---

## 3. Initial Superadmin Provisioning

To securely designate your first `superadmin` without exposing a public endpoint:

```sql
-- In Supabase SQL Editor:
UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'admin@bizchefs.com';
```

---

## 4. Rollback Procedure

```sql
-- To revert the four-role RBAC migration:
DROP TRIGGER IF EXISTS trg_guard_last_superadmin ON public.profiles;
DROP FUNCTION IF EXISTS public.check_last_superadmin_guard();
DROP FUNCTION IF EXISTS public.has_workspace_scope(UUID);
DROP FUNCTION IF EXISTS public.is_tech_or_higher();
DROP FUNCTION IF EXISTS public.is_admin_or_superadmin();
DROP FUNCTION IF EXISTS public.is_superadmin();
```
