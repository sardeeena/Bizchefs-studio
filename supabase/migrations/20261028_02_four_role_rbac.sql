-- ====================================================================
-- BizChefs Studio — Four-Role RBAC Database Migration
-- Version: 20261028_02_four_role_rbac
-- Roles: 'superadmin', 'admin', 'tech', 'owner'
-- ====================================================================

-- 1. SAFE ENUM CONVERSION
-- Create the new v2 enum containing the exact four roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_system_role_v2') THEN
    CREATE TYPE user_system_role_v2 AS ENUM ('superadmin', 'admin', 'tech', 'owner');
  END IF;
END $$;

-- Drop default constraint temporarily while altering
ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;

-- Safely migrate existing records:
-- 'admin' -> 'admin'
-- 'client' -> 'owner'
ALTER TABLE public.profiles
  ALTER COLUMN role TYPE user_system_role_v2
  USING (
    CASE role::text
      WHEN 'admin' THEN 'admin'::user_system_role_v2
      WHEN 'client' THEN 'owner'::user_system_role_v2
      WHEN 'superadmin' THEN 'superadmin'::user_system_role_v2
      WHEN 'tech' THEN 'tech'::user_system_role_v2
      ELSE 'owner'::user_system_role_v2
    END
  );

-- Update default to 'owner'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'owner'::user_system_role_v2;

-- Update ticket_messages sender_role
ALTER TABLE public.ticket_messages
  ALTER COLUMN sender_role TYPE user_system_role_v2
  USING (
    CASE sender_role::text
      WHEN 'admin' THEN 'admin'::user_system_role_v2
      ELSE 'owner'::user_system_role_v2
    END
  );
ALTER TABLE public.ticket_messages ALTER COLUMN sender_role SET DEFAULT 'owner'::user_system_role_v2;

-- Update activity_logs actor_role
ALTER TABLE public.activity_logs
  ALTER COLUMN actor_role TYPE user_system_role_v2
  USING (
    CASE actor_role::text
      WHEN 'admin' THEN 'admin'::user_system_role_v2
      ELSE 'owner'::user_system_role_v2
    END
  );

-- Drop old enum type and rename new one
DROP TYPE IF EXISTS user_system_role;
ALTER TYPE user_system_role_v2 RENAME TO user_system_role;

-- 2. TRIGGER: PREVENT ACCIDENTAL DEMOTION OR DELETION OF THE LAST SUPERADMIN
CREATE OR REPLACE FUNCTION public.check_last_superadmin_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  active_superadmins INT;
BEGIN
  -- If operation affects an existing superadmin
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

-- 3. UPDATED SECURITY DEFINER RLS HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_system_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('superadmin', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_tech_or_higher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('superadmin', 'admin', 'tech')
  );
$$;

-- Workspace scoping: checks if authenticated user belongs to target client workspace
-- (Superadmins bypass workspace scoping; admins and techs check client_memberships; owners check client_memberships)
CREATE OR REPLACE FUNCTION public.has_workspace_scope(target_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_superadmin() OR EXISTS (
    SELECT 1 FROM public.client_memberships
    WHERE client_id = target_client_id AND user_id = auth.uid()
  );
$$;

-- 4. REFINED ROW LEVEL SECURITY (RLS) POLICIES

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile or admins read all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile fields" ON public.profiles;

CREATE POLICY "Profiles view policy: Superadmin sees all; users see own and workspace members"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.client_memberships my_mem
      JOIN public.client_memberships other_mem ON my_mem.client_id = other_mem.client_id
      WHERE my_mem.user_id = auth.uid() AND other_mem.user_id = public.profiles.id
    )
  );

