'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  Users,
  Compass,
  FolderGit2,
  Inbox,
  User,
  Layers,
  ChevronDown,
  RefreshCw,
  Zap,
  Menu,
  X,
  Smile,
  Settings,
  Eye,
  Search,
  Check,
  FileText,
  History,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Sun,
  Moon,
  Bot,
  LogIn,
  LogOut
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    allUsers,
    myTeams,
    allProjects,
    switchUser,
    requests,
    resetAllDemoData,
    updateStatus,
    theme,
    toggleTheme,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    firebaseUser,
    isAuthenticated,
    loginWithGoogle,
    logout,
  } = useApp();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [accessibilityModalOpen, setAccessibilityModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [teamLogsModalOpen, setTeamLogsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newStatusText, setNewStatusText] = useState(currentUser.statusText || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Username Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pendingRequestsCount = requests.received.filter((r) => r.status === 'pending').length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered users for username search
  const searchResults = allUsers.filter((u) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().replace(/^@/, '');
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.name.toLowerCase().includes(q) ||
      u.skills.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  const navLinks = [
    { href: '/discover', label: 'Discover & Match', icon: Compass },
    { href: '/projects', label: 'Projects', icon: FolderGit2 },
    { href: '/candidates', label: 'Talent Pool', icon: Users },
    { href: '/team-builder', label: 'AI Team Builder', icon: Sparkles },
    { href: '/copilot', label: 'AI Copilot', icon: Bot, isProtected: true },
    { href: '/teams', label: 'My Teams', icon: Layers },
    {
      href: '/requests',
      label: 'Requests',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
  ];

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    updateStatus(newStatusText);
    setStatusModalOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
      {/* Full-width stretch container matching GitHub layout */}
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left Side: Logo & Global Search Bar */}
          <div className="flex items-center gap-4 lg:gap-6 flex-1 min-w-0">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center group-hover:border-slate-500 transition-colors">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-heading tracking-tight">SkillSync</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-accent border border-border hidden sm:inline-block">
                  AI
                </span>
              </div>
            </Link>

            {/* Global Username / Candidate Search Bar (Shown when authenticated) */}
            {isAuthenticated && (
              <div className="relative max-w-xs sm:max-w-sm w-full hidden md:block" ref={searchRef}>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input aria-label="Input field"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchDropdownOpen(true);
                    }}
                    onFocus={() => setSearchDropdownOpen(true)}
                    placeholder="Type @username or skill to search..."
                    className="w-full bg-card border border-border rounded-lg pl-8 pr-8 py-1.5 text-xs text-foreground placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:bg-background transition-all"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono border border-border px-1 rounded bg-muted">
                    /
                  </span>
                </div>

                {/* Instant Search Autocomplete Dropdown */}
                {searchDropdownOpen && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 mt-1.5 w-full rounded-xl bg-card border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      People & Usernames
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="p-3 text-center text-xs text-muted-foreground">
                        No person found for &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      <div className="space-y-0.5 max-h-60 overflow-y-auto">
                        {searchResults.map((user) => (
                          <button aria-label="Button"
                            key={user.id}
                            onClick={() => {
                              setSearchDropdownOpen(false);
                              setSearchQuery('');
                              router.push(`/candidates/${user.id}`);
                            }}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted text-left transition-colors cursor-pointer"
                          >
                            <Image
                              src={user.avatarUrl}
                              alt={user.name}
                              width={28}
                              height={28}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-border"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-heading truncate">{user.name}</span>
                                <span className="text-[10px] font-mono text-accent">@{user.username || user.id}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground truncate">{user.headline}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Desktop Navigation Links (Shown only when logged in) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        isActive
                          ? 'text-heading bg-muted border border-border'
                          : 'text-muted-foreground hover:text-heading hover:bg-card'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span>{link.label}</span>
                      {link.badge !== undefined && (
                        <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-destructive text-white">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Side: Post Project CTA & Profile / Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!isAuthenticated && (
              <button aria-label="Button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted hover:bg-border text-heading text-xs font-semibold border border-border transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}

            <Link
              href="/projects/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Post Project</span>
            </Link>

            {isAuthenticated && (
            <>
            {/* Profile Photo Dropdown */}
            <div className="relative" ref={menuRef}>
              <button aria-label="Button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="relative flex items-center gap-1.5 p-0.5 rounded-full ring-1 ring-border hover:ring-accent focus:outline-none transition-all"
                title={`${currentUser.name} (@${currentUser.username || 'user'})`}
              >
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                {isAuthenticated && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-background" />
                )}
                <ChevronDown className="w-3 h-3 text-muted-foreground mr-1 hidden sm:block" />
              </button>

              {/* GitHub/LinkedIn-style Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-card border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  {/* User Profile Header */}
                  <div className="px-3 py-2.5 border-b border-border">
                    <div className="flex items-center gap-2.5">
                      <Image
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-border"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-heading truncate text-xs">
                            @{currentUser.username || 'user'}
                          </p>
                          {isAuthenticated && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-success/15 text-success border border-success/30">
                              Google
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
                          {currentUser.name}
                        </p>
                        {currentUser.email && (
                          <p className="text-[10px] text-muted-foreground truncate">{currentUser.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Set Status Button */}
                    <button aria-label="Button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setNewStatusText(currentUser.statusText || '');
                        setStatusModalOpen(true);
                      }}
                      className="mt-2.5 w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-border hover:border-slate-500 bg-background text-foreground text-[11px] transition-colors text-left"
                    >
                      <Smile className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {currentUser.statusText || 'Set status...'}
                      </span>
                    </button>
                  </div>

                  {/* Main Links */}
                  <div className="py-1 border-b border-border space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Your Profile</span>
                    </Link>

                    <Link
                      href="/copilot"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-accent hover:bg-muted hover:text-heading transition-colors font-semibold"
                    >
                      <Bot className="w-3.5 h-3.5 text-accent" />
                      <span>AI Hackathon Copilot</span>
                    </Link>

                    <Link
                      href="/projects"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors"
                    >
                      <FolderGit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Your Projects</span>
                    </Link>

                    <Link
                      href="/teams"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Teams & Personal Space</span>
                    </Link>

                    <Link
                      href="/requests"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Inbox className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Match Requests</span>
                      </div>
                      {pendingRequestsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-destructive text-white">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Settings & Team Logs */}
                  <div className="py-1 border-b border-border space-y-0.5">
                    <button aria-label="Button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setTeamLogsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors text-left"
                    >
                      <History className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Team Logs & History</span>
                    </button>

                    <button aria-label="Button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAccessibilityModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors text-left"
                    >
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Accessibility</span>
                    </button>

                    <button aria-label="Button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-foreground hover:bg-muted hover:text-heading transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Persona Switcher & Google Auth */}
                  <div className="py-1 space-y-0.5">
                    {isAuthenticated ? (
                      <button aria-label="Button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out (Google)</span>
                      </button>
                    ) : (
                      <button aria-label="Button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-accent hover:bg-accent/10 transition-colors text-left font-semibold"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In with Google</span>
                      </button>
                    )}

                    
                  </div>
                </div>
              )}
            </div>
            </>)}

            {/* Mobile Menu Toggle */}
            <button
              aria-label="Toggle Mobile Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-muted-foreground hover:text-heading rounded-md border border-transparent hover:border-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-card p-4 space-y-3 shadow-xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-muted-foreground hover:text-heading hover:bg-muted transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Team Logs Modal (Settings -> Team Logs) */}
      {teamLogsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-accent" />
                <h3 className="text-base font-bold text-heading">Team Logs & Historical Records</h3>
              </div>
              <button aria-label="Button" onClick={() => setTeamLogsModalOpen(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Historical log of squads and projects you have formed or joined on SkillSync.
            </p>

            <div className="space-y-3 pt-2">
              {myTeams.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground bg-background rounded-xl border border-border">
                  No team activity logged yet.
                </div>
              ) : (
                myTeams.map((team) => {
                  const proj = allProjects.find((p) => p.id === team.projectId || p.teamId === team.id);
                  const isLeader = team.ownerId === currentUser.id;

                  return (
                    <div
                      key={team.id}
                      className="p-4 rounded-xl bg-background border border-border space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-heading">{team.projectTitle}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                isLeader
                                  ? 'bg-accent/20 text-emerald-400 border-[#238636]/40'
                                  : 'bg-[#1f6feb]/20 text-accent border-[#1f6feb]/40'
                              }`}
                            >
                              {isLeader ? 'Squad Lead' : 'Team Member'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Created: {new Date(team.createdAt).toLocaleDateString()} • {team.members.length} members
                          </p>
                        </div>

                        <Link
                          href={`/teams/${team.id}`}
                          onClick={() => setTeamLogsModalOpen(false)}
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <span>Open Workspace</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Required / Open Skills info */}
                      {proj && (
                        <div className="space-y-1 pt-2 border-t border-border text-xs">
                          <span className="text-[11px] font-semibold text-muted-foreground">Project Skill Needs:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.roles.map((r) => (
                              <span
                                key={r.id}
                                className={`text-[11px] px-2 py-0.5 rounded border ${
                                  r.filled
                                    ? 'bg-muted text-muted-foreground border-border'
                                    : 'bg-[#1f6feb]/15 text-accent border-[#1f6feb]/30'
                                }`}
                              >
                                {r.title} {r.filled ? '✓' : '(Open)'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-border">
              <button aria-label="Button"
                onClick={() => setTeamLogsModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-muted text-foreground text-xs font-semibold hover:bg-[#30363d]"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-heading">Set Status</h3>
              <button aria-label="Button" onClick={() => setStatusModalOpen(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">What&apos;s happening?</label>
                <input aria-label="Input field"
                  type="text"
                  value={newStatusText}
                  onChange={(e) => setNewStatusText(e.target.value)}
                  placeholder="e.g. ⚡ Available for F.AST Hackathon | 🔬 Training vision models"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-muted-foreground">Quick:</span>
                <button aria-label="Button"
                  type="button"
                  onClick={() => setNewStatusText('⚡ Open to join Hackathon Squads')}
                  className="px-2 py-0.5 rounded bg-muted text-[10px] text-foreground hover:text-heading"
                >
                  ⚡ Open to squads
                </button>
                <button aria-label="Button"
                  type="button"
                  onClick={() => setNewStatusText('🎯 Building MVP full-time')}
                  className="px-2 py-0.5 rounded bg-muted text-[10px] text-foreground hover:text-heading"
                >
                  🎯 Building MVP
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button aria-label="Button"
                  type="button"
                  onClick={() => setStatusModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md bg-muted text-foreground text-xs font-semibold hover:text-heading"
                >
                  Cancel
                </button>
                <button aria-label="Button"
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-accent hover:bg-[#2ea043] text-heading text-xs font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accessibility Modal */}
      {accessibilityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-heading flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <span>Accessibility Settings</span>
              </h3>
              <button aria-label="Button" onClick={() => setAccessibilityModalOpen(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div>
                  <p className="font-semibold text-heading">High Contrast Mode</p>
                  <p className="text-[11px] text-muted-foreground">Increase contrast for text legibility</p>
                </div>
                <button aria-label="Button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`px-3 py-1 rounded-md text-xs font-bold ${
                    highContrast ? 'bg-accent text-heading' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {highContrast ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div>
                  <p className="font-semibold text-heading">Text Size</p>
                  <p className="text-[11px] text-muted-foreground">Scale UI typography</p>
                </div>
                <div className="flex gap-1">
                  <button aria-label="Button"
                    onClick={() => setFontSize('normal')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      fontSize === 'normal' ? 'bg-accent text-heading' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Default
                  </button>
                  <button aria-label="Button"
                    onClick={() => setFontSize('large')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                      fontSize === 'large' ? 'bg-accent text-heading' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Large
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button aria-label="Button"
                onClick={() => setAccessibilityModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-accent text-heading text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-heading flex items-center gap-2">
                <Settings className="w-4 h-4 text-accent" />
                <span>Settings</span>
              </h3>
              <button aria-label="Button" onClick={() => setSettingsModalOpen(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-foreground">
              <button aria-label="Button"
                onClick={() => {
                  setSettingsModalOpen(false);
                  setTeamLogsModalOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-background border border-border hover:border-slate-500 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <History className="w-4 h-4 text-accent" />
                  <div>
                    <p className="font-semibold text-heading">Team Logs & History</p>
                    <p className="text-[11px] text-muted-foreground">View all your created and joined squad records</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border">
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? <Moon className="w-4 h-4 text-accent" /> : <Sun className="w-4 h-4 text-accent" />}
                  <div>
                    <p className="font-semibold text-heading">Theme</p>
                    <p className="text-[11px] text-muted-foreground">Toggle light and dark mode</p>
                  </div>
                </div>
                <button aria-label="Button" onClick={toggleTheme} className="px-3 py-1 rounded-md bg-muted text-heading text-xs font-semibold hover:bg-border transition">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-background border border-border space-y-1">
                <p className="font-semibold text-heading">AI Engine Integration</p>
                <p className="text-[11px] text-muted-foreground">Google Gemini 3.6 Flash API active for compatibility scoring.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <button aria-label="Button"
                onClick={() => setSettingsModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Authentication Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
}
