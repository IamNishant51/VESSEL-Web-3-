"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { LandingNavigation } from "@/components/layout/landing-navigation";

const PLANS = [
  {
    name: "Free",
    price: 0,
    description: "Perfect for getting started",
    features: [
      "Create up to 3 agents",
      "100 API calls/day",
      "Basic analytics",
      "Community support",
      "Share agents",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: 99,
    description: "For active traders and developers",
    features: [
      "Create up to 50 agents",
      "5,000 API calls/day",
      "Rent out 10 agents",
      "Advanced analytics",
      "Priority support",
      "Custom agent configurations",
      "API webhooks",
    ],
    cta: "Subscribe Now",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: 299,
    description: "For teams and organizations",
    features: [
      "Create up to 500 agents",
      "50,000 API calls/day",
      "Rent out unlimited agents",
      "Advanced analytics & dashboards",
      "24/7 premium support",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (tier: "pro" | "enterprise") => {
    if (!publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          tier,
          billingEmail: "",
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      toast.error("Failed to start checkout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LandingNavigation forceLight />
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose the plan that works best for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
            {PLANS.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border transition-all ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 scale-105 md:scale-100 md:shadow-lg"
                    : "border-border bg-card"
                } p-8`}
              >
              {plan.highlighted && (
                <div className="mb-4 inline-block bg-primary px-3 py-1 rounded-full text-sm font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-foreground mb-2">
                {plan.name}
              </h3>
              <p className="text-muted-foreground mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">
                  ${plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground ml-2">/month</span>
                )}
              </div>

              <button
                onClick={() =>
                  plan.price > 0
                    ? handleSubscribe(plan.name.toLowerCase() as "pro" | "enterprise")
                    : null
                }
                disabled={loading || plan.price === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors mb-8 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "bg-accent text-accent-foreground hover:opacity-90"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {plan.price === 0 ? (
                  <Link href="/forge">{plan.cta}</Link>
                ) : (
                  plan.cta
                )}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
