# VESSEL — Development vs Production Guide

## Current State: Development Mode

This project is currently configured in **development mode** (`NEXT_PUBLIC_DEV_MODE=true`). All on-chain operations are simulated — no SOL is required, no real transactions are sent, and no Merkle tree or collection mint is needed.

---

## How Dev Mode Works

| Feature | Dev Mode | Production Mode |
|---|---|---|
| Mint transaction | Simulated (1.5s delay, mock address/signature) | Real cNFT on Solana via Bubblegum |
| SOL balance check | Skipped | Required (≥ 0.01 SOL) |
| Preflight checks | Skipped | Merkle tree + collection mint validated |
| Wallet requirement | Must be connected | Must be connected + have SOL |
| Supported wallets | Any (Brave, Phantom, Solflare) | Phantom or Solflare recommended |
| Explorer link | `#` (no real tx) | Real Solana Explorer URL |

---

## Production-Ready Components

These components are fully built and will work in production once the on-chain infrastructure is configured:

### 1. Wallet Integration
- **File:** `components/wallet/wallet-provider.tsx`
- **Adapters:** Phantom, Backpack, Solflare
- **Features:** Auto-reconnect, disconnect guard, localStorage persistence
- **Status:** Production-ready

### 2. Forge UI (Agent Creator)
- **File:** `app/(core)/forge/page.tsx`
- **Features:** 4-step form (Identity → Tools → Economy → Deployment), intersection-based step tracking, real-time preview
- **Status:** Production-ready (dev mode skips on-chain requirements)

### 3. cNFT Minting Engine
- **File:** `lib/metaplex.ts`
- **Stack:** Metaplex Umi + Bubblegum (`mintToCollectionV1`)
- **Features:** Compressed NFT minting with dynamic metadata, leaf parsing, asset PDA derivation
- **Status:** Production-ready (dev mode returns simulated results)

### 4. Dynamic Metadata Generation
- **File:** `app/api/agents/metadata/route.ts`
- **Features:** On-the-fly Metaplex-compatible JSON with SVG artwork, traits, properties
- **Status:** Production-ready

### 5. Mint Preflight API
- **File:** `app/api/agents/mint-preflight/route.ts`
- **Features:** Validates env vars, RPC connectivity, on-chain account existence, retry logic
- **Status:** Production-ready (dev mode returns `ready: true`)

### 6. Agent Store (Zustand)
- **File:** `store/useVesselStore.ts`
- **Features:** Persistent localStorage, CRUD operations, treasury management, marketplace listings, rental system
- **Status:** Production-ready

### 7. Marketplace
- **File:** `app/(core)/marketplace/page.tsx`, `app/(core)/marketplace/[id]/page.tsx`
- **Features:** Browse agents, buy/rent with SOL, 2% fee calculation, settlement flow
- **Status:** Production-ready

### 8. SOL Payment System
- **File:** `lib/solana-payments.ts`
- **Features:** `sendConfirmedSolTransfer()` — creates, signs, sends, and confirms SOL transfers
- **Status:** Production-ready

### 9. Agent Runner & Chat
- **File:** `lib/agent-runner.ts`, `components/agents/AgentRunnerChat.tsx`
- **Features:** Prompt injection detection, rate limiting, on-chain balance lookup, tool execution
- **Status:** Production-ready

### 10. Agent API Endpoints
- **Files:** `app/api/agents/[id]/run/route.ts`, `app/api/agents/tools/route.ts`, `app/api/agents/generate-image/route.ts`
- **Features:** Agent execution, tool catalog, image generation with rate limiting
- **Status:** Production-ready

### 11. Dashboard & Agent Management
- **Files:** `app/(core)/dashboard/page.tsx`, `app/(core)/agents/page.tsx`, `app/(core)/agents/[id]/page.tsx`
- **Features:** Agent overview, orchestration, stats tracking, deletion
- **Status:** Production-ready

### 12. Network Configuration
- **File:** `lib/solana.ts`
- **Features:** Environment-based network selection (devnet/mainnet), RPC URL resolution
- **Status:** Production-ready

---

## What's Needed for Production

### Environment Variables to Set

```env
# Switch network to mainnet
NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Remove dev mode
# NEXT_PUBLIC_DEV_MODE=true  ← DELETE or set to false

# Bubblegum cNFT infrastructure (one-time setup)
NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE=<your-merkle-tree-address>
NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT=<your-collection-mint-address>
```

### One-Time On-Chain Setup

1. **Create a Merkle Tree**
   ```bash
   node scripts/create-merkle-tree.mjs --keypair /path/to/keypair.json --rpc https://api.mainnet-beta.solana.com
   ```
   This deploys a new Bubblegum merkle tree on-chain. Save the output address as `NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE`.

2. **Create a Collection Mint**
   Use Metaplex Token Metadata to create an NFT collection that will own all agent cNFTs. Save the mint address as `NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT`.

3. **Fund the Wallet**
   Ensure the wallet used for minting has enough SOL for transaction fees (~0.002 SOL per mint).

4. **Update RPC (Optional)**
   For production reliability, use a dedicated RPC provider (Helius, Triton, QuickNode) instead of the public `api.mainnet-beta.solana.com`.

### Code Changes for Production

1. Set `NEXT_PUBLIC_DEV_MODE=false` or remove it from `.env.local`
2. Set `NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=mainnet-beta`
3. Set `NEXT_PUBLIC_SOLANA_RPC_URL` to your production RPC endpoint
4. Set `NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE` and `NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT`
5. Restart the dev server: `npm run dev`

The code automatically detects these values and switches to real on-chain operations.

---

## Dev Mode Limitations

- No real on-chain transaction occurs
- Mint address and signature are randomly generated (not verifiable)
- Explorer link is `#` (no real transaction to view)
- Agents created in dev mode exist only in localStorage
- Marketplace buy/rent still works locally but won't transfer real SOL unless dev mode is off
- Agent orchestration and chat work fully (they don't require on-chain state)

---

## Switching from Dev → Production Checklist

- [ ] Set up Merkle tree on mainnet
- [ ] Create collection mint on mainnet
- [ ] Add addresses to `.env.local`
- [ ] Change `NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=mainnet-beta`
- [ ] Set production RPC URL (or use default mainnet)
- [ ] Remove or set `NEXT_PUBLIC_DEV_MODE=false`
- [ ] Restart dev server
- [ ] Test mint with small amount of SOL in wallet
- [ ] Verify transaction appears on Solana Explorer

---

## Current File Inventory

| File | Purpose | Dev Mode Behavior |
|---|---|---|
| `lib/metaplex.ts` | cNFT minting engine | Returns simulated mint result |
| `app/(core)/forge/page.tsx` | Agent creator UI | Skips balance check, preflight requirement |
| `app/api/agents/mint-preflight/route.ts` | Preflight validation | Returns `ready: true` automatically |
| `.env.local` | Environment config | `NEXT_PUBLIC_DEV_MODE=true` |
| `lib/solana.ts` | Network config | Points to devnet |
| `store/useVesselStore.ts` | Zustand state | Works identically in both modes |
| `lib/solana-payments.ts` | SOL transfers | Works identically in both modes |
| `lib/agent-runner.ts` | Agent execution | Works identically in both modes |
