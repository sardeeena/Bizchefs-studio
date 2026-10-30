import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { canModifyUserRole } from '@/lib/auth/authorize';
import { UserRole } from '@/types';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();

    if (userError || !authUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required' }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: actorProfile } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', authUser.id)
      .single();

    const actor = {
      id: authUser.id,
      email: authUser.email || '',
      name: actorProfile?.full_name || 'Admin',
      role: (actorProfile?.role as UserRole) || 'owner',
      createdAt: new Date().toISOString(),
    };

    if (actor.role !== 'superadmin' && actor.role !== 'admin') {
      return NextResponse.json(
        { error: 'FORBIDDEN', message: 'Only authorized administrative staff can modify user roles.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetUserId, newRole } = body;

    if (!targetUserId || !newRole) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'targetUserId and newRole are required.' },
        { status: 400 }
      );
    }

    // Fetch target user profile
    const { data: targetProfile } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', targetUserId)
      .single();

    const targetUser = targetProfile
      ? {
          id: targetProfile.id,
          email: targetProfile.email,
          name: targetProfile.full_name,
          role: targetProfile.role as UserRole,
          createdAt: new Date().toISOString(),
        }
      : null;

    if (!targetUser) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Target user not found' }, { status: 404 });
    }

    // Role modification authorization check
    const check = canModifyUserRole(actor, targetUser, newRole as UserRole);
    if (!check.allowed) {
      return NextResponse.json({ error: 'FORBIDDEN', message: check.reason }, { status: 403 });
    }

    // Check last-superadmin protection
    if (targetUser.role === 'superadmin' && newRole !== 'superadmin') {
      const { count } = await adminSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'superadmin');

      if (count && count <= 1) {
        return NextResponse.json(
          { error: 'SECURITY_VIOLATION', message: 'Cannot demote the last active superadmin account.' },
          { status: 400 }
        );
      }
    }

    // Update in Supabase
    await adminSupabase.from('profiles').update({ role: newRole }).eq('id', targetUserId);

    // Record audit log
    try {
      await adminSupabase.from('audit_logs').insert({
        actor_id: actor.id,
        actor_name: actor.name,
        actor_role: actor.role,
        action: 'role.updated',
        resource_type: 'user',
        resource_id: targetUserId,
        details: { previousRole: targetUser.role, newRole },
      });
    } catch {
      // Ignore if audit table pending
    }

    return NextResponse.json({
      success: true,
      message: `User role successfully updated to ${newRole}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Role update error';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}
