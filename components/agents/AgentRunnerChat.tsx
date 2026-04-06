"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageContent } from "./MessageContent";
import { TransactionApprovalModal } from "./TransactionApprovalModal";
import {
  Send,
  Loader2,
  ExternalLink,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ArrowDown,
  Wallet,
  Zap,
  Shield,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  Eye,
  EyeOff,
  Terminal,
  Cpu,
  Sparkles,
  ArrowRight,
  Target,
  Layers,
  GitBranch,
  Play,
  X,
  Menu,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { useAgent } from "@/hooks/useAgent";
import type { Agent, AgentPlanStep, AgentReasoningStep, AgentToolExecution, ChatMessage, RunAgentResponse } from "@/types/agent";
import { syncConversationToDB, deleteConversationFromDB, fetchConversationsFromDB } from "@/lib/db-sync";

type Props = {
  agent: Agent;
};

type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AgentMessage[];
};

type AgentMessage = ChatMessage & {
  type?: "text" | "tool" | "transaction" | "reasoning" | "plan" | "alert";
  toolName?: string;
  toolStatus?: "pending" | "running" | "success" | "failed";
  toolDetails?: Record<string, unknown>;
  reasoningSteps?: AgentReasoningStep[];
  planSteps?: AgentPlanStep[];
};

type AgentState = "idle" | "thinking" | "planning" | "executing" | "waiting_approval" | "error";

function initialAssistantMessage(agent: Agent): AgentMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `I'm ${agent.name}, your autonomous Solana agent. I can scan markets, execute trades, manage your portfolio, and interact with DeFi protocols — all on-chain. What would you like me to do?`,
    timestamp: Date.now(),
    type: "text",
  };
}

function buildSessionTitle(messages: AgentMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user")?.content?.trim();
  if (!firstUser) return "New chat";
  return firstUser.length > 44 ? `${firstUser.slice(0, 44)}...` : firstUser;
}

function createNewSession(agent: Agent): ChatSession {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: [initialAssistantMessage(agent)],
  };
}

function formatTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const stateLabels: Record<AgentState, string> = {
  idle: "Standby",
  thinking: "Analyzing...",
  planning: "Building plan...",
  executing: "Executing...",
  waiting_approval: "Awaiting approval",
  error: "Error",
};

const stateColors: Record<AgentState, string> = {
  idle: "bg-emerald-500",
  thinking: "bg-blue-500",
  planning: "bg-violet-500",
  executing: "bg-amber-500",
  waiting_approval: "bg-orange-500",
  error: "bg-red-500",
};

const reasoningTypeIcons: Record<AgentReasoningStep["type"], React.ReactNode> = {
  perception: <Eye className="h-3 w-3" />,
  reasoning: <Brain className="h-3 w-3" />,
  planning: <GitBranch className="h-3 w-3" />,
  tool_selection: <Target className="h-3 w-3" />,
  validation: <Shield className="h-3 w-3" />,
  execution: <Play className="h-3 w-3" />,
  reflection: <Activity className="h-3 w-3" />,
};

