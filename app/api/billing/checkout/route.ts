import { NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

// Subscription tier pricing (in cents)
const TIER_PRICING = {
  pro: 9900, // $99/month
  enterprise: 29900, // $299/month
};

// Create checkout session
export async function POST(request: Request) {
  try {
    const { walletAddress, tier, billingEmail } = await request.json();

    const schema = z.object({
      walletAddress: z.string().length(44),
      tier: z.enum(["pro", "enterprise"]),
      billingEmail: z.string().email(),
    });

    const validated = schema.parse({ walletAddress, tier, billingEmail });

    await connectToDatabase();

    // Get or create Stripe customer
    const customer = await stripe.customers.search({
      query: `metadata["walletAddress"]:"${validated.walletAddress}"`,
      limit: 1,
    });

    let customerId: string;
    if (customer.data.length > 0) {
      customerId = customer.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: validated.billingEmail,
        metadata: {
          walletAddress: validated.walletAddress,
        },
      });
      customerId = newCustomer.id;
    }

    // Create or get price ID
    let priceId = process.env[`STRIPE_PRICE_ID_${tier.toUpperCase()}`];

    if (!priceId) {
      // Create price if not available
      const product = await stripe.products.create({
        name: `VESSEL ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
        description: `VESSEL ${tier} subscription`,
        metadata: {
          tier,
        },
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: TIER_PRICING[tier as keyof typeof TIER_PRICING],
        currency: "usd",
        recurring: {
          interval: "month",
          interval_count: 1,
        },
      });

      priceId = price.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing`,
      subscription_data: {
        metadata: {
          walletAddress: validated.walletAddress,
          tier,
        },
      },
      customer_email: validated.billingEmail,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("[Billing] Create checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