CREATE POLICY "Profiles update policy: users update own profile fields without role escalation"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_superadmin())
  WITH CHECK (
    -- Superadmin can change roles; non-superadmin users CANNOT modify their role
    (public.is_superadmin()) OR
    (id = auth.uid() AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  );

-- CLIENTS
DROP POLICY IF EXISTS "Members view their authorized workspace; admins view all" ON public.clients;
DROP POLICY IF EXISTS "Admins can insert or update client workspaces" ON public.clients;

CREATE POLICY "Clients SELECT: Superadmin sees all; assigned users see permitted workspaces"
  ON public.clients FOR SELECT
  USING (public.has_workspace_scope(id));

CREATE POLICY "Clients INSERT/UPDATE: Superadmin and authorized Admins within scope"
  ON public.clients FOR INSERT
  WITH CHECK (public.is_admin_or_superadmin());

CREATE POLICY "Clients UPDATE: Superadmin and authorized Admins"
  ON public.clients FOR UPDATE
  USING (public.has_workspace_scope(id) AND public.is_admin_or_superadmin())
  WITH CHECK (public.has_workspace_scope(id) AND public.is_admin_or_superadmin());

CREATE POLICY "Clients DELETE: Strictly restricted to Superadmin"
  ON public.clients FOR DELETE
  USING (public.is_superadmin());

-- WEBSITES
DROP POLICY IF EXISTS "Members view their client websites" ON public.websites;
DROP POLICY IF EXISTS "Admins or workspace owners can insert or update websites" ON public.websites;

CREATE POLICY "Websites SELECT: Permitted workspace members"
  ON public.websites FOR SELECT
  USING (public.has_workspace_scope(client_id));

CREATE POLICY "Websites INSERT: Superadmin and Admin within scope"
  ON public.websites FOR INSERT
  WITH CHECK (public.has_workspace_scope(client_id) AND public.is_admin_or_superadmin());

CREATE POLICY "Websites UPDATE: Superadmin, Admin, and Tech (technical fields)"
  ON public.websites FOR UPDATE
  USING (public.has_workspace_scope(client_id) AND public.is_tech_or_higher())
  WITH CHECK (public.has_workspace_scope(client_id) AND public.is_tech_or_higher());

CREATE POLICY "Websites DELETE: Superadmin only"
  ON public.websites FOR DELETE
  USING (public.is_superadmin());

-- PROJECTS & TASKS
DROP POLICY IF EXISTS "Authorized members manage projects" ON public.projects;
DROP POLICY IF EXISTS "Members view their client projects" ON public.projects;
DROP POLICY IF EXISTS "Members view client tasks" ON public.tasks;
DROP POLICY IF EXISTS "Members update their client tasks" ON public.tasks;

CREATE POLICY "Projects SELECT: Scoped members"
  ON public.projects FOR SELECT
  USING (public.has_workspace_scope(client_id));

CREATE POLICY "Projects ALL: Superadmin and Admin within scope"
  ON public.projects FOR ALL
  USING (public.has_workspace_scope(client_id) AND public.is_admin_or_superadmin())
  WITH CHECK (public.has_workspace_scope(client_id) AND public.is_admin_or_superadmin());

CREATE POLICY "Tasks SELECT: Scoped members"
  ON public.tasks FOR SELECT
  USING (public.has_workspace_scope(client_id));

CREATE POLICY "Tasks UPDATE: Superadmin, Admin, and Tech (status updates)"
  ON public.tasks FOR UPDATE
  USING (public.has_workspace_scope(client_id) AND public.is_tech_or_higher())
  WITH CHECK (public.has_workspace_scope(client_id) AND public.is_tech_or_higher());

-- SUPPORT TICKETS & MESSAGES
DROP POLICY IF EXISTS "Members view client tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Members create client tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Members update client tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Members view ticket messages (excluding internal staff notes)" ON public.ticket_messages;
DROP POLICY IF EXISTS "Members send messages to authorized tickets" ON public.ticket_messages;

CREATE POLICY "Tickets SELECT: Scoped members"
  ON public.support_tickets FOR SELECT
  USING (public.has_workspace_scope(client_id));

CREATE POLICY "Tickets INSERT: Owners, Admins, Techs, Superadmins"
  ON public.support_tickets FOR INSERT
  WITH CHECK (public.has_workspace_scope(client_id));

CREATE POLICY "Tickets UPDATE: Staff (Superadmin, Admin, Tech)"
  ON public.support_tickets FOR UPDATE
  USING (public.has_workspace_scope(client_id) AND public.is_tech_or_higher());

CREATE POLICY "Messages SELECT: Non-internal to all scoped members; internal notes hidden from Owner"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND public.has_workspace_scope(t.client_id)
    ) AND (NOT is_internal OR public.is_tech_or_higher())
  );

CREATE POLICY "Messages INSERT: Authorized scoped members"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND public.has_workspace_scope(t.client_id)
    )
  );

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "Members view client activity logs; admins view all" ON public.activity_logs;

CREATE POLICY "Activity Logs SELECT: Superadmin sees all; Admin sees assigned scope; Tech and Owner denied"
  ON public.activity_logs FOR SELECT
  USING (
    public.is_superadmin() OR
    (public.is_admin_or_superadmin() AND client_id IS NOT NULL AND public.has_workspace_scope(client_id))
  );

-- 5. INITIAL SUPERADMIN PROVISIONING QUERY (Documentation procedure)
-- To provision your initial superadmin, run:
-- UPDATE public.profiles SET role = 'superadmin' WHERE email = 'admin@bizchefs.com';
