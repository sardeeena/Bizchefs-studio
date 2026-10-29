import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { decryptToken } from '@/lib/crypto/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'clientId is required to disconnect integration.' },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const { data: connection } = await adminSupabase
      .from('google_connections')
      .select('encrypted_refresh_token, token_iv, auth_tag, key_version')
      .eq('client_id', clientId)
      .single();

    if (connection) {
      try {
        const decryptedRefreshToken = decryptToken({
          version: connection.key_version,
          encryptedData: connection.encrypted_refresh_token,
          iv: connection.token_iv,
          authTag: connection.auth_tag,
        });

        // Revoke token with Google
        await fetch(`https://oauth2.googleapis.com/revoke?token=${decryptedRefreshToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
      } catch {
        // Proceed even if upstream token was already revoked
      }

      await adminSupabase
        .from('google_connections')
        .delete()
        .eq('client_id', clientId);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Google Analytics & Search Console integration disconnected successfully.',
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error disconnecting integration';
    return NextResponse.json(
      { error: 'DISCONNECT_FAILED', message },
      { status: 500 }
    );
  }
}
