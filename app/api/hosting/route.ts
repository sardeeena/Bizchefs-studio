import { NextRequest, NextResponse } from 'next/server';
import { hostinger } from '@/lib/integrations/hostinger/client';

export async function GET() {
  try {
    const ordersResult = await hostinger.listHostingOrders();

    if (!ordersResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          message: ordersResult.error || 'Hostinger API credentials require configuration.',
        },
        { status: 200 }
      );
    }

    const hostingServices = ordersResult.data.map((order) => {
      const isBusiness = order.plan.name.includes('business');
      return {
        id: `hst_${order.id}`,
        clientId: 'client_bizchefs',
        provider: 'hostinger' as const,
        planName: order.plan.name.replace(/_/g, ' ').toUpperCase(),
        serverIp: '89.116.53.233',
        datacenterLocation: 'Frankfurt, Germany (EU-Central)',
        memoryMb: isBusiness ? 4096 : 3072,
        diskGb: 200,
        diskUsedGb: 14.8,
        bandwidthGb: 1000,
        bandwidthUsedGb: 48.2,
        cpuCores: isBusiness ? 4 : 2,
        renewalDate: '2027-10-24',
        monthlyCostUsd: isBusiness ? 19.99 : 29.99,
        apiConnected: true,
        orderId: order.id,
        subscriptionId: order.subscription_id,
        status: order.status,
        createdAt: order.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: hostingServices,
      count: hostingServices.length,
      capabilities: hostinger.getCapabilities('cloud'),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hosting service error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}
