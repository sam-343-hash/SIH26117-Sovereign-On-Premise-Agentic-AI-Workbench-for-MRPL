import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/sidebar';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'RefinaAI — Enterprise Refinery Intelligence',
  description: 'Industrial RAG, Automated Safety Agent, and Knowledge Graph Engine for SIH 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#05070a] text-slate-100 flex h-screen overflow-hidden antialiased font-sans">
        <AuthProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[#070a0e]/95">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
