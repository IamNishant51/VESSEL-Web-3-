import { NextRequest, NextResponse } from 'next/server';
import { handleCSPViolation } from '@/lib/csp';

/**
 * CSP-Report endpoint
 * Receives Content Security Policy violation reports from browsers
 */
export async function POST(request: NextRequest) {
  return handleCSPViolation(request);
}

/**
 * Return 204 No Content for OPTIONS requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
