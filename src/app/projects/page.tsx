'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import ProjectCard from '@/components/ProjectCard';
import MatchAnalysisModal from '@/components/MatchAnalysisModal';
import AuthGuard from '@/components/AuthGuard';
import { Project } from '@/lib/types';
import { FolderGit2, Plus, Search, Trophy, Sparkles } from 'lucide-react';

export default function ProjectsPage() {
  const { allProjects, currentUser, sendJoinOrInviteRequest } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = allProjects.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.domain.some((d) => d.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleOpenMatch = (project: Project) => {
    setModalProject(project);
    setModalOpen(true);
  };

  const handleModalAction = async (message: string, roleId?: string) => {
    if (!modalProject) return;
    await sendJoinOrInviteRequest({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatarUrl,
      toUserId: modalProject.ownerId,
      projectId: modalProject.id,
      projectTitle: modalProject.title,
      roleId,
      roleTitle: modalProject.roles.find((r) => r.id === roleId)?.title || 'Team Member',
      direction: 'user_to_project',
      message,
    });
  };

  return (
    <AuthGuard
      pageTitle="Projects & Squad Directory"
      description="Sign in with your Google account to view active hackathon teams, open project roles, and apply to join squads."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              All Projects & Squads
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Browse active hackathon teams, startup MVPs, and open source initiatives looking for members.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Project</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input aria-label="Input field"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects by title, stack, or domain..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-heading placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
          >
            <option value="all">All Types</option>
            <option value="hackathon">Hackathon</option>
            <option value="startup">Startup MVP</option>
            <option value="research">Research</option>
            <option value="open_source">Open Source</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentUser={currentUser}
            />
          ))}
        </div>

        {modalProject && (
          <MatchAnalysisModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            candidate={currentUser}
            project={modalProject}
            onAction={handleModalAction}
            actionType="join"
          />
        )}
      </div>
    </AuthGuard>
  );
}
