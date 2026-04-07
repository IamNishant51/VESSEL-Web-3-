import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * Health check and monitoring endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.PACKAGE_VERSION || '0.1.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      services: {
        mongodb: process.env.MONGODB_URI ? 'configured' : 'not_configured',
        sentry: process.env.SENTRY_DSN ? 'configured' : 'not_configured',
        solana: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ? 'configured' : 'not_configured',
      },
    };

    logger.debug(health, 'Health check');

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logger.error({ error }, 'Health check failed');
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
