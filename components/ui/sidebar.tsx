"use client";

import { motion } from "framer-motion";
import { LogOut, Menu, Settings, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DashboardSidebarProps = {
  items: SidebarItem[];
  activeItem: string;
  onSelect: (id: string) => void;
  walletAddress: string;
  onDisconnect: () => Promise<void>;
};

function SidebarInner({
  items,
  activeItem,
  onSelect,
  walletAddress,
  onDisconnect,
}: DashboardSidebarProps) {
  return (
    <aside className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#111111]/85 p-4 backdrop-blur-2xl">
      <div className="mb-6 flex items-center gap-3 px-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5">
          <Sparkles className="h-4 w-4 text-[#ff2338]" />
        </span>
        <div>
          <p className="text-xs tracking-[0.2em] text-zinc-500">AGENT HUB</p>
          <p className="text-sm font-semibold tracking-[0.18em] text-white">VESSEL</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          return (
            <motion.button
              key={item.id}
              onClick={() => onSelect(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition",
                isActive
                  ? "border-[#ff2338]/50 bg-[#ff2338]/12 text-[#ff4f60]"
                  : "border-white/10 bg-white/[0.02] text-zinc-300 hover:border-white/20 hover:bg-white/[0.05]",
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-sm text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.05]">
          <Settings className="h-4 w-4" />
          <span className="font-medium">Settings</span>
        </button>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-zinc-500">Wallet</p>
          <p className="mt-1 text-xs font-medium text-zinc-200">{walletAddress}</p>
          <Button
            onClick={onDisconnect}
            variant="ghost"
            size="sm"
            className="mt-3 w-full justify-start border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function DashboardSidebar(props: DashboardSidebarProps) {
  return (
    <>
      <div className="mb-4 lg:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-start border-white/15 bg-[#111111]/80 text-zinc-100"
              />
            }
          >
            <Menu className="h-4 w-4" />
            Sidebar Menu
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] border-white/10 bg-black/95 p-3">
            <SidebarInner {...props} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100vh-8rem)]">
        <SidebarInner {...props} />
      </div>
    </>
  );
}
