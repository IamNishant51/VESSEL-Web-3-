type LogLevel = "info" | "warn" | "error" | "security";

type AuditEvent = {
  timestamp?: string;
  level: LogLevel;
  event: string;
  userId?: string;
  agentId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
};

function formatLogEntry(event: AuditEvent): string {
  return JSON.stringify({
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  });
}

function shouldLog(level: LogLevel): boolean {
  if (process.env.NODE_ENV === "production") {
    return true;
  }
  return level === "error" || level === "security";
}

export function auditLog(event: AuditEvent): void {
  if (!shouldLog(event.level)) {
    return;
  }

  const entry = formatLogEntry(event);

  switch (event.level) {
    case "error":
      console.error(entry);
      break;
    case "warn":
      console.warn(entry);
      break;
    case "security":
      console.error(entry);
      break;
    default:
      console.log(entry);
      break;
  }
}

export function logWalletConnect(walletAddress: string, ip?: string, userAgent?: string): void {
  auditLog({
    level: "info",
    event: "wallet_connect",
    userId: walletAddress,
    ip,
    userAgent,
    details: { walletType: "solana" },
  });
}

export function logAgentCreated(agentId: string, owner: string, ip?: string): void {
  auditLog({
    level: "info",
    event: "agent_created",
    userId: owner,
    agentId,
    ip,
  });
}

export function logAgentDeleted(agentId: string, owner: string, ip?: string): void {
  auditLog({
    level: "warn",
    event: "agent_deleted",
    userId: owner,
    agentId,
    ip,
  });
}

export function logAuthFailure(publicKey: string, reason: string, ip?: string): void {
  auditLog({
    level: "security",
    event: "auth_failure",
    userId: publicKey,
    details: { reason },
    ip,
  });
}

export function logRateLimitExceeded(ip: string, endpoint: string): void {
  auditLog({
    level: "security",
    event: "rate_limit_exceeded",
    details: { ip, endpoint },
    ip,
  });
}

export function logApiError(endpoint: string, error: string, ip?: string): void {
  auditLog({
    level: "error",
    event: "api_error",
    details: { endpoint, error },
    ip,
  });
}
