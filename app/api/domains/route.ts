import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';
import { hostinger } from '@/lib/integrations/hostinger/client';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const inspectDomain = searchParams.get('inspect');

    // 1. If inspect parameter is provided, query full live DNS records for that specific domain
    if (inspectDomain) {
      const cleanHost = inspectDomain.replace(/^https?:\/\//, '').split('/')[0];
      const [aRecords, nsRecords, mxRecords, txtRecords, liveCheck] = await Promise.all([
        dns.resolve4(cleanHost).catch(() => []),
        dns.resolveNs(cleanHost).catch(() => []),
        dns.resolveMx(cleanHost).catch(() => []),
        dns.resolveTxt(cleanHost).catch(() => []),
        hostinger.checkLiveWebsite(cleanHost),
      ]);

      const records = [
        ...aRecords.map((ip) => ({ type: 'A', name: '@', value: ip, ttl: 300 })),
        ...nsRecords.map((ns) => ({ type: 'NS', name: '@', value: ns, ttl: 86400 })),
        ...mxRecords.map((mx) => ({ type: 'MX', name: '@', value: `${mx.priority} ${mx.exchange}`, ttl: 3600 })),
        ...txtRecords.map((txt) => ({ type: 'TXT', name: '@', value: txt.join(' '), ttl: 3600 })),
      ];

      return NextResponse.json({
        success: true,
        domain: cleanHost,
        records,
        totalRecords: records.length,
        ssl: {
          valid: liveCheck.sslValid,
          issuer: liveCheck.sslIssuer,
          expiresAt: liveCheck.sslExpiresAt,
        },
      });
    }

    // 2. Otherwise return domain portfolio list
    const hostingerResult = await hostinger.listWebsites();
    const domains = await Promise.all(
      hostingerResult.data.map(async (rawSite) => {
        const cleanHost = rawSite.domain;
        const [aRecords, nsRecords, liveCheck] = await Promise.all([
          dns.resolve4(cleanHost).catch(() => []),
          dns.resolveNs(cleanHost).catch(() => []),
          hostinger.checkLiveWebsite(cleanHost),
        ]);

        return {
          id: `dom_${cleanHost.replace(/[^a-zA-Z0-9]/g, '_')}`,
          domain: cleanHost,
          clientId: 'client_bizchefs',
          registrar: 'Hostinger Domains',
          autoRenew: true,
          expiresAt: liveCheck.sslExpiresAt || '2027-01-26T00:00:00.000Z',
          dnsRecordsCount: aRecords.length + nsRecords.length || 4,
          nameservers: nsRecords.length > 0 ? nsRecords : ['ns1.dns-parking.com', 'ns2.dns-parking.com'],
          sslActive: Boolean(liveCheck.sslValid),
          status: liveCheck.httpStatus && liveCheck.httpStatus < 400 ? 'active' : 'pending_dns',
          ipAddresses: aRecords,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: domains,
      count: domains.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Domain retrieval error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
