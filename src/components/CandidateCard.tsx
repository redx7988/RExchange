'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';
import { Star, Code, Terminal, BrainCircuit, ExternalLink, Briefcase } from 'lucide-react';

interface CandidateCardProps {
  candidate: UserProfile;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  // Get top 3 skills safely
  const topSkills = Array.isArray(candidate.skills) ? candidate.skills.slice(0, 3) : [];

  return (
    <div className="rounded-xl bg-card border border-border hover:border-slate-500 transition-all flex flex-col overflow-hidden shadow-sm">
      <div className="p-5 flex gap-4">
        <Link href={`/candidates/${candidate.id}`} className="shrink-0">
          <img
            src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={candidate.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-background shadow-sm hover:opacity-80 transition-opacity"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/candidates/${candidate.id}`} className="hover:text-accent transition-colors">
            <h3 className="text-base font-bold text-heading truncate">{candidate.name}</h3>
          </Link>
          <p className="text-xs font-medium text-accent truncate mt-0.5">{candidate.headline}</p>
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
            {candidate.bio}
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex flex-wrap gap-1.5 mt-2">
          {topSkills.map((skill, idx) => (
            <span
              key={idx}
              className="text-[10px] px-2 py-0.5 rounded-full bg-background border border-border text-foreground flex items-center gap-1 font-medium"
            >
              {typeof skill === 'string' ? skill : skill.name}
            </span>
          ))}
          {candidate.skills && candidate.skills.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-3 mt-auto bg-background border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {candidate.links?.github && (
            <a href={candidate.links?.github} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-heading transition-colors" title="GitHub">
              <Code className="w-4 h-4" />
            </a>
          )}
          {candidate.links?.linkedin && (
            <a href={candidate.links?.linkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-heading transition-colors" title="LinkedIn">
              <Briefcase className="w-4 h-4" />
            </a>
          )}
        </div>

        <Link
          href={`/candidates/${candidate.id}`}
          className="px-4 py-1.5 rounded-md text-xs font-bold bg-accent hover:opacity-90 text-white transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
