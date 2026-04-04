import {
  Keypair,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { MPL_BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

import { solanaRpcUrl } from "@/lib/solana";
import type { ForgeDraft } from "@/types/agent";

type MintInput = {
  owner: string;
  draft: ForgeDraft;
};

export type MintResult = {
  mintAddress: string;
  bubblegumProgram: string;
  signature: string;
  estimatedCostSol: string;
  simulated: boolean;
  agentName?: string;
};

export async function mintAgentSoulCnft({ owner, draft }: MintInput): Promise<MintResult> {
  try {
    const connection = new Connection(solanaRpcUrl, "confirmed");
    const ownerKey = new PublicKey(owner);

    const bubblegumProgram = MPL_BUBBLEGUM_PROGRAM_ID.toString();

    let signature: string;
    let mintedAssetAddress: string;

    try {
      const latest = await connection.getLatestBlockhash();
      signature = `${latest.blockhash.slice(0, 20)}-${ownerKey.toBase58().slice(0, 8)}`;
      mintedAssetAddress = Keypair.generate().publicKey.toBase58();
    } catch {
      signature = `sim_${Date.now()}_fallback`;
      mintedAssetAddress = Keypair.generate().publicKey.toBase58();
    }

    const estimatedCost = draft.name.length > 0 ? "0.0021" : "0.0015";

    return {
      mintAddress: mintedAssetAddress,
      bubblegumProgram,
      signature,
      estimatedCostSol: estimatedCost,
      simulated: true,
      agentName: draft.name,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to mint agent soul: ${errorMessage}`);
  }
}
