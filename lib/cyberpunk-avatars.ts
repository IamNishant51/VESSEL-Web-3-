/**
 * Premium Cyberpunk Character Avatars
 * High-quality cyberpunk character images for Agent Souls
 * Each agent gets a unique, consistent avatar based on their ID
 */

// Premium cyberpunk character avatar URLs
// These are high-quality, professional cyberpunk character renders
export const CYBERPUNK_AGENT_AVATARS = [
  // Male cyberpunk characters
  "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1480429370612-2b0cf398ac8d?w=800&h=800&fit=crop&crop=face",
  
  // Female cyberpunk characters
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=800&fit=crop&crop=face",
  
  // Additional unique characters
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1542596594-649edbc13630?w=800&h=800&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&h=800&fit=crop&crop=face",
];

/**
 * Get a consistent cyberpunk avatar URL for an agent
 * Uses the agent's ID to deterministically select an avatar
 * Same agent always gets the same avatar
 */
export function getCyberpunkAvatar(agentId: string): string {
  // Convert agent ID to a numeric index
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    const char = agentId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % CYBERPUNK_AGENT_AVATARS.length;
  return CYBERPUNK_AGENT_AVATARS[index];
}

/**
 * Get avatar index for an agent (for consistent rendering)
 */
export function getCyberpunkAvatarIndex(agentId: string): number {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    const char = agentId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % CYBERPUNK_AGENT_AVATARS.length;
}
