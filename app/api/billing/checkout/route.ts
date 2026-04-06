import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { getStripe, createStripeCustomer, createCheckoutSession } from "@/lib/stripe";
import type { SubscriptionTier } from "@/lib/models/subscription";

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Billing is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const { walletAddress, tier, billingEmail } = await request.json();

    const schema = z.object({
      walletAddress: z.string().min(44).max(44),
      tier: z.enum(["pro", "enterprise"]),
      billingEmail: z.string().email(),
    });

    const validated = schema.parse({ walletAddress, tier, billingEmail });

    await connectToDatabase();

    const customer = await createStripeCustomer(
      validated.billingEmail,
      validated.walletAddress
    );

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const session = await createCheckoutSession(
      customer.id,
      validated.tier as SubscriptionTier,
      `${baseUrl}/billing?success=true`,
      `${baseUrl}/billing?canceled=true`
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("[Billing] Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Vessel Billing API - POST to create checkout session",
    tiers: {
      pro: { price: "$99/month", features: ["Advanced agent tools", "Priority support", "Higher limits"] },
      enterprise: { price: "$299/month", features: ["Everything in Pro", "Custom integrations", "Dedicated support"] },
    },
  });
}
