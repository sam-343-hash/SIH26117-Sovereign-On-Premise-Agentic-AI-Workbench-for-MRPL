"use client";

import { Bell, Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/mock-data";

export function Topbar() {
  const pathname = usePathname();
  const current = navItems.find((n) => n.href === pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-slate-950/60 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="font-display text-base font-semibold text-white">
            {current?.label ?? "Dashboard"}
          </p>
          <p className="text-xs text-slate-500">Refina Refinery Intelligence Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm text-slate-400 hover:border-white/20 hover:text-slate-200 sm:flex"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search RefinaAI…</span>
          <kbd className="ml-4 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px]">⌘K</kbd>
        </button>

        <button className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-copper" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-flux to-flux-dark text-xs font-semibold text-slate-950">
          DV
        </div>
      </div>
    </header>
  );
}
