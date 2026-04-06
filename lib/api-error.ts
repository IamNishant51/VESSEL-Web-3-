import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiErrorCode =
  | "INTERNAL_ERROR"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "SERVER_ERROR";

export interface ApiError {
  success: false;
  errorCode: ApiErrorCode;
  error: string;
  details?: Record<string, unknown>;
}

export function successResponse<T>(data: T, options?: { cacheSeconds?: number }): NextResponse<T> {
  const headers: Record<string, string> = {};
  if (options?.cacheSeconds) {
    headers["Cache-Control"] = `public, max-age=${options.cacheSeconds}`;
  }
  return NextResponse.json(data, { headers });
}

export function errorResponse(
  errorCode: ApiErrorCode,
  error: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      errorCode,
      error,
      ...(details && { details }),
    },
    { status }
  );
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiError> {
  const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  return errorResponse("VALIDATION_ERROR", messages.join("; "), 400, {
    validationErrors: error.errors,
  });
}

export function notFoundError(resource: string): NextResponse<ApiError> {
  return errorResponse("NOT_FOUND", `${resource} not found`, 404);
}

export function unauthorizedError(message = "Unauthorized"): NextResponse<ApiError> {
  return errorResponse("UNAUTHORIZED", message, 401);
}

export function forbiddenError(message = "Forbidden"): NextResponse<ApiError> {
  return errorResponse("FORBIDDEN", message, 403);
}

export function rateLimitedError(retryAfter?: number): NextResponse<ApiError> {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers["Retry-After"] = String(retryAfter);
  }
  return errorResponse("RATE_LIMITED", "Too many requests. Try again later.", 429);
}

export function internalError(details?: Record<string, unknown>): NextResponse<ApiError> {
  return errorResponse("SERVER_ERROR", "An internal error occurred", 500, details);
}
