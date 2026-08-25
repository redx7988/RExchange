'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CandidateCard from '@/components/CandidateCard';
import MatchAnalysisModal from '@/components/MatchAnalysisModal';
import AuthGuard from '@/components/AuthGuard';
import { UserProfile } from '@/lib/types';
import { Users, Search, Sparkles, Trophy } from 'lucide-react';

export default function CandidatesPage() {
  const { allUsers, allProjects, currentUser, sendJoinOrInviteRequest } = useApp();
  const [search, setSearch] = useState('');
  const [hackathonOnly, setHackathonOnly] = useState(false);
  const [selectedTargetProject, setSelectedTargetProject] = useState(allProjects[0]?.id || '');

  const [modalCandidate, setModalCandidate] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const targetProject = allProjects.find((p) => p.id === selectedTargetProject) || allProjects[0];

  const filtered = allUsers
    .filter((u) => u.id !== currentUser.id)
    .filter((u) => {
      if (hackathonOnly && !u.availability.hackathonReady) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.headline.toLowerCase().includes(q) ||
          u.bio.toLowerCase().includes(q) ||
          u.skills.some((s) => s.name.toLowerCase().includes(q)) ||
          u.interests.some((i) => i.toLowerCase().includes(q))
        );
      }
      return true;
    });

  const handleOpenMatch = (candidate: UserProfile) => {
    setModalCandidate(candidate);
    setModalOpen(true);
  };

  const handleModalAction = async (message: string, roleId?: string) => {
    if (!modalCandidate || !targetProject) return;
    await sendJoinOrInviteRequest({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatarUrl,
      toUserId: modalCandidate.id,
      projectId: targetProject.id,
      projectTitle: targetProject.title,
      roleId,
      roleTitle: targetProject.roles.find((r) => r.id === roleId)?.title || 'Team Member',
      direction: 'project_to_user',
      message,
    });
  };

  return (
    <AuthGuard
      pageTitle="Talent Pool & Candidates"
      description="Sign in with your Google account to discover developers, designers, and domain experts with verified Firestore skill tags."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Talent Pool & Candidates
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Discover passionate developers, UI/UX designers, and ML engineers with verified skill tags in Firestore.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input aria-label="Input field"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill (e.g. PyTorch, React, Figma), name, or domain..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-heading placeholder-muted-foreground focus:outline-none focus:border-accent"
            />
          </div>

          {allProjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Match for:</span>
              <select
                value={selectedTargetProject}
                onChange={(e) => setSelectedTargetProject(e.target.value)}
                className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setHackathonOnly(!hackathonOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              hackathonOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-background text-muted-foreground border-border hover:text-heading'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Sprint Ready Only</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
            />
          ))}
        </div>

        {modalCandidate && targetProject && (
          <MatchAnalysisModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            candidate={modalCandidate}
            project={targetProject}
            onAction={handleModalAction}
            actionType="invite"
          />
        )}
      </div>
    </AuthGuard>
  );
}
