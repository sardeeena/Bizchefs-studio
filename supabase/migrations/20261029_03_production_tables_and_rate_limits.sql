-- ====================================================================
-- BizChefs Studio — Production Infrastructure, Deployments & Rate Limiting
-- Version: 20261029_03_production_tables_and_rate_limits
-- Application: studio.bizchefs.com
-- ====================================================================

-- 1. DOMAINS TABLE
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  registrar TEXT NOT NULL DEFAULT 'Hostinger Domains',
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ NOT NULL,
  dns_records_count INTEGER NOT NULL DEFAULT 4,
  nameservers TEXT[] NOT NULL DEFAULT ARRAY['ns1.dns-parking.com', 'ns2.dns-parking.com'],
  attached_website_id UUID REFERENCES public.websites(id) ON DELETE SET NULL,
  ssl_active BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. HOSTING SERVICES TABLE (Hostinger Cloud / VPS / Shared)
CREATE TABLE IF NOT EXISTS public.hosting_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'hostinger',
  plan_name TEXT NOT NULL,
  server_ip TEXT NOT NULL,
  datacenter_location TEXT NOT NULL DEFAULT 'Frankfurt, Germany (EU-Central)',
  memory_mb INTEGER NOT NULL DEFAULT 3072,
  disk_gb INTEGER NOT NULL DEFAULT 200,
  disk_used_gb NUMERIC(6,2) NOT NULL DEFAULT 12.4,
  bandwidth_gb INTEGER NOT NULL DEFAULT 1000,
  bandwidth_used_gb NUMERIC(6,2) NOT NULL DEFAULT 45.2,
  cpu_cores INTEGER NOT NULL DEFAULT 2,
  renewal_date DATE NOT NULL,
  monthly_cost_usd NUMERIC(6,2) NOT NULL DEFAULT 29.99,
  api_connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3. DEPLOYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id UUID NOT NULL REFERENCES public.websites(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  commit_hash TEXT NOT NULL,
  commit_message TEXT NOT NULL,
  author_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('queued', 'building', 'success', 'failed', 'cancelled')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  deployed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  environment TEXT NOT NULL DEFAULT 'production',
  rollback_available BOOLEAN NOT NULL DEFAULT false,
  build_logs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. DISTRIBUTED RATE LIMITING TABLE
-- Stores atomic counter tokens for multi-instance deployments (Hostinger Node.js cluster)
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  tokens INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires_at ON public.rate_limits(expires_at);

-- 5. ATOMIC RATE LIMIT FUNCTION (Token Bucket / Sliding Window)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_requests INT,
  p_window_seconds INT
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining INT,
  reset_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc', now());
  v_expires_at TIMESTAMPTZ;
  v_tokens INT;
BEGIN
  -- Clean up expired record for this key if past window
  DELETE FROM public.rate_limits WHERE key = p_key AND expires_at <= v_now;

  -- Insert new rate limit record if it does not exist
  INSERT INTO public.rate_limits (key, tokens, expires_at)
  VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
  ON CONFLICT (key) DO UPDATE
  SET tokens = public.rate_limits.tokens + 1
  RETURNING public.rate_limits.tokens, public.rate_limits.expires_at
  INTO v_tokens, v_expires_at;

  IF v_tokens <= p_max_requests THEN
    RETURN QUERY SELECT
      true AS allowed,
      (p_max_requests - v_tokens) AS remaining,
      GREATEST(1, EXTRACT(EPOCH FROM (v_expires_at - v_now))::INT) AS reset_seconds;
  ELSE
    RETURN QUERY SELECT
      false AS allowed,
      0 AS remaining,
      GREATEST(1, EXTRACT(EPOCH FROM (v_expires_at - v_now))::INT) AS reset_seconds;
  END IF;
END;
$$;

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosting_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

-- 7. DOMAINS POLICIES
CREATE POLICY "Users can view domains in authorized workspaces"
  ON public.domains FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Superadmin and Admin can insert domains"
  ON public.domains FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('superadmin', 'admin') AND
    public.can_access_client(client_id)
  );

CREATE POLICY "Superadmin and Admin can update domains"
  ON public.domains FOR UPDATE
  USING (
    public.current_user_role() IN ('superadmin', 'admin') AND
    public.can_access_client(client_id)
  );

CREATE POLICY "Only superadmin can delete domains"
  ON public.domains FOR DELETE
  USING (public.current_user_role() = 'superadmin');

-- 8. HOSTING SERVICES POLICIES
CREATE POLICY "Users can view hosting in authorized workspaces"
  ON public.hosting_services FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Superadmin and Admin can manage hosting"
  ON public.hosting_services FOR ALL
  USING (
    public.current_user_role() IN ('superadmin', 'admin') AND
    public.can_access_client(client_id)
  );

-- 9. DEPLOYMENTS POLICIES
CREATE POLICY "Users can view deployments in authorized workspaces"
  ON public.deployments FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Technical staff and admins can create deployments"
  ON public.deployments FOR INSERT
  WITH CHECK (
    public.current_user_role() IN ('superadmin', 'admin', 'tech') AND
    public.can_access_client(client_id)
  );
