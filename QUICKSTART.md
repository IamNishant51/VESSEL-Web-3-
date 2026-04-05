# Quick Start Guide

Get VESSEL running locally and understand the on-chain settlement architecture.

## Prerequisites

- Node.js 18+
- npm or yarn
- Phantom wallet (or other Solana adapter)
- Devnet SOL (faucet: `solana airdrop 2`)

## Installation & Setup

```bash
# Clone and install
git clone <repo>
cd VESSEL
npm install

# Create .env (copy template)
cp .env.example .env

# Edit .env with your values
# Required:
# - NEXT_PUBLIC_SOLANA_RPC_URL (keep as devnet)
# - GROQ_API_KEY (from console.groq.com)
# - NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE (your merkle tree address)
# - NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT (your collection mint)

# Validate build
npm run build

# Run locally
npm run dev
# Opens http://localhost:3000
```

And that's it! The app is now running locally.

---

## Architecture at a Glance

### Three Core Flows

#### 1. Mint Agent cNFT (Forge)
```
User fills form → Wallet adapter bridge → Umi transaction builder
                                             ↓
                                    Metaplex Bubblegum
                                             ↓
                               Creates compressed NFT on-chain
                                             ↓
                                    Signature returned to app
                                             ↓
                                  Store updates with mintAddress
```

**Files**: `lib/metaplex.ts`, `app/(core)/forge/page.tsx`, `app/api/agents/mint-preflight/route.ts`

---

#### 2. Marketplace Settlement (Buy/Rent)
```
User clicks Buy → Wallet adapter
                       ↓
              SystemProgram.transfer()
                       ↓
           Confirms on-chain (devnet)
                       ↓
        Returns TxMeta (signature + explorer URL)
                       ↓
         Store updates with TxMeta proof
                       ↓
         Buyer gets agent ownership
```

**Files**: `lib/solana-payments.ts`, `app/(core)/marketplace/[id]/page.tsx`, `store/useVesselStore.ts`

**Key Principle**: State mutation only happens AFTER confirmed on-chain signature.

---

#### 3. Orchestration (Agent Collaboration)
```
User sends prompt → Wallet signs SOL transfer to target agent
                                  ↓
                        Payment confirmed on-chain
                                  ↓
                       Agent 1 executes workflow
                                  ↓
                       Calls Agent 2 via REST API
                                  ↓
                       Agent 2 responds with steps
                                  ↓
                      Steps logged with TxMeta proof
```

**Files**: `app/(core)/agents/[id]/page.tsx`, `store/useVesselStore.ts`

---

## File Structure (Key Files)

```
lib/
├─ metaplex.ts              # Wallet-signed Bubblegum mint
├─ solana-payments.ts       # Confirmed SOL transfers (NEW)
├─ agent-runner.ts          # LLM reasoning + tool execution
├─ solana.ts                # RPC connection setup
└─ utils.ts                 # Helpers

app/api/agents/
├─ [id]/run/route.ts        # Agent execution endpoint
├─ metadata/route.ts        # On-chain metadata JSON
├─ tools/route.ts           # Available tool definitions
└─ mint-preflight/route.ts  # Environment validation (NEW)

app/(core)/
├─ forge/page.tsx           # Agent minting UI + preflight
├─ marketplace/[id]/page.tsx    # Buy/rent UI with settlement
└─ agents/[id]/page.tsx     # Agent detail + orchestration

store/
└─ useVesselStore.ts        # Zustand state (REWRITTEN)
   └─ buyAgentWithSettlementTx()    # (NEW)
   └─ rentAgentWithSettlementTx()   # (NEW)
```

---

## Key Dependencies

**Metaplex Stack**:
- `@metaplex-foundation/mpl-bubblegum@5.0.2` - Compressed NFT standard
- `@metaplex-foundation/umi-bundle-defaults@0.9.2` - Transaction builder
- `@metaplex-foundation/umi-signer-wallet-adapters@0.9.2` - Wallet bridge
- `@metaplex-foundation/mpl-token-metadata` - Token registry

**Solana**:
- `@solana/web3.js@1.98.4` - Core transaction SDK
- `@solana/wallet-adapter-react@0.15.39` - Wallet UI adapter

**LLM**:
- `@ai-sdk/groq@3.0.33` - Groq AI integration
- `ai@4.3.19` - Vercel AI SDK

---

## Development Workflow

