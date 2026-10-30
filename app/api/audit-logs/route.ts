import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const adminSupabase = createAdminClient();
    const clientId = request.nextUrl.searchParams.get('clientId');

    let query = adminSupabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: 'No audit logs recorded yet.',
      });
    }

    const logs = (data || []).map((l) => ({
      id: l.id,
      actorName: l.actor_name,
      actorRole: l.actor_role,
      action: l.action,
      resourceType: l.resource_type,
      resourceId: l.resource_id,
      details: l.details,
      createdAt: l.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: logs,
      count: logs.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit log retrieval error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
