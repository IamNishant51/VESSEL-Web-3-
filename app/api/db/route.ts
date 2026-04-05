import { NextResponse } from "next/server";

import { connectToDatabase, isMongoDBConnected } from "@/lib/mongodb";
import { Agent, MarketplaceListing, User, Transaction } from "@/lib/models";
import { dbActionSchema } from "@/lib/validation";
import { verifyWalletAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!isMongoDBConnected()) {
      await connectToDatabase();
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const validationResult = dbActionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: validationResult.error.issues.slice(0, 3).map((i) => i.message) },
        { status: 400 }
      );
    }

    const { action } = validationResult.data;

    const requiresAuth = ["save-agent", "delete-agent", "save-listing", "delete-listing", "save-transaction", "bulk-save-agents"];
    if (requiresAuth.includes(action)) {
      const authResult = await verifyWalletAuth(request as any);
      if (!authResult.valid) {
        return NextResponse.json({ error: authResult.error }, { status: authResult.status });
      }

      const ownerAddress = authResult.publicKey.toBase58();
      const data = validationResult.data as any;

      if (data.agent && data.agent.owner !== ownerAddress) {
        return NextResponse.json({ error: "Unauthorized: wallet does not match agent owner" }, { status: 403 });
      }
      if (data.ownerAddress && data.ownerAddress !== ownerAddress) {
        return NextResponse.json({ error: "Unauthorized: wallet mismatch" }, { status: 403 });
      }
      if (data.listing && data.listing.seller !== ownerAddress) {
        return NextResponse.json({ error: "Unauthorized: wallet does not match listing owner" }, { status: 403 });
      }
    }

    switch (action) {
      case "save-agent": {
        const agent = (validationResult.data as any).agent;

        const existingAgent = await Agent.findOne({ id: agent.id });
        if (existingAgent && existingAgent.owner !== agent.owner) {
          return NextResponse.json({ error: "Unauthorized: agent belongs to another user" }, { status: 403 });
        }

        await Agent.findOneAndUpdate(
          { id: agent.id },
          {
            id: agent.id,
            name: agent.name,
            tagline: agent.tagline || "",
            personality: agent.personality || "",
            owner: agent.owner || "",
            riskLevel: agent.riskLevel || "Balanced",
            dailyBudgetUsdc: agent.dailyBudgetUsdc || 100,
            maxSolPerTx: agent.maxSolPerTx || 0.5,
            allowedActions: agent.allowedActions || [],
            tools: agent.tools || [],
            treasuryBalance: agent.treasuryBalance ?? 10,
            earnings: agent.earnings ?? 0,
            totalActions: agent.totalActions ?? 0,
            reputation: agent.reputation ?? 80,
            listed: !!agent.listed,
            isRental: !!agent.isRental,
            mintAddress: agent.mintAddress || "",
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
      }

      case "bulk-save-agents": {
        const agents = (validationResult.data as any).agents;

        for (const agent of agents) {
          const existingAgent = await Agent.findOne({ id: agent.id });
          if (existingAgent && existingAgent.owner !== agent.owner) {
            return NextResponse.json({ error: `Unauthorized: agent ${agent.id} belongs to another user` }, { status: 403 });
          }
        }

        const ops = agents.map((agent: Record<string, unknown>) => ({
          updateOne: {
            filter: { id: String(agent.id) },
            update: {
              $set: {
                name: String(agent.name || ""),
                tagline: String(agent.tagline || ""),
                personality: String(agent.personality || ""),
                owner: String(agent.owner || ""),
                riskLevel: String(agent.riskLevel || "Balanced"),
                dailyBudgetUsdc: Number(agent.dailyBudgetUsdc) || 100,
                maxSolPerTx: Number(agent.maxSolPerTx) || 0.5,
                allowedActions: Array.isArray(agent.allowedActions) ? agent.allowedActions : [],
                tools: Array.isArray(agent.tools) ? agent.tools : [],
                treasuryBalance: Number(agent.treasuryBalance) ?? 10,
                earnings: Number(agent.earnings) ?? 0,
                totalActions: Number(agent.totalActions) ?? 0,
                reputation: Number(agent.reputation) ?? 80,
                listed: !!agent.listed,
                isRental: !!agent.isRental,
                mintAddress: String(agent.mintAddress || ""),
              },
            },
            upsert: true,
          },
        }));

        await Agent.bulkWrite(ops);
        return NextResponse.json({ success: true, count: agents.length });
      }

      case "delete-agent": {
        const { agentId } = validationResult.data as any;

        const existingAgent = await Agent.findOne({ id: agentId });
        if (!existingAgent) {
          return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        const authResult = await verifyWalletAuth(request as any);
        if (authResult.valid && existingAgent.owner !== authResult.publicKey.toBase58()) {
          return NextResponse.json({ error: "Unauthorized: agent belongs to another user" }, { status: 403 });
        }

        await Agent.deleteOne({ id: agentId });
        return NextResponse.json({ success: true });
      }

      case "fetch-agents": {
        const { walletAddress } = body;
        const query = walletAddress ? { owner: walletAddress } : {};
        const agents = await Agent.find(query).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ agents });
      }

      case "fetch-agent-by-id": {
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
        }

        const agent = await Agent.findOne({ id: agentId }).lean();
        if (!agent) {
          return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        return NextResponse.json({ agent });
      }

      case "save-listing": {
        const listing = (validationResult.data as any).listing;

        const existingListing = await MarketplaceListing.findOne({ id: listing.id });
        if (existingListing && existingListing.seller !== listing.seller) {
          return NextResponse.json({ error: "Unauthorized: listing belongs to another user" }, { status: 403 });
        }

        await MarketplaceListing.findOneAndUpdate(
          { id: listing.id },
          {
            id: listing.id,
            seller: listing.seller,
            price: listing.price,
            currency: listing.currency || "SOL",
            isRental: !!listing.isRental,
            rentalDays: listing.rentalDays,
            listedAt: new Date().toISOString(),
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
      }

      case "delete-listing": {
        const { agentId } = validationResult.data as any;

        const existingListing = await MarketplaceListing.findOne({ id: agentId });
        if (!existingListing) {
          return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        const authResult = await verifyWalletAuth(request as any);
        if (authResult.valid && existingListing.seller !== authResult.publicKey.toBase58()) {
          return NextResponse.json({ error: "Unauthorized: listing belongs to another user" }, { status: 403 });
        }

        await MarketplaceListing.deleteOne({ id: agentId });
        return NextResponse.json({ success: true });
      }

      case "fetch-listings": {
        const { seller, includeAll } = body;
        const query = seller ? { seller } : includeAll ? {} : {};
        const listings = await MarketplaceListing.find(query).sort({ listedAt: -1 }).lean();
        return NextResponse.json({ listings });
      }

      case "save-transaction": {
        const tx = (validationResult.data as any).tx;

        await Transaction.create({
          transactionSignature: tx.transactionSignature,
          type: tx.type,
          agentId: tx.agentId,
          timestamp: tx.timestamp,
          amount: tx.amount,
          target: tx.target,
          metadata: tx.metadata || {},
        });

        return NextResponse.json({ success: true });
      }

      case "fetch-transactions": {
        const { agentId, limit = 50 } = body;
        const query = agentId ? { agentId } : {};
        const transactions = await Transaction.find(query).sort({ timestamp: -1 }).limit(limit).lean();
        return NextResponse.json({ transactions });
      }

      case "user-stats": {
        const { ownerAddress, stats } = body;
        if (!ownerAddress) {
          return NextResponse.json({ error: "Missing ownerAddress" }, { status: 400 });
        }

        await User.findOneAndUpdate(
          { walletAddress: ownerAddress },
          {
            walletAddress: ownerAddress,
            totalAgents: stats?.totalAgents ?? 0,
            totalTransactions: stats?.totalTransactions ?? 0,
            totalEarnings: stats?.totalEarnings ?? 0,
            lastActive: new Date().toISOString(),
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
      }

      case "fetch-user-stats": {
        const { walletAddress } = body;
        if (!walletAddress) {
          return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
        }

        const user = await User.findOne({ walletAddress }).lean();
        return NextResponse.json({ stats: user || null });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
