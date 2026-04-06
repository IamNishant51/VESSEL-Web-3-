"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

// Pricing tiers data (duplicated to avoid server import)
const PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    limits: {
      agentsPerUser: 3,
      conversationsPerDay: 100,
      apiCallsPerMonth: 10000,
      storageGB: 1,
      customPersonality: false,
      analyticsAccess: false,
      communitySupport: true,
    },
  },
  pro: {
    name: "Pro",
    priceMonthly: 29,
    limits: {
      agentsPerUser: 50,
      conversationsPerDay: 10000,
      apiCallsPerMonth: 1000000,
      storageGB: 100,
      customPersonality: true,
      analyticsAccess: true,
      communitySupport: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    name: "Enterprise",
    priceMonthly: 299,
    limits: {
      agentsPerUser: Infinity,
      conversationsPerDay: Infinity,
      apiCallsPerMonth: Infinity,
      storageGB: 1000,
      customPersonality: true,
      analyticsAccess: true,
      communitySupport: true,
      prioritySupport: true,
      dedicatedAccount: true,
      customIntegrations: true,
    },
  },
};

type SubscriptionTier = "free" | "pro" | "enterprise";

export function PricingPage() {
  const { publicKey, signMessage } = useWallet();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (tier === "free") {
      toast.info("You're already on the free plan");
      return;
    }

    if (!publicKey || !signMessage) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(tier);

      // Sign message for verification
      const message = new TextEncoder().encode(`Upgrade to ${tier} - ${Date.now()}`);
      const signature = await signMessage(message);

      // Request checkout session
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          tier,
          message: Buffer.from(message).toString("base64"),
          signature: Buffer.from(signature).toString("base64"),
          billingEmail: `user-${publicKey.toString().slice(0, 8)}@vessel.local`,
        }),
      });

      if (!response.ok) throw new Error("Failed to create checkout");

      const { checkoutUrl } = await response.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade subscription");
    } finally {
      setLoading(null);
    }
  };

  const tiers: Array<{
    key: SubscriptionTier;
    popular?: boolean;
  }> = [
    { key: "free" },
    { key: "pro", popular: true },
    { key: "enterprise" },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the perfect plan for your AI agent needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map(({ key, popular }) => {
            const plan = PLANS[key];
            return (
              <div
                key={key}
                className={`relative rounded-lg border-2 transition-all ${
                  popular
                    ? "border-primary bg-card shadow-lg scale-105"
                    : "border-border bg-card hover:border-muted-foreground"
                }`}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-foreground">
                      ${plan.priceMonthly}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(key as SubscriptionTier)}
                    disabled={loading === key}
                    className={`w-full py-3 px-4 rounded-lg font-semibold mb-8 transition-all ${
                      key === "free"
                        ? "bg-muted text-muted-foreground cursor-default"
                        : popular
                          ? "bg-primary text-primary-foreground hover:opacity-90"
                          : "bg-card border border-border text-foreground hover:bg-accent"
                    } ${loading === key ? "opacity-50 cursor-wait" : ""}`}
                  >
                    {loading === key
                      ? "Processing..."
                      : key === "free"
                        ? "Current Plan"
                        : "Upgrade"}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="font-semibold text-foreground mb-4">
                      Includes:
                    </div>
                    {Object.entries(plan.limits).map(([feature, limit]) => {
                      let displayValue = "";
                      if (typeof limit === "boolean") {
                        displayValue = limit ? "Yes" : "No";
                      } else if (typeof limit === "number") {
                        if (limit === Infinity) {
                          displayValue = "Unlimited";
                        } else if (limit > 1000) {
                          displayValue = `${(limit / 1000).toFixed(0)}K`;
                        } else {
                          displayValue = limit.toString();
                        }
                      }

                      return (
                        <div
                          key={feature}
                          className="flex items-start gap-3 text-sm"
                        >
                          <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {feature
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            :{" "}
                            <span className="text-foreground font-medium">
                              {displayValue}
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes, you can upgrade or downgrade at any time. Changes take effect immediately.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through Stripe.",
              },
              {
                q: "Do you offer refunds?",
                a: "If you cancel within 14 days of trial, we offer a full refund.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes, all paid plans start with a 14-day free trial.",
              },
            ].map((faq, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
