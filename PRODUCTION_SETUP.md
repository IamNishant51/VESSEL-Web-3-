# Production Setup Guide

This document outlines the remaining steps to take VESSEL from the current devnet demo state to full production.

## Status

### ✅ Completed
- `lib/metaplex.ts` - Wallet-signed Bubblegum cNFT minting via Umi
- `lib/solana-payments.ts` - Confirmed SOL transfer helper for marketplace/orchestration
- `/api/agents/mint-preflight` - Environment validation endpoint
- Marketplace buy/rent workflows - Real on-chain settlement via wallet
- Orchestration payment flows - Real SOL transfers confirmed on-chain
- Demo data APIs - Disabled (410 responses)
- All settlement mutations - Require confirmed transaction metadata

### ⚠️ Incomplete

#### 1. Agent Executor Backend (Critical for Tool Execution)
**Current State**: All tool executions (swap, transfer, stake, etc.) return `EXECUTOR_NOT_CONFIGURED` error.

**What's Needed**:
- Dedicated backend service that:
  - Listens for agent execution requests from `/api/agents/[id]/run` 
  - Signs transactions using agent's keypair or delegated authority
  - Executes on-chain operations (token swaps, transfers, staking, etc.)
  - Returns signed transaction signatures to the app
  - Handles error recovery and retry logic

**Implementation Path**:
```bash
# Example architecture (not yet implemented):
# - Backend service (Node.js / Rust)
# - WebSocket/gRPC connection to VESSEL app
# - SPL Token Program interaction library
# - Validator delegation setup
# - Bridge protocol integration (if cross-chain needed)
```

**Minimal Proof-of-Concept**:
1. Create backend service endpoint: `POST /execute-tool`
2. Wire `/api/agents/[id]/run` to call backend async
3. Return job ID immediately, poll for completion
4. Sign and broadcast from secure keypair management

---

#### 2. Bubblegum Merkle Tree Setup (Devnet)
**Current State**: `.env` has placeholder values. Preflight endpoint validates they exist.

**Steps to Configure**:

1. **Create Merkle Tree on Devnet**:
```bash
# Using metaplex-foundation CLI or custom script
# You need a funded wallet on devnet first
solana config set --url https://api.devnet.solana.com
solana airdrop 2  # Request devnet SOL

# Create tree (example - adjust parameters for your needs)
metaplex create-tree \
  --max-depth 14 \
  --max-buffer-size 64 \
  --canopy-depth 10
# Returns merkle tree address
```

2. **Create Collection Mint**:
```bash
# Use SPL Token to create verified collection
spl-token create-token
# Returns collection mint address
```

3. **Update `.env`**:
```env
NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE=<your-merkle-tree-address>
NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT=<your-collection-mint>
```

4. **Verify in Preflight**:
- Navigate to Forge page → "Check Mint Requirements"
- All checks should show ✓ green

---

#### 3. LLM Agent Reasoning (Groq API)
**Current State**: `GROQ_API_KEY` in `.env` is populated. Chat and orchestration use it.

**Verify**:
```bash
npm run build  # Should compile without errors
```

**Test**:
- Go to `/core/agents/[id]` → Agent chat
- Send message → Should get LLM response (validates Groq key works)

---

#### 4. Solana Wallet Configuration (Devnet)
**Current State**: App uses wallet adapter for user signatures. Hardcoded to devnet.

**For User Testing**:
1. Install Phantom wallet extension
2. Set Phantom to devnet network
3. Request devnet airdrop: `solana airdrop 2`
4. Connect wallet in VESSEL

**For Production (Mainnet)**:
- Change `.env`:
  ```env
  NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=mainnet-beta
  NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
  ```
- Redeploy merkle tree and collection to mainnet
- Fund mainnet account for cNFT metadata storage

---

## Remaining Major Gaps

### On-Chain Escrow Program (Optional)
**Why**: Currently marketplace state is app-authoritative. A dedicated Solana program could:
- Fully on-chain listing lifecycle
- Automatic settlement on confirmation
- Multi-sig support for marketplace fees
- Better auditability

**Effort**: High (1-2 weeks), optional for MVP.

---

### Agent Executor Backend (Required for Production)
**Why**: Current app can only return mock responses for tool execution. Real tools need off-chain execution authority.

**Minimum Implementation**:
1. Node.js backend with Solana web3.js
2. Secure keypair storage (Vault/KMS)
3. Transaction signing and broadcasting
4. Error handling and retry logic

**Estimated Effort**: 1-2 weeks for MVP

---

### Production RPC & Infrastructure
**Current**: Hardcoded devnet RPC.
**Task**: 
- Set up production RPC (Helius, QuickNode, or self-hosted validator)
- Add rate limiting / retry with exponential backoff
- Monitor RPC health and failover

---

## Validation Checklist

Run before production deployment:

- [ ] `npm run build` succeeds with 0 errors
- [ ] Bubblegum preflight endpoint returns `ready: true`
- [ ] Wallet connect works (Phantom on correct network)
- [ ] Can mint agent cNFT from Forge (requires wallet signature)
- [ ] Can purchase agent from marketplace (real SOL transfer to seller)
- [ ] Can rent agent from marketplace (real SOL transfer + token locked)
- [ ] Can orchestrate agents (payment tx confirmed before workflow step)
- [ ] Agent chat returns LLM responses (Groq API working)
- [ ] Tool execution attempts show error (awaiting executor backend)

---

## Deployment Recommendations

### Phase 1: Devnet Demo (Current)
✅ Live now. Use for user testing and feedback.

### Phase 2: Devnet Full Features (Next)
- [ ] Implement Agent Executor backend (Node.js)
- [ ] Full end-to-end tool execution testing
- [ ] Load testing on Bubblegum mint flow

### Phase 3: Mainnet Preparation (Before Public)
- [ ] Migrate RPC to mainnet
- [ ] Create mainnet Bubblegum tree + collection
- [ ] Set up production key management (Vault/KMS)
- [ ] Contract security audit (if escrow program added)

### Phase 4: Launch
- [ ] Domain + SSL
- [ ] Analytics setup
- [ ] Community outreach

---

## Quick Start (Summary)

1. **Current State**: All core flows work on devnet with real wallet signatures
2. **Missing**: Agent tool executor backend
3. **To Test Now**: 
   - Buy/rent agents (costs real devnet SOL)
   - Mint cNFT (requires Bubblegum env configured)
   - Orchestrate agents (payment required)
4. **To Go Production**:
   - Build executor backend
   - Migrate to mainnet RPC
   - Setup production keypair management
