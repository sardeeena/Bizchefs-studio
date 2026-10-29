import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const adminSupabase = createAdminClient();

    // Fetch profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url')
      .eq('id', user.id)
      .single();

    // Fetch memberships and workspaces
    const { data: memberships } = await adminSupabase
      .from('client_memberships')
      .select('client_id, role, clients(id, name, slug, tier, status, active_care_plan)')
      .eq('user_id', user.id);

    // If superadmin, fetch all clients
    let allClients: Array<{ id: string; name: string; slug: string; tier: string; status: string; active_care_plan: string }> = [];
    if (profile?.role === 'superadmin') {
      const { data: clients } = await adminSupabase
        .from('clients')
        .select('id, name, slug, tier, status, active_care_plan')
        .order('name');
      allClients = clients || [];
    } else if (memberships) {
      allClients = memberships
        .map((m) => m.clients as unknown as { id: string; name: string; slug: string; tier: string; status: string; active_care_plan: string })
        .filter(Boolean);
    }

    const role = profile?.role || 'owner';
    const firstClient = allClients[0] || null;

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0],
          role,
          avatarUrl: profile?.avatar_url || null,
          clientId: firstClient?.id || null,
          assignedClientIds: allClients.map((c) => c.id),
        },
        clients: allClients,
        currentClient: firstClient,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Session verification error';
    return NextResponse.json({ authenticated: false, error: message }, { status: 500 });
  }
}
