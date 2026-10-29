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
        message: 'Google OAuth client credentials are not yet configured in environment variables (GOOGLE_CLIENT_ID missing).',
      },
      { status: 503 }
    );
  }

  // Extract client workspace if provided
  const workspaceClientId = request.nextUrl.searchParams.get('clientId') || '';

  // Generate cryptographically secure CSRF state token
  const csrfToken = crypto.randomBytes(32).toString('hex');
  const statePayload = Buffer.from(
    JSON.stringify({ csrf: csrfToken, clientId: workspaceClientId })
  ).toString('base64url');

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
  authUrl.searchParams.set('state', statePayload);

  const response = NextResponse.redirect(authUrl.toString());

  // Store CSRF in secure HTTP-only cookie
  response.cookies.set('bizchefs_oauth_csrf', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });

  return response;
}
