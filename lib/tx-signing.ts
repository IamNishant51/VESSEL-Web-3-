import { Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { getLogger } from './logger';
import { captureException } from './sentry';

const logger = getLogger('tx-signing');

export function signData(data: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return nacl.sign.detached(data, secretKey);
}

export function verifySignature(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: PublicKey
): boolean {
  try {
    return nacl.sign.detached.verify(data, signature, publicKey.toBytes());
  } catch (error) {
    logger.error({ error }, 'Signature verification failed');
    return false;
  }
}

export interface SignedTransactionRequest {
  transaction: string;
  blockhash: string;
  requestData: {
    action: string;
    timestamp: number;
    nonce: string;
  };
  requestSignature: string;
  publicKey: string;
  expiresAt?: number;
}

export async function createSignedTransactionRequest(
  transaction: Transaction | VersionedTransaction,
  action: string,
  secretKey: Uint8Array,
  expiresIn: number = 5 * 60 * 1000
): Promise<SignedTransactionRequest> {
  try {
    const keypair = secretKey.length === 64
      ? Keypair.fromSecretKey(secretKey)
      : Keypair.fromSeed(secretKey.slice(0, 32));
    
    const txBuffer = transaction instanceof VersionedTransaction
      ? transaction.serialize()
      : transaction.serialize();
    
    const txBase64 = Buffer.from(txBuffer).toString('base64');
    
    const nonce = Buffer.from(nacl.randomBytes(32)).toString('hex');
    const timestamp = Date.now();
    const expiresAt = timestamp + expiresIn;
    
    const requestData = {
      action,
      timestamp,
      nonce,
    };
    
    const requestDataJson = JSON.stringify(requestData);
    const requestDataBytes = new TextEncoder().encode(requestDataJson);
    const requestSignature = signData(requestDataBytes, secretKey);
    
    logger.info({ action, expiresIn }, 'Signed transaction request created');
    
    let blockhash = '';
    if (transaction instanceof Transaction) {
      blockhash = transaction.recentBlockhash || '';
    } else if ('message' in transaction && 'recentBlockhash' in transaction.message) {
      blockhash = (transaction.message as { recentBlockhash?: string }).recentBlockhash || '';
    }
    
    return {
      transaction: txBase64,
      blockhash,
      requestData,
      requestSignature: Buffer.from(requestSignature).toString('base64'),
      publicKey: keypair.publicKey.toBase58(),
      expiresAt,
    };
  } catch (error) {
    logger.error({ error }, 'Failed to create signed transaction request');
    throw error;
  }
}

export function verifySignedTransactionRequest(
  request: SignedTransactionRequest
): { valid: boolean; reason?: string } {
  try {
    if (request.expiresAt && Date.now() > request.expiresAt) {
      return { valid: false, reason: 'Request expired' };
    }
    
    const requestDataJson = JSON.stringify(request.requestData);
    const requestDataBytes = new TextEncoder().encode(requestDataJson);
    const signatureBytes = Buffer.from(request.requestSignature, 'base64');
    const publicKey = new PublicKey(request.publicKey);
    
    const isValid = verifySignature(requestDataBytes, signatureBytes, publicKey);
    
    if (!isValid) {
      return { valid: false, reason: 'Invalid signature' };
    }
    
    return { valid: true };
  } catch (error) {
    logger.error({ error }, 'Failed to verify signed transaction request');
    captureException(error, { type: 'tx_verification_failed' });
    return { valid: false, reason: 'Verification error' };
  }
}

export function createServerTransactionSignature(
  transactionData: {
    action: string;
    walletAddress: string;
    amount?: number;
    description?: string;
  },
  serverSecretKey: Uint8Array
): string {
  try {
    const dataJson = JSON.stringify(transactionData);
    const dataBytes = new TextEncoder().encode(dataJson);
    const signature = signData(dataBytes, serverSecretKey);
    
    logger.info({ action: transactionData.action, walletAddress: transactionData.walletAddress }, 'Server transaction signature created');
    
    return Buffer.from(signature).toString('base64');
  } catch (error) {
    logger.error({ error }, 'Failed to create server transaction signature');
    throw error;
  }
}

export function verifyServerTransactionSignature(
  transactionData: {
    action: string;
    walletAddress: string;
    amount?: number;
    description?: string;
  },
  signature: string,
  serverPublicKey: PublicKey
): boolean {
  try {
    const dataJson = JSON.stringify(transactionData);
    const dataBytes = new TextEncoder().encode(dataJson);
    const signatureBytes = Buffer.from(signature, 'base64');
    
    return verifySignature(dataBytes, signatureBytes, serverPublicKey);
  } catch (error) {
    logger.error({ error }, 'Failed to verify server transaction signature');
    return false;
  }
}

export interface TransactionAuditEntry {
  transactionId: string;
  signer: string;
  action: string;
  timestamp: number;
  signature: string;
  verified: boolean;
  metadata?: Record<string, unknown>;
}

export function logTransactionAudit(
  entry: Omit<TransactionAuditEntry, 'timestamp'>
): void {
  logger.info({
    ...entry,
    timestamp: Date.now(),
  }, 'Transaction audit log');
}

export async function batchVerifyTransactionRequests(
  requests: SignedTransactionRequest[]
): Promise<Map<string, { valid: boolean; reason?: string }>> {
  const results = new Map<string, { valid: boolean; reason?: string }>();
  
  for (const request of requests) {
    const txId = request.requestData.nonce;
    results.set(txId, verifySignedTransactionRequest(request));
  }
  
  return results;
}

export default {
  signData,
  verifySignature,
  createSignedTransactionRequest,
  verifySignedTransactionRequest,
  createServerTransactionSignature,
  verifyServerTransactionSignature,
  logTransactionAudit,
  batchVerifyTransactionRequests,
};
