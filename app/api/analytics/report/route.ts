import { NextRequest, NextResponse } from 'next/server';
import { DEMO_ANALYTICS, DEMO_WEBSITES } from '@/lib/data/mock-db';

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

  const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
  if (!website) {
    return NextResponse.json(
      { error: 'NOT_FOUND', message: 'Website record not found' },
      { status: 404 }
    );
  }

  // Fetch verified analytics for this website
  const data = DEMO_ANALYTICS[websiteId] || DEMO_ANALYTICS['web_kemet_main'];

  return NextResponse.json(
    {
      websiteId,
      domain: website.domain,
      range,
      source: data.isMockData ? 'sandbox_telemetry' : 'google_analytics_data_api_v1',
      metrics: {
        monthlyUsers: data.monthlyUsers,
        usersGrowthPct: data.usersGrowthPct,
        monthlySessions: data.monthlySessions,
        monthlyPageviews: data.monthlyPageviews,
        bounceRatePct: data.bounceRatePct,
        avgSessionDurationSeconds: data.avgSessionDurationSeconds,
      },
      searchConsole: {
        clicks: data.searchClicks,
        impressions: data.searchImpressions,
        ctrPct: data.ctrPct,
        avgPosition: data.avgSearchPosition,
        topQueries: data.searchQueries,
      },
      topPages: data.topPages,
      acquisitionSources: data.acquisitionSources,
      dailyTraffic: data.dailyTraffic,
    },
    { status: 200 }
  );
}
