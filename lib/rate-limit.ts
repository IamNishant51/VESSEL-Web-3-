import { SubscriptionModel, SUBSCRIPTION_PLANS, type SubscriptionTier } from "@/lib/models/subscription";
import { connectToDatabase } from "@/lib/mongodb";

interface RateLimitUsage {
  conversationsToday: number;
  apiCallsThisMonth: number;
  lastResetDate: Date;
}

// Store usage in memory (in production, use Redis)
const usageMap = new Map<string, RateLimitUsage>();

/**
 * Extract client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(userId: string): Promise<SubscriptionTier> {
  try {
    await connectToDatabase();
    const subscription = await SubscriptionModel.findOne({ userId });
    return subscription?.tier || "free";
  } catch (error) {
    console.warn("[RateLimit] Failed to get subscription tier:", error);
    return "free";
  }
}

/**
 * Check if user can perform an action based on tier limits
 */
export async function checkRateLimit(
  userId: string,
  action: "conversation" | "api_call" | "agent_create"
): Promise<{ allowed: boolean; remaining?: number; limit?: number }> {
  const tier = await getUserSubscriptionTier(userId);
  const plan = SUBSCRIPTION_PLANS[tier];

  // Get current usage
  let usage = usageMap.get(userId);
  if (!usage) {
    usage = {
      conversationsToday: 0,
      apiCallsThisMonth: 0,
      lastResetDate: new Date(),
    };
    usageMap.set(userId, usage);
  }

  // Reset usage if needed
  const now = new Date();
  const daysSinceReset = Math.floor(
    (now.getTime() - usage.lastResetDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceReset >= 1) {
    usage.conversationsToday = 0;
  }

  if (daysSinceReset >= 30) {
    usage.apiCallsThisMonth = 0;
  }

  // Check limits
  if (action === "conversation") {
    if (usage.conversationsToday >= plan.limits.conversationsPerDay) {
      return {
        allowed: false,
        remaining: 0,
        limit: plan.limits.conversationsPerDay,
      };
    }
    return {
      allowed: true,
      remaining: plan.limits.conversationsPerDay - usage.conversationsToday - 1,
      limit: plan.limits.conversationsPerDay,
    };
  }

  if (action === "api_call") {
    if (usage.apiCallsThisMonth >= plan.limits.apiCallsPerMonth) {
      return {
        allowed: false,
        remaining: 0,
        limit: plan.limits.apiCallsPerMonth,
      };
    }
    return {
      allowed: true,
      remaining: plan.limits.apiCallsPerMonth - usage.apiCallsThisMonth - 1,
      limit: plan.limits.apiCallsPerMonth,
    };
  }

  if (action === "agent_create") {
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Increment usage counter after action
 */
export function recordUsage(userId: string, action: "conversation" | "api_call") {
  const usage = usageMap.get(userId);
  if (!usage) return;

  if (action === "conversation") {
    usage.conversationsToday++;
  } else if (action === "api_call") {
    usage.apiCallsThisMonth++;
  }
}

/**
 * Check subscription status and access to features
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof SUBSCRIPTION_PLANS.free.limits
): Promise<boolean> {
  const tier = await getUserSubscriptionTier(userId);
  const plan = SUBSCRIPTION_PLANS[tier];

  const featureValue = (plan.limits as Record<string, boolean | number>)[feature];
  if (typeof featureValue === "boolean") {
    return featureValue;
  }

  return featureValue > 0;
}

/**
 * Middleware to check rate limits for API routes
 */
export async function withRateLimitCheck(
  userId: string,
  action: "conversation" | "api_call" = "api_call"
) {
  const { allowed, remaining, limit } = await checkRateLimit(userId, action);

  if (!allowed) {
    return {
      error: `Rate limit exceeded. Limit: ${limit}`,
      statusCode: 429,
    };
  }

  recordUsage(userId, action);

  return {
    success: true,
    remaining,
    limit,
  };
}

/**
 * Get user's tier info
 */
export async function getUserTierInfo(userId: string) {
  const tier = await getUserSubscriptionTier(userId);
  const plan = SUBSCRIPTION_PLANS[tier];

  return {
    tier,
    plan,
    limits: plan.limits,
  };
}
