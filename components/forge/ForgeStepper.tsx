"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type ForgeStepperProps = {
  steps: string[];
  currentStep: number;
};

export function ForgeStepper({ steps, currentStep }: ForgeStepperProps) {
  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-4">
      <div className="relative h-2 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#14F195] to-[#9945FF]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;

          return (
            <div
              key={step}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                isActive
                  ? "border-[#14F195]/40 bg-[#14F195]/10 text-[#14F195]"
                  : "border-white/10 bg-white/[0.02] text-zinc-400",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                  isDone
                    ? "border-[#14F195] bg-[#14F195] text-black"
                    : "border-white/20 text-zinc-400",
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : stepNumber}
              </span>
              <span className="truncate font-medium">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
