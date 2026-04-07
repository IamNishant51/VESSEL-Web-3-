/**
 * Content Security Policy (CSP) Reporting
 * Monitor and report CSP violations across the application
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';
import { captureException } from './sentry';

export interface CSPViolation {
  'document-uri': string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'disposition': 'enforce' | 'report';
  'blocked-uri': string;
  'line-number'?: number;
  'column-number'?: number;
  'source-file'?: string;
  'status-code'?: number;
}

interface CSPReport {
  'csp-report': CSPViolation;
}

/**
 * CSP Violation severity levels
 */
function calculateViolationSeverity(violation: CSPViolation): 'low' | 'medium' | 'high' {
  const directive = violation['violated-directive'];
  const blockedUri = violation['blocked-uri'];

  // High severity: script-src violations (potential XSS)
  if (directive.includes('script-src') || directive.includes('script-src-attr')) {
    return 'high';
  }

  // High severity: wildcard blocks on critical directives
  if (
    (directive.includes('connect-src') || directive.includes('object-src')) &&
    blockedUri.includes('*')
  ) {
    return 'high';
  }

  // Medium severity: style-src violations
  if (directive.includes('style-src')) {
    return 'medium';
  }

  // Low severity: other directives
  return 'low';
}

/**
 * Handle CSP violation report from browser
 */
export async function handleCSPViolation(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => null)) as CSPReport | null;

    if (!body || !body['csp-report']) {
      return NextResponse.json({ status: 'invalid' }, { status: 400 });
    }

    const violation = body['csp-report'];
    const severity = calculateViolationSeverity(violation);

    // Log violation
    logger.warn({
      directive: violation['violated-directive'],
      blockedUri: violation['blocked-uri'],
      documentUri: violation['document-uri'],
      source: violation['source-file'],
      severity,
    }, 'CSP Violation detected');

    // Send to error tracking if high severity
    if (severity === 'high') {
      captureException(
        new Error(`CSP Violation: ${violation['violated-directive']}`),
        {
          type: 'csp_violation',
          severity,
          violation,
        }
      );
    }

    return NextResponse.json({ status: 'reported' }, { status: 204 });
  } catch (error) {
    logger.error({ error }, 'Failed to process CSP report');
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

/**
 * Generate CSP header with reporting endpoint
 * Should be used in middleware or layout
 */
export function generateCSPHeader(reportUri: string = '/api/security/csp-report'): string {
  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'media-src': ["'self'", 'https:'],
    'connect-src': [
      "'self'",
      'https://api.solana.com',
      'https://rpc.ankr.com/solana',
      'https://api.coingecko.com',
      'https://api.imagekit.io',
      `https://${process.env.NEXT_PUBLIC_IMAGEKIT_DOMAIN || 'ik.imagekit.io'}`,
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'report-uri': [reportUri],
    'report-to': ['csp-endpoint'],
  };

  const headerValue = Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');

  return headerValue;
}

/**
 * CSP Report-Only header (for testing without blocking)
 */
export function generateCSPReportOnlyHeader(reportUri: string = '/api/security/csp-report'): string {
  return generateCSPHeader(reportUri) + '; report-only';
}

/**
 * Collect CSP statistics
 */
export class CSPReportCollector {
  private violations: CSPViolation[] = [];
  private violationCounts: Map<string, number> = new Map();

  addViolation(violation: CSPViolation): void {
    this.violations.push(violation);

    const key = `${violation['violated-directive']}:${violation['blocked-uri']}`;
    this.violationCounts.set(key, (this.violationCounts.get(key) || 0) + 1);

    // Log if threshold exceeded
    const count = this.violationCounts.get(key) || 0;
    if (count > 10) {
      logger.error({
        directive: violation['violated-directive'],
        blockedUri: violation['blocked-uri'],
        count,
      }, 'CSP Violation threshold exceeded');
    }
  }

  getStats(): {
    totalViolations: number;
    topViolations: Array<[string, number]>;
  } {
    const sorted = Array.from(this.violationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return {
      totalViolations: this.violations.length,
      topViolations: sorted,
    };
  }

  clear(): void {
    this.violations = [];
    this.violationCounts.clear();
  }
}

export default {
  handleCSPViolation,
  generateCSPHeader,
  generateCSPReportOnlyHeader,
  CSPReportCollector,
};
