/**
 * Mongoose Models
 * Agent, MarketplaceListing, User, Transaction, Conversation, Follow, Like
 */

import mongoose, { Schema, Types } from "mongoose";

// ===== Agent Model =====
export interface IAgentDoc {
  _id: Types.ObjectId;
  id: string;
  name: string;
  tagline: string;
  personality: string;
  owner: string;
  riskLevel: string;
  dailyBudgetUsdc: number;
  maxSolPerTx: number;
  allowedActions: string[];
  tools: string[];
  treasuryBalance: number;
  earnings: number;
  totalActions: number;
  reputation: number;
  listed: boolean;
  isRental: boolean;
  mintAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const AgentSchema = new Schema<IAgentDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    tagline: { type: String, default: "Give Your Ideas a Soul" },
    personality: { type: String, required: true },
    owner: { type: String, required: true, index: true },
    riskLevel: { type: String, default: "Balanced" },
    dailyBudgetUsdc: { type: Number, default: 100 },
    maxSolPerTx: { type: Number, default: 0.5 },
    allowedActions: { type: [String], default: [] },
    tools: { type: [String], default: [] },
    treasuryBalance: { type: Number, default: 10 },
    earnings: { type: Number, default: 0 },
    totalActions: { type: Number, default: 0 },
    reputation: { type: Number, default: 80 },
    listed: { type: Boolean, default: false, index: true },
    isRental: { type: Boolean, default: false },
    mintAddress: { type: String, default: "" },
  },
  {
    timestamps: true,
    collection: "agents",
  }
);

AgentSchema.index({ owner: 1, listed: 1 });
AgentSchema.index({ reputation: -1 });
AgentSchema.index({ totalActions: -1 });
// Composite indexes for common query patterns
AgentSchema.index({ owner: 1, createdAt: -1 }); // User agent listings
AgentSchema.index({ listed: 1, reputation: -1 }); // Marketplace browsing sorted by reputation
AgentSchema.index({ listed: 1, totalActions: -1 }); // Marketplace browsing sorted by activity
AgentSchema.index({ name: 1, owner: 1 }); // Search by name for owner

export const Agent =
  (mongoose.models.Agent as mongoose.Model<IAgentDoc>) ||
  mongoose.model<IAgentDoc>("Agent", AgentSchema);

// ===== MarketplaceListing Model =====
export interface IMarketplaceListingDoc {
  _id: Types.ObjectId;
  id: string;
  agentId: string;
  name: string;
  seller: string;
  price: number;
  priceCurrency: "SOL" | "USDC";
  isRental: boolean;
  rentalDays: number;
  listed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListingDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    seller: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    priceCurrency: { type: String, enum: ["SOL", "USDC"], default: "SOL" },
    isRental: { type: Boolean, default: false },
    rentalDays: { type: Number, default: 7 },
    listed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "marketplace_listings",
  }
);

MarketplaceListingSchema.index({ seller: 1 });
MarketplaceListingSchema.index({ price: 1 });
// Composite indexes for common query patterns
MarketplaceListingSchema.index({ listed: 1, price: 1 }); // Active listings sorted by price
MarketplaceListingSchema.index({ seller: 1, createdAt: -1 }); // Seller's listings
MarketplaceListingSchema.index({ agentId: 1, listed: 1 }); // Agent listings status

export const MarketplaceListing =
  (mongoose.models.MarketplaceListing as mongoose.Model<IMarketplaceListingDoc>) ||
  mongoose.model<IMarketplaceListingDoc>("MarketplaceListing", MarketplaceListingSchema);

// ===== User Model =====
export interface IUserDoc {
  _id: Types.ObjectId;
  walletAddress: string;
  agentCount: number;
  totalEarnings: number;
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: boolean;
  };
  deviceTokens?: Array<{
    id: string;
    ip?: string;
    userAgent?: string;
    lastActive: Date;
    name?: string;
  }>;
  lastLogin?: Date;
  twoFactorEnabled?: boolean;
  premiumTier?: "free" | "pro" | "enterprise";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    walletAddress: { type: String, required: true, unique: true, index: true },
    agentCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    preferences: {
      theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
      language: { type: String, default: "en" },
      notifications: { type: Boolean, default: true },
    },
    deviceTokens: [
      {
        id: { type: String, required: true },
        ip: String,
        userAgent: String,
        lastActive: { type: Date, default: Date.now },
        name: String,
      },
    ],
    lastLogin: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    premiumTier: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Composite indexes for User model
UserSchema.index({ premiumTier: 1, createdAt: -1 }); // Premium user lookups
UserSchema.index({ walletAddress: 1, lastLogin: -1 }); // Recent active users

export const User =
  (mongoose.models.User as mongoose.Model<IUserDoc>) ||
  mongoose.model<IUserDoc>("User", UserSchema);

