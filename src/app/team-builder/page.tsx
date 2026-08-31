'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { useApp } from '@/context/AppContext';
import { TeamBalanceRecommendation, Project, UserProfile } from '@/lib/types';
import type { TeamSearchResult } from '@/lib/gemini';
import {
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Loader2,
  ArrowRight,
  UserCheck,
  Search,
  Plus,
  Send,
  FolderGit2,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Check
} from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

export default function TeamBuilderPage() {
  const { allProjects, allUsers, currentUser, sendJoinOrInviteRequest } = useApp();

  // Mode: 'join' (Join an existing team) vs 'build' (Build/Assemble your own team)
  const [activeMode, setActiveMode] = useState<'join' | 'build'>('join');

  // ----------------------------------------------------
  // JOIN TEAM STATE (Mode 1)
  // ----------------------------------------------------
  const [candidateSkills, setCandidateSkills] = useState<string[]>(
    currentUser.skills.map((s) => s.name)
  );
  const [skillInput, setSkillInput] = useState('');
  const [userComment, setUserComment] = useState(
    'Looking for a fast-paced F.AST hackathon team building an AI project where I can contribute to backend APIs and Gemini integrations.'
  );
  const [isSearchingTeams, setIsSearchingTeams] = useState(false);
  const [matchingTeams, setMatchingTeams] = useState<TeamSearchResult[]>([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState<string[]>([]);

  // ----------------------------------------------------
  // BUILD TEAM STATE (Mode 2)
  // ----------------------------------------------------
  const [selectedProjectId, setSelectedProjectId] = useState<string>(allProjects[0]?.id || '');
  const [isAssembling, setIsAssembling] = useState(false);
  const [recommendation, setRecommendation] = useState<TeamBalanceRecommendation | null>(null);
  const [invitesSent, setInvitesSent] = useState(false);

  // Teammate Search inside Build mode
  const [leaderSearchPrompt, setLeaderSearchPrompt] = useState('');
  const [leaderTargetSkills, setLeaderTargetSkills] = useState<string[]>(['React', 'Figma']);
  const [leaderSkillInput, setLeaderSkillInput] = useState('');
  const [isSearchingTeammates, setIsSearchingTeammates] = useState(false);
  const [teammateResults, setTeammateResults] = useState<any[]>([]);

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId) || allProjects[0];

  // Handler: Join Team Search with Gemini
  const handleSearchTeams = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearchingTeams(true);

    try {
      const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch('/api/ai/team-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          mode: 'join_team',
          skills: candidateSkills,
          comment: userComment,
          candidate: currentUser,
          allProjects,
        }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        setMatchingTeams(data.results);
      }
    } catch (err) {
      console.error('Failed to search teams:', err);
    } finally {
      setIsSearchingTeams(false);
    }
  }, [candidateSkills, userComment, currentUser, allProjects]);

  const hasInitialSearchRun = useRef(false);

  // Initial trigger for Join mode
  useEffect(() => {
    if (allProjects.length > 0 && matchingTeams.length === 0 && !hasInitialSearchRun.current) {
      hasInitialSearchRun.current = true;
      handleSearchTeams();
    }
  }, [allProjects, handleSearchTeams, matchingTeams.length]);

  const handleApplyToTeam = async (teamResult: TeamSearchResult) => {
    const proj = allProjects.find((p) => p.id === teamResult.projectId);
    if (!proj) return;

    await sendJoinOrInviteRequest({
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromUserAvatar: currentUser.avatarUrl,
      toUserId: proj.ownerId,
      projectId: proj.id,
      projectTitle: proj.title,
      roleTitle: teamResult.matchedRoleTitle,
      direction: 'user_to_project',
      message: teamResult.suggestedPitch || userComment,
    });

    setAppliedProjectIds([...appliedProjectIds, proj.id]);
  };

  // Handler: Assemble Team with Gemini (Build mode)
  const handleAssembleTeam = async () => {
    if (!selectedProject) return;

    setIsAssembling(true);
    setInvitesSent(false);

    try {
      const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : '';
      const res = await fetch('/api/ai/team-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          project: selectedProject,
          candidatePool: allUsers,
        }),
      });

      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
      }
    } catch (err) {
      console.error('Failed to assemble team:', err);
    } finally {
      setIsAssembling(false);
    }
  };

  // Handler: Leader Teammate Search with Gemini (Build mode)
  const handleSearchTeammates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    setIsSearchingTeammates(true);
    try {
      const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : "";
      const res = await fetch('/api/ai/team-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          mode: 'find_teammates',
          searchPrompt: leaderSearchPrompt,
          skills: leaderTargetSkills,
          project: selectedProject,
          candidatePool: allUsers.filter((u) => u.id !== currentUser.id),
        }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        setTeammateResults(data.results);
      }
    } catch (err) {
      console.error('Failed to search teammates:', err);
    } finally {
      setIsSearchingTeammates(false);
    }
  };

  const handleSendAllInvites = async () => {
    if (!recommendation || !selectedProject) return;

    for (const assignment of recommendation.roleAssignments) {
      if (assignment.candidateId !== currentUser.id) {
        await sendJoinOrInviteRequest({
          fromUserId: currentUser.id,
          fromUserName: currentUser.name,
          fromUserAvatar: currentUser.avatarUrl,
          toUserId: assignment.candidateId,
          projectId: selectedProject.id,
          projectTitle: selectedProject.title,
          roleId: assignment.roleId,
          roleTitle: assignment.roleTitle,
          direction: 'project_to_user',
          message: `You were auto-matched by Gemini AI for the "${assignment.roleTitle}" role in our squad "${selectedProject.title}"! ${assignment.keyContribution}`,
        });
      }
    }

    setInvitesSent(true);
  };

  const handleAddCandidateSkill = () => {
    if (skillInput.trim() && !candidateSkills.includes(skillInput.trim())) {
      setCandidateSkills([...candidateSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveCandidateSkill = (s: string) => {
    setCandidateSkills(candidateSkills.filter((item) => item !== s));
  };

  const handleAddLeaderSkill = () => {
    if (leaderSkillInput.trim() && !leaderTargetSkills.includes(leaderSkillInput.trim())) {
      setLeaderTargetSkills([...leaderTargetSkills, leaderSkillInput.trim()]);
      setLeaderSkillInput('');
    }
  };

  return (
    <AuthGuard
      pageTitle="AI Team Auto-Balancer & Matchmaker"
      description="Sign in with your Google account to auto-assemble balanced hackathon teams and match with compatible squads."
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-card border border-border space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">
                AI Team Formation & Matchmaker
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-accent border border-border">
                Google Gemini
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Find and join an open squad based on your skills & goals, or build and auto-balance your own project team.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-background p-1 rounded-lg border border-border shrink-0">
            <button
              onClick={() => setActiveMode('join')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeMode === 'join'
                  ? 'bg-[#1f6feb] text-heading'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Join a Team</span>
            </button>
            <button
              onClick={() => setActiveMode('build')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                activeMode === 'build'
                  ? 'bg-accent text-heading'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Build Your Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODE 1: JOIN A TEAM / SQUAD                          */}
      {/* ==================================================== */}
      {activeMode === 'join' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Query & Skill Filter Card */}
          <form onSubmit={handleSearchTeams} className="p-6 rounded-xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-heading">
                  Describe What Squad You Want to Join
                </h2>
              </div>
              <span className="text-xs text-muted-foreground">Gemini Semantic Matching</span>
            </div>

            {/* Prompt Comment Input */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-foreground">
                Your Goals, Preferences, or Hackathon Focus:
              </label>
              <textarea aria-label="Text area"
                rows={3}
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="e.g. I am looking for a fast-paced F.AST hackathon team building an AI project with Next.js and FastAPI..."
                className="w-full bg-background border border-border rounded-lg p-3 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none leading-relaxed"
              />
            </div>

            {/* Unique Skill Tags selector */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-foreground">
                Skills You Offer / Target Roles:
              </label>
              <div className="flex gap-2">
                <input aria-label="Input field"
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCandidateSkill();
                    }
                  }}
                  placeholder="Add skill tag (e.g. PyTorch, React, Figma)..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="button"
                  onClick={handleAddCandidateSkill}
                  className="px-3.5 py-1.5 bg-muted hover:bg-[#30363d] text-foreground rounded-lg text-xs font-semibold border border-border"
                >
                  Add Tag
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {candidateSkills.map((sk) => (
                  <span
                    key={sk}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-background border border-border text-heading"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCandidateSkill(sk)}
                      className="text-muted-foreground hover:text-[#f85149]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSearchingTeams}
                className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-heading text-xs font-bold transition-all disabled:opacity-50"
              >
                {isSearchingTeams ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Searching Compatible Squads...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Matching Teams with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Matching Teams Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-heading">
                Recommended Teams & Open Positions ({matchingTeams.length})
              </h3>
              <span className="text-xs text-muted-foreground">Ranked by Gemini synergy score</span>
            </div>

            {matchingTeams.length === 0 && !isSearchingTeams ? (
              <div className="p-10 text-center rounded-xl bg-card border border-border text-xs text-muted-foreground">
                No matching teams found. Try broadening your comment or adding more skill tags.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingTeams.map((match) => {
                  const isApplied = appliedProjectIds.includes(match.projectId);
                  return (
                    <div
                      key={match.projectId}
                      className="p-5 rounded-xl bg-card border border-border hover:border-slate-500 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-accent border border-border uppercase tracking-wider">
                              {match.projectType}
                            </span>
                            <h4 className="text-base font-bold text-heading mt-1.5 leading-snug">
                              {match.projectTitle}
                            </h4>
                          </div>

                          <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-accent/20 text-emerald-400 border border-[#238636]/40 shrink-0">
                            {match.matchScore}% Fit
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-background border border-border text-xs space-y-1">
                          <p className="text-muted-foreground">
                            Target Role: <strong className="text-accent">{match.matchedRoleTitle}</strong>
                          </p>
                          <p className="text-foreground leading-relaxed">{match.matchRationale}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
                        <Link
                          href={`/projects/${match.projectId}`}
                          className="text-xs font-semibold text-muted-foreground hover:text-heading"
                        >
                          View Project
                        </Link>

                        <button
                          onClick={() => handleApplyToTeam(match)}
                          disabled={isApplied}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isApplied
                              ? 'bg-muted text-muted-foreground border border-border'
                              : 'bg-accent hover:bg-[#2ea043] text-heading shadow-sm'
                          }`}
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Request Sent</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Request to Join</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODE 2: BUILD YOUR TEAM (Team Leader / Project Lead) */}
      {/* ==================================================== */}
      {activeMode === 'build' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Project Selection & Team Configuration */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-heading">Select Project to Build Squad For</h2>
                <p className="text-xs text-muted-foreground">Teams are created for specific hackathon projects.</p>
              </div>

              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value);
                  setRecommendation(null);
                  setInvitesSent(false);
                }}
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-heading focus:outline-none focus:border-[#58a6ff] w-full sm:w-auto"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.roles.length} roles)
                  </option>
                ))}
              </select>
            </div>

            {/* AI Auto-Balance Action */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-background border border-border">
              <div>
                <span className="text-xs font-bold text-heading block">Auto-Compose Balanced Team</span>
                <span className="text-[11px] text-muted-foreground">
                  Gemini analyzes candidate skill tags & availability to allocate optimal members for open roles.
                </span>
              </div>

              <button
                onClick={handleAssembleTeam}
                disabled={isAssembling}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-[#2ea043] text-heading text-xs font-bold transition-all disabled:opacity-50 shrink-0"
              >
                {isAssembling ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auto-Balancing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Auto-Balance Squad with Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Auto-Balanced Squad Results */}
          {recommendation && (
            <div className="p-6 rounded-xl bg-card border border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-heading">{recommendation.teamName}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-accent/20 text-emerald-400 border border-[#238636]/40">
                      {recommendation.overallSynergyScore}% Balance Score
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{recommendation.balanceRationale}</p>
                </div>

                <button
                  onClick={handleSendAllInvites}
                  disabled={invitesSent}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    invitesSent
                      ? 'bg-muted text-muted-foreground border border-border'
                      : 'bg-accent hover:bg-[#2ea043] text-heading'
                  }`}
                >
                  {invitesSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Invites Sent to All!</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Send All Invites</span>
                    </>
                  )}
                </button>
              </div>

              {/* Role Allocations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {recommendation.roleAssignments.map((assignment) => {
                  const cand = allUsers.find((u) => u.id === assignment.candidateId);
                  return (
                    <div
                      key={assignment.roleId}
                      className="p-3.5 rounded-lg bg-background border border-border space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-accent">{assignment.roleTitle}</span>
                        <span className="text-[11px] font-bold text-emerald-400">{assignment.matchScore}%</span>
                      </div>

                      {cand && (
                        <div className="flex items-center gap-2">
                          <img loading="lazy" src={cand.avatarUrl} alt={cand.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-xs font-bold text-heading">{cand.name}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-muted-foreground leading-relaxed">{assignment.keyContribution}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teammate Search Tool (Leader search by prompt or skill tags) */}
          <div className="p-6 rounded-xl bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-heading flex items-center gap-2">
              <Search className="w-4 h-4 text-accent" />
              <span>Search & Invite Specific Teammates</span>
            </h3>

            <form onSubmit={handleSearchTeammates} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Describe the teammate you need (natural language):
                </label>
                <input aria-label="Input field"
                  type="text"
                  value={leaderSearchPrompt}
                  onChange={(e) => setLeaderSearchPrompt(e.target.value)}
                  placeholder="e.g. Need a UI/UX designer with Figma who has worked on clinical medical apps..."
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="flex gap-2">
                <input aria-label="Input field"
                  type="text"
                  value={leaderSkillInput}
                  onChange={(e) => setLeaderSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLeaderSkill();
                    }
                  }}
                  placeholder="Filter by skill tag (hit Enter)..."
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
                <button
                  type="submit"
                  disabled={isSearchingTeammates}
                  className="px-4 py-1.5 rounded-md bg-[#1f6feb] hover:bg-[#388bfd] text-heading text-xs font-bold transition-all disabled:opacity-50"
                >
                  {isSearchingTeammates ? 'Searching...' : 'Search Candidates'}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {leaderTargetSkills.map((sk) => (
                  <span
                    key={sk}
                    className="text-[11px] px-2 py-0.5 rounded bg-background border border-border text-foreground flex items-center gap-1"
                  >
                    <span>{sk}</span>
                    <button
                      type="button"
                      onClick={() => setLeaderTargetSkills(leaderTargetSkills.filter((i) => i !== sk))}
                      className="text-muted-foreground hover:text-[#f85149]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </form>

            {/* Teammate Results */}
            {teammateResults.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Top Candidate Matches
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {teammateResults.map((cand) => (
                    <div
                      key={cand.candidateId}
                      className="p-3.5 rounded-lg bg-background border border-border flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <img loading="lazy"
                          src={cand.candidateAvatar}
                          alt={cand.candidateName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-[#30363d]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-heading truncate">{cand.candidateName}</p>
                          <p className="text-[10px] text-accent">{cand.bestFitRole}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5">{cand.matchReason}</p>
                        </div>
                      </div>

                      <Link
                        href={`/candidates/${cand.candidateId}`}
                        className="px-3 py-1 rounded bg-muted hover:bg-[#30363d] text-foreground text-[11px] font-semibold shrink-0"
                      >
                        View & Invite
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
