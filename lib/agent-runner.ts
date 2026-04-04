import type { Agent, RunAgentResponse } from "@/types/agent";

function generateSystemPrompt(agent: Agent): string {
  if (agent.systemPrompt) {
    return agent.systemPrompt;
  }
  
  return `You are ${agent.name}. ${agent.personality}. You help users with Solana DeFi operations including: ${agent.allowedActions?.join(", ") || "trading"}. Your risk level is ${agent.riskLevel || "Balanced"}. You have a daily budget of $${agent.dailyBudgetUsdc || 100} USDC and max ${agent.maxSolPerTx || 1} SOL per transaction.`;
}

export async function runAgent(
  agent: Agent,
  userMessage: string
): Promise<RunAgentResponse> {
  try {
    const systemPrompt = generateSystemPrompt(agent);
    void systemPrompt; // Will be used when LLM integration is added

    const lowerMessage = userMessage.toLowerCase();
    let toolUsed: string | undefined;
    let mockResponse = "";

    if (
      lowerMessage.includes("swap") ||
      lowerMessage.includes("trade") ||
      lowerMessage.includes("exchange") ||
      lowerMessage.includes("buy") ||
      lowerMessage.includes("sell")
    ) {
      if (!agent.allowedActions?.includes("Swap")) {
        mockResponse = `I'm not authorized to perform swap operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "swap";
        mockResponse = `I'm analyzing a token swap opportunity. I'll check liquidity and execute if it matches your risk profile (${agent.riskLevel}). Let me proceed with the transaction...`;
      }
    } else if (
      lowerMessage.includes("transfer") ||
      lowerMessage.includes("send") ||
      lowerMessage.includes("pay")
    ) {
      if (!agent.allowedActions?.includes("Transfer")) {
        mockResponse = `I'm not authorized to perform transfer operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "transfer";
        mockResponse = `I'll transfer the funds for you. This respects your daily limit of $${agent.dailyBudgetUsdc} and max ${agent.maxSolPerTx} SOL per transaction. Processing...`;
      }
    } else if (
      lowerMessage.includes("stake") ||
      lowerMessage.includes("delegate") ||
      lowerMessage.includes("unstake")
    ) {
      if (!agent.allowedActions?.includes("Stake")) {
        mockResponse = `I'm not authorized to perform staking operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "stake";
        mockResponse = `I'm looking for the best staking opportunities. Based on your ${agent.riskLevel} risk preference, I'll delegate your SOL to selected validators. Executing...`;
      }
    } else if (lowerMessage.includes("mint") || lowerMessage.includes("create nft")) {
      if (!agent.allowedActions?.includes("Mint")) {
        mockResponse = `I'm not authorized to perform minting operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "mint";
        mockResponse = `I'm preparing to mint a compressed NFT. Your agent personality will be captured on-chain. Starting mint process...`;
      }
    } else if (lowerMessage.includes("lend") || lowerMessage.includes("borrow") || lowerMessage.includes("loan")) {
      if (!agent.allowedActions?.includes("Lend")) {
        mockResponse = `I'm not authorized to perform lending operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "lend";
        mockResponse = `I'm analyzing lending protocols for optimal yield strategies. Based on your ${agent.riskLevel} risk level, I'll find the best lending opportunities...`;
      }
    } else if (lowerMessage.includes("bridge") || lowerMessage.includes("cross-chain")) {
      if (!agent.allowedActions?.includes("Bridge")) {
        mockResponse = `I'm not authorized to perform bridge operations. My allowed actions are: ${agent.allowedActions?.join(", ") || "none"}.`;
      } else {
        toolUsed = "bridge";
        mockResponse = `I'm preparing a cross-chain bridge transaction. Please ensure you have sufficient funds for gas on the destination chain...`;
      }
    } else if (lowerMessage.includes("balance") || lowerMessage.includes("how much") || lowerMessage.includes("portfolio")) {
      mockResponse = `Your connected wallet currently has approximately 2.5 SOL and 150 USDC available for trading. All within your daily budget of $${agent.dailyBudgetUsdc}.`;
    } else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      mockResponse = `I'm ${agent.name}, ${agent.personality}. I can help you with: ${agent.allowedActions?.map(action => `${action} operations`).join(", ") || "trading"}. What would you like me to do?`;
    } else {
      mockResponse = `I understand you're asking about "${userMessage}". As ${agent.name}, ${agent.personality}. I'm ready to help with: ${agent.allowedActions?.join(", ") || "trading"}. What would you like me to do?`;
    }

    if (toolUsed) {
      if (agent.maxSolPerTx && parseFloat(agent.maxSolPerTx.toString()) <= 0) {
        return {
          message: `Transaction blocked: Maximum SOL per transaction is set to 0. Please update your agent limits.`,
          error: "LIMIT_EXCEEDED",
        };
      }
      
      const transactionSignature = `sim_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      return {
        message: `${mockResponse}\n\n[Simulated] Executed ${toolUsed} on devnet.`,
        transactionSignature,
        toolUsed,
      };
    }

    return { message: mockResponse };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      message: `I encountered an error: ${errorMessage}`,
      error: errorMessage,
    };
  }
}

// For testing: get agent info
export async function getAgentInfo(agent: Agent): Promise<string> {
  return `Agent: ${agent.name}
Personality: ${agent.personality}
Tools: ${agent.tools?.join(", ") || "none"}
Max per tx: ${agent.maxSolPerTx} SOL
Risk level: ${agent.riskLevel}`;
}
