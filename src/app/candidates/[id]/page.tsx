'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import MatchAnalysisModal from '@/components/MatchAnalysisModal';
import AuthGuard from '@/components/AuthGuard';
import { calculateCandidateProjectMatch } from '@/lib/matchingAlgorithm';
import {
  Sparkles,
  ArrowLeft,
  Clock,
  Send,
  Award,
  Github,
  Linkedin,
  Globe,
  ThumbsUp,
  MapPin,
  Building,
  Twitter,
  Link as LinkIcon,
  ShieldCheck,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { allUsers, allProjects, currentUser, sendJoinOrInviteRequest, endorseUserSkill } = useApp();

  const candidate = allUsers.find((u) => u.id === id || u.username === id);
  const [selectedProjectId, setSelectedProjectId] = useState(allProjects[0]?.id || '');
  const [modalOpen, setModalOpen] = useState(false);

  if (!candidate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-heading">Candidate Not Found</h2>
        <p className="text-xs text-slate-400">The developer profile you are looking for does not exist.</p>
        <Link href="/candidates" className="inline-block px-4 py-2 bg-indigo-600 text-heading rounded-xl text-xs font-bold">
          Back to Talent Pool
        </Link>
      </div>
    );
  }

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId) || allProjects[0];
  const matchResult = selectedProject ? calculateCandidateProjectMatch(candidate, selectedProject) : null;

  const handleEndorse = async (skillName: string) => {
    await endorseUserSkill(candidate.id, skillName);
  };

  const handleModalAction = async (message: string, roleId?: string) => {
    if (!selectedProject) return;
    await sendJoinOrInviteRequest({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatarUrl,
      toUserId: candidate.id,
      projectId: selectedProject.id,
      projectTitle: selectedProject.title,
      roleId,
      roleTitle: selectedProject.roles.find((r) => r.id === roleId)?.title || 'Team Member',
      direction: 'project_to_user',
      message,
    });
  };

  return (
    <AuthGuard
      pageTitle="Candidate Profile & Skill Portfolio"
      description="Sign in with Google to view candidate credentials, verified skill tags, and send hackathon team invitations."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <Link
          href="/candidates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Talent Pool</span>
        </Link>

      {/* LinkedIn-Style Profile Header Card */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-xl">
        {/* Cover Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
          <img
            src={candidate.coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'}
            alt="Cover background"
            className="w-full h-full object-cover opacity-60"
          />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="relative inline-block">
              <img
                src={candidate.avatarUrl}
                alt={candidate.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-[#161b22] shadow-2xl bg-card"
              />
              {candidate.availability.hackathonReady && (
                <span className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950 ring-2 ring-[#161b22] shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                  #OpenToSprint
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {matchResult && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-heading text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{matchResult.overallScore}% AI Match • Invite</span>
                </button>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-heading tracking-tight">{candidate.name}</h1>
              {candidate.pronouns && (
                <span className="text-xs text-slate-400">({candidate.pronouns})</span>
              )}
              <span className="text-xs text-indigo-400 font-mono">@{candidate.username || candidate.id}</span>
            </div>

            <p className="text-sm text-slate-200 leading-snug font-medium max-w-2xl">
              {candidate.headline}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {candidate.location}
                </span>
              )}
              {candidate.collegeOrOrg && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  {candidate.collegeOrOrg}
                </span>
              )}
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {candidate.availability.hoursPerWeek} hrs/week availability
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/80">
              {candidate.links.github && (
                <a
                  href={candidate.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-slate-200 hover:text-heading text-xs border border-border transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {candidate.links.linkedin && (
                <a
                  href={candidate.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-slate-200 hover:text-heading text-xs border border-border transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5 text-sky-400" />
                  <span>LinkedIn</span>
                </a>
              )}
              {candidate.links.portfolio && (
                <a
                  href={candidate.links.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-slate-200 hover:text-heading text-xs border border-border transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Portfolio</span>
                </a>
              )}
              {candidate.links.twitter && (
                <a
                  href={candidate.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-slate-200 hover:text-heading text-xs border border-border transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Twitter/X</span>
                </a>
              )}
              {candidate.links.customLinks?.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted text-indigo-300 hover:text-heading text-xs border border-indigo-500/30 transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-2">
        <h2 className="text-base font-bold text-heading">About</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
          {candidate.about || candidate.bio}
        </p>
      </div>

      {/* Skills & Peer Endorsement Validation Section */}
      <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Skills & Endorsements</span>
            </h2>
            <p className="text-xs text-slate-400">
              Endorse {candidate.name}’s skills to validate their technical proficiency.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {candidate.skills.map((skill) => {
            const endorserIds = skill.endorsements || [];
            const hasEndorsed = endorserIds.includes(currentUser.id);
            const endorsers = allUsers.filter((u) => endorserIds.includes(u.id));

            return (
              <div
                key={skill.name}
                className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-heading">{skill.name}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {skill.level}
                    </span>
                  </div>

                  {endorserIds.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {endorsers.slice(0, 3).map((e) => (
                          <img
                            key={e.id}
                            src={e.avatarUrl}
                            alt={e.name}
                            className="inline-block h-5 w-5 rounded-full ring-1 ring-[#161b22]"
                            title={e.name}
                          />
                        ))}
                      </div>
                      <span>
                        Endorsed by{' '}
                        <strong className="text-slate-300">{endorsers[0]?.name}</strong>
                        {endorserIds.length > 1 && ` and ${endorserIds.length - 1} other`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">Be the first to endorse this skill</p>
                  )}
                </div>

                <button
                  onClick={() => handleEndorse(skill.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    hasEndorsed
                      ? 'bg-indigo-600 text-heading border-indigo-500'
                      : 'bg-muted text-slate-300 border-border hover:border-slate-500'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{hasEndorsed ? 'Endorsed' : 'Endorse Skill'}</span>
                  <span className="ml-1 text-[11px] font-bold opacity-80">
                    ({endorserIds.length})
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Experiences Showcase */}
      {candidate.experiences && candidate.experiences.length > 0 && (
        <div className="rounded-2xl bg-card border border-border p-6 space-y-4">
          <h2 className="text-base font-bold text-heading">Experience & Hackathons</h2>
          <div className="space-y-3">
            {candidate.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl bg-background border border-border space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-heading">{exp.title}</h3>
                  {exp.badge && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {exp.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-300 font-medium">{exp.organization} • <span className="text-slate-400">{exp.period}</span></p>
                <p className="text-xs text-slate-400 leading-relaxed pt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {selectedProject && (
        <MatchAnalysisModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          candidate={candidate}
          project={selectedProject}
          onAction={handleModalAction}
          actionType="invite"
        />
      )}
    </div>
  </AuthGuard>
  );
}
