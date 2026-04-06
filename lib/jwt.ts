import jwt from "jsonwebtoken";
import type { IUserDoc } from "@/lib/models";

interface JwtPayload {
  userId: string;
  walletAddress: string;
  iat?: number;
  exp?: number;
}

// Secret keys for JWT signing - in production, use environment variables
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key-change-in-production";

const JWT_EXPIRES_IN = "7d"; // Token expiration time
const JWT_REFRESH_EXPIRES_IN = "30d"; // Refresh token expiration time

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: IUserDoc): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    walletAddress: user.walletAddress,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Generate a refresh token for a user
 */
export function generateRefreshToken(user: IUserDoc): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    walletAddress: user.walletAddress,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

/**
 * Verify a JWT token and return the payload if valid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token and return the payload if valid
 */
export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded as JwtPayload;
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