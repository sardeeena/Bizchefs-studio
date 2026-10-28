import { createClient } from '@supabase/supabase-js';

/**
 * Privileged Supabase Admin Client
 *
 * Rules:
 * - Server-side ONLY. Never import into client components.
 * - Used exclusively for administrative operations (client workspace provisioning,
 *   secure token writing, system audit logging) that have passed authorization assertions.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo-project.supabase.co';
  const serviceKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_SECRET_KEY is required in production for privileged database operations.');
    }
    return createClient(supabaseUrl, 'dummy_service_role_key_for_development', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
