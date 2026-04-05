# VESSEL Manual Testing Guide (Beginner Friendly)

This guide is for end-to-end testing of the full app.
It is written for non-experts, so you can validate every feature and tell me exactly what works and what fails.

## 1. Simple Terms First

If words like "merkle tree" are confusing, use this:

- Agent: The AI profile you create in Forge.
- cNFT: The on-chain identity token for your agent.
- Collection Mint: The parent token that validates your agent mints.
- Merkle Tree: A special Solana account used by Bubblegum to store compressed NFTs cheaply.
- Preflight: A safety check before minting.

For your app, minting works only when these are true:

- The collection mint address exists on devnet.
- The merkle tree address exists on devnet.
- Your app .env has both addresses.

## 2. Pre-Test Setup

1. Start app:

   npm run dev

2. Open:

   http://localhost:3000

3. Use Phantom (or another supported wallet) on devnet.
4. Keep some devnet SOL in wallet for transactions.
5. Confirm .env has valid values:
   - NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
   - NEXT_PUBLIC_WALLET_ADAPTER_NETWORK=devnet
   - GROQ_API_KEY=...
   - NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE=...
   - NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT=...

## 3. Global Behavior You Should Expect

- Public pages load without wallet:
  - /
  - /docs
  - /privacy
  - /terms

- Core pages are wallet-gated:
  - /forge
  - /agents
  - /dashboard
  - /marketplace

If wallet is not connected on core pages, expected UI is:
- "Connect Your Wallet"
- "Vessel uses your Solana wallet for identity and agent ownership. Connect to continue."

## 4. Feature-by-Feature Test Plan

Use this exact order.

### A) Landing and Static Pages

1. Open /.
Expected:
- Main hero loads.
- Top nav links work.

2. Open /docs.
Expected:
- Left sidebar appears.
- Anchor links jump to sections.

3. Open /privacy and /terms.
Expected:
- Legal pages render with content blocks.

### B) Wallet Gate Check

1. Disconnect wallet.
2. Open /forge.
Expected:
- You should see the connect-wallet gate card.

3. Connect wallet.
4. Refresh /forge.
Expected:
- Forge UI appears.

### C) Forge: Mint Requirements + Mint Flow

1. In Forge, wait for checks to load.
Expected preflight checks include these names:
- bubblegum_merkle_tree_env
- bubblegum_collection_mint_env
- rpc_connection
- merkle_tree_account
- collection_mint_account

2. All checks should be green/ok before mint.
Expected:
- ready = true behavior in UI
- Mint path allowed

3. Try mint with missing required form fields.
Expected toast examples:
- "Add agent name and behavioral directives first."
- "Select at least one tool capability."

4. Complete steps and click mint.
Expected:
- Wallet approval prompt appears.
- On success toast includes explorer URL and mentions successful mint.
- Agent is added to local state with mintAddress.

5. Try mint while wallet disconnected.
Expected:
- "Connect a wallet before minting."

### D) Agents Page

1. Open /agents.
Expected:
- My agents list appears.
- Search, category filters, sort controls work.

2. Click Forge Agent from agents page if no agents exist.
Expected:
- Route to /forge.

3. Delete an agent.
Expected:
- Confirm modal appears.
- Success toast like "<name> deleted".

4. List an agent on marketplace.
Expected:
- List modal opens.
- After listing, agent appears in marketplace list.

### E) Agent Detail: Chat Tab

1. Open /agents/[id].
2. Chat with a normal question, for example:
   - "What can you do?"
Expected:
- Assistant text response.
- No crash.

3. Ask for portfolio/balance, for example:
   - "What is my wallet balance?"
Expected:
- Response like "Your wallet currently holds X.XXXX SOL on devnet." (or temporary fetch error message).

4. Ask for execution action, for example:
   - "Swap 0.01 SOL to USDC"
Expected:
- Response includes:
  - "Execution Blocked"
  - error code behavior EXECUTOR_NOT_CONFIGURED
  - message that backend executor is not configured yet

5. If wallet is disconnected and you send chat message.
Expected toast:
- "Connect wallet to chat with agent"

