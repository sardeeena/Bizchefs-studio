import { NextRequest, NextResponse } from 'next/server';
import { encryptToken } from '@/lib/crypto/encryption';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const savedState = request.cookies.get('bizchefs_oauth_state')?.value;

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?error=${encodeURIComponent('Google authorization was cancelled or denied: ' + error)}`, request.url)
    );
  }

  // Strict CSRF state validation
  if (!state || !savedState || state !== savedState) {
    return NextResponse.json(
      {
        error: 'INVALID_CSRF_STATE',
        message: 'Security validation failed: OAuth state mismatch or expired session.',
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
        message: 'Google OAuth client secret is missing in environment variables.',
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
    const refreshToken = tokenData.refresh_token;

    if (refreshToken) {
      // Encrypt the refresh token using AES-256-GCM before database insertion
      const encrypted = encryptToken(refreshToken);
      // In production, write `encrypted.encryptedData`, `encrypted.iv`, `encrypted.authTag` to `public.google_connections`
    }

    const response = NextResponse.redirect(new URL('/dashboard?google_connected=true', request.url));
    // Clear CSRF cookie
    response.cookies.delete('bizchefs_oauth_state');
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
