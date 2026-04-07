import jwt from "jsonwebtoken";
import type { IUserDoc } from "@/lib/models";

interface JwtPayload {
  userId: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET_FALLBACK = "your-super-secret-jwt-key-change-in-production";
const JWT_REFRESH_SECRET_FALLBACK = "your-super-secret-refresh-key-change-in-production";

function getJwtSecret(name: "JWT_SECRET" | "JWT_REFRESH_SECRET", fallback: string): string {
  const value = process.env[name];

  if (!value || value === fallback) {
    throw new Error(`${name} environment variable is required and must be changed from default in production`);
  }

  return value;
}

const JWT_EXPIRES_IN = "7d"; // Token expiration time
const JWT_REFRESH_EXPIRES_IN = "30d"; // Refresh token expiration time

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: IUserDoc): string {
  const jwtSecret = getJwtSecret("JWT_SECRET", JWT_SECRET_FALLBACK);
  const payload: JwtPayload = {
    userId: user._id.toString(),
    walletAddress: user.walletAddress,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(user: IUserDoc): string {
  const jwtRefreshSecret = getJwtSecret("JWT_REFRESH_SECRET", JWT_REFRESH_SECRET_FALLBACK);
  const payload: JwtPayload = {
    userId: user._id.toString(),
    walletAddress: user.walletAddress,
  };

  return jwt.sign(payload, jwtRefreshSecret, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify a JWT token and return the payload if valid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret("JWT_SECRET", JWT_SECRET_FALLBACK));
    return decoded as unknown as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token and return the payload if valid
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret("JWT_REFRESH_SECRET", JWT_REFRESH_SECRET_FALLBACK));
    return decoded as unknown as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(header: string | undefined): string | null {
  if (!header) return null;

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;

  return parts[1];
}