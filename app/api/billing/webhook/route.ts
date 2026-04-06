import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import { Subscription } from "@/lib/models";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const TIER_FEATURES = {
  pro: {
    maxAgents: 50,
    maxRentals: 10,
    maxDailyApiCalls: 5000,
    prioritySupport: true,
    advancedAnalytics: false,
  },
  enterprise: {
    maxAgents: 500,
    maxRentals: 100,
    maxDailyApiCalls: 50000,
    prioritySupport: true,
    advancedAnalytics: true,
  },
};

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  await connectToDatabase();

  try {
    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const meta = subscription.metadata as { walletAddress?: string; tier?: string };
        const walletAddress = meta.walletAddress;
        const tier = meta.tier || "pro";

        if (walletAddress) {
          await Subscription.updateOne(
            { walletAddress },
            {
              status: subscription.status === "active" ? "active" : "inactive",
              stripeSubscriptionId: subscription.id,
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            { upsert: true }
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const meta = subscription.metadata as { walletAddress?: string };
        const walletAddress = meta.walletAddress;

        if (walletAddress) {
          await Subscription.updateOne(
            { walletAddress },
            { status: "canceled", tier: "free" }
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