// ===== Transaction Model =====
export interface ITransactionDoc {
  _id: Types.ObjectId;
  transactionSignature: string;
  type: "mint" | "buy" | "rent" | "transfer" | "tool_call" | "settlement";
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  agentId: string;
  status: "pending" | "confirmed" | "failed";
  explorerUrl: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const TransactionSchema = new Schema<ITransactionDoc>(
  {
    transactionSignature: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["mint", "buy", "rent", "transfer", "tool_call", "settlement"],
      required: true,
      index: true,
    },
    fromAddress: { type: String, required: true, index: true },
    toAddress: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "SOL" },
    agentId: { type: String, required: true, index: true },
    status: { type: String, enum: ["pending", "confirmed", "failed"], default: "pending" },
    explorerUrl: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
    collection: "transactions",
  }
);

TransactionSchema.index({ fromAddress: 1, createdAt: -1 });
TransactionSchema.index({ agentId: 1, createdAt: -1 });
TransactionSchema.index({ status: 1 });

export const Transaction =
  (mongoose.models.Transaction as mongoose.Model<ITransactionDoc>) ||
  mongoose.model<ITransactionDoc>("Transaction", TransactionSchema);

// ===== Conversation Model =====
export interface IConversationDoc {
  _id: Types.ObjectId;
  id: string;
  agentId: string;
  walletAddress: string;
  title: string;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
    transactionSignature?: string;
    explorerUrl?: string;
    type?: string;
    toolName?: string;
    toolStatus?: string;
    toolDetails?: Record<string, unknown>;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  id: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Number, required: true },
  transactionSignature: { type: String },
  explorerUrl: { type: String },
  type: { type: String },
  toolName: { type: String },
  toolStatus: { type: String },
  toolDetails: { type: Schema.Types.Mixed },
}, { _id: false });

const ConversationSchema = new Schema<IConversationDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    agentId: { type: String, required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New conversation" },
    messages: { type: [MessageSchema], default: [] },
  },
  {
    timestamps: true,
    collection: "conversations",
  }
);

ConversationSchema.index({ agentId: 1, walletAddress: 1, updatedAt: -1 });

export const Conversation =
  (mongoose.models.Conversation as mongoose.Model<IConversationDoc>) ||
  mongoose.model<IConversationDoc>("Conversation", ConversationSchema);

// ===== Follow Model =====
export interface IFollowDoc {
  _id: Types.ObjectId;
  id: string;
  followerWallet: string;
  agentId: string;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollowDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    followerWallet: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: "follows",
  }
);

FollowSchema.index({ followerWallet: 1, agentId: 1 }, { unique: true });
FollowSchema.index({ agentId: 1, createdAt: -1 });

export const Follow =
  (mongoose.models.Follow as mongoose.Model<IFollowDoc>) ||
  mongoose.model<IFollowDoc>("Follow", FollowSchema);

// ===== Like Model =====
export interface ILikeDoc {
  _id: Types.ObjectId;
  id: string;
  walletAddress: string;
  agentId: string;
  createdAt: Date;
}

const LikeSchema = new Schema<ILikeDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    agentId: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
    collection: "likes",
  }
);

LikeSchema.index({ walletAddress: 1, agentId: 1 }, { unique: true });
LikeSchema.index({ agentId: 1, createdAt: -1 });

export const Like =
  (mongoose.models.Like as mongoose.Model<ILikeDoc>) ||
  mongoose.model<ILikeDoc>("Like", LikeSchema);

// ===== Subscription Model =====
export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface ISubscriptionDoc {
  _id: Types.ObjectId;
  id: string;
  walletAddress: string;
  tier: SubscriptionTier;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status: "active" | "inactive" | "canceled" | "past_due";
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  features: {
    maxAgents: number;
    maxRentals: number;
    maxDailyApiCalls: number;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
  };
  billingEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscriptionDoc>(
  {
    id: { type: String, required: true, unique: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    tier: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    stripeCustomerId: { type: String, required: true, unique: true },
    stripeSubscriptionId: { type: String, sparse: true, index: true },
    stripePriceId: { type: String, sparse: true },
    status: { type: String, enum: ["active", "inactive", "canceled", "past_due"], default: "inactive" },
    currentPeriodStart: { type: Date, required: true },
    currentPeriodEnd: { type: Date, required: true },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    canceledAt: { type: Date, sparse: true },
    features: {
      maxAgents: { type: Number, default: 3 },
      maxRentals: { type: Number, default: 0 },
      maxDailyApiCalls: { type: Number, default: 100 },
      prioritySupport: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
    },
    billingEmail: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

SubscriptionSchema.index({ walletAddress: 1 });
SubscriptionSchema.index({ stripeCustomerId: 1 });
SubscriptionSchema.index({ tier: 1, status: 1 });

export const Subscription =
  (mongoose.models.Subscription as mongoose.Model<ISubscriptionDoc>) ||
  mongoose.model<ISubscriptionDoc>("Subscription", SubscriptionSchema);
