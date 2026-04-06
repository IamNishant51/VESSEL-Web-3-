import { cookies } from "next/headers";

const CSRF_COOKIE_NAME = "vessel-csrf-token";
const CSRF_HEADER_NAME = "x-vessel-csrf-token";

export function getCsrfTokenFromCookie(): string {
  return "";
}

export function setCsrfCookieHeaders(headers: Headers): void {
  const token = generateCsrfToken();
  headers.set("Set-Cookie", `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`);
  headers.set(CSRF_HEADER_NAME, token);
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function validateCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  return token === expectedToken;
}

export function getExpectedCsrfToken(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}
