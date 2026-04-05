# VESSEL - Web3 AI Agent Platform

## Project Overview

VESSEL is a Next.js 15 Web3 application for creating, managing, and trading AI-powered Solana agents as compressed NFTs (cNFTs). Users can forge agents with unique personalities, run them with AI reasoning, and trade them on a marketplace.

## Tech Stack

### Frontend
- **Next.js 15.5** (App Router, React Server Components)
- **React 19** with hooks
- **TypeScript** (strict mode)
- **Tailwind CSS** + `tw-animate-css` for styling
- **Framer Motion** for animations
- **Zustand** + `zustand/middleware` for state management (persisted to localStorage)
- **@solana/wallet-adapter-react** for wallet connection
- **Lucide React** for icons
- **Sonner** for toast notifications

### Backend / APIs
- **Next.js API Routes** (serverless functions)
- **MongoDB** + Mongoose for data persistence
- **Groq API** (llama-3.3-70b-versatile) for AI agent reasoning
- **Vercel AI SDK** (`ai`, `@ai-sdk/groq`) for LLM integration
- **@solana/web3.js** for blockchain interactions
- **sharp** for image processing
- **ImageKit** (`@imagekit/nodejs`) for cNFT cloud storage

### NFT Engine
- **Custom SVG-based trait system** with 8 layers: background, body, clothing, eyes, hair, headgear, accessories, effects
- **Deterministic generation** using seeded random
- **sharp** for SVG→PNG conversion and post-processing
- **Professional anime-style rendering** with gradients, glow filters, and skin tones
- **Metaplex Bubblegum** cNFT minting (simulated in dev mode)

## Key Architecture

### State Management
- `store/useVesselStore.ts` - Zustand store with localStorage persistence
- Agents, marketplace listings, transactions, user stats
- Hydration guard via `hooks/useStoreHydrated.ts`

### Core Modules
- `lib/agent-runner.ts` - AI agent reasoning engine with market data, prompt injection detection, circuit breakers
- `lib/agent-kit.ts` - Solana Agent Kit integration (lazy-loaded)
- `lib/agent-kit-fallback.ts` - Fallback tools when Solana Agent Kit unavailable
- `lib/auth.ts` - Wallet signature verification
- `lib/validation.ts` - Zod schemas for all API inputs
- `lib/audit.ts` - Structured audit logging
- `lib/imagekit.ts` - ImageKit upload/delete service
- `lib/rate-limit.ts` - In-memory rate limiting
- `lib/cyberpunk-avatars.ts` - SVG avatar generation
- `nft-engine/` - cNFT generation pipeline (generator, trait-library, render utils)

### API Routes
- `/api/db` - Database CRUD (agents, listings, transactions, user stats) - requires wallet auth
- `/api/agents/[id]/run` - AI agent execution with streaming
- `/api/agents/tools` - Tool catalog (cached, lazy-loaded)
- `/api/agents/mint-preflight` - Mint readiness checks
- `/api/cnft/upload` - Image upload to ImageKit (wallet auth, validation)
- `/api/cnft/generate` - Server-side cNFT generation + upload
- `/api/health` - Health check (rate limited)

### Pages
- `/` - Landing page with hero, features, agent preview
- `/agents` - Agent management (my agents, marketplace listings)
- `/agents/[id]` - Agent detail with chat interface
- `/forge` - Agent creation wizard (multi-step form)
- `/marketplace` - Browse and trade agents
- `/marketplace/[id]` - Agent detail + buy/rent
- `/dashboard` - User analytics
- `/preview` - Full cNFT gallery
- `/docs` - Documentation

## Security

### Implemented
- Wallet signature verification on state-changing API routes
- Zod input validation on all endpoints
- Prompt injection detection with unicode sanitization
- Rate limiting on API routes
- CSP headers, HSTS, X-Frame-Options
- Error message sanitization (no internal details leaked)
- Image upload validation (size, format, content-type)
- CoinGecko circuit breaker + rate limiting

