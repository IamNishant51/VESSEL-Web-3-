import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "es", "fr", "ja", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap file)
     * - robots.txt (robots file)
     * - manifestateness.json (PWA manifest)
     * - sw.js (service worker)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|sw.js).*)",
  ],
};
