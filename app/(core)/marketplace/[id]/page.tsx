"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/hooks/useMarketplace";
import type { Agent } from "@/types/agent";

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { getListingById, buyAgent, rentAgent } = useMarketplace();

  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<(Agent & { seller: string; listed: true }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{ success: boolean; txSig?: string } | null>(null);
  const [buyDays, setBuyDays] = useState(7);

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false);
      return;
    }

    const found = getListingById(listingId);
    if (found) {
      setListing(found);
    }
    setIsLoading(false);
  }, [listingId, getListingById]);

  const handleBuyNow = async () => {
    if (!publicKey) {
      toast.error("Connect wallet to purchase");
      return;
    }

    if (!listing) return;

    setIsProcessing(true);
    try {
      const result = listing.isRental
        ? rentAgent(listing.id, publicKey.toBase58(), buyDays)
        : buyAgent(listing.id, publicKey.toBase58());

      if (!result.success) {
        toast.error("Purchase failed");
        setIsProcessing(false);
        return;
      }

      setPurchaseResult({
        success: true,
        txSig: result.txSig,
      });

      toast.success(
        listing.isRental
          ? `Rental succeeded (${buyDays} days)! https://solscan.io/tx/${result.txSig}?cluster=devnet`
          : `Purchase successful! https://solscan.io/tx/${result.txSig}?cluster=devnet`
      );
    } catch {
      toast.error("Transaction failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-red-500/20 bg-red-950/10">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-white">Listing not found</h3>
              <p className="text-sm text-zinc-400">
                This listing may have been sold or removed.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push("/marketplace")}
          className="bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
        >
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const listingPrice = listing.price ?? 0;
  const listingCurrency = listing.priceCurrency ?? "SOL";

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
          className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card className="border-[#14F195]/40 bg-[#111111]/50">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-[#14F195] mx-auto" />
              <h2 className="text-2xl font-bold text-white">
                {listing.isRental ? "Rental" : "Purchase"} Successful!
              </h2>
              <p className="text-zinc-400">
                {listing.name} is now in your collection.
              </p>

              {purchaseResult.txSig && (
                <div className="pt-4 space-y-2">
                  <p className="text-xs text-zinc-500">Transaction:</p>
                  <a
                    href={`https://solscan.io/tx/${purchaseResult.txSig}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#14F195]/20 text-[#14F195] hover:bg-[#14F195]/10 text-sm font-mono"
                  >
                    {purchaseResult.txSig.slice(0, 20)}...
                    <span>↗</span>
                  </a>
                </div>
              )}

              <div className="flex gap-3 justify-center pt-6">
                <Button
                  onClick={() => router.push("/agents")}
                  className="bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
                >
                  View My Agents
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/marketplace")}
                  className="border-white/10 text-white hover:bg-white/5"
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-white/10 bg-[#111111]/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">{listing.name}</CardTitle>
                  <p className="text-sm text-zinc-500 mt-2">{listing.tagline}</p>
                </div>
                {listing.isRental && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-0">
                    Available for Rental
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-zinc-300 mb-2">Personality</h3>
                <p className="text-zinc-400">{listing.personality}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 mb-1">Risk Level</h3>
                  <p className="text-white">{listing.riskLevel}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 mb-1">Daily Budget</h3>
                  <p className="text-white">${listing.dailyBudgetUsdc}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 mb-1">Max per Tx</h3>
                  <p className="text-white">{listing.maxSolPerTx} SOL</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 mb-1">Tools</h3>
                  <p className="text-white">{listing.tools?.length || 0} available</p>
                </div>
              </div>

              {listing.allowedActions && listing.allowedActions.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">Allowed Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.allowedActions.map((action) => (
                      <Badge key={action} variant="secondary" className="bg-zinc-800/50 border-0">
                        {action}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10">
                <h3 className="text-xs font-semibold text-zinc-500 mb-2">Mint Address</h3>
                <p className="text-xs text-zinc-400 font-mono break-all">{listing.mintAddress}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Purchase options */}
        <div className="space-y-4">
          <Card className="border-[#14F195]/40 bg-[#111111]/50">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#14F195]" />
                  {listing.isRental ? "Rent" : "Buy"}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-300">Price</h3>
                <p className="text-3xl font-bold text-[#14F195]">
                  {listingPrice}
                  <span className="text-sm text-zinc-400 ml-2">{listingCurrency}</span>
                </p>
              </div>

              {listing.isRental && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-300">Duration</h3>
                  <select
                    value={buyDays}
                    onChange={(e) => setBuyDays(parseInt(e.target.value))}
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-white/10 bg-[#0A0A0A] px-3 py-2 text-white text-sm focus:border-[#14F195]/40 focus:outline-none"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </div>
              )}

              <div className="pt-4 space-y-2 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Fee (2%)</span>
                  <span className="text-white">{(listingPrice * 0.02).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-[#14F195]">{(listingPrice * 1.02).toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleBuyNow}
                disabled={isProcessing || !publicKey}
                className="w-full gap-2 bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {listing.isRental ? "Rent Now" : "Buy Now"}
                  </>
                )}
              </Button>

              {!publicKey && (
                <p className="text-xs text-center text-zinc-500">
                  Connect wallet to purchase
                </p>
              )}
            </CardContent>
          </Card>

          {/* Seller info */}
          <Card className="border-white/10 bg-[#111111]/50">
            <CardHeader>
              <CardTitle className="text-sm">Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-400 font-mono break-all">
                {listing.seller}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
