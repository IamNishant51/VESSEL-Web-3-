# Integration Checklist

Use this checklist to verify all production-readiness components are working correctly.

## Environment Setup ✓

- [x] `.env` exists with required variables
  ```env
  NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
  NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=devnet
  GROQ_API_KEY=<your-key>
  NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE=<address>
  NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT=<address>
  ```

## Build Validation ✓

- [x] `npm run build` completes successfully (0 errors, 5 pre-existing warnings)
- [x] All 17 routes optimized (13 static, 4 dynamic)
- [x] TypeScript compilation passes
- [x] ESLint warnings are pre-existing (not from settlement changes)

## API Endpoints

### ✓ Mint Preflight
**Path**: `/api/agents/mint-preflight`
**Method**: `GET`
**Expected Response**:
```json
{
  "ready": true,
  "checks": [
    { "name": "bubblegum_merkle_tree_env", "ok": true, "detail": "Configured" },
    { "name": "bubblegum_collection_mint_env", "ok": true, "detail": "Configured" },
    { "name": "rpc_connection", "ok": true, "detail": "Connected" },
    { "name": "merkle_tree_account", "ok": true, "detail": "Account exists" },
    { "name": "collection_mint_account", "ok": true, "detail": "Account exists" }
  ]
}
```
**Test**: Navigate to Forge page → "Check Mint Requirements" should all show ✓

### ✓ Agent Metadata
**Path**: `/api/agents/metadata`
**Method**: `POST`
**Body**: `{ agentId: string, name: string, personality: string, ... }`
**Expected**: Returns JSON metadata suitable for on-chain storage
**Test**: Forge creates agent → metadata endpoint called before mint

### ✓ Agent Execution (Blocked)
**Path**: `/api/agents/[id]/run`
**Method**: `POST`
**Body**: `{ userInput: string, allowedActions: string[] }`
**Current Behavior**: Returns `EXECUTOR_NOT_CONFIGURED` error with helpful message
**Expected After Backend**: Returns signed transaction signature for tool execution
**Test**: Agent chat → ask agent to execute action → see error message with docs link

### ✓ Demo APIs (Disabled)
**Paths**: `/api/demo`, `/api/demo/reset`
**Current Response**: 410 Gone
**Test**: Try endpoints → should return 410 instead of 200

---

## Marketplace Flow

### Buy Agent
**Prerequisites**: 
- [ ] Wallet connected (Phantom on devnet)
- [ ] Account has ≥ listing price + 2% in SOL
- [ ] Listing exists with seller address

**Steps**:
1. Navigate to `/marketplace/[listingId]`
2. Click "Buy Now"
3. Approve wallet transaction (SOL transfer)
4. Wait for confirmation
5. Agent ownership transfers to buyer

**Verification**:
- [ ] Transaction signature appears in explorer
- [ ] Buyer can now see agent in "Your Agents"
- [ ] Seller receives SOL

**Code Path**: `app/(core)/marketplace/[id]/page.tsx` → `sendConfirmedSolTransfer()` → `buyAgentWithSettlementTx()`

### Rent Agent
**Prerequisites**:
- [ ] Wallet connected
- [ ] Account has ≥ (daily_rate × days) in SOL

**Steps**:
1. Navigate to listing
2. Select rental days
3. Click "Rent"
4. Approve wallet transaction
5. Token locked until rental expires

**Verification**:
- [ ] Agent appears in "Rented Agents" with countdown
- [ ] Token held by marketplace contract
- [ ] Seller receives SOL

**Code Path**: `app/(core)/marketplace/[id]/page.tsx` → `sendConfirmedSolTransfer()` → `rentAgentWithSettlementTx()`

---

## Forge (Mint) Flow

### Before Attempting Mint
1. Navigate to `/forge`
2. Scroll to "Mint Requirements"
3. Click "Check Requirements"
4. Wait for preflight validation

**Expected**: All 5 checks should show ✓ green

**If Any Fail**:
- **bubblegum_merkle_tree_env**: Add `NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE` to `.env`
- **bubblegum_collection_mint_env**: Add `NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT` to `.env`
- **rpc_connection**: Check RPC URL in `.env` and network connectivity
- **merkle_tree_account**: Address doesn't exist on devnet; create new tree
- **collection_mint_account**: Address doesn't exist; create new mint

### Mint Agent cNFT
1. Fill in agent personality/tools/limits (steps 1-3)
2. Review settings (step 4)
3. Click "Mint cNFT"
4. Approve wallet transaction
5. Wait for on-chain confirmation

**Verification**:
- [ ] Wallet signature appears
- [ ] Compressed NFT created on devnet
- [ ] Explorer shows `mintToCollectionV1` transaction
- [ ] Agent now has `mintAddress` in store
- [ ] Can view agent in `/agents`

**Code Path**: `app/(core)/forge/page.tsx` → `mintAgentSoulCnft()` → `lib/metaplex.ts`

---

## Orchestration Flow

