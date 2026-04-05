import { NextResponse } from "next/server";

import { connectToDatabase, isMongoDBConnected } from "@/lib/mongodb";
import { Agent, MarketplaceListing, User, Transaction } from "@/lib/models";

export async function POST(request: Request) {
  try {
    if (!isMongoDBConnected()) {
      await connectToDatabase();
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ===== AGENTS =====
      case "save-agent": {
        const agent = body.agent;
        if (!agent?.id) {
          return NextResponse.json({ error: "Missing agent.id" }, { status: 400 });
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
        const agents: Array<Record<string, unknown>> = body.agents;
        if (!Array.isArray(agents)) {
          return NextResponse.json({ error: "Missing agents array" }, { status: 400 });
        }

        const ops = agents.map((agent) => ({
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
        const { agentId } = body;
        if (!agentId) {
          return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
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

      // ===== LISTINGS =====
      case "save-listing": {
        const listing = body.listing;
        if (!listing?.id) {
          return NextResponse.json({ error: "Missing listing.id" }, { status: 400 });
        }

        await MarketplaceListing.findOneAndUpdate(
          { id: listing.id },
          {
            id: listing.id,
            agentId: listing.agentId,
            name: listing.name,
            seller: listing.seller,
            price: listing.price,
            priceCurrency: listing.priceCurrency || "SOL",
            isRental: !!listing.isRental,
            rentalDays: listing.rentalDays || 7,
            listed: true,
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
      }

      case "delete-listing": {
        const { listingId } = body;
        if (!listingId) {
          return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
        }

        await MarketplaceListing.deleteOne({ id: listingId });
        return NextResponse.json({ success: true });
      }

      case "fetch-listings": {
        const listings = await MarketplaceListing.find({ listed: true })
          .sort({ createdAt: -1 })
          .lean();
        return NextResponse.json({ listings });
      }

      // ===== TRANSACTIONS =====
      case "save-transaction": {
        const tx = body.tx;
        if (!tx?.transactionSignature) {
          return NextResponse.json({ error: "Missing transactionSignature" }, { status: 400 });
        }

        await Transaction.findOneAndUpdate(
          { transactionSignature: tx.transactionSignature },
          {
            transactionSignature: tx.transactionSignature,
            type: tx.type || "tool_call",
            fromAddress: tx.fromAddress || "",
            toAddress: tx.toAddress || "",
            amount: tx.amount || 0,
            currency: tx.currency || "SOL",
            agentId: tx.agentId || "",
            status: tx.status || "confirmed",
            explorerUrl: tx.explorerUrl || "",
            metadata: tx.metadata || {},
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
      }

      // ===== USER STATS =====
      case "user-stats": {
        const { walletAddress } = body;
        if (!walletAddress) {
          return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
        }

        const agentCount = await Agent.countDocuments({ owner: walletAddress });
        const agents = await Agent.find({ owner: walletAddress }).lean() as unknown as Array<Record<string, unknown>>;
        const totalEarnings = agents.reduce((sum: number, a) => sum + (Number(a.earnings) || 0), 0);

        await User.findOneAndUpdate(
          { walletAddress },
          {
            walletAddress,
            agentCount,
            totalEarnings,
          },
          { upsert: true, new: true }
        );

        return NextResponse.json({ stats: { agentCount, totalEarnings } });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("[DB API] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Database operation failed" },
      { status: 500 }
    );
  }
}
