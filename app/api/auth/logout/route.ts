import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true, message: 'Logged out successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Sign out error';
    return NextResponse.json({ error: 'SERVER_ERROR', message }, { status: 500 });
  }
}