### Run Orchestration
1. Go to agent detail page `/agents/[id]`
2. Select target agent to collaborate with
3. Enter prompt (e.g., "Analyze portfolio and suggest rebalance")
4. Click "Run Orchestration"
5. Approve wallet transaction for payment
6. Workflow steps execute

**Expected Behavior**:
- Payment tx confirmed before any workflow step
- Agent 1 calls Agent 2 with prompt
- Response parsed into workflow steps
- Each step logged with timestamp

**Verification**:
- [ ] Payment tx in explorer
- [ ] Workflow steps appear in UI
- [ ] Target agent received SOL

**Code Path**: `app/(core)/agents/[id]/page.tsx` → `sendConfirmedSolTransfer()` → `orchestrateAgents()`

---

## Store (Zustand) State

### Settlements Require Confirmed TX
All settlement mutations now require a `TxMeta` parameter with confirmed signature:

```typescript
// These FAIL without settlement tx:
buyAgent(agentId) // ❌ Returns error
rentAgent(agentId, days) // ❌ Returns error
debitTreasuryForToolCall(agentId, target, amount) // ❌ Returns error

// These WORK with settlement tx:
buyAgentWithSettlementTx(agentId, buyer, settlementTx) // ✓
rentAgentWithSettlementTx(agentId, renter, days, settlementTx) // ✓
orchestrateAgents(agent1Id, agent2Id, prompt, settlementTx) // ✓
```

**Test**: Try calling old methods in dev console → should return error requiring settlement tx

---

## Wallet Adapter Integration

### Connection Flow
1. Click "Connect Wallet" in top nav
2. Select Phantom (or other adapter)
3. Approve connection in wallet popup
4. Connected address displays

**Verification**:
- [ ] Public key shows in wallet button
- [ ] Can see account balance
- [ ] Transactions require approval

### Transaction Signing
Every settlement flow requires wallet signature:
- Buy/rent: Signs SOL transfer
- Mint: Signs Bubblegum transaction
- Orchestrate: Signs SOL transfer

**Verification**:
- [ ] Wallet popup appears on action
- [ ] Can reject transaction
- [ ] Approval returns signature to app

---

## Groq LLM Integration

### Agent Chat
1. Go to agent detail `/agents/[id]`
2. Type message in chat
3. Agent responds with LLM reasoning

**Verification**:
- [ ] Response appears (not mock)
- [ ] Text is coherent and contextual
- [ ] Tool suggestions appropriate to agent personality

**If Broken**: Check `GROQ_API_KEY` in `.env` and verify devnet quota

---

## Error Scenarios

### User Rejects Wallet Signature
**Expected**: Toast shows "Transaction cancelled" → UI returns to form
**Code**: Try/catch in `sendConfirmedSolTransfer()`

### Insufficient SOL
**Expected**: Wallet prevents tx → message from wallet adapter
**Test**: Try purchasing with 0.0001 SOL

### RPC Connection Fails
**Expected**: Toast shows "RPC unavailable" after timeout
**Code**: `sendConfirmedSolTransfer()` retries 3x then fails
**Test**: Temporarily change RPC URL to invalid address

### Missing Bubblegum Config
**Expected**: Preflight shows ✗ red → Mint button disabled
**Code**: `app/api/agents/mint-preflight/route.ts`

### Tool Execution Requested
**Expected**: Agent chat shows "Execution Blocked" message with setup docs link
**Code**: `lib/agent-runner.ts` returns `EXECUTOR_NOT_CONFIGURED`

---

## Performance Baselines

- **Build time**: ~15-20s (clean build with cache clear)
- **Home page load**: < 500ms
- **Minpreflight check**: < 1s (RPC depends)
- **Marketplace list render**: < 2s
- **Agent chat response**: 2-5s (Groq API depends)
- **Wallet tx confirmation**: 5-15s (network depends)

---

## Deployment Ready?

Before going to production, verify:

- [ ] Build succeeds `npm run build` → 0 errors
- [ ] All 5 preflight checks pass
- [ ] Can buy/rent agents with real SOL
- [ ] Can mint cNFT from Forge
- [ ] Can run orchestration workflow
- [ ] Agent chat returns LLM responses
- [ ] Tool execution shows helpful error (awaiting backend)
- [ ] All transactions appear in Solana explorer

---

## Next Steps (After Devnet Validation)

1. **Agent Executor Backend** (Required for production)
   - Build Node.js service to sign/execute tool transactions
   - See `PRODUCTION_SETUP.md` → "Agent Executor Backend"

2. **Escrow Program** (Optional, improves UX)
   - Implement on-chain settlement for full chain-authority
   - Reduces app-state trust requirements

3. **Production RPC**
   - Migrate to mainnet RPC (Helius, QuickNode, self-hosted)
   - Add failover and rate limiting

4. **Mainnet Deployment**
   - Create mainnet Bubblegum tree + collection
   - Deploy with mainnet RPC and token metadata