### F) Agent Detail: Orchestra Tab

1. Switch to Orchestra tab.
2. Enter prompt.
3. Select another owned agent as target.
4. Click "Run Orchestra".
Expected:
- Wallet approval prompt for 0.001 SOL transfer.
- Orchestra log adds entries in order:
  - USER message
  - assistant delegation message
  - system payment line
  - assistant response
  - assistant final message
- "View transaction" link appears on payment log row.

Failure expectations:
- No wallet: "Connect wallet before running orchestration."
- No target owner: "Target agent owner is not available."

### G) Marketplace List and Detail

1. Open /marketplace.
Expected:
- Listings grid appears.
- Search and tabs work.

2. Open listing detail /marketplace/[id].
Expected:
- Agent detail card, price panel, buy/rent controls.

3. Buy flow:
- Click Buy Now.
Expected:
- Wallet prompt appears.
- If approved, success screen shows transaction link.

4. Rent flow (if rental listing):
- Select 7/14/30 days.
- Complete flow.
Expected:
- Success state and explorer link.

Important expected constraints:
- Buying your own listing shows info message.
- Non-SOL listings show error that only SOL settlement is enabled.

### H) Dashboard

1. Open /dashboard.
Expected:
- Stats, sidebar, and workspace cards render.

2. Click sidebar actions.
Expected examples:
- Running with no agents redirects to Forge with info toast.
- Running with agents toggles run mode toast.
- Earnings highlights earnings panel.

3. Test save/reset workspace controls.
Expected:
- Save creates local snapshot and toast "Workspace snapshot saved."
- Reset restores default flow and toast "Workspace reset to default flow."

## 5. API Testing (Direct)

Use PowerShell or browser.

### GET /api/agents/mint-preflight
Expected HTTP 200 with:
- ready boolean
- checks array with detailed status strings

### GET /api/agents/tools
Expected:
- success true
- tools array

### GET /api/agents/metadata?id=test1&name=TestAgent
Expected:
- JSON metadata
- symbol "VSLAGENT"
- image data URI

### POST /api/agents/generate-image
Body example:
{
  "id": "t1",
  "name": "Test",
  "personality": "Balanced trading assistant",
  "riskLevel": "Balanced",
  "toolCount": 3
}
Expected:
- success true
- imageDataUrl or svg
- metadata block with rarity/archetype fields

### POST /api/agents/{id}/run
Expected behavior:
- Valid payload returns assistant result JSON.
- Missing fields return 400 with specific error code.
- Too many requests returns 429 RATE_LIMITED.

### GET /api/demo and /api/demo/reset
Expected:
- HTTP 410
- message that demo endpoints are disabled

## 6. Known Current Product Behavior (Not a Bug)

This is expected right now:

- Real execution actions (swap/transfer/stake/mint/lend/bridge) return EXECUTOR_NOT_CONFIGURED.
- This means frontend and policy checks work, but backend transaction executor is not deployed yet.

## 7. Final Pass/Fail Checklist (Fill This and Send Back)

Copy this section and mark each line with PASS or FAIL plus notes.

- Landing page and nav:
- Docs page sections and anchors:
- Privacy page:
- Terms page:
- Wallet gate on core pages:
- Forge preflight all green:
- Forge mint success:
- Agents page list/search/filter:
- Agent delete flow:
- Agent listing modal flow:
- Agent chat normal reply:
- Agent chat balance reply:
- Agent chat execution blocked message:
- Orchestra payment + log chain:
- Marketplace list render:
- Marketplace buy success:
- Marketplace rent success:
- Dashboard load and stats:
- Dashboard run mode + toasts:
- Dashboard save/reset workspace:
- API mint-preflight:
- API tools:
- API metadata:
- API generate-image:
- API run route validation:
- API demo endpoints return 410:

## 8. What To Send Me After Testing

Send me:

1. The checklist with PASS/FAIL per item.
2. Any exact error text you saw.
3. Which page/step failed.
4. Screenshot or console error if available.

Then I can fix issues one by one very quickly.
