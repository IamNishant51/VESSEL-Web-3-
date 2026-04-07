import { cookies } from "next/headers";
import crypto from "crypto";

const CSRF_COOKIE_NAME = "vessel-csrf-token";
const CSRF_HEADER_NAME = "x-vessel-csrf-token";

export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export function setCsrfCookieHeaders(headers: Headers): string {
  const token = generateCsrfToken();
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  headers.set("Set-Cookie", `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Strict${secure}; Max-Age=3600`);
  headers.set(CSRF_HEADER_NAME, token);
  return token;
}

export function validateCsrfToken(token: string, expectedToken: string | null): boolean {
  if (!token || !expectedToken) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expectedToken));
  } catch {
    return false;
  }
}

export function getExpectedCsrfToken(request: Request): string | null {
  return request.headers.get(CSRF_HEADER_NAME);
}
