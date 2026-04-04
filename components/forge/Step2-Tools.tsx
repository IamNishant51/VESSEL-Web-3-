"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ForgeDraft, ForgeTool, ToolCategory } from "@/types/agent";

type Props = {
  draft: ForgeDraft;
  updateDraft: (patch: Partial<ForgeDraft>) => void;
  tools: ForgeTool[];
};

const categories: ToolCategory[] = [
  "All",
  "Trading",
  "DeFi",
  "Staking",
  "Payments",
  "NFTs",
  "Social",
  "Oracles",
];

export function Step2Tools({ draft, updateDraft, tools }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory>("All");

  const selectedTools = draft.tools;

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const byCategory = category === "All" || tool.category === category;
      const text = `${tool.name} ${tool.description}`.toLowerCase();
      const bySearch = text.includes(query.toLowerCase());
      return byCategory && bySearch;
    });
  }, [tools, category, query]);

  function toggleTool(id: string) {
    if (selectedTools.includes(id)) {
      updateDraft({ tools: selectedTools.filter((toolId) => toolId !== id) });
      return;
    }

    updateDraft({ tools: [...selectedTools, id] });
  }

  return (
    <Card className="border-white/10 bg-[#111111]/85 backdrop-blur-xl">
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Tools & Capabilities</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Choose the Solana Agent Kit tools your agent can execute.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          {selectedTools.length === 0 ? (
            <p className="text-xs text-zinc-500">No tools selected yet.</p>
          ) : (
            selectedTools.map((toolId) => {
              const tool = tools.find((item) => item.id === toolId);
              if (!tool) return null;

              return (
                <Badge key={toolId} className="bg-[#14F195]/15 text-[#14F195]">
                  {tool.name}
                </Badge>
              );
            })
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tools..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#14F195]/50"
            />
          </div>

          <Tabs value={category} onValueChange={(value) => setCategory(value as ToolCategory)}>
            <TabsList className="h-auto flex-wrap">
              {categories.map((item) => (
                <TabsTrigger key={item} value={item} className="text-xs">
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTools.map((tool) => {
            const selected = selectedTools.includes(tool.id);
            return (
              <motion.button
                key={tool.id}
                whileHover={{ y: -2 }}
                onClick={() => toggleTool(tool.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-[#14F195]/40 bg-[#14F195]/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{tool.name}</p>
                    <p className="mt-1 text-xs text-zinc-400">{tool.description}</p>
                  </div>
                  <span
                    className={`inline-flex h-6 w-11 items-center rounded-full p-1 transition ${
                      selected ? "bg-[#14F195]" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 rounded-full bg-white transition ${
                        selected ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
