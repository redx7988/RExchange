'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { MatchRequest } from '@/lib/types';
import AuthGuard from '@/components/AuthGuard';
import {
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Layers
} from 'lucide-react';

export default function RequestsPage() {
  const { requests, handleRequestAction, currentUser } = useApp();
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  const pendingReceived = requests.received.filter((r) => r.status === 'pending');
  const pastReceived = requests.received.filter((r) => r.status !== 'pending');

  const pendingSent = requests.sent.filter((r) => r.status === 'pending');
  const pastSent = requests.sent.filter((r) => r.status !== 'pending');

  return (
    <AuthGuard
      pageTitle="Match Requests & Invitations"
      description="Sign in with your Google account to review team invitations, respond to applicants, and accept squad match requests."
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Match Requests & Invites Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Manage incoming squad invitations and review applications for your projects.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-card p-1.5 rounded-2xl border border-border shrink-0 shadow-sm">
            <button
              onClick={() => setTab('received')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'received'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Received ({requests.received.length})</span>
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'sent'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-muted-foreground hover:text-heading'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Sent ({requests.sent.length})</span>
            </button>
          </div>
        </div>

        {/* RECEIVED TAB */}
        {tab === 'received' && (
          <div className="space-y-6">
            {/* Pending Requests */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Pending Actions ({pendingReceived.length})
              </h2>

              {pendingReceived.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-card border border-border text-muted-foreground text-xs">
                  No pending match requests awaiting your response.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReceived.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.fromUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                            alt={req.fromUserName}
                            className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-heading">{req.fromUserName}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-medium">
                                Applied for: {req.roleTitle || 'Team Member'}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Target: <strong className="text-foreground">{req.projectTitle}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRequestAction(req.id, 'accepted')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleRequestAction(req.id, 'declined')}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-muted hover:bg-border text-muted-foreground hover:text-heading text-xs font-semibold border border-border transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                        </div>
                      </div>

                      {req.message && (
                        <p className="text-xs text-muted-foreground italic bg-background p-3 rounded-xl border border-border">
                          "{req.message}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Requests History */}
            {pastReceived.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Past Received Requests
                </h2>
                <div className="space-y-2">
                  {pastReceived.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl bg-card border border-border flex items-center justify-between opacity-80"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={req.fromUserAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                          alt={req.fromUserName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-heading">{req.fromUserName}</p>
                          <p className="text-[10px] text-muted-foreground">{req.projectTitle}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          req.status === 'accepted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SENT TAB */}
        {tab === 'sent' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Outreach Sent ({requests.sent.length})
            </h2>

            {requests.sent.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-card border border-border text-muted-foreground text-xs">
                You haven't sent any match requests yet. Browse projects to join or candidates to invite!
              </div>
            ) : (
              requests.sent.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl bg-card border border-border space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-heading">{req.projectTitle}</h3>
                      <p className="text-xs text-muted-foreground">
                        Applied for: <strong className="text-accent">{req.roleTitle || 'General'}</strong>
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : req.status === 'declined'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {req.status === 'pending' ? 'Pending Owner Review' : req.status}
                    </span>
                  </div>
                  {req.message && (
                    <p className="text-xs text-muted-foreground italic bg-background p-2.5 rounded-xl border border-border">
                      "{req.message}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
