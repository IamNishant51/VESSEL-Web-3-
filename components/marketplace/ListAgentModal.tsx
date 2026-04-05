"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVesselStore } from "@/store/useVesselStore";
import type { Agent } from "@/types/agent";

type Props = {
  agents: Agent[];
  isOpen: boolean;
  onClose: () => void;
  ownerAddress: string;
  instantListOnSelect?: boolean;
  onListed?: (agentId: string) => void;
};

export function ListAgentModal({
  agents,
  isOpen,
  onClose,
  ownerAddress,
  instantListOnSelect = false,
  onListed,
}: Props) {
  const [step, setStep] = useState<"select" | "details">("select");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [price, setPrice] = useState("1.5");
  const [currency, setCurrency] = useState<"SOL" | "USDC">("SOL");
  const [durationDays, setDurationDays] = useState("7");
  const [isRental, setIsRental] = useState(false);
  const [isListing, setIsListing] = useState(false);

  const addListing = useVesselStore((state) => state.addListing);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const availableAgents = agents.filter((agent) => !agent.listed && !agent.isRental);

  const resetState = () => {
    setStep("select");
    setSelectedAgent(null);
    setPrice("1.5");
    setCurrency("SOL");
    setDurationDays("7");
    setIsRental(false);
  };

  const performListing = async (agentToList: Agent) => {
    setIsListing(true);
    try {
      const priceNum = parseFloat(price);
      if (!Number.isFinite(priceNum) || priceNum <= 0) {
        toast.error("Price must be greater than 0");
        return;
      }

      const parsedDays = Number(durationDays);
      const safeDurationDays = Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 7;

      addListing(
        {
          ...agentToList,
          seller: ownerAddress,
          listed: true,
        },
        priceNum,
        currency,
        isRental,
        safeDurationDays
      );

      toast.success(`${agentToList.name} listed for ${price} ${currency}${isRental ? ` for ${safeDurationDays} days` : ""}!`);
      onListed?.(agentToList.id);
      resetState();
      onClose();
    } catch {
      toast.error("Failed to list agent");
    } finally {
      setIsListing(false);
    }
  };

  const handleSelectAgent = (agent: Agent) => {
    if (instantListOnSelect) {
      void performListing(agent);
      return;
    }

    setSelectedAgent(agent);
    setStep("details");
  };

  const handleList = async () => {
    if (!selectedAgent || !price) {
      toast.error("Fill in all fields");
      return;
    }

    await performListing(selectedAgent);
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        onClick={() => {
          resetState();
          onClose();
        }}
        className="absolute inset-0 h-full w-full cursor-pointer bg-black/50 backdrop-blur-sm"
        aria-label="Close listing modal"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="absolute inset-0 z-[51] flex items-center justify-center p-4"
      >
        <Card className="relative w-full max-w-md border-white/10 bg-[#111111]">
            <CardHeader>
              <CardTitle className="text-white">
                {step === "select" ? "List Your Agent" : "Set Price"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {step === "select" ? (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3 max-h-96 overflow-y-auto"
                  >
                    {availableAgents.length === 0 ? (
                      <p className="text-center text-zinc-400 text-sm">
                        No agents available to list. All your agents are either already listed or rented.
                      </p>
                    ) : (
                      availableAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleSelectAgent(agent)}
                          disabled={isListing}
                          className="w-full p-3 rounded-lg border border-white/10 bg-[#0A0A0A] text-left cursor-pointer hover:border-[#14F195]/40 hover:bg-[#0A0A0A]/80 transition-all disabled:opacity-60"
                        >
                          <h4 className="font-semibold text-white">{agent.name}</h4>
                          <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                            {agent.personality}
                          </p>
                        </button>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-4"
                  >
                    {selectedAgent && (
                      <div className="p-3 rounded-lg border border-[#14F195]/20 bg-[#14F195]/5">
                        <h4 className="font-semibold text-white">{selectedAgent.name}</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Ready to list on marketplace
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-zinc-300">Price</label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          step="0.1"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          disabled={isListing}
                          className="flex-1 rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-white text-sm focus:border-[#14F195]/40 focus:outline-none"
                          placeholder="1.5"
                        />
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as "SOL" | "USDC")}
                          disabled={isListing}
                          className="rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-white text-sm focus:border-[#14F195]/40 focus:outline-none"
                        >
                          <option value="SOL">SOL</option>
                          <option value="USDC">USDC</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-zinc-300">Duration (days)</label>
                      <input
                        type="number"
                        min={1}
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        disabled={isListing}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-white text-sm focus:border-[#14F195]/40 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isRental}
                        onChange={(e) => setIsRental(e.target.checked)}
                        disabled={isListing}
                        id="rental-checkbox"
                        className="rounded border border-white/10 bg-[#0A0A0A]"
                      />
                      <label
                        htmlFor="rental-checkbox"
                        className="text-sm text-zinc-300 cursor-pointer"
                      >
                        Make available for rental (7-day periods)
                      </label>
                    </div>

                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-zinc-500">
                        Marketplace fee: 2% ({(parseFloat(price) * 0.02).toFixed(2)} {currency})
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (step === "details") {
                      setStep("select");
                    } else {
                      resetState();
                      onClose();
                    }
                  }}
                  disabled={isListing}
                  className="flex-1 border-white/10 text-white hover:bg-white/5"
                >
                  {step === "details" ? "Back" : "Cancel"}
                </Button>
                {step === "details" && (
                  <Button
                    onClick={handleList}
                    disabled={isListing}
                    className="flex-1 gap-2 bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
                  >
                    {isListing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Listing...
                      </>
                    ) : (
                      "List Now"
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          <button
            onClick={() => {
              resetState();
              onClose();
            }}
            className="absolute right-3 top-3 rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
            aria-label="Close"
          >
            Close
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
