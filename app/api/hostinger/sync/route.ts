import { NextRequest, NextResponse } from 'next/server';
import { hostinger } from '@/lib/integrations/hostinger/client';
import { DEMO_WEBSITES } from '@/lib/data/mock-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { websiteId } = body;

    if (!websiteId) {
      return NextResponse.json(
        { error: 'BAD_REQUEST', message: 'websiteId is required' },
        { status: 400 }
      );
    }

    const website = DEMO_WEBSITES.find((w) => w.id === websiteId);
    if (!website) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Website not found' },
        { status: 404 }
      );
    }

    const result = await hostinger.syncWebsiteStatus(
      website.hostingerDomainId || 'hst_site_882910',
      website.domain
    );

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hostinger sync error';
    return NextResponse.json(
      { error: 'SYNC_FAILED', message },
      { status: 500 }
    );
  }
}