function SidebarContent({
  sessions,
  activeSessionId,
  agent,
  agentState,
  currentAgent,
  showMetrics,
  setShowMetrics,
  setActiveSessionId,
  deleteChatSession,
  createChatSession,
  onClose,
}: {
  sessions: ChatSession[];
  activeSessionId: string;
  agent: Agent;
  agentState: AgentState;
  currentAgent: Agent;
  showMetrics: boolean;
  setShowMetrics: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveSessionId: (id: string) => void;
  deleteChatSession: (id: string) => void;
  createChatSession: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center justify-between border-b border-black/8 p-3">
        <button
          onClick={() => { createChatSession(); onClose?.(); }}
          className="flex flex-1 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-black/70 transition-all hover:border-black/20 hover:bg-black/[0.02] hover:text-black"
        >
          <Plus className="h-4 w-4" />
          New session
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-black/30 hover:bg-black/5 hover:text-black/60 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/30">
          Sessions
        </p>
        <div className="space-y-0.5">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors ${
                session.id === activeSessionId
                  ? "bg-black/[0.06]"
                  : "hover:bg-black/[0.04]"
              }`}
            >
              <button
                onClick={() => { setActiveSessionId(session.id); onClose?.(); }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-[12px] font-medium text-black/80">
                  {session.title}
                </div>
                <div className="text-[10px] text-black/30">
                  {formatTime(session.updatedAt)} · {session.messages.length} msgs
                </div>
              </button>
              <button
                onClick={() => deleteChatSession(session.id)}
                className="shrink-0 rounded p-1 text-black/15 opacity-0 transition-all hover:bg-black/10 hover:text-black/50 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Agent State Card */}
      <div className="border-t border-black/8 p-3">
        <div className="rounded-xl border border-black/8 bg-white p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171819] text-[12px] font-bold text-white">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${stateColors[agentState]}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-black/80">{agent.name}</p>
              <p className="text-[10px] text-black/40">{stateLabels[agentState]}</p>
            </div>
          </div>

          {showMetrics && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 border-t border-black/8 pt-3"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Treasury</span>
                <span className="font-mono text-black/70">{(currentAgent.treasuryBalance ?? 0).toFixed(3)} USDC</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Reputation</span>
                <span className="font-mono text-emerald-600">{(currentAgent.reputation ?? 80).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Actions</span>
                <span className="font-mono text-black/70">{(currentAgent.totalActions ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Risk</span>
                <span className="font-mono text-black/70">{currentAgent.riskLevel || "Balanced"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Tools</span>
                <span className="font-mono text-black/70">{(agent.tools ?? []).length} connected</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-black/35">Budget/tx</span>
                <span className="font-mono text-black/70">{agent.maxSolPerTx ?? 0} SOL</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setShowMetrics((p) => !p)}
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-md py-1.5 text-[10px] text-black/25 transition-colors hover:bg-black/[0.04] hover:text-black/40"
          >
            {showMetrics ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showMetrics ? "Hide metrics" : "Show metrics"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AgentRunnerChat({ agent }: Props) {
  const emptyMessages = useMemo<AgentMessage[]>(() => [], []);
  const storageKey = `vessel.agent.chat.sessions.v3.${agent.id}`;
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [liveReasoning, setLiveReasoning] = useState<AgentReasoningStep[]>([]);
  const [livePlan, setLivePlan] = useState<AgentPlanStep[]>([]);
  const [liveTool, setLiveTool] = useState<AgentToolExecution | null>(null);
  const [streamingContent, setStreamingContent] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { publicKey } = useWallet();
  const { incrementAgentStats, debitTreasuryForToolCall, getAgentById } = useAgent();

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );
  const messages = activeSession?.messages ?? emptyMessages;
  const hasUserMessages = messages.some((m) => m.role === "user");

  const currentAgent = useMemo(() => getAgentById(agent.id) ?? agent, [agent.id, getAgentById]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const loadSessions = async () => {
      try {
        const raw = window.localStorage.getItem(storageKey);
        
        const walletAddress = publicKey?.toBase58();
        
        if (walletAddress) {
          try {
            const dbConversations = await fetchConversationsFromDB(agent.id, walletAddress);
            if (dbConversations.length > 0) {
              const loadedFromDB = dbConversations.map((conv) => ({
                id: conv.id,
                title: conv.title,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                messages: conv.messages as AgentMessage[],
              }));
              if (loadedFromDB.length > 0) {
                setSessions(loadedFromDB);
                setActiveSessionId(loadedFromDB[0].id);
                window.localStorage.setItem(storageKey, JSON.stringify(loadedFromDB));
                return;
              }
            }
          } catch (e) {
            console.warn("[Chat] Failed to load from DB:", e);
          }
        }
        
        if (!raw) {
          const first = createNewSession(agent);
          setSessions([first]);
          setActiveSessionId(first.id);
          return;
        }
        const parsed = JSON.parse(raw) as ChatSession[];
        if (!Array.isArray(parsed) || parsed.length === 0) {
          const first = createNewSession(agent);
          setSessions([first]);
          setActiveSessionId(first.id);
          return;
        }
        setSessions(parsed);
        setActiveSessionId(parsed[0].id);
      } catch {
        const first = createNewSession(agent);
        setSessions([first]);
        setActiveSessionId(first.id);
      }
    };

    loadSessions();
  }, [agent, storageKey, publicKey]);

  useEffect(() => {
    if (typeof window === "undefined" || sessions.length === 0) return;
    window.localStorage.setItem(storageKey, JSON.stringify(sessions));
    
    const walletAddress = publicKey?.toBase58();
    if (!walletAddress) return;
    
    sessions.forEach(async (session) => {
      try {
        await syncConversationToDB({
          id: session.id,
          agentId: agent.id,
          walletAddress,
          title: session.title,
          messages: session.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            transactionSignature: m.transactionSignature,
            explorerUrl: m.explorerUrl,
            type: m.type,
            toolName: m.toolName,
            toolStatus: m.toolStatus,
            toolDetails: m.toolDetails,
          })),
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        });
      } catch (e) {
        console.warn("[Chat] Failed to sync conversation:", e);
      }
    });
  }, [sessions, storageKey, agent.id, publicKey]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior });
    }, 50);
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  const stopStreaming = useCallback(() => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => { stopStreaming(); };
  }, [stopStreaming]);

  const streamText = useCallback(
    (fullText: string, duration: number = 1500): Promise<void> => {
      return new Promise((resolve) => {
        stopStreaming();
        setStreamingContent("");
        const chars = fullText.split("");
        const interval = duration / chars.length;
        let i = 0;
        streamIntervalRef.current = setInterval(() => {
          i++;
          setStreamingContent(chars.slice(0, i).join(""));
          if (i >= chars.length) {
            stopStreaming();
            resolve();
          }
        }, Math.max(interval, 6));
      });
    },
    [stopStreaming],
  );

  const createChatSession = useCallback(() => {
    const next = createNewSession(agent);
    setSessions((prev) => [next, ...prev]);
    setActiveSessionId(next.id);
    setInput("");
    setAgentState("idle");
    setLiveReasoning([]);
    setLivePlan([]);
    setLiveTool(null);
    inputRef.current?.focus();
  }, [agent]);

  const deleteChatSession = useCallback(
    (sessionId: string) => {
      const walletAddress = publicKey?.toBase58();
      if (walletAddress) {
        deleteConversationFromDB(sessionId).catch((e) => {
          console.warn("[Chat] Failed to delete conversation from DB:", e);
        });
      }
      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== sessionId);
        if (remaining.length === 0) {
          const fresh = createNewSession(agent);
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (sessionId === activeSessionId) setActiveSessionId(remaining[0].id);
        return remaining;
      });
    },
    [activeSessionId, agent, publicKey],
  );

  const appendMessage = useCallback(
    (message: AgentMessage) => {
      if (!activeSessionId) return;
      setSessions((prev) =>
        prev
          .map((s) => {
            if (s.id !== activeSessionId) return s;
            const next = [...s.messages, message];
            return { ...s, messages: next, title: buildSessionTitle(next), updatedAt: Date.now() };
          })
          .sort((a, b) => b.updatedAt - a.updatedAt),
      );
    },
    [activeSessionId],
  );

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || !activeSessionId || !publicKey) {
      if (!publicKey) toast.error("Connect wallet to interact with agent");
      return;
    }

    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
      type: "text",
    };

    appendMessage(userMessage);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);
    setAgentState("thinking");
    setLiveReasoning([]);
    setLivePlan([]);
    setLiveTool(null);
    setStreamingContent("");
    scrollToBottom("auto");

    try {
      const activeMsgs = sessions.find((s) => s.id === activeSessionId)?.messages ?? [];
      const lastAssistant = [...activeMsgs].reverse().find((m) => m.role === "assistant")?.content;
      const lastUser = [...activeMsgs].reverse().find((m) => m.role === "user")?.content;

      const apiResponse = await fetch(`/api/agents/${agent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: currentInput,
          userPublicKey: publicKey.toBase58(),
          agent,
          context: { lastAssistantMessage: lastAssistant, lastUserMessage: lastUser },
        }),
      });

      if (!apiResponse.ok) throw new Error("Agent execution failed");

      const result = (await apiResponse.json()) as RunAgentResponse;

      setAgentState("thinking");
      if (result.reasoningSteps && result.reasoningSteps.length > 0) {
        for (let i = 0; i < result.reasoningSteps.length; i++) {
          setLiveReasoning((prev) => [...prev, result.reasoningSteps![i]]);
          await new Promise((r) => setTimeout(r, 250 + Math.random() * 200));
        }
      }

      if (result.toolUsed && result.planSteps) {
        setAgentState("planning");
        await new Promise((r) => setTimeout(r, 300));

        setAgentState("executing");
        setLivePlan(result.planSteps);

        if (result.toolExecution) {
          setLiveTool(result.toolExecution);
        }

        for (let i = 0; i < result.planSteps.length; i++) {
          await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
          setLivePlan((prev) =>
            prev.map((step, idx) =>
              idx === i ? { ...step, status: "running" as const } :
              idx < i ? { ...step, status: "done" as const } :
              step
            )
          );
        }

        // Check if this needs wallet approval
        if (result.executionRequest?.requiresWalletApproval) {
          setAgentState("waiting_approval");
          setPendingTransaction({
            tool: result.toolUsed,
            description: result.executionRequest.description || `Execute ${result.toolUsed}`,
            estimatedFee: 0.000005,
            agentId: agent.id,
            parameters: {},
          });
          setShowTxModal(true);

          // Wait for transaction modal to complete
          await new Promise((r) => {
            const checkTxModal = setInterval(() => {
              if (!showTxModal) {
                clearInterval(checkTxModal);
                r(null);
              }
            }, 100);
          });
        }
      }

      setAgentState("thinking");
      await streamText(result.message || "Task completed.");

      const msgType: AgentMessage["type"] = result.toolUsed ? "tool" : "text";

      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        timestamp: Date.now(),
        type: msgType,
        toolName: result.toolUsed,
        toolStatus: result.toolUsed ? "success" : undefined,
        reasoningSteps: result.reasoningSteps,
        planSteps: result.planSteps,
        transactionSignature: result.transactionSignature,
        explorerUrl: result.explorerUrl,
      });

      if (result.toolUsed) {
        const paymentResult = debitTreasuryForToolCall(agent.id, result.toolUsed, 0.001);
        if (paymentResult.success && paymentResult.payment) {
          appendMessage({
            id: crypto.randomUUID(),
            role: "system",
            content: `Transaction confirmed: 0.001 USDC paid to ${result.toolUsed}`,
            timestamp: Date.now(),
            type: "transaction",
            toolName: result.toolUsed,
            toolStatus: "success",
            transactionSignature: paymentResult.payment.transactionSignature,
            explorerUrl: paymentResult.payment.explorerUrl,
            payment: paymentResult.payment,
          });

          incrementAgentStats(agent.id);
          const refreshed = getAgentById(agent.id);
          toast.success(`Action executed. Treasury: ${(refreshed?.treasuryBalance ?? 0).toFixed(3)} USDC`);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Agent error: ${errorMsg}`);
      appendMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: Date.now(),
        type: "alert",
      });
    } finally {
      setIsLoading(false);
      setAgentState("idle");
      setLiveReasoning([]);
      setLivePlan([]);
      setLiveTool(null);
      setStreamingContent("");
      scrollToBottom();
    }
  }, [
    input, activeSessionId, sessions, agent, publicKey,
    scrollToBottom, incrementAgentStats, debitTreasuryForToolCall,
    getAgentById, appendMessage, streamText,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const target = e.target;
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
  };

  const suggestedActions = [
    { icon: <TrendingUp className="h-4 w-4" />, label: "Scan market opportunities", prompt: "Scan SOL ecosystem and suggest top 3 opportunities." },
    { icon: <Shield className="h-4 w-4" />, label: "Portfolio risk analysis", prompt: "Rebalance to lower-risk allocations for this week." },
    { icon: <Zap className="h-4 w-4" />, label: "Execute a swap", prompt: "Swap 0.01 SOL to USDC using Jupiter." },
    { icon: <Layers className="h-4 w-4" />, label: "DeFi strategy plan", prompt: "Generate a budget-safe action plan for today." },
  ];

  return (
    <div className="relative flex h-full min-h-0 bg-white">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280, opacity: 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 1 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-black/8 shadow-xl lg:hidden"
            >
              <SidebarContent
                sessions={sessions}
                activeSessionId={activeSessionId}
                agent={agent}
                agentState={agentState}
                currentAgent={currentAgent}
                showMetrics={showMetrics}
                setShowMetrics={setShowMetrics}
                setActiveSessionId={setActiveSessionId}
                deleteChatSession={deleteChatSession}
                createChatSession={createChatSession}
                onClose={() => setShowSidebar(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="hidden shrink-0 border-r border-black/8 bg-white lg:block"
          >
            <SidebarContent
              sessions={sessions}
              activeSessionId={activeSessionId}
              agent={agent}
              agentState={agentState}
              currentAgent={currentAgent}
              showMetrics={showMetrics}
              setShowMetrics={setShowMetrics}
              setActiveSessionId={setActiveSessionId}
              deleteChatSession={deleteChatSession}
              createChatSession={createChatSession}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <div className="shrink-0 border-b border-black/8 bg-white px-3 py-2 sm:px-4 sm:py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowSidebar((p) => !p)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex min-w-0 items-center gap-2">
                <div className={`h-2 w-2 shrink-0 rounded-full ${stateColors[agentState]}`} />
                <h2 className="truncate text-[13px] font-semibold text-black/80 sm:text-[14px]">{agent.name}</h2>
                <span className="hidden shrink-0 text-[11px] text-black/25 sm:inline">·</span>
                <span className="hidden shrink-0 text-[11px] text-black/40 sm:inline">{stateLabels[agentState]}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {liveTool && (
                <div className="flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 sm:px-2">
                  <Terminal className="h-3 w-3 text-amber-500" />
                  <span className="max-w-[80px] truncate text-[10px] font-medium text-amber-700 sm:max-w-none">
                    {liveTool.name}
                  </span>
                </div>
              )}
              {agent.tools && agent.tools.length > 0 && (
                <div className="hidden items-center gap-1 rounded-md bg-black/[0.04] px-2 py-1 sm:flex">
                  <Cpu className="h-3 w-3 text-black/30" />
                  <span className="text-[10px] text-black/35">{agent.tools.length} tools</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          data-lenis-prevent
          className="relative min-h-0 flex-1 overflow-y-auto bg-white"
        >
          {!hasUserMessages ? (
            <div className="flex h-full flex-col items-center justify-center px-4 py-8 sm:py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex w-full max-w-[680px] flex-col items-center"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171819] text-xl font-bold text-white shadow-2xl sm:h-16 sm:w-16 sm:text-2xl">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white sm:h-4 sm:w-4 ${stateColors[agentState]}`} />
                </div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-black sm:text-[20px]">
                  What should I work on?
                </h3>
                <p className="mt-1.5 max-w-[400px] text-center text-[12px] leading-relaxed text-black/40 sm:mt-2 sm:max-w-[480px] sm:text-[13px]">
                  {agent.personality}
                </p>

                <div className="mt-6 grid w-full gap-2 sm:mt-8 sm:grid-cols-2">
                  {suggestedActions.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i + 0.2, duration: 0.3 }}
                      onClick={() => {
                        setInput(action.prompt);
                        inputRef.current?.focus();
                      }}
                      className="group flex items-start gap-2.5 rounded-xl border border-black/8 bg-white p-3 text-left transition-all duration-150 hover:border-black/15 hover:bg-black/[0.02] hover:shadow-sm sm:gap-3 sm:p-3.5"
                    >
                      <div className="mt-0.5 shrink-0 rounded-md bg-black/[0.04] p-1.5 text-black/40 transition-colors group-hover:text-black/60">
                        {action.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-black/60 group-hover:text-black/80 sm:text-[12px]">
                          {action.label}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="mx-auto max-w-[800px] px-3 py-4 sm:px-4 sm:py-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-4 sm:mb-5"
                  >
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-[#171819] px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow-sm sm:max-w-[75%] sm:px-4 sm:py-3 sm:text-[14px]">
                          {msg.content}
                        </div>
                      </div>
                    ) : msg.type === "transaction" ? (
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 sm:mt-1 sm:h-7 sm:w-7">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 sm:px-4 sm:py-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                              <span className="text-[12px] font-semibold text-emerald-700 sm:text-[13px]">Transaction Confirmed</span>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] sm:text-[11px]">
                              <div className="rounded-md bg-white px-2 py-1.5 sm:px-2.5">
                                <span className="text-black/35">Tool</span>
                                <p className="mt-0.5 font-mono text-black/70">{msg.toolName || "—"}</p>
                              </div>
                              <div className="rounded-md bg-white px-2 py-1.5 sm:px-2.5">
                                <span className="text-black/35">Amount</span>
                                <p className="mt-0.5 font-mono text-black/70">0.001 USDC</p>
                              </div>
                            </div>
                            {msg.explorerUrl && (
                              <a
                                href={msg.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-white px-2.5 py-1.5 text-[10px] text-black/50 transition-colors hover:border-black/15 hover:text-black/70 sm:px-3 sm:text-[11px]"
                              >
                                View on Explorer
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : msg.type === "alert" ? (
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 sm:mt-1 sm:h-7 sm:w-7">
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 sm:px-4 sm:py-3">
                            <p className="text-[12px] text-red-700 sm:text-[13px]">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#171819] text-[9px] font-bold text-white sm:mt-1 sm:h-7 sm:w-7 sm:text-[11px]">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-black sm:text-[12px]">{agent.name}</span>
                            <span className="text-[10px] text-black/25 sm:text-[11px]">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <div className="group relative mt-1">
                            {streamingContent && msg === messages[messages.length - 1] && isLoading ? (
                              <p className="text-[13px] leading-[1.65] text-black/80 whitespace-pre-wrap sm:text-[14px] sm:leading-[1.7]">
                                {streamingContent}
                                <motion.span
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.5, repeat: Infinity }}
                                  className="inline-block h-3.5 w-1.5 bg-black/30 sm:h-4 sm:w-2"
                                />
                              </p>
                            ) : (
                              <MessageContent content={msg.content} />
                            )}
                            <div className="mt-1.5 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:mt-2">
                              <button
                                onClick={() => handleCopy(msg.content, msg.id)}
                                className="flex h-6 w-6 items-center justify-center rounded text-black/20 transition-colors hover:bg-black/5 hover:text-black/50"
                              >
                                {copiedId === msg.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </div>
                          {msg.transactionSignature && (
                            <a
                              href={msg.explorerUrl || `https://explorer.solana.com/tx/${msg.transactionSignature}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg border border-black/8 bg-black/[0.02] px-2.5 py-1.5 text-[10px] text-black/50 transition-colors hover:border-black/15 hover:text-black/70 sm:mt-2 sm:px-3 sm:text-[11px]"
                            >
                              <Wallet className="h-3 w-3" />
                              View Transaction
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Live reasoning panel */}
                {(isLoading || liveReasoning.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4 sm:mb-5"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 sm:mt-1 sm:h-7 sm:w-7">
                        <Brain className="h-3.5 w-3.5 text-blue-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2.5 sm:px-4 sm:py-3">
                          <div className="flex items-center gap-2">
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 shrink-0 animate-spin text-blue-500" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-500" />
                            )}
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-600/70 sm:text-[11px]">
                              {agentState === "thinking" ? "Thinking" : agentState === "planning" ? "Planning" : agentState === "executing" ? "Executing" : "Processing"}
                            </span>
                          </div>
                          <div className="mt-2 space-y-1.5">
                            {liveReasoning.map((step, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-start gap-2 text-[11px] sm:text-[12px]"
                              >
                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                  {reasoningTypeIcons[step.type]}
                                </div>
                                <span className="text-black/50">{step.content}</span>
                              </motion.div>
                            ))}
                            {isLoading && liveReasoning.length === 0 && (
                              <div className="flex items-center gap-2 text-[11px] text-black/30">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Initializing...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Live plan steps */}
                {livePlan.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 sm:mb-5"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-50 sm:mt-1 sm:h-7 sm:w-7">
                        <GitBranch className="h-3.5 w-3.5 text-violet-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="rounded-xl border border-violet-100 bg-violet-50/40 px-3 py-2.5 sm:px-4 sm:py-3">
                          <div className="flex items-center gap-2">
                            <Target className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-violet-600/70 sm:text-[11px]">
                              Execution Plan
                            </span>
                          </div>
                          <div className="mt-2 space-y-1.5 sm:mt-3 sm:space-y-2">
                            {livePlan.map((step, i) => (
                              <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-2 sm:gap-2.5"
                              >
                                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                  step.status === "done" ? "bg-emerald-100" :
                                  step.status === "running" ? "bg-amber-100" :
                                  step.status === "failed" ? "bg-red-100" :
                                  "bg-black/5"
                                }`}>
                                  {step.status === "done" ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  ) : step.status === "running" ? (
                                    <Loader2 className="h-3 w-3 animate-spin text-amber-500" />
                                  ) : step.status === "failed" ? (
                                    <XCircle className="h-3 w-3 text-red-500" />
                                  ) : (
                                    <div className="h-1.5 w-1.5 rounded-full bg-black/20" />
                                  )}
                                </div>
                                <span className={`text-[11px] sm:text-[12px] ${
                                  step.status === "done" ? "text-black/50" :
                                  step.status === "running" ? "text-black/70 font-medium" :
                                  step.status === "failed" ? "text-red-600" :
                                  "text-black/25"
                                }`}>
                                  {step.description}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => scrollToBottom("smooth")}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg transition-colors hover:bg-black/5"
              >
                <ArrowDown className="h-3.5 w-3.5 text-black/40" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-black/8 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="mx-auto max-w-[800px]">
            <div className="flex items-end gap-2 rounded-2xl border border-black/10 bg-white p-1.5 transition-colors focus-within:border-black/20 focus-within:shadow-sm sm:p-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder={`Tell ${agent.name} what to do...`}
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-2 text-[13px] leading-relaxed text-black placeholder-black/30 focus:outline-none disabled:opacity-40 sm:text-[14px]"
                disabled={isLoading}
                style={{ maxHeight: "160px" }}
              />
              <button
                onClick={() => void handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#171819] text-white transition-all duration-150 hover:bg-[#111111] sm:h-9 sm:w-9 ${
                  isLoading ? "animate-pulse ring-2 ring-cyan-500/30" : "disabled:opacity-30 disabled:hover:bg-[#171819]"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                  </div>
                ) : (
                  <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                )}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between sm:mt-2">
              <p className="text-[9px] text-black/20 sm:text-[10px]">
                {agent.name} executes on-chain actions. Always verify transactions before approving.
              </p>
              <div className="hidden items-center gap-2 text-[10px] text-black/15 sm:flex">
                <span>Enter to send</span>
                <span>·</span>
                <span>Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Approval Modal */}
        <TransactionApprovalModal
          open={showTxModal}
          onClose={() => setShowTxModal(false)}
          transactionData={pendingTransaction}
          onExecute={(signature) => {
            toast.success(`Transaction executed! Signature: ${signature.slice(0, 8)}...`);
            setShowTxModal(false);
          }}
          onError={(error) => {
            toast.error(`Transaction failed: ${error}`);
          }}
        />
      </div>
    </div>
  );
}
