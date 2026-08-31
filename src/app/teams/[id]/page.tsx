'use client';

import React, { useState, use, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import TeamChat from '@/components/TeamChat';
import AuthGuard from '@/components/AuthGuard';
import { Team, TeamTask, TeamDemoLink } from '@/lib/types';
import { getTeamById, updateTeamTasks } from '@/lib/firestoreService';
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  FolderGit2,
  ExternalLink,
  Github,
  Globe,
  FileCode,
  Video,
  Presentation,
  Copy,
  Check,
  Sparkles,
  Link as LinkIcon,
  X
} from 'lucide-react';

export default function TeamWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { currentUser, allProjects, addDemoLinkToTeam, removeDemoLinkFromTeam } = useApp();
  const [team, setTeam] = useState<Team | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Demo Links Form State
  const [isAddingDemo, setIsAddingDemo] = useState(false);
  const [demoTitle, setDemoTitle] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [demoType, setDemoType] = useState<TeamDemoLink['type']>('live_demo');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchTeam = useCallback(() => {
    getTeamById(id).then((t) => {
      if (t) setTeam(t);
    });
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-heading">Team Personal Space Not Found</h2>
        <p className="text-xs text-slate-400">This team has not been initialized yet.</p>
        <Link href="/teams" className="inline-block px-4 py-2 bg-accent text-heading rounded-xl text-xs font-bold">
          Back to Teams
        </Link>
      </div>
    );
  }

  const project = allProjects.find((p) => p.id === team.projectId || p.teamId === team.id);

  const handleToggleTaskStatus = async (taskId: string) => {
    const updatedTasks: TeamTask[] = team.tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus: TeamTask['status'] =
          t.status === 'todo' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'todo';
        return { ...t, status: nextStatus };
      }
      return t;
    });

    setTeam({ ...team, tasks: updatedTasks });
    await updateTeamTasks(team.id, updatedTasks);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TeamTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'todo',
      assignedTo: currentUser.id,
      assignedName: currentUser.name,
    };

    const updated = [...team.tasks, newTask];
    setTeam({ ...team, tasks: updated });
    setNewTaskTitle('');
    await updateTeamTasks(team.id, updated);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updated = team.tasks.filter((t) => t.id !== taskId);
    setTeam({ ...team, tasks: updated });
    await updateTeamTasks(team.id, updated);
  };

  const handleAddDemoLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoTitle.trim() || !demoUrl.trim()) return;

    await addDemoLinkToTeam(team.id, {
      title: demoTitle.trim(),
      url: demoUrl.trim(),
      type: demoType,
      addedBy: currentUser.name,
    });

    setDemoTitle('');
    setDemoUrl('');
    setIsAddingDemo(false);
    fetchTeam();
  };

  const handleRemoveDemoLink = async (linkId: string) => {
    await removeDemoLinkFromTeam(team.id, linkId);
    fetchTeam();
  };

  const handleCopyLink = (linkId: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDemoIcon = (type: TeamDemoLink['type']) => {
    switch (type) {
      case 'github':
        return <Github className="w-4 h-4 text-slate-300" />;
      case 'figma':
        return <FileCode className="w-4 h-4 text-accent" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'deck':
        return <Presentation className="w-4 h-4 text-foreground" />;
      default:
        return <Globe className="w-4 h-4 text-success" />;
    }
  };

  const completedCount = team.tasks.filter((t) => t.status === 'done').length;
  const progressPercent = team.tasks.length > 0 ? Math.round((completedCount / team.tasks.length) * 100) : 0;

  return (
    <AuthGuard
      pageTitle="Team Squad Workspace & Chat"
      description="Sign in with your Google account to access your private squad workspace, chat with team members, and manage deliverables."
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teams</span>
        </Link>

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-heading tracking-tight">
                {team.projectTitle}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success/10 text-success border border-border">
                Team Personal Space
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Private collaborative workspace for team discussion, live project demos, and milestone deliverables.
            </p>
          </div>

          {project && (
            <Link
              href={`/projects/${project.id}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted hover:bg-[#30363d] text-heading text-xs font-semibold border border-border transition-colors"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-accent" />
              <span>Project Requirements</span>
            </Link>
          )}
        </div>

        {/* Team Members Roster */}
        <div className="pt-3 border-t border-border space-y-2">
          <span className="text-xs font-semibold text-slate-400">
            Squad Roster ({team.members.length} members):
          </span>
          <div className="flex flex-wrap gap-2">
            {team.members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background border border-border"
              >
                <img loading="lazy"
                  src={member.avatarUrl}
                  alt={member.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-heading block leading-tight">{member.name}</span>
                  <span className="text-[10px] text-accent block leading-tight">{member.roleTitle}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Demos & Deliverables Hub Section */}
      <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-heading flex items-center gap-2">
              <Globe className="w-4 h-4 text-success" />
              <span>Project Demos & Shared Deliverables</span>
            </h2>
            <p className="text-xs text-slate-400">
              Live web deployments, GitHub repositories, Figma designs, and pitch decks shared by the team.
            </p>
          </div>

          <button
            onClick={() => setIsAddingDemo(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent hover:bg-accent text-heading text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share Demo / Link</span>
          </button>
        </div>

        {/* Demo Links List */}
        {(!team.demoLinks || team.demoLinks.length === 0) ? (
          <div className="p-6 text-center text-xs text-muted-foreground bg-background rounded-xl border border-border">
            No demo links added yet. Share your Vercel deployment, GitHub repo, or Figma board!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {team.demoLinks.map((demo) => (
              <div
                key={demo.id}
                className="p-3.5 rounded-xl bg-background border border-border hover:border-slate-500 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDemoIcon(demo.type)}
                      <span className="text-xs font-bold text-heading truncate max-w-[170px]">
                        {demo.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveDemoLink(demo.id)}
                      className="text-muted-foreground hover:text-rose-400 p-1"
                      title="Remove link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-accent hover:underline truncate block"
                  >
                    {demo.url}
                  </a>

                  {demo.addedBy && (
                    <span className="text-[10px] text-muted-foreground block">
                      Added by {demo.addedBy}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-muted hover:bg-[#30363d] text-heading text-[11px] font-semibold transition-colors"
                  >
                    <span>Open Demo</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    onClick={() => handleCopyLink(demo.id, demo.url)}
                    className="p-1 rounded bg-muted text-slate-300 hover:text-heading"
                    title="Copy link URL"
                  >
                    {copiedId === demo.id ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Left = Task Board, Right = Realtime Team Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestone & Task Board (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-heading flex items-center gap-2">
                  <span>Hackathon Work & Milestone Tasks</span>
                  <span className="text-xs font-normal text-slate-400">
                    ({completedCount}/{team.tasks.length} done)
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">Click task circle to toggle progress.</p>
              </div>

              {/* Progress percentage */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-success">{progressPercent}%</span>
                <div className="w-16 h-1.5 rounded-full bg-background overflow-hidden border border-border">
                  <div
                    className="h-full bg-success transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input aria-label="Input field"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add milestone (e.g. Deploy API, Submit Pitch Deck)..."
                className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-xs text-heading placeholder-slate-500 focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-accent hover:bg-accent text-heading rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
              {team.tasks.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted-foreground bg-background rounded-xl border border-border">
                  No tasks added yet. Keep your squad aligned by adding tasks above!
                </div>
              ) : (
                team.tasks.map((task) => {
                  const isDone = task.status === 'done';
                  const inProgress = task.status === 'in_progress';

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-background/60 border-border text-muted-foreground'
                          : inProgress
                          ? 'bg-muted border-border text-heading'
                          : 'bg-background border-border text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task.id)}
                        className="flex items-center gap-3 text-left flex-1"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                        ) : inProgress ? (
                          <Clock className="w-4 h-4 text-accent shrink-0 animate-spin" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground shrink-0 hover:text-accent" />
                        )}
                        <div>
                          <span className={`text-xs font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-heading'}`}>
                            {task.title}
                          </span>
                          {task.assignedName && (
                            <span className="block text-[10px] text-muted-foreground">
                              Assigned to {task.assignedName}
                            </span>
                          )}
                        </div>
                      </button>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                            isDone
                              ? 'bg-success/10 text-success'
                              : inProgress
                              ? 'bg-accent/10 text-accent'
                              : 'bg-muted text-slate-400'
                          }`}
                        >
                          {task.status}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-muted-foreground hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Real-time Collaboration Chat (5 cols) */}
        <div className="lg:col-span-5">
          <TeamChat
            channelId={team.id}
            currentUser={currentUser}
            channelName={`${team.projectTitle} Chat Room`}
          />
        </div>
      </div>

      {/* Add Demo Link Modal */}
      {isAddingDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-heading">Share Project Demo / Asset</h3>
              <button onClick={() => setIsAddingDemo(false)} className="text-slate-400 hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDemoLink} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Asset Title</label>
                <input aria-label="Input field"
                  type="text"
                  required
                  placeholder="e.g. Vercel Production Web Demo, Figma Wireframes"
                  value={demoTitle}
                  onChange={(e) => setDemoTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-heading focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Resource URL</label>
                <input aria-label="Input field"
                  type="url"
                  required
                  placeholder="https://..."
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-heading focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Type</label>
                <select
                  value={demoType}
                  onChange={(e: any) => setDemoType(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2 text-heading focus:outline-none focus:border-accent"
                >
                  <option value="live_demo">Live Web Demo (Vercel/Netlify)</option>
                  <option value="github">GitHub Repository</option>
                  <option value="figma">Figma Design Prototype</option>
                  <option value="deck">Pitch Deck / Slides</option>
                  <option value="video">Video Walkthrough (Loom/YouTube)</option>
                  <option value="other">Other Link</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingDemo(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent text-heading font-bold"
                >
                  Share Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </AuthGuard>
  );
}
