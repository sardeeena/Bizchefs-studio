import { NextRequest, NextResponse } from 'next/server';
import { hostinger } from '@/lib/integrations/hostinger/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || (body.domain || body.websiteId ? 'check_live' : 'sync_all');

    if (action === 'sync_all') {
      const [sitesResult, ordersResult] = await Promise.all([
        hostinger.listWebsites(),
        hostinger.listHostingOrders(),
      ]);

      return NextResponse.json({
        success: sitesResult.success,
        websites: sitesResult.data,
        orders: ordersResult.data,
        error: sitesResult.error || ordersResult.error,
      });
    }

    const domain = body.domain || body.websiteId;
    if (!domain) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'Domain or websiteId is required' },
        { status: 400 }
      );
    }

    const cleanHost = domain.replace(/^https?:\/\//, '').split('/')[0];

    if (action === 'purge_cache') {
      const purgeResult = await hostinger.purgeEdgeCache(cleanHost);
      return NextResponse.json(purgeResult);
    }

    const result = await hostinger.checkLiveWebsite(cleanHost);
    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hostinger sync error';
    return NextResponse.json(
      { error: 'SYNC_FAILED', message },
      { status: 500 }
    );
  }
}
