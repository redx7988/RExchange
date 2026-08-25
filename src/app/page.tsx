'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ProjectCard from '@/components/ProjectCard';
import CandidateCard from '@/components/CandidateCard';
import MatchAnalysisModal from '@/components/MatchAnalysisModal';
import { Project, UserProfile } from '@/lib/types';
import {
  Sparkles,
  Zap,
  Users,
  Compass,
  CheckCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Shield,
  Layers,
  Cpu
} from 'lucide-react';

export default function LandingPage() {
  const { currentUser, allProjects, allUsers, sendJoinOrInviteRequest, isAuthenticated, loginWithGoogle, authLoading } = useApp();
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<Project | null>(null);
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoginError(null);
      setSigningIn(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Landing page login error:', err);
      setLoginError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setSigningIn(false);
    }
  };

  const handleOpenSkillSync = (project: Project) => {
    setSelectedProjectForModal(project);
    setSelectedCandidateForModal(currentUser);
    setModalOpen(true);
  };

  const handleOpenCandidateMatch = (candidate: UserProfile) => {
    setSelectedProjectForModal(allProjects[0] || null);
    setSelectedCandidateForModal(candidate);
    setModalOpen(true);
  };

  const handleModalAction = async (message: string, roleId?: string) => {
    if (!selectedProjectForModal || !selectedCandidateForModal) return;

    await sendJoinOrInviteRequest({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatarUrl,
      toUserId: selectedProjectForModal.ownerId,
      projectId: selectedProjectForModal.id,
      projectTitle: selectedProjectForModal.title,
      roleId,
      roleTitle: selectedProjectForModal.roles.find(r => r.id === roleId)?.title || 'Team Member',
      direction: 'user_to_project',
      message,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-fuchsia-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-semibold mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>F.AST Hackathon 2026 • AI-Powered Team Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-heading tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Form Winning Hackathon Teams with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
            Intelligent Gemini AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mt-6 leading-relaxed">
          Stop relying on random group chats. SkillSync connects students, developers, and designers based on{' '}
          <span className="text-heading font-medium">Firestore skill tags</span>, availability, and deep semantic Gemini compatibility scoring.
        </p>

        {/* Central Authentication Card / CTA Area */}
        <div className="max-w-md mx-auto mt-10">
          {!isAuthenticated ? (
            <div className="p-6 rounded-3xl bg-card border border-border shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-heading">
                  Get Started with Google
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sign in to unlock full access to projects, candidate pool, and Gemini AI Copilot.
                </p>
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-[11px] text-destructive">
                  {loginError}
                </div>
              )}

              <button aria-label="Sign In with Google"
                onClick={handleGoogleSignIn}
                disabled={signingIn || authLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all border border-slate-300 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{signingIn ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>

              <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground border-t border-border">
                <span>✓ Realtime Sync</span>
                <span>•</span>
                <span>✓ Gemini AI Copilot</span>
                <span>•</span>
                <span>✓ Team Workspaces</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/discover"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:opacity-90 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <Compass className="w-4 h-4" />
                <span>Discover Projects & Talent</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/copilot"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted hover:bg-border text-heading border border-border text-xs sm:text-sm font-bold transition-all"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>AI Hackathon Copilot</span>
              </Link>

              <Link
                href="/projects/new"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs sm:text-sm font-medium transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Post a Project</span>
              </Link>
            </div>
          )}
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-8 border-t border-border">
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-heading">96%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Complementary Fit Accuracy</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-accent">&lt; 30s</p>
            <p className="text-xs text-muted-foreground mt-0.5">To Auto-Assemble Teams</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-accent">100%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Realtime Firestore Sync</p>
          </div>
          <div className="p-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-success">Gemini 2.5</p>
            <p className="text-xs text-muted-foreground mt-0.5">Deep Semantic Scoring</p>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-heading tracking-tight">
            How SkillSync Supercharges Hackathon Teams
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Eliminating skill bottlenecks and chaotic team formation before the hackathon clock starts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-slate-500 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-muted text-accent flex items-center justify-center border border-border">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-heading">Firestore Skill Tag Matrix</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Users maintain granular skill tags (React, PyTorch, Figma, Rust) with verified proficiency levels and availability hours, stored persistently in Firestore.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-slate-500 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-muted text-accent flex items-center justify-center border border-border">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-heading">Gemini Compatibility Engine</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Evaluates synergy beyond keyword matching. Calculates skill gap overlap, complementary strengths, domain affinity, and personalized outreach pitches.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-slate-500 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-muted text-accent flex items-center justify-center border border-border">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-heading">Full Team Workspace & Chat</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Send and accept invites, unlock official team dashboards with open/filled roles, track hackathon milestones, and collaborate in real-time group chat.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Projects Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">
              Featured Open Projects
            </h2>
            <p className="text-xs text-slate-400">
              Active projects recruiting teammates right now.
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allProjects.slice(0, 3).map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUser={currentUser}
            />
          ))}
        </div>
      </section>

      {/* Top Candidate Talent Pool */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">
              Available Hackathon Talent
            </h2>
            <p className="text-xs text-slate-400">
              Developers, designers, and domain experts ready to sprint.
            </p>
          </div>
          <Link
            href="/candidates"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Talent Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allUsers
            .filter((u) => u.id !== currentUser.id)
            .slice(0, 3)
            .map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
              />
            ))}
        </div>
      </section>

      {/* Deep Match Analysis Modal */}
      {selectedProjectForModal && selectedCandidateForModal && (
        <MatchAnalysisModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          candidate={selectedCandidateForModal}
          project={selectedProjectForModal}
          onAction={handleModalAction}
          actionType="join"
        />
      )}
    </div>
  );
}
