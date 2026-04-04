"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

import { AgentAvatar3D } from "@/components/agents/AgentAvatar3D";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type AgentCardProps = {
  name: string;
  reputation: number;
  lastActive: string;
  accentColor?: string;
  agentId?: string;
};

export function AgentCard({
  name,
  reputation,
  lastActive,
  accentColor = "#ff2338",
  agentId,
}: AgentCardProps) {
  const router = useRouter();

  const handleRunAgent = () => {
    if (agentId) {
      router.push(`/agents/${agentId}`);
    }
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }}>
      <Card className="border-white/10 bg-[#111111]/90 backdrop-blur-xl">
        <CardContent className="space-y-4 p-4">
          <AgentAvatar3D accentColor={accentColor} />

          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white">{name}</p>
            <Badge className="border border-[#ff2338]/40 bg-[#ff2338]/12 text-[#ff7584]">Rep {reputation}</Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Last active</span>
            <span>{lastActive}</span>
          </div>

          <Button 
            onClick={handleRunAgent}
            className="w-full border border-[#ff2338] bg-[#ff2338] text-white hover:bg-[#e21930]"
          >
            <PlayCircle className="h-4 w-4" />
            Run Agent
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
