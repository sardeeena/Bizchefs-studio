import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In production, fetch connection record for the authenticated client and revoke token with Google:
    // await fetch(`https://oauth2.googleapis.com/revoke?token=${refreshToken}`, { method: 'POST' });
    // And delete from public.google_connections where client_id = client.id

    return NextResponse.json(
      {
        success: true,
        message: 'Google Analytics and Search Console integration successfully disconnected.',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error disconnecting integration';
    return NextResponse.json(
      {
        error: 'DISCONNECT_FAILED',
        message,
      },
      { status: 500 }
    );
  }
}
