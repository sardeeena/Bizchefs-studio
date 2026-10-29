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
    const { password, confirmPassword } = body;

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Password and password confirmation are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'MISMATCH', message: 'Passwords do not match.' },
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: 'UNAUTHORIZED',
          message: 'Your password reset session has expired or is invalid. Please request a new reset link.',
        },
        { status: 401 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'UPDATE_FAILED', message: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password successfully updated. You may now log in with your new credentials.',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Password update service error';
    return NextResponse.json(
      { error: 'SERVER_ERROR', message },
      { status: 500 }
    );
  }
}
