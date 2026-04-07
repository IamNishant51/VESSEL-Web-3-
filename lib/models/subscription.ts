import mongoose, { Schema } from "mongoose";

export interface SubscriptionDoc {
  userId: string;
  tier: "free" | "pro" | "enterprise";
  status: "active" | "canceled" | "past_due" | "trialing";
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
  canceledReason?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  billingEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDoc>({
  userId: { type: String, required: true, unique: true, index: true },
  tier: {
    type: String,
    enum: ["free", "pro", "enterprise"],
    default: "free",
    index: true,
  },
  status: {
    type: String,
    enum: ["active", "canceled", "past_due", "trialing"],
    default: "active",
    index: true,
  },
  stripeSubscriptionId: { type: String, index: true },
  stripeCustomerId: { type: String, unique: true, sparse: true },
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  canceledAt: Date,
  canceledReason: String,
  autoRenew: { type: Boolean, default: true },
  paymentMethod: String,
  billingEmail: { type: String, index: true },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
});

// Update updatedAt on save
subscriptionSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const SubscriptionModel =
  mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

// Plan definitions
export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Free",
    priceMonthly: 0,
    stripePriceId: "free",
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
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || "price_pro",
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
    stripePriceId: process.env.STRIPE_PRICE_ID_ENTERPRISE || "price_enterprise",
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

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;
export type SubscriptionStatus = SubscriptionDoc["status"];
