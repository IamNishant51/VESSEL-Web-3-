import * as Sentry from '@sentry/nextjs';
import { logger } from './logger';

const SENTRY_DSN = process.env.SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NODE_ENV || 'development';
const SENTRY_TRACE_SAMPLE_RATE = parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE || '0.1');
const SENTRY_PROFILES_SAMPLE_RATE = parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.01');

export function initializeSentry(): void {
  if (!SENTRY_DSN) {
    logger.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    tracesSampleRate: SENTRY_TRACE_SAMPLE_RATE,
    profilesSampleRate: SENTRY_PROFILES_SAMPLE_RATE,
    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException;
        if (error instanceof Error && error.message.includes('404')) {
          return null;
        }
      }
      return event;
    },
    release: process.env.PACKAGE_VERSION || '0.1.0',
    ignoreErrors: [
      'chrome-extension://',
      'moz-extension://',
      'NetworkError',
      'Network request failed',
    ],
  });

  logger.info('Sentry initialized for error tracking');
}

export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
): string | undefined {
  let message = 'Unknown error';
  
  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  logger.info({ message, context }, 'Error captured');

  if (!SENTRY_DSN) {
    return undefined;
  }

  const eventId = Sentry.captureException(error, {
    contexts: {
      custom: context || {},
    },
  });

  return eventId;
}

export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): string | undefined {
  if (!SENTRY_DSN) {
    return undefined;
  }

  return Sentry.captureMessage(message, level);
}

export async function withErrorTracking<T>(
  fn: () => Promise<T>,
  context: string,
  metadata?: Record<string, unknown>
): Promise<T> {
  try {
    return await Sentry.startSpan({ name: context, op: 'function.execution' }, async () => {
      return await fn();
    });
  } catch (error) {
    const eventId = captureException(error, {
      context,
      ...metadata,
    });

    throw new Error(`${context} failed (Sentry ID: ${eventId || 'N/A'})`);
  }
}

export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

export function setSentryUser(
  walletAddress: string,
  metadata?: Record<string, unknown>
): void {
  Sentry.setUser({
    id: walletAddress,
    username: walletAddress.slice(0, 8),
    ...metadata,
  });
}

export function clearSentryUser(): void {
  Sentry.setUser(null);
}

export default {
  initializeSentry,
  captureException,
  captureMessage,
  withErrorTracking,
  addBreadcrumb,
  setSentryUser,
  clearSentryUser,
};
