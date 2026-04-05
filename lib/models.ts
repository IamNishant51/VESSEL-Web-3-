/**
 * Mongoose Models
 * Agent, MarketplaceListing, User, Transaction
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

export const MarketplaceListing =
  (mongoose.models.MarketplaceListing as mongoose.Model<IMarketplaceListingDoc>) ||
  mongoose.model<IMarketplaceListingDoc>("MarketplaceListing", MarketplaceListingSchema);

// ===== User Model =====
export interface IUserDoc {
  _id: Types.ObjectId;
  walletAddress: string;
  agentCount: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDoc>(
  {
    walletAddress: { type: String, required: true, unique: true, index: true },
    agentCount: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

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
