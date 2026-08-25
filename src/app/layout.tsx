import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'SkillSync — AI-Powered Team Formation Platform',
  description:
    'Connect students and developers into balanced hackathon and project teams using Firestore skill tags and Google Gemini compatibility scoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-accent selection:text-white">
        <AppProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          
          {/* Global Footer */}
          <footer className="border-t border-border bg-card/80 py-8 text-center text-xs text-muted-foreground">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-heading">SkillSync</span>
                <span>•</span>
                <span>AI Collaborative Team Engine</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>Powered by Google Gemini 2.5 & Firestore</span>
                <span>•</span>
                <span>F.AST Hackathon 2026</span>
              </div>
            </div>
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}
