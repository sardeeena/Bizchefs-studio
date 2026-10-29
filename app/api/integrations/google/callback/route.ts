import { NextRequest, NextResponse } from 'next/server';
import { encryptToken } from '@/lib/crypto/encryption';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const rawState = searchParams.get('state');
  const error = searchParams.get('error');

  const savedCsrf = request.cookies.get('bizchefs_oauth_csrf')?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('Google authorization cancelled or denied: ' + error)}`, request.url)
    );
  }

  if (!rawState || !savedCsrf) {
    return NextResponse.json(
      {
        error: 'INVALID_CSRF_STATE',
        message: 'Security validation failed: OAuth state mismatch or expired session.',
      },
      { status: 400 }
    );
  }

  let stateData: { csrf: string; clientId?: string } | null = null;
  try {
    stateData = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf8'));
  } catch {
    return NextResponse.json(
      { error: 'CORRUPTED_STATE', message: 'Unable to parse OAuth state token' },
      { status: 400 }
    );
  }

  if (!stateData || stateData.csrf !== savedCsrf) {
    return NextResponse.json(
      {
        error: 'INVALID_CSRF_STATE',
        message: 'Security validation failed: CSRF token does not match browser session.',
      },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      {
        error: 'MISSING_AUTHORIZATION_CODE',
        message: 'Authorization code is required from Google callback.',
      },
      { status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'https://studio.bizchefs.com/api/integrations/google/callback';

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        error: 'SERVER_MISCONFIGURED',
        message: 'Google OAuth client credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing.',
      },
      { status: 500 }
    );
  }

  try {
    // Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      return NextResponse.json(
        {
          error: 'TOKEN_EXCHANGE_FAILED',
          message: 'Failed to exchange authorization code with Google token endpoint.',
          details: errBody,
        },
        { status: 400 }
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch Google profile email
    let googleEmail = 'google-account@connected';
    let googleUserId = '';
    try {
      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userRes.ok) {
        const userInfo = await userRes.json();
        googleEmail = userInfo.email || googleEmail;
        googleUserId = userInfo.id || '';
      }
    } catch {
      // Continue if userinfo fails
    }

    // Encrypt and persist refresh token if provided
    if (refreshToken) {
      const encrypted = encryptToken(refreshToken);
      const adminSupabase = createAdminClient();

      if (stateData.clientId) {
        await adminSupabase.from('google_connections').upsert({
          client_id: stateData.clientId,
          google_user_id: googleUserId,
          google_email: googleEmail,
          encrypted_refresh_token: encrypted.encryptedData,
          token_iv: encrypted.iv,
          auth_tag: encrypted.authTag,
          key_version: encrypted.version,
          is_connected: true,
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    const response = NextResponse.redirect(
      new URL('/dashboard?google_connected=true', request.url)
    );
    response.cookies.delete('bizchefs_oauth_csrf');
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'OAUTH_CALLBACK_EXCEPTION',
        message: 'Unexpected failure during OAuth token verification.',
        details: message,
      },
      { status: 500 }
    );
  }
}
