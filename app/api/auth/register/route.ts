import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit, extractClientIp, buildRateLimitResponse, RATE_LIMIT_PRESETS } from '@/lib/security/rate-limiter';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request);
    const rateLimit = await checkRateLimit(ip, RATE_LIMIT_PRESETS.authRegister);

    if (!rateLimit.allowed) {
      return buildRateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const { email, password, fullName, organizationName } = body;

    if (!email || !password || !fullName || !organizationName) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'All fields are required: Full Name, Organization Name, Work Email, and Password.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL', message: 'Please provide a valid work email address.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const adminSupabase = createAdminClient();

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          organization_name: organizationName.trim(),
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        {
          error: 'SIGNUP_FAILED',
          message: authError?.message || 'Unable to register account. Please try again.',
        },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // 2. Insert or update profile with 'owner' role
    await adminSupabase.from('profiles').upsert({
      id: userId,
      email: cleanEmail,
      full_name: fullName.trim(),
      role: 'owner',
    });

    // 3. Create client workspace record
    let baseSlug = slugify(organizationName.trim()) || 'client';
    // Append short suffix for uniqueness
    const slugSuffix = crypto.randomBytes(3).toString('hex');
    const clientSlug = `${baseSlug}-${slugSuffix}`;

    const { data: newClient, error: clientError } = await adminSupabase
      .from('clients')
      .insert({
        name: organizationName.trim(),
        slug: clientSlug,
        tier: 'growth',
        status: 'active',
        contact_email: cleanEmail,
      })
      .select('id, name, slug, tier, status')
      .single();

    if (!clientError && newClient) {
      // 4. Attach client membership as owner
      await adminSupabase.from('client_memberships').insert({
        client_id: newClient.id,
        user_id: userId,
        role: 'owner',
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        requiresEmailConfirmation: !authData.session,
        user: {
          id: userId,
          email: cleanEmail,
          name: fullName.trim(),
          role: 'owner',
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration service error';
    return NextResponse.json(
      { error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}
