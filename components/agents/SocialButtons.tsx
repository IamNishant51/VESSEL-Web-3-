"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart, Users, Loader2 } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { followAgent, unfollowAgent, likeAgent, unlikeAgent, getSocialStatus } from "@/lib/db-sync";

type Props = {
  agentId: string;
  size?: "sm" | "md";
  showCounts?: boolean;
  onSocialChange?: (data: { followers: number; likes: number; isFollowing: boolean; isLiked: boolean }) => void;
};

export function SocialButtons({ agentId, size = "md", showCounts = true, onSocialChange }: Props) {
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [socialState, setSocialState] = useState({
    followers: 0,
    likes: 0,
    isFollowing: false,
    isLiked: false,
  });

  useEffect(() => {
    const walletAddress = publicKey?.toBase58();
    getSocialStatus(agentId, walletAddress)
      .then(setSocialState)
      .catch(console.warn);
  }, [agentId, publicKey]);

  const handleFollow = useCallback(async () => {
    if (!connected) {
      toast.error("Connect wallet to follow");
      return;
    }
    setLoading(true);
    try {
      const result = socialState.isFollowing
        ? await unfollowAgent(agentId)
        : await followAgent(agentId);
      
      const newState = {
        ...socialState,
        isFollowing: !socialState.isFollowing,
        followers: result.followerCount,
      };
      setSocialState(newState);
      onSocialChange?.(newState);
    } catch (e) {
      console.error("Follow error:", e);
      toast.error("Failed to update follow");
    } finally {
      setLoading(false);
    }
  }, [agentId, connected, socialState, onSocialChange]);

  const handleLike = useCallback(async () => {
    if (!connected) {
      toast.error("Connect wallet to like");
      return;
    }
    setLoading(true);
    try {
      const result = socialState.isLiked
        ? await unlikeAgent(agentId)
        : await likeAgent(agentId);
      
      const newState = {
        ...socialState,
        isLiked: !socialState.isLiked,
        likes: result.likeCount,
      };
      setSocialState(newState);
      onSocialChange?.(newState);
    } catch (e) {
      console.error("Like error:", e);
      toast.error("Failed to update like");
    } finally {
      setLoading(false);
    }
  }, [agentId, connected, socialState, onSocialChange]);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const buttonPadding = size === "sm" ? "p-1.5" : "p-2";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleFollow}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-full border transition-all ${
          socialState.isFollowing
            ? "border-black/20 bg-black/[0.04] text-black"
            : "border-black/10 bg-white text-black/50 hover:border-black/20 hover:text-black"
        } ${buttonPadding}`}
      >
        {loading ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Users className={iconSize} />
        )}
        {showCounts && (
          <span className={`${textSize} font-medium`}>{socialState.followers}</span>
        )}
      </button>

      <button
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center gap-1.5 rounded-full border transition-all ${
          socialState.isLiked
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-black/10 bg-white text-black/50 hover:border-red-200 hover:text-red-500"
        } ${buttonPadding}`}
      >
        {loading ? (
          <Loader2 className={`${iconSize} animate-spin`} />
        ) : (
          <Heart className={`${iconSize} ${socialState.isLiked ? "fill-current" : ""}`} />
        )}
        {showCounts && (
          <span className={`${textSize} font-medium`}>{socialState.likes}</span>
        )}
      </button>
    </div>
  );
}
