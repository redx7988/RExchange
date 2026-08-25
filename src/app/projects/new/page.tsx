'use client';

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProjectRole, SkillLevel } from '@/lib/types';
import {
  Sparkles,
  Plus,
  Trash2,
  Zap,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Trophy,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function NewProjectPage() {
  const router = useRouter();
  const { currentUser, addNewProject } = useApp();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'hackathon' | 'startup' | 'research' | 'open_source'>('hackathon');
  const [eventName, setEventName] = useState('F.AST Hackathon 2026');
  const [domainInput, setDomainInput] = useState('');
  const [domains, setDomains] = useState<string[]>(['AI Agents', 'FinTech']);
  const [timeline, setTimeline] = useState('36 hours (Hackathon weekend)');
  const [teamSizeLimit, setTeamSizeLimit] = useState(4);

  const [roles, setRoles] = useState<ProjectRole[]>([
    {
      id: 'role-1',
      title: 'Full-Stack Engineer',
      requiredSkills: [{ name: 'React', minLevel: 'advanced' }, { name: 'Next.js', minLevel: 'advanced' }],
      experienceLevel: 'intermediate',
      filled: false,
    },
    {
      id: 'role-2',
      title: 'AI / Backend Specialist',
      requiredSkills: [{ name: 'Python', minLevel: 'intermediate' }, { name: 'Gemini API', minLevel: 'intermediate' }],
      experienceLevel: 'intermediate',
      filled: false,
    }
  ]);

  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddDomain = () => {
    if (domainInput.trim() && !domains.includes(domainInput.trim())) {
      setDomains([...domains, domainInput.trim()]);
      setDomainInput('');
    }
  };

  const handleRemoveDomain = (d: string) => {
    setDomains(domains.filter((item) => item !== d));
  };

  const handleAddRole = () => {
    const newRole: ProjectRole = {
      id: `role-${Date.now()}`,
      title: 'New Role',
      requiredSkills: [{ name: 'TypeScript', minLevel: 'intermediate' }],
      experienceLevel: 'intermediate',
      filled: false,
    };
    setRoles([...roles, newRole]);
  };

  const handleRemoveRole = (id: string) => {
    setRoles(roles.filter((r) => r.id !== id));
  };

  const handleUpdateRoleTitle = (id: string, newTitle: string) => {
    setRoles(roles.map((r) => (r.id === id ? { ...r, title: newTitle } : r)));
  };

  const handleAddSkillToRole = (roleId: string, skillName: string) => {
    if (!skillName.trim()) return;
    setRoles(
      roles.map((r) => {
        if (r.id === roleId) {
          if (r.requiredSkills.some((s) => s.name.toLowerCase() === skillName.trim().toLowerCase())) return r;
          return {
            ...r,
            requiredSkills: [...r.requiredSkills, { name: skillName.trim(), minLevel: 'intermediate' as SkillLevel }],
          };
        }
        return r;
      })
    );
  };

  const handleRemoveSkillFromRole = (roleId: string, skillName: string) => {
    setRoles(
      roles.map((r) => {
        if (r.id === roleId) {
          return {
            ...r,
            requiredSkills: r.requiredSkills.filter((s) => s.name !== skillName),
          };
        }
        return r;
      })
    );
  };

  // AI Project Assistant (Gemini)
  const handleAiSuggest = async () => {
    if (!title && !description) {
      alert('Please enter a project title or brief description first so Gemini can analyze requirements.');
      return;
    }

    setIsSuggesting(true);
    try {
      const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch('/api/ai/skill-suggest', {

        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description, type }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.suggestedRoles && data.data.suggestedRoles.length > 0) {
          const mapped = data.data.suggestedRoles.map((r: any, idx: number) => ({
            id: `role-ai-${idx}-${Date.now()}`,
            title: r.title,
            requiredSkills: r.requiredSkills.map((s: any) => ({
              name: s.name,
              minLevel: (s.minLevel as SkillLevel) || 'intermediate',
            })),
            experienceLevel: r.experienceLevel || 'intermediate',
            filled: false,
          }));
          setRoles(mapped);
        }

        if (data.data.suggestedDomains && data.data.suggestedDomains.length > 0) {
          setDomains(Array.from(new Set([...domains, ...data.data.suggestedDomains])));
        }
      }
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Please fill in the project title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProj = await addNewProject({
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        ownerAvatar: currentUser.avatarUrl,
        title,
        tagline: tagline || title,
        description,
        type,
        eventName: type === 'hackathon' ? eventName : undefined,
        domain: domains.length > 0 ? domains : ['AI Agents'],
        timeline,
        teamSizeLimit,
        roles,
        status: 'recruiting',
      });

      router.push(`/projects/${newProj.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthGuard
      pageTitle="Create & Post Project"
      description="Sign in with Google to post your hackathon project, specify skill tag requirements, and recruit squad members."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </Link>

        <div className="p-6 rounded-3xl bg-card border border-border space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Post a Project & Form Your Squad
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Specify open roles and required skill tags to let Gemini match you with the best candidates.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={isSuggesting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isSuggesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Roles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-fuchsia-300" />
                <span>AI Auto-Suggest Roles</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Tagline */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MediScan AI: Realtime Ultrasound Diagnostic Copilot"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Short Tagline / Hook
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="One catchy sentence describing what your project solves..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Detailed Description & Hackathon Goals *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you are building, the architecture, what's done so far, and the ideal teammate contributions..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Project Type
              </label>
              <select
                value={type}
                onChange={(e: any) => setType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="hackathon">Hackathon</option>
                <option value="startup">Startup MVP</option>
                <option value="research">Research</option>
                <option value="open_source">Open Source</option>
              </select>
            </div>

            {type === 'hackathon' && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hackathon / Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. F.AST Hackathon 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Team Size
              </label>
              <input
                type="number"
                min={2}
                max={8}
                value={teamSizeLimit}
                onChange={(e) => setTeamSizeLimit(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Domains / Tags */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Domain & Track Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
                placeholder="Add tag (e.g. HealthTech, AI Agents, FinTech)..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddDomain}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {domains.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                >
                  <span>{d}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDomain(d)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Open Roles & Required Skills Matrix */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Open Roles & Required Skills ({roles.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Define specific skill needs per role for granular AI compatibility scoring.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddRole}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Role</span>
              </button>
            </div>

            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={role.title}
                      onChange={(e) => handleUpdateRoleTitle(role.id, e.target.value)}
                      placeholder="Role Title (e.g. Frontend Engineer)"
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold flex-1 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Required Skills for Role */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Required Skill Tags for this role:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredSkills.map((sk) => (
                        <span
                          key={sk.name}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-lg bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                        >
                          <span>{sk.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillFromRole(role.id, sk.name)}
                            className="text-slate-400 hover:text-rose-400 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}

                      {/* Quick skill add inputs */}
                      <input
                        type="text"
                        placeholder="+ add skill (hit Enter)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkillToRole(role.id, e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-0.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-36"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <Link
              href="/projects"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Project...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Publish Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </AuthGuard>
  );
}
