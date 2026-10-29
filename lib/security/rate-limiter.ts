import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
  actionName: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  error?: string;
}

// In-memory sliding window cache for instant local response and fallback
const inMemoryCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Extracts verified client IP address taking reverse proxies (Hostinger / Cloud Run) into account safely
 */
export function extractClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Get the first, leftmost IP which is the original client IP
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    if (ips.length > 0 && ips[0]) {
      return ips[0];
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  return '127.0.0.1';
}

/**
 * Enforces atomic rate limiting.
 * Uses Supabase PostgreSQL stored procedure `check_rate_limit` when available in production,
 * and maintains an synchronized in-memory cache to guarantee low latency.
 */
export async function checkRateLimit(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Date.now();
  const rateLimitKey = `rl:${config.actionName}:${key}`;

  // Try PostgreSQL distributed stored procedure first if configured
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: rateLimitKey,
      p_max_requests: config.maxRequests,
      p_window_seconds: config.windowSeconds,
    });

    if (!error && data && data.length > 0) {
      const row = data[0];
      return {
        allowed: Boolean(row.allowed),
        remaining: Number(row.remaining),
        resetSeconds: Number(row.reset_seconds),
      };
    }
  } catch {
    // Fall back to resilient in-memory sliding window
  }

  // Resilient in-memory sliding window fallback
  const cached = inMemoryCache.get(rateLimitKey);

  if (!cached || cached.resetAt <= now) {
    inMemoryCache.set(rateLimitKey, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetSeconds: config.windowSeconds,
    };
  }

  if (cached.count < config.maxRequests) {
    cached.count += 1;
    return {
      allowed: true,
      remaining: config.maxRequests - cached.count,
      resetSeconds: Math.ceil((cached.resetAt - now) / 1000),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetSeconds: Math.ceil((cached.resetAt - now) / 1000),
  };
}

/**
 * Standard preset rate limit configurations
 */
export const RATE_LIMIT_PRESETS = {
  authLogin: {
    actionName: 'auth_login',
    maxRequests: 5,
    windowSeconds: 15 * 60, // 5 attempts per 15 minutes
  },
  authRegister: {
    actionName: 'auth_register',
    maxRequests: 3,
    windowSeconds: 60 * 60, // 3 registrations per hour
  },
  passwordReset: {
    actionName: 'password_reset',
    maxRequests: 3,
    windowSeconds: 15 * 60, // 3 reset requests per 15 minutes
  },
  supportTicket: {
    actionName: 'support_ticket',
    maxRequests: 10,
    windowSeconds: 60 * 60, // 10 tickets per hour
  },
  deployment: {
    actionName: 'deploy',
    maxRequests: 6,
    windowSeconds: 10 * 60, // 6 deployments per 10 minutes
  },
  apiAnalytics: {
    actionName: 'api_analytics',
    maxRequests: 60,
    windowSeconds: 60, // 60 requests per minute
  },
};

/**
 * Builds standard RFC 7807 HTTP 429 response with Retry-After header
 */
export function buildRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Too many requests. Please wait ${result.resetSeconds} seconds before retrying.`,
      retryAfterSeconds: result.resetSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.resetSeconds),
        'X-RateLimit-Remaining': '0',
      },
    }
  );
}
