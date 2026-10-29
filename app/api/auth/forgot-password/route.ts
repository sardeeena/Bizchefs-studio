import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, extractClientIp, buildRateLimitResponse, RATE_LIMIT_PRESETS } from '@/lib/security/rate-limiter';

export async function POST(request: NextRequest) {
  try {
    const ip = extractClientIp(request);
    const rateLimit = await checkRateLimit(ip, RATE_LIMIT_PRESETS.passwordReset);

    if (!rateLimit.allowed) {
      return buildRateLimitResponse(rateLimit);
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabase = await createServerSupabaseClient();

    // Determine redirect origin
    const configuredAppUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    const origin = configuredAppUrl || request.nextUrl.origin || 'https://studio.bizchefs.com';
    const redirectTo = `${origin}/reset-password`;

    // Trigger Supabase Auth password reset email
    await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    // Uniform response to protect against user enumeration
    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists with this email address, a password reset link has been dispatched.',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password reset request failed';
    return NextResponse.json(
      { error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}