### Add a New Feature
1. Check `.env` has all required variables
2. Start `npm run dev`
3. Make changes to files
4. Browser auto-refreshes
5. Run `npm run build` before committing

### Debug Settlement Flow
```typescript
// Add to any settlement function for console logging:
console.log("Settlement TX:", settlementTx);
console.log("Explorer:", settlementTx.explorerUrl);
```

Then check browser console or network tab in DevTools.

### Test Wallet Signature Rejection
1. Start action (Buy/Rent/Mint)
2. Wallet popup appears
3. Click "Reject" or close popup
4. App should show error toast and return to form

---

## Common Issues & Fixes

### "Bubblegum preflight checks not passing"
- [ ] Do you have `NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE` and `NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT` in `.env`?
- [ ] Are those addresses valid Solana public keys?
- [ ] Do they exist on devnet? (Check via Solana CLI: `solana account <address> -u devnet`)

**Fix**: Create new merkle tree and collection mint, update `.env`, refresh page.

### "Wallet not connecting"
- [ ] Do you have Phantom installed?
- [ ] Is Phantom set to **devnet** network?
- [ ] Try reloading page and reconnecting

### "Transaction failed: Insufficient funds"
- [ ] Your account doesn't have enough SOL
- [ ] Buy/rent costs: listing price + 2% (marketplace fee)
- [ ] Mint costs: ~0.1 SOL (Bubblegum account rent)

**Fix**: Airdrop more: `solana airdrop 2 -u devnet`

### "Agent chat doesn't respond"
- [ ] Check `GROQ_API_KEY` in `.env`
- [ ] Verify key format (should start with `gsk_`)
- [ ] Check browser console for API errors

### "Build fails with type errors"
```bash
# Clean everything and rebuild
rm -rf .next node_modules/.cache
npm run build
```

---

## Exploring the Code

### Wallet Integration
Entry point: `components/wallet/wallet-provider.tsx`
- Sets up `WalletAdapterProvider`
- Connects to devnet by default
- Wraps entire app

### State Management
Entry point: `store/useVesselStore.ts`
- Zustand store with agent/marketplace/orchestration state
- `buyAgentWithSettlementTx()` requires TxMeta parameter
- No fake transaction generation

### API Layer
Entry point: `app/api/` routes
- `/api/agents/[id]/run` - Agent execution
- `/api/agents/metadata` - On-chain JSON
- `/api/agents/mint-preflight` - Validation

---

## Testing Scenarios

### Scenario 1: Complete Mint Flow
1. Go to `/forge`
2. Fill out agent form (step 1-4)
3. Check mint requirements → all ✓
4. Click "Mint cNFT"
5. Approve wallet tx
6. Verify in explorer: `mintToCollectionV1`

**Expected**: Agent has `mintAddress` after confirmed.

### Scenario 2: Buy Agent from Marketplace
1. List an agent (requires owning one)
2. Go to `/marketplace`
3. Click on listing
4. Click "Buy Now"
5. Approve wallet tx
6. Check Treasury balance decreased, Seller balance increased

**Expected**: You're the new owner; can see in "Your Agents".

### Scenario 3: Agent Orchestration
1. Go to agent detail `/agents/[id]`
2. Select another agent as target
3. Enter prompt (e.g., "What are my next 3 action items?")
4. Click "Run Orchestration"
5. Approve payment tx
6. Watch workflow steps appear

**Expected**: Payment confirms, steps appear one by one.

### Scenario 4: Tool Execution Blocked
1. Go to agent chat
2. Ask agent to execute action: "Swap 0.5 SOL to USDC"
3. Observe response

**Expected**: Agent says execution is blocked, provides link to docs.

---

## Performance Tips

- **First load slow?** Static site generation happens during build. First load after deploy caches.
- **Wallet slow?** Phantom extension can lag. Try another adapter (Backpack).
- **RPC slow?** Devnet can be congested. Try a different public RPC.

---

## Next: Production

Once you've validated all scenarios above, see [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for:
- Agent executor backend architecture
- On-chain escrow program (optional)
- Mainnet deployment checklist

---

**Need help?** Check:
1. [INTEGRATION_CHECKLIST.md](INTEGRATION_CHECKLIST.md) - Comprehensive test matrix
2. [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Deployment guide
3. [Solana Dev Docs](https://docs.solana.com/) - Blockchain fundamentals
4. [Metaplex Bubblegum Docs](https://docs.metaplex.com/compressed-nfts) - cNFT standard
