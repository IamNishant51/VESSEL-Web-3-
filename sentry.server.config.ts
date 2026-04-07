import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACE_SAMPLE_RATE || '0.1'),
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.01'),
    release: process.env.PACKAGE_VERSION || '0.1.0',
    ignoreErrors: [
      'chrome-extension://',
      'moz-extension://',
      'NetworkError',
      'Network request failed',
    ],
    beforeSend(event) {
      if (event?.exception?.values?.[0]?.value?.includes?.('404')) {
        return null;
      }
      return event;
    },
  });
}
