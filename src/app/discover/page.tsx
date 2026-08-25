'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Project, UserProfile } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';
import CandidateCard from '@/components/CandidateCard';
import AuthGuard from '@/components/AuthGuard';
import { FolderGit2, Users, Search, Sliders, Trophy, Tags } from 'lucide-react';

export default function DiscoverPage() {
  const { allProjects, allUsers, currentUser } = useApp();
  const [tab, setTab] = useState<'projects' | 'candidates'>('projects');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [hackathonOnly, setHackathonOnly] = useState(false);

  const allDomains = Array.from(
    new Set(allProjects.flatMap((p) => p.domain))
  );

  // Filtering Logic (Method 1: Strict Tag/Text Matching)
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Exclude user's own projects from discover? Optional, but let's keep them if they search.
      
      const matchesSearch =
        searchQuery === '' ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.roles.some((r) => r.requiredSkills.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesDomain = selectedDomain === 'all' || project.domain.includes(selectedDomain);
      const matchesHackathon = !hackathonOnly || project.type === 'hackathon';

      return matchesSearch && matchesDomain && matchesHackathon;
    });
  }, [allProjects, searchQuery, selectedDomain, hackathonOnly]);

  const filteredCandidates = useMemo(() => {
    return allUsers.filter((user) => {
      if (user.id === currentUser.id) return false;

      const matchesSearch =
        searchQuery === '' ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.skills.some((s) => 
          (typeof s === 'string' ? s : s.name).toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });
  }, [allUsers, currentUser.id, searchQuery]);

  return (
    <AuthGuard
      pageTitle="Discover Projects & Talent Pool"
      description="Sign in with Google to browse hackathon teams, explore candidate profiles, and connect with teammates."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">
                Directory
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Browse all ongoing projects and registered candidates. Use specific skill tags and keywords to find exactly who or what you need.
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-background p-1 rounded-lg border border-border shrink-0">
            <button
              onClick={() => setTab('projects')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tab === 'projects'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Browse Projects</span>
            </button>
            <button
              onClick={() => setTab('candidates')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                tab === 'candidates'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Browse Candidates</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input aria-label="Input field"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keyword, skill (e.g. Next.js, PyTorch), or role..."
                className="w-full bg-background border border-border rounded-lg pl-8 pr-4 py-2 text-xs text-heading placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {tab === 'projects' && (
              <>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  <option value="all">All Domains</option>
                  {allDomains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setHackathonOnly(!hackathonOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    hackathonOnly
                      ? 'bg-accent/10 text-accent border-accent/30'
                      : 'bg-background text-muted-foreground border-border hover:text-heading'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Hackathon Only</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {tab === 'projects' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={currentUser}
              />
            ))}
            {filteredProjects.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No projects found matching those tags.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCandidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
              />
            ))}
            {filteredCandidates.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl">
                <p className="text-muted-foreground text-sm font-medium">No candidates found matching those tags.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
