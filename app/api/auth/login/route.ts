import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, extractClientIp, buildRateLimitResponse, RATE_LIMIT_PRESETS } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request);
    const rateLimit = await checkRateLimit(ip, RATE_LIMIT_PRESETS.authLogin);

    if (!rateLimit.allowed) {
      return buildRateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Authenticate with Supabase Auth
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.user) {
      return NextResponse.json(
        {
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please check your credentials.',
        },
        { status: 401 }
      );
    }

    // Fetch user profile and workspace membership
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url')
      .eq('id', data.user.id)
      .single();

    const { data: memberships } = await supabase
      .from('client_memberships')
      .select('client_id, role, clients(id, name, slug, tier, status)')
      .eq('user_id', data.user.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          role: profile?.role || 'owner',
          avatarUrl: profile?.avatar_url || null,
        },
        memberships: memberships || [],
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication service error';
    return NextResponse.json(
      { error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}
