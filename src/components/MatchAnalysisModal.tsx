'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { UserProfile, Project, ProjectRole, MatchScoreResult } from '@/lib/types';
import { calculateCandidateProjectMatch } from '@/lib/matchingAlgorithm';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Zap,
  Send,
  Loader2,
  Copy,
  Check,
  ShieldCheck
} from 'lucide-react';

interface MatchAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: UserProfile;
  project: Project;
  targetRole?: ProjectRole;
  onAction?: (message: string, roleId?: string) => void;
  actionType?: 'join' | 'invite';
}

export default function MatchAnalysisModal({
  isOpen,
  onClose,
  candidate,
  project,
  targetRole,
  onAction,
  actionType = 'join',
}: MatchAnalysisModalProps) {
  const [matchResult, setMatchResult] = useState<MatchScoreResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(true);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>(
    targetRole?.id || project.roles.find(r => !r.filled)?.id || project.roles[0]?.id || ''
  );

  useEffect(() => {
    if (!isOpen) return;

    const base = calculateCandidateProjectMatch(candidate, project, targetRole);
    setMatchResult(base);
    setIsLoadingAi(true);

    const fetchMatch = async () => {
      try {
        const token = auth && auth.currentUser ? await auth.currentUser.getIdToken() : "";
        const res = await fetch("/api/ai/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ candidate, project, targetRole }),
        });
        const data = await res.json();
        if (data.success && data.match) {
          setMatchResult(data.match);
          if (data.match.pitchTip) {
            setCustomMessage(
              `Hi ${actionType === "join" ? project.ownerName : candidate.name}! ${data.match.pitchTip} I’m excited about ${project.title}.`
            );
          }
        }
      } catch (err) {
        console.error("AI Match Error:", err);
      } finally {
        setIsLoadingAi(false);
      }
    };
    fetchMatch();
  }, [isOpen, candidate, project, targetRole, actionType]);

  if (!isOpen || !matchResult) return null;

  const handleCopyPitch = () => {
    if (!matchResult.pitchTip) return;
    navigator.clipboard.writeText(matchResult.pitchTip);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  const handleSend = () => {
    if (onAction) {
      onAction(customMessage, selectedRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-background flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-heading">Gemini AI Match Breakdown</h3>
                {isLoadingAi ? (
                  <span className="flex items-center gap-1 text-[11px] text-accent animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-accent/20 text-emerald-400 border border-[#238636]/40">
                    Verified Fit
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {candidate.name} ↔ {project.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-heading hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Score Hero */}
          <div className="p-4 rounded-xl bg-background border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-border bg-card flex items-center justify-center text-center">
                <div>
                  <span className="text-xl font-extrabold text-heading block leading-none">
                    {matchResult.overallScore}%
                  </span>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground">Match</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-heading">
                  {matchResult.overallScore >= 80 ? 'High Compatibility Match' : 'Complementary Fit'}
                </h4>
                <p className="text-xs text-foreground mt-0.5 leading-relaxed">
                  {matchResult.aiExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Dimension Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-lg bg-background border border-border text-center">
              <span className="text-[11px] text-muted-foreground">Skills Overlap</span>
              <p className="text-base font-bold text-accent mt-0.5">{matchResult.skillMatchScore}%</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border text-center">
              <span className="text-[11px] text-muted-foreground">Domain Match</span>
              <p className="text-base font-bold text-cyan-400 mt-0.5">{matchResult.interestMatchScore}%</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border text-center">
              <span className="text-[11px] text-muted-foreground">Sprint Capacity</span>
              <p className="text-base font-bold text-emerald-400 mt-0.5">{matchResult.availabilityScore}%</p>
            </div>
            <div className="p-3 rounded-lg bg-background border border-border text-center">
              <span className="text-[11px] text-muted-foreground">Experience Fit</span>
              <p className="text-base font-bold text-amber-300 mt-0.5">{matchResult.experienceScore}%</p>
            </div>
          </div>

          {/* Synergies */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Synergies & Technical Fit
            </h4>
            <div className="space-y-1.5">
              {matchResult.synergyHighlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-background border border-border text-xs text-foreground flex items-start gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Pitch Tip */}
          {matchResult.pitchTip && (
            <div className="p-3.5 rounded-xl bg-background border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Recommended Pitch</span>
                </span>
                <button
                  onClick={handleCopyPitch}
                  className="text-[11px] text-muted-foreground hover:text-heading flex items-center gap-1"
                >
                  {copiedPitch ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPitch ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs text-foreground italic leading-relaxed">
                &quot;{matchResult.pitchTip}&quot;
              </p>
            </div>
          )}

          {/* Action Dispatcher */}
          {onAction && (
            <div className="p-4 rounded-xl bg-background border border-border space-y-3">
              <label className="block text-xs font-bold text-heading">
                {actionType === 'join' ? 'Select Role to Apply For:' : 'Select Role to Invite For:'}
              </label>

              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-heading focus:outline-none focus:border-[#58a6ff]"
              >
                {project.roles.map((r) => (
                  <option key={r.id} value={r.id} disabled={r.filled}>
                    {r.title} {r.filled ? '(Filled)' : '(Open)'}
                  </option>
                ))}
              </select>

              <textarea aria-label="Text area"
                rows={3}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Personalized note to team leader..."
                className="w-full bg-card border border-border rounded-lg p-2.5 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none"
              />

              <button
                onClick={handleSend}
                className="w-full py-2 rounded-md bg-accent hover:bg-[#2ea043] text-heading text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{actionType === 'join' ? 'Submit Join Request' : 'Send Team Invitation'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
