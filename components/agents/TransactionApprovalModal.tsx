import React, { useState, useEffect, memo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { Transaction } from "@solana/web3.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

interface TransactionData {
  tool: "transfer" | "swap" | "stake";
  description: string;
  estimatedFee: number;
  estimatedOutput?: any;
  agentId: string;
  parameters: Record<string, any>;
}

interface TransactionApprovalModalProps {
  open: boolean;
  onClose: () => void;
  transactionData: TransactionData | null;
  onExecute?: (signature: string) => void;
  onError?: (error: string) => void;
}

export const TransactionApprovalModal = memo(function TransactionApprovalModal({
  open,
  onClose,
  transactionData,
  onExecute,
  onError,
}: TransactionApprovalModalProps) {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "signing" | "executing" | "success" | "error">("pending");
  const [unsignedTx, setUnsignedTx] = useState<string | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch unsigned transaction when modal opens
  useEffect(() => {
    if (!open || !transactionData || !publicKey) return;

    const fetchUnsignedTx = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agents/tools/sign-tx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: transactionData.agentId,
            tool: transactionData.tool,
            params: transactionData.parameters,
            userWallet: publicKey.toString(),
            estimatedAmount: transactionData.estimatedOutput?.inputAmount || 0.01,
            slippageBps: transactionData.estimatedOutput?.slippageBps,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to fetch transaction");
        }

        const data = await response.json();
        setUnsignedTx(data.transaction); // Base64 encoded
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setErrorMessage(message);
        setStatus("error");
        onError?.(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUnsignedTx();
  }, [open, transactionData, publicKey, onError]);

  const handleApprove = async () => {
    if (!publicKey || !signTransaction || !unsignedTx || !transactionData) {
      throw new WalletNotConnectedError();
    }

    try {
      setLoading(true);
      setStatus("signing");

      // Deserialize the unsigned transaction
      const txBuffer = Buffer.from(unsignedTx, "base64");
      const tx = Transaction.from(txBuffer);

      // Sign with user's wallet
      const signedTx = await signTransaction(tx);

      // Serialize back to base64
      const signedTxBase64 = signedTx
        .serialize({
          requireAllSignatures: false,
          verifySignatures: false,
        })
        .toString("base64");

      // Submit to executor
      setStatus("executing");
      const executeResponse = await fetch("/api/agents/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: transactionData.agentId,
          signedTransaction: signedTxBase64,
          tool: transactionData.tool,
          estimatedAmount: transactionData.estimatedOutput?.inputAmount || 0.01,
        }),
      });

      if (!executeResponse.ok) {
        const error = await executeResponse.json();
        throw new Error(error.error || "Transaction failed");
      }

      const result = await executeResponse.json();
      setTxSignature(result.signature);
      setStatus("success");
      onExecute?.(result.signature);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed";
      setErrorMessage(message);
      setStatus("error");
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={() => !loading && onClose()}>
      <SheetContent side="bottom" className="max-w-md">
        <SheetHeader>
          <SheetTitle>
            {status === "success" ? "✅ Transaction Executed" : "Approve Transaction"}
          </SheetTitle>
          <SheetDescription>
            {status === "pending" && "Review and approve this transaction in your wallet"}
            {status === "signing" && "Signing with your wallet..."}
            {status === "executing" && "Submitting to blockchain..."}
            {status === "success" && "Your transaction has been confirmed"}
            {status === "error" && "Transaction failed"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {/* Transaction Details */}
          <div className="bg-slate-900 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tool:</span>
              <span className="font-mono capitalize text-white">{transactionData?.tool}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Description:</span>
              <span className="font-mono text-white text-right max-w-xs">{transactionData?.description}</span>
            </div>

            {transactionData?.estimatedOutput && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Expected Output:</span>
                  <span className="font-mono text-emerald-400">
                    {transactionData.estimatedOutput.estimatedOutput}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Slippage:</span>
                  <span className="font-mono text-yellow-400">
                    {(transactionData.estimatedOutput.slippageBps / 100).toFixed(2)}%
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between text-sm border-t border-slate-700 pt-3">
              <span className="text-slate-400">Est. Fee:</span>
              <span className="font-mono text-blue-400">{transactionData?.estimatedFee.toFixed(6)} SOL</span>
            </div>
          </div>

          {/* Status Messages */}
          {status === "success" && txSignature && (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-3 flex gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-200 font-mono break-all text-xs">{txSignature}</p>
                <a
                  href={`https://solscan.io/tx/${txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1"
                >
                  View on Solscan <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {status === "error" && errorMessage && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-200">{errorMessage}</p>
              </div>
            </div>
          )}

          {(status === "signing" || status === "executing") && (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 flex gap-2">
              <Loader2 className="h-5 w-5 text-blue-400 flex-shrink-0 animate-spin" />
              <p className="text-sm text-blue-200">
                {status === "signing" ? "Waiting for wallet signature..." : "Confirming on blockchain..."}
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            {status === "success" ? "Done" : "Cancel"}
          </Button>
          {status !== "success" && status !== "executing" && status !== "signing" && (
            <Button
              onClick={handleApprove}
              disabled={loading || !unsignedTx || status === "error"}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Approve in Phantom"
              )}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
});
