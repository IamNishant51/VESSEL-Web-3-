"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string;
  hint: string;
  icon: LucideIcon;
};

export function StatsCard({ title, value, hint, icon: Icon }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <Card className="border-white/10 bg-[#101010]/90 backdrop-blur-xl">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-zinc-500">
                {title}
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.01em] text-white">{value}</p>
            </div>
            <span className="rounded-xl border border-[#ff2338]/40 bg-[#ff2338]/10 p-2">
              <Icon className="h-4 w-4 text-[#ff2338]" />
            </span>
          </div>
          <p className="mt-4 text-xs text-zinc-400">{hint}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
