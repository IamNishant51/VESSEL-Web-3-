/**
 * Lazy-loaded Components with Dynamic Imports
 *
 * Reduces initial JavaScript bundle by deferring heavy library loads:
 * - Three.js (AgentAvatar3D) - ~300KB
 * - @solana/web3.js (TransactionApprovalModal) - ~150KB
 * - Stripe (StripePayments) - ~100KB
 *
 * Components are loaded on-demand when needed, improving initial page load.
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Loading skeleton component
const ComponentSkeleton = () => (
  <div className="flex items-center justify-center h-full">
    <Skeleton className="w-full h-full" />
  </div>
);

/**
 * AgentAvatar3D - Three.js 3D avatar rendering
 * Used in: Agent detail pages, agent preview cards
 * Lazy load: Yes - Only loaded when user views agent details
 */
export const DynamicAgentAvatar3D = dynamic(
  () => import('@/components/agents/AgentAvatar3D').then((mod) => ({
    default: mod.AgentAvatar3D,
  })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false, // Three.js requires browser
  }
);

/**
 * TransactionApprovalModal - Solana transaction signing
 * Used in: Marketplace transactions, agent execution
 * Lazy load: Yes - Only loaded on transaction initiation
 */
export const DynamicTransactionApprovalModal = dynamic(
  () => import('@/components/agents/TransactionApprovalModal').then((mod) => ({
    default: mod.TransactionApprovalModal,
  })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false,
  }
);

/**
 * AgentLeaderboard - Large data visualization
 * Used in: Leaderboard page
 * Lazy load: Yes - Only loaded on dedicated page
 */
export const DynamicAgentLeaderboard = dynamic(
  () => import('@/components/dashboard/AgentLeaderboard').then((mod) => ({
    default: mod.AgentLeaderboard,
  })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: true,
  }
);

/**
 * LiveActivityFeed - Real-time activity streaming
 * Used in: Dashboard, homepage feed
 * Lazy load: Yes - Only loaded on dashboard
 */
export const DynamicLiveActivityFeed = dynamic(
  () => import('@/components/dashboard/LiveActivityFeed').then((mod) => ({
    default: mod.LiveActivityFeed,
  })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: true,
  }
);

/**
 * AgentRunnerChat - Heavy chat component with message rendering
 * Used in: Agent execution page
 * Lazy load: Yes - Only loaded during agent runs
 */
export const DynamicAgentRunnerChat = dynamic(
  () => import('@/components/agents/AgentRunnerChat').then((mod) => ({
    default: mod.AgentRunnerChat,
  })),
  {
    loading: () => <ComponentSkeleton />,
    ssr: false,
  }
);

/**
 * Example usage in a page:
 *
 * import { DynamicAgentAvatar3D, DynamicTransactionApprovalModal } from '@/lib/dynamic-imports';
 *
 * export default function AgentDetailPage() {
 *   return (
 *     <div>
 *       <DynamicAgentAvatar3D seed="agent-123" size={300} />
 *       <DynamicTransactionApprovalModal 
 *         isOpen={showTx}
 *         onApprove={handleApprove}
 *       />
 *     </div>
 *   );
 * }
 */
