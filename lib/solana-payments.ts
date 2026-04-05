import { Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";

import { solanaRpcUrl } from "@/lib/solana";

export type ConfirmedPayment = {
  transactionSignature: string;
  explorerUrl: string;
};

export async function sendConfirmedSolTransfer(params: {
  wallet: WalletContextState;
  to: string;
  amountSol: number;
}): Promise<ConfirmedPayment> {
  const { wallet, to, amountSol } = params;

  if (!wallet.publicKey) {
    throw new Error("Connect wallet before sending payment.");
  }

  if (amountSol <= 0 || !Number.isFinite(amountSol)) {
    throw new Error("Transfer amount must be a valid positive number.");
  }

  const connection = new Connection(solanaRpcUrl, "confirmed");
  const recipient = new PublicKey(to);
  const lamports = Math.max(1, Math.round(amountSol * 1_000_000_000));

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: recipient,
      lamports,
    }),
  );

  const signature = await wallet.sendTransaction(tx, connection);
  await connection.confirmTransaction(signature, "confirmed");

  return {
    transactionSignature: signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  };
}
