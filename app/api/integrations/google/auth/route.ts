import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri =
    process.env.GOOGLE_REDIRECT_URI || 'https://studio.bizchefs.com/api/integrations/google/callback';

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'GOOGLE_AUTH_UNCONFIGURED',
        message: 'Google OAuth client credentials are not yet configured in environment variables.',
      },
      { status: 503 }
    );
  }

  // Generate cryptographically secure CSRF state token
  const state = crypto.randomBytes(32).toString('hex');

  const scopes = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ].join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl.toString());

  // Store state in secure HTTP-only cookie with SameSite=Lax for CSRF verification
  response.cookies.set('bizchefs_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
