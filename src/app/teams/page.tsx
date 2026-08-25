'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import AuthGuard from '@/components/AuthGuard';
import { Layers, Users, ArrowRight, MessageSquare, CheckCircle2, Sparkles } from 'lucide-react';

export default function TeamsPage() {
  const { myTeams, allProjects } = useApp();

  return (
    <AuthGuard
      pageTitle="My Teams & Squad Workspaces"
      description="Sign in with Google to view and manage your hackathon teams, access private team chat rooms, and share project deliverables."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              My Teams & Workspaces
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active squads you are collaborating with for hackathons and projects.
            </p>
          </div>

          <Link
            href="/discover"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold shadow-md transition-colors"
          >
            <span>Find More Squads</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myTeams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-muted text-accent flex items-center justify-center mx-auto border border-border">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-heading">No active teams yet</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              You haven't formed or joined a team yet. Browse open projects or post one to form your squad!
            </p>
            <Link
              href="/discover"
              className="inline-block px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-md"
            >
              Explore Match Discovery
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTeams.map((team) => {
              const project = allProjects.find((p) => p.id === team.projectId || p.teamId === team.id);
              return (
                <div
                  key={team.id}
                  className="p-6 rounded-3xl bg-card border border-border hover:border-slate-500 transition-all space-y-5 flex flex-col justify-between shadow-sm"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-muted text-success border border-border flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Squad
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {team.members.length} members
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-heading tracking-tight">
                      {team.projectTitle}
                    </h2>

                    {/* Members Avatars */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-xs font-semibold text-muted-foreground">Team Roster:</span>
                      <div className="flex items-center gap-2">
                        {team.members.map((m) => (
                          <div key={m.userId} className="flex items-center gap-1.5 bg-background px-2.5 py-1 rounded-xl border border-border">
                            <img
                              src={m.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={m.name}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="text-xs font-semibold text-foreground">{m.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <Link
                      href={`/teams/${team.id}`}
                      className="flex items-center gap-1.5 text-xs font-bold text-accent hover:opacity-80"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Team Workspace & Chat</span>
                    </Link>

                    <Link
                      href={`/teams/${team.id}`}
                      className="p-2 rounded-xl bg-accent hover:opacity-90 text-white shadow-md transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
