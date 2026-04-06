import Stripe from "stripe";
import { SUBSCRIPTION_PLANS, SubscriptionTier } from "@/lib/models/subscription";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
      typescript: true,
    })
  : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
  }
  return stripe;
}

/**
 * Creates a Stripe customer for a user
 */
export async function createStripeCustomer(
  email: string,
  userId: string,
  metadata?: Record<string, string>
) {
  try {
    const customer = await getStripe().customers.create({
      email,
      metadata: {
        userId,
        ...metadata,
      },
    });
    return customer;
  } catch (error) {
    console.error("[Stripe] Failed to create customer:", error);
    throw error;
  }
}

/**
 * Creates a subscription for a user
 */
export async function createSubscription(
  customerId: string,
  tier: SubscriptionTier,
  trialDays: number = 14
) {
  try {
    if (tier === "free") {
      throw new Error("Cannot create subscription for free tier");
    }

    const plan = SUBSCRIPTION_PLANS[tier];
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [
        {
          price: plan.stripePriceId,
        },
      ],
      trial_period_days: trialDays,
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice"],
    });

    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to create subscription:", error);
    throw error;
  }
}

/**
 * Cancels a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  reason?: string,
  immediate: boolean = false
) {
  try {
    if (immediate) {
      const subscription = await getStripe().subscriptions.cancel(subscriptionId);
      return subscription;
    } else {
      const subscription = await getStripe().subscriptions.update(subscriptionId, {
        metadata: {
          cancelReason: reason || "User requested",
        },
        cancel_at_period_end: true,
      });
      return subscription;
    }
  } catch (error) {
    console.error("[Stripe] Failed to cancel subscription:", error);
    throw error;
  }
}

/**
 * Updates a subscription to a new tier
 */
export async function updateSubscriptionTier(
  subscriptionId: string,
  newTier: SubscriptionTier
) {
  try {
    if (newTier === "free") {
      return cancelSubscription(subscriptionId, "Downgraded to free");
    }

    const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
    const plan = SUBSCRIPTION_PLANS[newTier];

    const updated = await getStripe().subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: plan.stripePriceId,
        },
      ],
      proration_behavior: "create_prorations",
    });

    return updated;
  } catch (error) {
    console.error("[Stripe] Failed to update subscription:", error);
    throw error;
  }
}

/**
 * Retrieves subscription details
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
      expand: ["customer", "latest_invoice"],
    });
    return subscription;
  } catch (error) {
    console.error("[Stripe] Failed to retrieve subscription:", error);
    throw error;
  }
}

/**
 * Retrieves customer subscriptions
 */
export async function getCustomerSubscriptions(customerId: string) {
  try {
    const subscriptions = await getStripe().subscriptions.list({
      customer: customerId,
    });
    return subscriptions.data;
  } catch (error) {
    console.error("[Stripe] Failed to retrieve customer subscriptions:", error);
    throw error;
  }
}

/**
 * Validates webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  try {
    return getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("[Stripe] Webhook verification failed:", error);
    throw error;
  }
}

/**
 * Creates a checkout session
 */
export async function createCheckoutSession(
  customerId: string,
  tier: SubscriptionTier,
  successUrl: string,
  cancelUrl: string
) {
  try {
    if (tier === "free") {
      throw new Error("Cannot create checkout for free tier");
    }

    const plan = SUBSCRIPTION_PLANS[tier];
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: "auto",
      subscription_data: {
        trial_period_days: 14,
      },
    });

    return session;
  } catch (error) {
    console.error("[Stripe] Failed to create checkout session:", error);
    throw error;
  }
}

/**
 * Creates a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("[Stripe] Failed to create billing portal session:", error);
    throw error;
  }
}
