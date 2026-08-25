'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import CandidateCard from '@/components/CandidateCard';
import MatchAnalysisModal from '@/components/MatchAnalysisModal';
import AuthGuard from '@/components/AuthGuard';
import { calculateCandidateProjectMatch } from '@/lib/matchingAlgorithm';
import { ProjectRole, UserProfile } from '@/lib/types';
import {
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  Trophy,
  Rocket,
  Shield,
  ArrowLeft,
  Send,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allProjects, allUsers, currentUser, sendJoinOrInviteRequest } = useApp();

  const project = allProjects.find((p) => p.id === id);

  const [selectedRole, setSelectedRole] = useState<ProjectRole | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<UserProfile | null>(null);
  const [modalActionType, setModalActionType] = useState<'join' | 'invite'>('join');

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-heading">Project Not Found</h2>
        <p className="text-xs text-muted-foreground">The project you are looking for does not exist or has been removed.</p>
        <Link href="/projects" className="inline-block px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const isOwner = project.ownerId === currentUser.id;
  const userMatchResult = calculateCandidateProjectMatch(currentUser, project, selectedRole);

  // Recommended Candidates for this project
  const candidateRecommendations = allUsers
    .filter((u) => u.id !== project.ownerId)
    .map((candidate) => ({
      candidate,
      match: calculateCandidateProjectMatch(candidate, project),
    }))
    .sort((a, b) => b.match.overallScore - a.match.overallScore);

  const handleApplyClick = (role?: ProjectRole) => {
    setSelectedRole(role);
    setModalCandidate(currentUser);
    setModalActionType('join');
    setModalOpen(true);
  };

  const handleInviteCandidateClick = (candidate: UserProfile) => {
    setModalCandidate(candidate);
    setModalActionType('invite');
    setModalOpen(true);
  };

  const handleModalAction = async (message: string, roleId?: string) => {
    if (!modalCandidate) return;

    if (modalActionType === 'join') {
      await sendJoinOrInviteRequest({
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatarUrl,
        toUserId: project.ownerId,
        projectId: project.id,
        projectTitle: project.title,
        roleId,
        roleTitle: project.roles.find((r) => r.id === roleId)?.title || 'Team Member',
        direction: 'user_to_project',
        message,
      });
    } else {
      await sendJoinOrInviteRequest({
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        fromUserAvatar: currentUser.avatarUrl,
        toUserId: modalCandidate.id,
        projectId: project.id,
        projectTitle: project.title,
        roleId,
        roleTitle: project.roles.find((r) => r.id === roleId)?.title || 'Team Member',
        direction: 'project_to_user',
        message,
      });
    }
  };

  return (
    <AuthGuard
      pageTitle="Project Workspace & Team Roster"
      description="Sign in with Google to view detailed project roles, match compatibility scoring, and contact project leaders."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-heading transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all projects</span>
          </Link>
        </div>

        {/* Project Header Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                  {project.type}
                </span>
                {project.eventName && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-foreground border border-border flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    {project.eventName}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  Posted on {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-heading tracking-tight">
                {project.title}
              </h1>

              <p className="text-sm sm:text-base text-foreground font-medium">
                {project.tagline}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {project.domain.map((d) => (
                  <span
                    key={d}
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-background border border-border text-foreground"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Compatibility Card */}
            <div className="w-full lg:w-72 p-5 rounded-2xl bg-background border border-border flex flex-col justify-between space-y-4 shrink-0 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Your Match
                </span>
                <span className="text-xl font-black text-accent">
                  {userMatchResult.overallScore}%
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Skill Alignment</span>
                  <span className="font-semibold text-heading">{userMatchResult.skillMatchScore}%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Domain Overlap</span>
                  <span className="font-semibold text-heading">{userMatchResult.interestMatchScore}%</span>
                </div>
              </div>

              {!isOwner ? (
                <button
                  onClick={() => handleApplyClick()}
                  className="w-full py-2.5 rounded-xl bg-accent hover:opacity-90 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Apply to Squad</span>
                </button>
              ) : (
                <Link
                  href={`/teams/${project.teamId || `team-${project.id}`}`}
                  className="w-full py-2.5 rounded-xl bg-muted hover:bg-border text-heading font-bold text-xs border border-border transition-all flex items-center justify-center gap-2 text-center"
                >
                  <Layers className="w-3.5 h-3.5 text-accent" />
                  <span>Open Team Workspace</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Two Column Layout: Description + Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Detailed Description & Project Leads */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-heading">Project Overview & Mission</h2>
              <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Project Lead Card */}
            <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Project Founder & Lead
              </h2>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={project.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={project.ownerName}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-border"
                  />
                  <div>
                    <h3 className="text-base font-bold text-heading">{project.ownerName}</h3>
                    <p className="text-xs text-muted-foreground">Project Creator</p>
                  </div>
                </div>

                <Link
                  href={`/candidates/${project.ownerId}`}
                  className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-border text-heading text-xs font-semibold border border-border transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Right Col: Open Roles */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-heading flex items-center justify-between">
              <span>Squad Positions</span>
              <span className="text-xs font-normal text-muted-foreground">
                {project.roles.filter((r) => !r.filled).length} open
              </span>
            </h2>

            <div className="space-y-3">
              {project.roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 ${
                    role.filled
                      ? 'bg-muted border-border opacity-70'
                      : 'bg-card border-border hover:border-slate-500 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-heading">{role.title}</h3>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {role.experienceLevel} Level
                      </span>
                    </div>

                    {role.filled ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        Filled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                        Open
                      </span>
                    )}
                  </div>

                  {/* Required Skills */}
                  <div className="flex flex-wrap gap-1.5">
                    {role.requiredSkills.map((skill) => (
                      <span
                        key={skill.name}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-background border border-border text-foreground"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>

                  {!role.filled && !isOwner && (
                    <button
                      onClick={() => handleApplyClick(role)}
                      className="w-full mt-2 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Apply for this Role
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-heading flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span>AI Recommended Candidates for this Project</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Ranked by Google Gemini compatibility score for open positions on this squad.
              </p>
            </div>
            <Link
              href="/team-builder"
              className="flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
            >
              <span>Auto-Build Full Team</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidateRecommendations.slice(0, 3).map(({ candidate }) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
              />
            ))}
          </div>
        </div>

        {/* Match Details Modal */}
        {modalCandidate && (
          <MatchAnalysisModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            candidate={modalCandidate}
            project={project}
            targetRole={selectedRole}
            onAction={handleModalAction}
            actionType={modalActionType}
          />
        )}
      </div>
    </AuthGuard>
  );
}
