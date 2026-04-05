"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

import { LandingNavigation } from "@/components/layout/landing-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAgentArtworkUrl } from "@/lib/agent-visuals";
import { getCyberpunkAgentDataUrl } from "@/lib/agent-avatar";
import { sendConfirmedSolTransfer } from "@/lib/solana-payments";
import { clonePremadeFreeAgent, getPremadeFreeAgentById } from "@/lib/premade-agents";
import { useVesselStore } from "@/store/useVesselStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import type { Agent } from "@/types/agent";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const listings = useVesselStore((state) => state.marketplaceListings);
  const agents = useVesselStore((state) => state.usersAgents);
  const addAgent = useVesselStore((state) => state.addAgent);
  const getListingById = useVesselStore((state) => state.getListingById);
  const buyAgentWithSettlementTx = useVesselStore((state) => state.buyAgentWithSettlementTx);
  const rentAgentWithSettlementTx = useVesselStore((state) => state.rentAgentWithSettlementTx);
  const removeListing = useVesselStore((state) => state.removeListing);
  const hasHydrated = useStoreHydrated();

  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<(Agent & { seller: string; listed: true; isPremade?: boolean; sourceTemplateId?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    success: boolean;
    txSig?: string;
    explorerUrl?: string;
    itemName: string;
    wasRental: boolean;
  } | null>(null);
  const [buyDays, setBuyDays] = useState(7);

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    const found = getListingById(listingId);
    if (found) {
      setListing(found);
      setIsLoading(false);
      return;
    }

    const premadeTemplate = getPremadeFreeAgentById(listingId);
    if (premadeTemplate) {
      setListing(premadeTemplate);
      setIsLoading(false);
      return;
    }

    const fallbackAgent = agents.find((agent: Agent) => agent.id === listingId && agent.listed && (agent.price ?? 0) > 0);
    if (fallbackAgent) {
      setListing({
        ...fallbackAgent,
        listed: true,
        seller: fallbackAgent.seller ?? fallbackAgent.owner,
      });
      setIsLoading(false);
      return;
    }

    setListing(null);
    setIsLoading(false);
  }, [agents, listingId, getListingById, listings]);

  const claimedPremadeAgent = listing && publicKey
    ? agents.find(
        (agent) =>
          agent.sourceTemplateId === listing.id &&
          agent.owner === publicKey.toBase58(),
      )
    : undefined;

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/20 border-t-black" />
      </div>
    );
  }

  const handleBuyNow = async () => {
    if (!publicKey) {
      toast.error("Connect wallet to purchase");
      return;
    }

    if (!listing) return;

    if (listing.isPremade || listing.price === 0) {
      if (claimedPremadeAgent) {
        toast.info("You already claimed this free agent.");
        router.push(`/agents/${claimedPremadeAgent.id}`);
        return;
      }

      const premadeTemplate = getPremadeFreeAgentById(listing.id);
      if (!premadeTemplate) {
        toast.error("Free template metadata is unavailable. Please refresh and try again.");
        return;
      }

      const claimedAgent = clonePremadeFreeAgent(premadeTemplate, publicKey.toBase58());
      addAgent(claimedAgent);
      toast.success(`${listing.name} added to your agents for free.`);
      router.push(`/agents/${claimedAgent.id}`);
      return;
    }

    if (publicKey.toBase58() === listing.seller) {
      toast.info("You already own this listing. Open or unlist it instead.");
      return;
    }

    setIsProcessing(true);
    try {
      if (listing.priceCurrency !== "SOL") {
        toast.error("Only SOL-settled listings are enabled until SPL token settlement rails are configured.");
        setIsProcessing(false);
        return;
      }

      const settlementAmount = Number(((listing.price ?? 0) * 1.02).toFixed(9));
      const settlementTx = await sendConfirmedSolTransfer({
        wallet,
        to: listing.seller,
        amountSol: settlementAmount,
      });

      const result = listing.isRental
        ? rentAgentWithSettlementTx(listing.id, publicKey.toBase58(), buyDays, settlementTx)
        : buyAgentWithSettlementTx(listing.id, publicKey.toBase58(), settlementTx);

      if (!result.success) {
        toast.error(result.error || "Purchase failed");
        setIsProcessing(false);
        return;
      }

      setPurchaseResult({
        success: true,
        txSig: result.txSig,
        explorerUrl: result.explorerUrl,
        itemName: listing.name,
        wasRental: !!listing.isRental,
      });

      toast.success(
        listing.isRental
          ? `Rental succeeded (${buyDays} days)! ${result.explorerUrl || ""}`
          : `Purchase successful! ${result.explorerUrl || ""}`
      );
    } catch {
      toast.error("Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <div className="h-6 w-44 animate-pulse rounded bg-black/10" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-black/8" />
        <div className="mt-6 h-[480px] animate-pulse rounded-xl bg-black/8" />
      </div>
    );
  }

  if (purchaseResult?.success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-black/65 hover:bg-black/5 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-black/10 bg-white">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-[#171819]" />
              <h2 className="text-2xl font-bold text-black">
                {purchaseResult.wasRental ? "Rental" : "Purchase"} Successful!
              </h2>
              <p className="text-black/60">
                {purchaseResult.itemName} is now in your collection.
              </p>

              {purchaseResult.txSig && (
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-black/50">Transaction:</p>
                  <a
                    href={purchaseResult.explorerUrl || `https://explorer.solana.com/tx/${purchaseResult.txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-mono text-black/75 hover:bg-black/5"
                  >
                    {purchaseResult.txSig.slice(0, 20)}...
                    <span>↗</span>
                  </a>
                </div>
              )}

              <div className="flex gap-3 justify-center pt-6">
                <Button
                  onClick={() => router.push("/agents")}
                  className="bg-[#171819] text-white hover:bg-[#111111]"
                >
                  View My Agents
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/marketplace")}
                  className="border-black/10 text-black/80 hover:bg-black/5"
                >
                  Back to Marketplace
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!listing) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-black/65 hover:bg-black/5 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-[#ff2338]/30 bg-[#ff2338]/5">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-[#a01223]" />
            <div>
              <h3 className="font-semibold text-black">Listing not found</h3>
              <p className="text-sm text-black/65">
                This listing may have been sold or removed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push("/marketplace")}
          className="bg-[#171819] text-white hover:bg-[#111111]"
        >
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const listingPrice = listing.price ?? 0;
  const listingCurrency = listing.priceCurrency ?? "SOL";
  const isOwnerViewingListing = !!publicKey && listing.seller === publicKey.toBase58();
  const isPremadeFree = !!listing.isPremade || listingPrice === 0;
  const artworkUrl = getAgentArtworkUrl(listing, 1200);

  return (
    <>
      <LandingNavigation forceLight />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 text-black/65 hover:bg-black/5 hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-black/10 bg-white">
            <CardHeader className="px-4 pt-4 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="text-[28px] font-semibold leading-[0.95] tracking-[-0.03em] text-black sm:text-[40px] lg:text-[48px]">{listing.name}</CardTitle>
                  <p className="mt-2 text-[13px] text-black/60 sm:text-[15px]">{listing.tagline || "Give Your Ideas a Soul"}</p>
                </div>
                {listing.isRental && (
                  <Badge className="shrink-0 border border-black/10 bg-[#f1f2f3] text-black/75">
                    Available for Rental
                  </Badge>
                )}
                {isPremadeFree && (
                  <Badge className="shrink-0 border border-black/10 bg-[#171819] text-white">
                    Free Premade
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6 px-4 pb-6 sm:px-6">
              <div className="overflow-hidden rounded-xl border border-black/10 bg-[#f3f4f6]">
                <img
                  src={artworkUrl}
                  alt={`${listing.name} cNFT artwork`}
                  loading="eager"
                  onError={(event) => {
                    const target = event.currentTarget;
                    target.onerror = null;
                    target.src = getCyberpunkAgentDataUrl(listing.id);
                  }}
                  className="h-[200px] w-full object-cover sm:h-[320px]"
                />
              </div>

              <div>
                <h3 className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-black/45">PERSONALITY</h3>
                <p className="text-[16px] leading-relaxed text-black/75">{listing.personality}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-[#f7f8f9] p-4">
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-black/45">RISK LEVEL</h3>
                  <p className="text-[16px] font-semibold text-black">{listing.riskLevel || "Balanced"}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-black/45">DAILY BUDGET</h3>
                  <p className="text-[16px] font-semibold text-black">${listing.dailyBudgetUsdc ?? 0}</p>
                </div>
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-black/45">MAX PER TX</h3>
                  <p className="text-[16px] font-semibold text-black">{listing.maxSolPerTx ?? 0} SOL</p>
                </div>
                <div>
                  <h3 className="mb-1 text-[10px] font-semibold tracking-[0.1em] text-black/45">TOOLS</h3>
                  <p className="text-[16px] font-semibold text-black">{listing.tools?.length || 0} available</p>
                </div>
              </div>

              {listing.allowedActions && listing.allowedActions.length > 0 && (
                <div>
                  <h3 className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-black/45">ALLOWED ACTIONS</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.allowedActions.map((action) => (
                      <Badge key={action} variant="secondary" className="border border-black/10 bg-[#f1f2f3] text-black/75">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-black/10 pt-4">
                <h3 className="mb-2 text-[10px] font-semibold tracking-[0.1em] text-black/45">MINT ADDRESS</h3>
                <p className="break-all font-mono text-xs text-black/55">{listing.mintAddress || "Not available"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-black/10 bg-white">
            <CardHeader>
              <CardTitle className="text-xl text-black">
                <div className="flex items-center gap-2 text-[#171819]">
                  <ShoppingCart className="h-5 w-5" />
                  {listing.isRental ? "Rent" : "Buy"}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-black/55">Price</h3>
                <p className="text-4xl font-semibold tracking-[-0.02em] text-black">
                  {isPremadeFree ? "Free" : listingPrice}
                  {!isPremadeFree && <span className="ml-2 text-sm text-black/45">{listingCurrency}</span>}
                </p>
              </div>

              {isPremadeFree && (
                <div className="rounded-md border border-black/10 bg-[#f7f8f9] px-3 py-2 text-[12px] text-black/65">
                  This premade agent is free to claim. It will be copied into your agent collection with your wallet as the owner.
                </div>
              )}

              {isOwnerViewingListing && (
                <div className="rounded-md border border-black/10 bg-[#f7f8f9] px-3 py-2 text-[12px] text-black/65">
                  This is your listing. Manage it from here instead of buying.
                </div>
              )}

              {listing.isRental && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-black/55">Duration</h3>
                  <select
                    value={buyDays}
                    onChange={(e) => setBuyDays(parseInt(e.target.value))}
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-black/10 bg-[#f7f8f9] px-3 py-2 text-sm text-black/75 focus:border-[#171819] focus:outline-none"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              )}

              <div className="space-y-2 border-t border-black/10 pt-4">
                {isPremadeFree ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Fee</span>
                    <span className="text-black/80">Free</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-black/60">Fee (2%)</span>
                      <span className="text-black/80">{(listingPrice * 0.02).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-base font-semibold">
                      <span className="text-black">Total</span>
                      <span className="text-black">{(listingPrice * 1.02).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {isOwnerViewingListing ? (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => router.push(`/agents/${listing.id}`)}
                    className="h-11 w-full gap-2 bg-[#171819] text-white hover:bg-[#111111]"
                  >
                    Open Agent
                  </Button>
                  <Button
                    onClick={() => {
                      removeListing(listing.id);
                      toast.success("Listing removed from marketplace.");
                      router.push("/agents");
                    }}
                    variant="outline"
                    className="h-11 w-full border-black/10 text-black/80 hover:bg-black/5"
                  >
                    Unlist
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  disabled={isProcessing || !publicKey}
                  className="h-11 w-full gap-2 bg-[#171819] text-white hover:bg-[#111111] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isPremadeFree ? "Claim Free Agent" : listing.isRental ? "Rent Now" : "Buy Now"}
                    </>
                  )}
                </Button>
              )}

              {!publicKey && (
                <p className="text-center text-xs text-black/50">
                  Connect wallet to {isPremadeFree ? "claim" : "purchase"}
                </p>
              )}

              {claimedPremadeAgent && (
                <Button
                  onClick={() => router.push(`/agents/${claimedPremadeAgent.id}`)}
                  variant="outline"
                  className="h-11 w-full border-black/10 text-black/80 hover:bg-black/5"
                >
                  Open Claimed Agent
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-black/10 bg-white">
            <CardHeader>
              <CardTitle className="text-sm text-black">Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="break-all font-mono text-xs text-black/55">
                {listing.seller}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
    </>
  );
}
