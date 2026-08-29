"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  MessagesSquare,
  UploadCloud,
  Search,
  ShieldAlert,
  Share2,
  FileText,
  Settings2,
  Sparkles,
} from "lucide-react";
import { navItems } from "@/lib/mock-data";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  MessagesSquare,
  UploadCloud,
  Search,
  ShieldAlert,
  Share2,
  FileText,
  Settings2,
};

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-rise" />
        <Dialog.Content className="fixed left-1/2 top-[18%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl glass-strong shadow-glass">
          <Dialog.Title className="sr-only">Command Palette</Dialog.Title>
          <Command
            className="flex flex-col"
            filter={(value, search) =>
              value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4">
              <Sparkles className="h-4 w-4 text-flux" />
              <Command.Input
                autoFocus
                placeholder="Jump to a workspace, document, or action…"
                className="w-full bg-transparent py-3.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
              />
              <kbd className="hidden shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-500 sm:inline">
                ESC
              </kbd>
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-sm text-slate-500">
                No matches. Try “upload”, “safety”, or “report”.
              </Command.Empty>
              <Command.Group heading="Navigate" className="px-2 py-1 text-[11px] uppercase tracking-wider text-slate-500">
                {navItems.map((item) => {
                  const Icon = iconMap[item.icon] ?? Search;
                  return (
                    <Command.Item
                      key={item.key}
                      value={item.label}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 aria-selected:bg-flux/10 aria-selected:text-flux-light"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading="Quick Actions" className="px-2 py-1 text-[11px] uppercase tracking-wider text-slate-500">
                <Command.Item
                  value="Ask AI a question"
                  onSelect={() => go("/chat")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 aria-selected:bg-copper/10 aria-selected:text-copper-light"
                >
                  <MessagesSquare className="h-4 w-4" />
                  Ask AI a question
                </Command.Item>
                <Command.Item
                  value="Upload a new document"
                  onSelect={() => go("/upload")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 aria-selected:bg-copper/10 aria-selected:text-copper-light"
                >
                  <UploadCloud className="h-4 w-4" />
                  Upload a new document
                </Command.Item>
                <Command.Item
                  value="Generate compliance report"
                  onSelect={() => go("/reports")}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 aria-selected:bg-copper/10 aria-selected:text-copper-light"
                >
                  <FileText className="h-4 w-4" />
                  Generate compliance report
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