### Key Files
- `lib/auth.ts` - `verifyWalletAuth()` for signature verification
- `lib/validation.ts` - All Zod schemas
- `middleware.ts` - Security headers, bot blocking, rate limiting

## NFT Engine

### Trait Layers (render order)
1. **Background** - 8 cyberpunk scenes (neon alley, orbital hangar, crystal cavern, etc.)
2. **Body** - 8 character types (humanoid, canine, feline, avian, mech, spirit, dragon, rabbit)
3. **Clothing** - 6 outfits (neon trench, plated armor, kimono tech, stealth suit, etc.)
4. **Eyes** - 12 styles (5 anime gradient eyes + 7 cyber/mech eyes)
5. **Hair** - 8 styles (spiky blue, long pink, short silver, twin tails, wild red, ponytail gold, bob green, none)
6. **Headgear** - 7 accessories (helmets, crowns, masks, hoods, diadems)
7. **Accessories** - 5 items (energy blade, holo shield, data orb, plasma whip, none)
8. **Effects** - 6 auras (cyan, rose, purple, lightning arc, void echo, none)

### Generation Pipeline
1. Weighted random trait selection based on rarity
2. Compatibility filtering by character family
3. Uniqueness check via signature hashing
4. SVG composition → PNG via sharp
5. Post-processing: blur, glow, color grading, film grain
6. Upload to ImageKit CDN

## Conventions

### Code Style
- No comments unless explicitly requested
- TypeScript strict mode
- Tailwind utility classes (no CSS-in-JS)
- Server components by default, `"use client"` only when needed
- `memo()` for frequently re-rendered components
- Error boundaries for client components

### API Patterns
- All POST routes that modify data require wallet signature verification
- Use Zod schemas from `lib/validation.ts` for input validation
- Return generic error messages, log details server-side
- Use `auditLog()` for security-relevant events

### State Management
- Use `useVesselStore` for agents, listings, transactions
- Always check `useStoreHydrated()` before accessing store data
- Persist only non-sensitive data to localStorage

### Image Handling
- Use `SkeletonImage` component for loading states
- Hero fallback: `/women-hero-section-main-asset.png`
- cNFT avatars: ImageKit CDN (`https://ik.imagekit.io/9pfz6g8ri/VESSSEL/`)
- Cyber avatars: SVG data URLs via `getCyberpunkAgentDataUrl()`

## Environment Variables

Required for full functionality:
- `GROQ_API_KEY` - LLM inference
- `MONGODB_URI` - Database connection
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT` - cNFT storage
- `NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE` - cNFT minting
- `NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT` - cNFT collection

Dev mode: `DEV_MODE=true` or `NEXT_PUBLIC_DEV_MODE=true` bypasses on-chain checks.

## Common Tasks

### Adding a new API route
1. Create route in `app/api/[path]/route.ts`
2. Add Zod validation schema to `lib/validation.ts`
3. Add wallet auth if modifying data: `verifyWalletAuth(request)`
4. Add audit logging for security events

### Adding a new NFT trait
1. Add SVG definition to `nft-engine/trait-library.ts`
2. Set layer, rarity, weight, and compatible families
3. Update `LAYER_ORDER` if adding new layer
4. Update generator.ts rarity calculation and metadata

### Adding a new page
1. Create route in `app/(core)/[name]/page.tsx`
2. Use `LandingNavigation` component (not old AppShell)
3. Use `bg-[#fafafa]` for page background, `bg-white` for content cards
4. Check `useStoreHydrated()` before accessing store data

## Important Notes

- **Never commit `.env`** - secrets are in deployment platform
- **Never trust client-supplied agent config** - validate server-side
- **Always use wallet signature verification** for state-changing operations
- **Use dynamic imports** for heavy dependencies (SolanaAgentKit, etc.)
- **Rate limit all endpoints** - use `checkRateLimit()` from `lib/rate-limit.ts`
- **Sanitize all user input** - use `clampText()` and Zod validation
