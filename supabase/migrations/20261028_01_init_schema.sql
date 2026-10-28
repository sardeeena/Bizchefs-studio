-- ====================================================================
-- BizChefs Studio — Multi-Tenant Schema & Row Level Security (RLS)
-- Version: 20261028_01
-- Target: Supabase PostgreSQL (studio.bizchefs.com)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE user_system_role AS ENUM ('admin', 'client');
CREATE TYPE client_tier_type AS ENUM ('starter', 'growth', 'enterprise');
CREATE TYPE client_status_type AS ENUM ('active', 'suspended', 'onboarding');
CREATE TYPE membership_role_type AS ENUM ('owner', 'manager', 'viewer');
CREATE TYPE website_status_type AS ENUM ('healthy', 'degraded', 'maintenance', 'offline');
CREATE TYPE project_status_type AS ENUM ('planned', 'in_progress', 'completed', 'on_hold');
CREATE TYPE task_status_type AS ENUM ('todo', 'in_progress', 'completed', 'blocked');
CREATE TYPE ticket_status_type AS ENUM ('open', 'in_progress', 'waiting_on_client', 'resolved');
CREATE TYPE ticket_priority_type AS ENUM ('low', 'medium', 'high', 'urgent');

-- 3. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_system_role NOT NULL DEFAULT 'client',
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

-- 5. CLIENT MEMBERSHIPS (Associates users to client workspaces)
CREATE TABLE IF NOT EXISTS public.client_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role membership_role_type NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE(client_id, user_id)
);

-- 6. WEBSITES
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
  ip_address TEXT NOT NULL DEFAULT '185.199.110.153',
  uptime_percentage NUMERIC(5,2) NOT NULL DEFAULT 99.98,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 7. PROJECTS & ROADMAPS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status project_status_type NOT NULL DEFAULT 'in_progress',
  due_date DATE,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  service_category TEXT NOT NULL DEFAULT 'Engineering',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 8. TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status_type NOT NULL DEFAULT 'todo',
  priority ticket_priority_type NOT NULL DEFAULT 'medium',
  assignee_name TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 9. SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'hosting',
  priority ticket_priority_type NOT NULL DEFAULT 'medium',
  status ticket_status_type NOT NULL DEFAULT 'open',
  assigned_staff TEXT DEFAULT 'BizChefs Lead',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 10. SUPPORT TICKET MESSAGES
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_role user_system_role NOT NULL DEFAULT 'client',
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 11. GOOGLE INTEGRATION & ENCRYPTED TOKEN VAULT
CREATE TABLE IF NOT EXISTS public.google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE UNIQUE,
  google_user_id TEXT,
  google_email TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL, -- AES-256-GCM ciphertext
  token_iv TEXT NOT NULL,                -- 96-bit IV hex
  auth_tag TEXT NOT NULL,                -- 128-bit GCM auth tag
  key_version TEXT NOT NULL DEFAULT 'v1',
  scopes TEXT[] NOT NULL DEFAULT ARRAY['https://www.googleapis.com/auth/analytics.readonly', 'https://www.googleapis.com/auth/webmasters.readonly'],
  is_connected BOOLEAN NOT NULL DEFAULT true,
  connected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. GOOGLE ANALYTICS PROPERTIES
CREATE TABLE IF NOT EXISTS public.google_analytics_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  property_id TEXT NOT NULL,
  property_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 13. GOOGLE SEARCH CONSOLE PROPERTIES
CREATE TABLE IF NOT EXISTS public.google_search_console_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  site_url TEXT NOT NULL,
  permission_level TEXT DEFAULT 'siteOwner',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. SECURITY & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role user_system_role NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) HELPER FUNCTIONS
-- ====================================================================

-- Check if authenticated user is BizChefs admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Check if authenticated user belongs to target client workspace
CREATE OR REPLACE FUNCTION public.is_member_of(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_memberships
    WHERE client_id = target_client_id AND user_id = auth.uid()
  ) OR public.is_admin();
$$;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) ENFORCEMENT ON ALL TABLES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_analytics_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_search_console_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can read own profile or admins read all"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile fields"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self-promotion to admin

-- 2. CLIENTS WORKSPACE POLICIES
CREATE POLICY "Members view their authorized workspace; admins view all"
  ON public.clients FOR SELECT
  USING (public.is_member_of(id));

CREATE POLICY "Admins can insert or update client workspaces"
  ON public.clients FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. MEMBERSHIPS POLICIES
CREATE POLICY "Members view team roster; admins view all"
  ON public.client_memberships FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Admins manage memberships"
  ON public.client_memberships FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. WEBSITES POLICIES
CREATE POLICY "Members view their client websites"
  ON public.websites FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Admins or workspace owners can insert or update websites"
  ON public.websites FOR ALL
  USING (public.is_member_of(client_id))
  WITH CHECK (public.is_member_of(client_id));

-- 5. PROJECTS POLICIES
CREATE POLICY "Members view their client projects"
  ON public.projects FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Authorized members manage projects"
  ON public.projects FOR ALL
  USING (public.is_member_of(client_id))
  WITH CHECK (public.is_member_of(client_id));

-- 6. TASKS POLICIES
CREATE POLICY "Members view client tasks"
  ON public.tasks FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Members update their client tasks"
  ON public.tasks FOR ALL
  USING (public.is_member_of(client_id))
  WITH CHECK (public.is_member_of(client_id));

-- 7. SUPPORT TICKETS POLICIES
CREATE POLICY "Members view client tickets"
  ON public.support_tickets FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Members create client tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (public.is_member_of(client_id));

CREATE POLICY "Members update client tickets"
  ON public.support_tickets FOR UPDATE
  USING (public.is_member_of(client_id));

-- 8. TICKET MESSAGES POLICIES
CREATE POLICY "Members view ticket messages (excluding internal staff notes)"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND public.is_member_of(t.client_id)
    ) AND (NOT is_internal OR public.is_admin())
  );

CREATE POLICY "Members send messages to authorized tickets"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND public.is_member_of(t.client_id)
    )
  );

-- 9. GOOGLE CONNECTIONS (Strict token protection: only server or admin)
CREATE POLICY "Clients see connection status only"
  ON public.google_connections FOR SELECT
  USING (public.is_member_of(client_id));

CREATE POLICY "Only admins or trusted service-role manage token vault"
  ON public.google_connections FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 10. GOOGLE PROPERTIES POLICIES
CREATE POLICY "Members view Google Analytics properties"
  ON public.google_analytics_properties FOR ALL
  USING (public.is_member_of(client_id))
  WITH CHECK (public.is_member_of(client_id));

CREATE POLICY "Members view Google Search Console properties"
  ON public.google_search_console_properties FOR ALL
  USING (public.is_member_of(client_id))
  WITH CHECK (public.is_member_of(client_id));

-- 11. ACTIVITY LOGS POLICIES
CREATE POLICY "Members view client activity logs; admins view all"
  ON public.activity_logs FOR SELECT
  USING (client_id IS NULL AND public.is_admin() OR public.is_member_of(client_id));

CREATE POLICY "Admins or system insert logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (true);
