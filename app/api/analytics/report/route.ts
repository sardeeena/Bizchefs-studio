import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const websiteId = searchParams.get('websiteId');
  const range = searchParams.get('range') || '28d';

  if (!websiteId) {
    return NextResponse.json(
      { error: 'BAD_REQUEST', message: 'websiteId query parameter is required' },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();

  // 1. Fetch website details
  const { data: website } = await adminSupabase
    .from('websites')
    .select('id, name, domain, client_id, ga4_property_id, search_console_site_url')
    .eq('id', websiteId)
    .single();

  if (!website) {
    // If not found in database, check if client has configured Google connection
    return NextResponse.json(
      {
        connected: false,
        websiteId,
        message: 'No website record found or Google integration is not yet connected.',
      },
      { status: 200 }
    );
  }

  // 2. Check if client has an active Google Connection
  const { data: connection } = await adminSupabase
    .from('google_connections')
    .select('id, google_email, is_connected, updated_at')
    .eq('client_id', website.client_id)
    .eq('is_connected', true)
    .single();

  if (!connection) {
    return NextResponse.json(
      {
        connected: false,
        websiteId,
        domain: website.domain,
        message: 'Google Analytics 4 & Google Search Console are not yet connected for this client workspace.',
      },
      { status: 200 }
    );
  }

  // 3. Return connected telemetry status
  return NextResponse.json(
    {
      connected: true,
      websiteId,
      domain: website.domain,
      googleEmail: connection.google_email,
      lastSyncedAt: connection.updated_at,
      range,
      source: 'google_analytics_data_api_v1',
      metrics: {
        monthlyUsers: 0,
        usersGrowthPct: 0,
        monthlySessions: 0,
        monthlyPageviews: 0,
        bounceRatePct: 0,
        avgSessionDurationSeconds: 0,
      },
      searchConsole: {
        clicks: 0,
        impressions: 0,
        ctrPct: 0,
        avgPosition: 0,
        topQueries: [],
      },
      topPages: [],
      acquisitionSources: [],
      dailyTraffic: [],
    },
    { status: 200 }
  );
}
