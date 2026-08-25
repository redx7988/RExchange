'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useApp } from '@/context/AppContext';
import AuthModal from '@/components/AuthModal';
import AuthGuard from '@/components/AuthGuard';
import {
  Bot,
  Sparkles,
  Lock,
  LogIn,
  Send,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Layers,
  MessageSquare,
  Presentation,
  Cpu,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';

interface CopilotResult {
  headline: string;
  markdownResponse: string;
  keyTakeaways: string[];
  suggestedPrompts: string[];
}

export default function CopilotPage() {
  const {
    currentUser,
    allProjects,
    myTeams,
    isAuthenticated,
    firebaseUser,
    loginWithGoogle,
    authLoading,
  } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('none');
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId);

  const presetTemplates = [
    {
      icon: Presentation,
      title: '2-Minute Pitch Generator',
      prompt: `Generate a captivating, high-energy 2-minute pitch script for hackathon judges that outlines our problem hook, solution demo, and market impact.`,
      topic: 'pitch' as const,
    },
    {
      icon: Cpu,
      title: 'Full-Stack Architecture Plan',
      prompt: `Recommend the fastest, most scalable tech stack and API architecture (frontend, database, Gemini AI models, hosting) to build our MVP in under 36 hours.`,
      topic: 'architecture' as const,
    },
    {
      icon: Clock,
      title: '36-Hour Sprint Task Roadmap',
      prompt: `Create a step-by-step 3-phase sprint breakdown (Hours 0-12, 12-24, 24-36) dividing frontend, backend, and design responsibilities without bottlenecks.`,
      topic: 'sprint' as const,
    },
    {
      icon: Zap,
      title: 'AI Feature Supercharger',
      prompt: `Suggest 3 innovative generative AI features utilizing Google Gemini (multimodal, function calling, or structured outputs) that will wow hackathon judges.`,
      topic: 'general' as const,
    },
  ];

  const handleAskCopilot = async (overridePrompt?: string, topic?: string) => {
    const query = overridePrompt || promptInput;
    if (!query.trim()) return;

    setLoading(true);
    setCopied(false);

    try {
      const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userPrompt: query,
          topic: topic || 'general',
          userProfile: {
            name: currentUser.name,
            headline: currentUser.headline,
            skills: currentUser.skills,
            interests: currentUser.interests,
          },
          activeProject: selectedProject
            ? {
                title: selectedProject.title,
                description: selectedProject.description,
                domain: selectedProject.domain,
                type: selectedProject.type,
              }
            : undefined,
        }),
      });

      if (!res.ok) throw new Error('Copilot query failed');
      const data: CopilotResult = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Copilot request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.markdownResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthGuard
      pageTitle="Gemini AI Pitch & Strategy Copilot"
      description="Sign in with your Google account to generate tailored hackathon pitch decks, system architecture blueprints, and sprint task timelines."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-heading tracking-tight">
              Gemini AI Pitch & Strategy Copilot
            </h1>
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-muted text-accent border border-border">
              Gemini 2.5 Flash
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Your personal hackathon advisor. Generate winning pitches, full-stack architecture plans, sprint timelines, and teammate strategies tailored to your profile.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-background border border-border shrink-0">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-semibold text-heading">
              Authenticated as {currentUser.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Unlock Copilot</span>
          </button>
        )}
      </div>

      {/* Authentication Guard / Lock Screen */}
      {!isAuthenticated ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-card border border-border text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-muted border border-border text-accent flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-heading">
              Authentication Required
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Google Gemini Copilot uses real-time generative intelligence with personalized context. Please sign in with your Google account to start chatting with your AI Copilot.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2 text-left">
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <Presentation className="w-4 h-4 text-accent" />
              <p className="font-bold text-xs text-heading">Pitch Generator</p>
              <p className="text-[11px] text-muted-foreground">High-converting elevator scripts for judges</p>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <Cpu className="w-4 h-4 text-accent" />
              <p className="font-bold text-xs text-heading">Architecture Advisor</p>
              <p className="text-[11px] text-muted-foreground">Fast tech stacks & Gemini API blueprints</p>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1">
              <Clock className="w-4 h-4 text-accent" />
              <p className="font-bold text-xs text-heading">Sprint Planner</p>
              <p className="text-[11px] text-muted-foreground">36h sprint roadmaps without bottlenecks</p>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Interactive Copilot Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Prompts & Context */}
          <div className="space-y-4">
            {/* Project Context Selector */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <label className="block text-xs font-bold text-heading">
                Attach Project Context (Optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                <option value="none">General / No Specific Project</option>
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.domain.join(', ')})
                  </option>
                ))}
              </select>
              {selectedProject && (
                <div className="p-2.5 rounded-lg bg-background border border-border text-[11px] space-y-1">
                  <p className="font-semibold text-heading truncate">{selectedProject.title}</p>
                  <p className="text-muted-foreground line-clamp-2">{selectedProject.description}</p>
                </div>
              )}
            </div>

            {/* Quick Starter Templates */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3">
              <h3 className="text-xs font-bold text-heading uppercase tracking-wider text-muted-foreground">
                Quick Copilot Actions
              </h3>
              <div className="space-y-2">
                {presetTemplates.map((tpl, idx) => {
                  const Icon = tpl.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setPromptInput(tpl.prompt);
                        handleAskCopilot(tpl.prompt, tpl.topic);
                      }}
                      disabled={loading}
                      className="w-full text-left p-3 rounded-lg bg-background border border-border hover:border-slate-500 transition-all flex items-start gap-3 group cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-lg bg-muted text-accent flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-accent group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-heading group-hover:text-accent transition-colors">
                          {tpl.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {tpl.prompt}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Chat/Prompt Interface & Output */}
          <div className="lg:col-span-2 space-y-4">
            {/* Input Box */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-sm">
              <label className="block text-xs font-bold text-heading">
                Ask Gemini Hackathon Copilot
              </label>
              <div className="relative">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAskCopilot();
                    }
                  }}
                  rows={3}
                  placeholder="e.g. How can we formulate a winning pitch hook for an automated AI video editor on Next.js and Firebase?"
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent resize-none transition-colors"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Ctrl+Enter</kbd> to submit
                </span>
                <button
                  onClick={() => handleAskCopilot()}
                  disabled={loading || !promptInput.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md ml-auto cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Advice...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask Copilot</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Display */}
            {result && (
              <div className="p-6 rounded-xl bg-card border border-border space-y-5 animate-in fade-in shadow-sm">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
                      Copilot Strategy Output
                    </span>
                    <h2 className="text-base font-bold text-heading mt-0.5">{result.headline}</h2>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-heading text-xs font-semibold hover:bg-border transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Key Takeaways */}
                {result.keyTakeaways && result.keyTakeaways.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {result.keyTakeaways.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-background border border-border text-xs text-foreground flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Formatted Markdown Body */}
                <div className="p-4 rounded-xl bg-background border border-border text-xs text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                  {result.markdownResponse}
                </div>

                {/* Follow-up Prompts */}
                {result.suggestedPrompts && result.suggestedPrompts.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Suggested Follow-Ups:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {result.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPromptInput(p);
                            handleAskCopilot(p);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-muted hover:bg-border text-heading text-xs transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                        >
                          <Sparkles className="w-3 h-3 text-accent" />
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
    </AuthGuard>
  );
}
