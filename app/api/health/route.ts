import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      app: 'BizChefs Studio',
      domain: 'studio.bizchefs.com',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV || 'production',
      services: {
        database: 'configured',
        hostingerAdapter: 'ready',
        googleOAuth: 'configured',
      },
    },
    { status: 200 }
  );
}
