'use client';

import React from 'react';
import Link from 'next/link';
import { Project, UserProfile } from '@/lib/types';
import { Sparkles, Users, Clock, ChevronRight, Trophy, Rocket, Code2, CheckCircle2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  currentUser: UserProfile;
}

export default function ProjectCard({
  project,
  currentUser,
}: ProjectCardProps) {
  const openRoles = project.roles.filter((r) => !r.filled);
  const isOwner = project.ownerId === currentUser.id;

  return (
    <div className="rounded-xl bg-card border border-border hover:border-slate-500 transition-all flex flex-col justify-between overflow-hidden shadow-sm">
      {/* Top Section */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-accent border border-border uppercase tracking-wider">
              {project.type}
            </span>
            {project.eventName && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-amber-500 border border-border">
                {project.eventName}
              </span>
            )}
          </div>
          {isOwner && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
              Owner
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/projects/${project.id}`} className="hover:text-accent transition-colors">
          <h3 className="text-base font-bold text-heading leading-snug line-clamp-1 mb-1">
            {project.title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {project.tagline || project.description}
        </p>

        {/* Open Roles */}
        <div className="space-y-1.5 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Roles needed:</span>
            <span>{openRoles.length} open</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.roles.map((role) => (
              <span
                key={role.id}
                className={`text-[11px] px-2 py-0.5 rounded border ${
                  role.filled
                    ? 'bg-background text-muted-foreground border-border line-through'
                    : 'bg-background text-foreground border-border'
                }`}
              >
                {role.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-background border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <img loading="lazy"
            src={project.ownerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={project.ownerName}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-border"
          />
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{project.ownerName}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/projects/${project.id}`}
            className="px-3 py-1.5 rounded-md text-xs font-bold bg-accent hover:opacity-90 text-white transition-colors"
          >
            View Project
          </Link>
        </div>
      </div>
    </div>
  );
}
