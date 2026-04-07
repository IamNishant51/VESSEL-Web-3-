/**
 * Structured Logging with Pino
 * Centralized logger for all VESSEL platform operations
 */

import pino, { Logger } from 'pino';

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Base logger configuration
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

// Transport configuration for development (prettier output)
const transport = isDevelopment
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
        messageFormat: '{levelLabel} - {msg}',
      },
    }
  : undefined;

/**
 * Root logger instance
 */
export const logger: Logger = pino({
  level: logLevel,
  base: {
    env: process.env.NODE_ENV,
    service: 'vessel',
    version: process.env.PACKAGE_VERSION || '0.1.0',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && transport ? { transport } : {}),
});

/**
 * Get child logger for specific context
 */
export function getLogger(context: string): Logger {
  return logger.child({ context });
}

/**
 * Log API request
 */
export function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  userId?: string
): void {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  
  logger[level as 'error' | 'warn' | 'info']({
    type: 'api_request',
    method,
    path,
    statusCode,
    durationMs,
    userId,
  });
}

/**
 * Log authentication event
 */
export function logAuthEvent(
  event: 'login' | 'logout' | 'signup' | 'auth_failure',
  walletAddress: string,
  details?: Record<string, unknown>
): void {
  logger.info({
    type: 'auth_event',
    event,
    walletAddress,
    ...details,
  });
}

/**
 * Log blockchain transaction
 */
export function logBlockchainTx(
  txType: string,
  signature: string,
  status: 'pending' | 'confirmed' | 'failed',
  details?: Record<string, unknown>
): void {
  const level = status === 'failed' ? 'error' : 'info';
  
  logger[level as 'error' | 'info']({
    type: 'blockchain_tx',
    txType,
    signature,
    status,
    ...details,
  });
}

/**
 * Log agent execution
 */
export function logAgentExecution(
  agentId: string,
  action: string,
  result: 'success' | 'failure',
  durationMs: number,
  details?: Record<string, unknown>
): void {
  const level = result === 'failure' ? 'error' : 'info';
  
  logger[level as 'error' | 'info']({
    type: 'agent_execution',
    agentId,
    action,
    result,
    durationMs,
    ...details,
  });
}

/**
 * Log database operation
 */
export function logDatabaseOp(
  operation: 'query' | 'insert' | 'update' | 'delete',
  collection: string,
  durationMs: number,
  status: 'success' | 'error',
  details?: Record<string, unknown>
): void {
  const level = status === 'error' ? 'error' : 'debug';
  
  logger[level as 'error' | 'debug']({
    type: 'database_op',
    operation,
    collection,
    durationMs,
    status,
    ...details,
  });
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, unknown>
): void {
  const level = severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';
  
  logger[level as 'error' | 'warn' | 'info']({
    type: 'security_event',
    event,
    severity,
    ...details,
  });
}

export default logger;
