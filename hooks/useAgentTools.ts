"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

interface ToolParams {
  [key: string]: any;
}

interface ExecuteToolOptions {
  agentId: string;
  tool: "transfer" | "swap" | "stake" | "portfolio";
  params: ToolParams;
}

export function useAgentTools() {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTool = useCallback(
    async (options: ExecuteToolOptions) => {
      if (!publicKey || !signMessage) {
        toast.error("Please connect your wallet first");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Get JWT token from localStorage (set during login)
        const token = localStorage.getItem("vessel_jwt_token");
        if (!token) {
          throw new Error("Authentication required");
        }

        // Create message to sign
        const message = new TextEncoder().encode(
          `Execute tool: ${options.tool} - ${Date.now()}`
        );
        const signature = await signMessage(message);

        // Execute tool
        const response = await fetch("/api/agents/tools/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...options,
            walletAddress: publicKey.toString(),
            signature: Buffer.from(signature).toString("base64"),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Tool execution failed (${response.status})`
          );
        }

        const result = await response.json();

        if (result.success) {
          toast.success(`${options.tool} executed successfully`);
          if (result.transactionSignature) {
            toast.info(
              `Transaction: ${result.transactionSignature.slice(0, 16)}...`,
              {
                duration: 5000,
              }
            );
          }
        } else {
          toast.error(result.error || "Tool execution failed");
        }

        return result;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("[AgentTools] Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signMessage]
  );

  return {
    executeTool,
    loading,
    error,
  };
}

/**
 * Higher-order component to add tool execution capability to agents
 */
export function withAgentTools<T extends object>(Component: React.ComponentType<T>) {
  return function WithAgentToolsComponent(props: T) {
    const tools = useAgentTools();
    return <Component {...props} agentTools={tools} />;
  };
}
