'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, UserRole } from '@/lib/auth-context';

export function Sidebar() {
  const pathname = usePathname();
  const { user, setRole, isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'AI Workspace', href: '/chat', icon: '💬' },
    { name: 'Document Intake', href: '/upload', icon: '📥' },
    { name: 'RAG Search (Vector Index)', href: '/rag', icon: '🔍' },
    { name: 'Safety Agent (Safety Scan)', href: '/safety', icon: '🛡️' },
    { name: 'Knowledge Graph (Graph Link)', href: '/knowledge-graph', icon: '🕸️' },
    { name: 'Reports', href: '/reports', icon: '📄' },
    { name: 'Admin Panel', href: '/admin', icon: '⚙️' },
  ];

  return (
    <aside className="w-64 bg-[#05070a] border-r border-slate-800 flex flex-col justify-between p-4 h-screen select-none">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#e0883f] to-[#3fd8c4] flex items-center justify-center text-black font-black text-xl shadow-lg shadow-[#e0883f]/20">
            R
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg tracking-wide">RefinaAI</h1>
            <p className="text-[10px] text-[#3fd8c4] font-mono tracking-wider uppercase">Enterprise Intelligence</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e0883f]/15 text-[#e0883f] border border-[#e0883f]/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">Portal Mode:</div>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
            isAdmin ? 'bg-amber-500/20 text-[#e0883f] border border-amber-500/30' : 'bg-teal-500/20 text-[#3fd8c4] border border-teal-500/30'
          }`}>
            {user.role}
          </span>
        </div>

        <select
          value={user.role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full bg-[#05070a] border border-slate-700 text-xs text-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#3fd8c4]"
        >
          <option value="operator">Operator Portal</option>
          <option value="safety_auditor">Safety Auditor Portal</option>
          <option value="admin">Plant Admin Portal</option>
        </select>

        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{user.name}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>
    </aside>
  );
}
