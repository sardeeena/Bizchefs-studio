-- ====================================================================
-- BizChefs Studio — Unified Production Database Schema
-- Version: 20261030_04_unified_production_schema
-- Target: Supabase PostgreSQL (studio.bizchefs.com)
-- Execution: Run once in Supabase Dashboard -> SQL Editor
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_system_role') THEN
    CREATE TYPE user_system_role AS ENUM ('superadmin', 'admin', 'tech', 'owner');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_tier_type') THEN
    CREATE TYPE client_tier_type AS ENUM ('starter', 'growth', 'enterprise');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'client_status_type') THEN
    CREATE TYPE client_status_type AS ENUM ('active', 'suspended', 'onboarding');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role_type') THEN
    CREATE TYPE membership_role_type AS ENUM ('owner', 'manager', 'viewer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'website_status_type') THEN
    CREATE TYPE website_status_type AS ENUM ('healthy', 'degraded', 'maintenance', 'offline');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status_type') THEN
    CREATE TYPE project_status_type AS ENUM ('planned', 'in_progress', 'completed', 'on_hold');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status_type') THEN
    CREATE TYPE task_status_type AS ENUM ('todo', 'in_progress', 'completed', 'blocked');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status_type') THEN
    CREATE TYPE ticket_status_type AS ENUM ('open', 'in_progress', 'waiting_on_client', 'resolved');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority_type') THEN
    CREATE TYPE ticket_priority_type AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;
END $$;

-- 3. PROFILES TABLE (Tied to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_system_role NOT NULL DEFAULT 'owner',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. CLIENTS WORKSPACE TABLE
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier client_tier_type NOT NULL DEFAULT 'growth',
  status client_status_type NOT NULL DEFAULT 'active',
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  active_care_plan TEXT NOT NULL DEFAULT 'Monthly Website Care — Professional ($100/mo)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 5. CLIENT MEMBERSHIPS
CREATE TABLE IF NOT EXISTS public.client_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role membership_role_type NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(client_id, user_id)
);

-- 6. WEBSITES TABLE
CREATE TABLE IF NOT EXISTS public.websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  staging_domain TEXT,
  repository_url TEXT,
  branch TEXT NOT NULL DEFAULT 'main',
  framework TEXT NOT NULL DEFAULT 'Next.js 15',
  hosting_provider TEXT NOT NULL DEFAULT 'hostinger',
  hosting_type TEXT NOT NULL DEFAULT 'cloud_startup',
  hostinger_domain_id TEXT,
  status website_status_type NOT NULL DEFAULT 'healthy',
  ssl_active BOOLEAN NOT NULL DEFAULT true,
  ssl_issuer TEXT,
  ssl_expires_at TIMESTAMPTZ,
  php_version TEXT,
  node_version TEXT DEFAULT 'v20.x',
  ip_address TEXT NOT NULL DEFAULT '89.116.53.233',
  uptime_percentage NUMERIC(5,2) NOT NULL DEFAULT 99.98,
  ga4_property_id TEXT,
  search_console_site_url TEXT,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  registrar TEXT NOT NULL DEFAULT 'Hostinger Domains',
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now() + INTERVAL '1 year'),
  dns_records_count INTEGER NOT NULL DEFAULT 4,
  nameservers TEXT[] NOT NULL DEFAULT ARRAY['ns1.dns-parking.com', 'ns2.dns-parking.com'],
  attached_website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  ssl_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. HOSTING SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.hosting_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'hostinger',
  plan_name TEXT NOT NULL DEFAULT 'hostinger_business_v6',
  server_ip TEXT NOT NULL DEFAULT '89.116.53.233',
  datacenter_location TEXT NOT NULL DEFAULT 'Frankfurt, Germany (EU-Central)',
  memory_mb INTEGER NOT NULL DEFAULT 3072,
  disk_gb INTEGER NOT NULL DEFAULT 200,
  disk_used_gb NUMERIC(6,2) NOT NULL DEFAULT 12.4,
  bandwidth_gb INTEGER NOT NULL DEFAULT 1000,
  bandwidth_used_gb NUMERIC(6,2) NOT NULL DEFAULT 45.2,
  cpu_cores INTEGER NOT NULL DEFAULT 2,
  renewal_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '1 year',
  monthly_cost_usd NUMERIC(6,2) NOT NULL DEFAULT 29.99,
  api_connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority ticket_priority_type NOT NULL DEFAULT 'medium',
  status task_status_type NOT NULL DEFAULT 'todo',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_name TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. SUPPORT TICKETS & MESSAGES
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'hosting',
  priority ticket_priority_type NOT NULL DEFAULT 'medium',
  status ticket_status_type NOT NULL DEFAULT 'open',
  assigned_staff TEXT DEFAULT 'BizChefs Support Team',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL DEFAULT 'owner',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. GOOGLE INTEGRATION CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  google_email TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  key_version TEXT NOT NULL DEFAULT 'v1',
  is_connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role user_system_role NOT NULL DEFAULT 'owner',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. RATE LIMITING TABLE & ATOMIC FUNCTION
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  tokens INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON public.rate_limits(expires_at);

-- 14. LAST SUPERADMIN PROTECTION TRIGGER
CREATE OR REPLACE FUNCTION public.check_last_superadmin_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_superadmins INT;
BEGIN
  IF (TG_OP = 'DELETE' AND OLD.role = 'superadmin') OR
     (TG_OP = 'UPDATE' AND OLD.role = 'superadmin' AND NEW.role <> 'superadmin') THEN
    SELECT COUNT(*) INTO active_superadmins
    FROM public.profiles
    WHERE role = 'superadmin' AND id <> OLD.id;

    IF active_superadmins = 0 THEN
      RAISE EXCEPTION 'SECURITY_VIOLATION: Cannot delete or demote the last active superadmin account.';
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_guard_last_superadmin ON public.profiles;
CREATE TRIGGER trigger_guard_last_superadmin
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.check_last_superadmin_guard();

-- 15. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
