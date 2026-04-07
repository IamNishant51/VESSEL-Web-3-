import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACE_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE || '0.01'),
    release: process.env.NEXT_PUBLIC_PACKAGE_VERSION || '0.1.0',
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'chrome-extension://',
      'moz-extension://',
    ],
  });
}
