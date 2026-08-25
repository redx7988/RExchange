'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import SkillTagInput from '@/components/SkillTagInput';
import AuthGuard from '@/components/AuthGuard';
import { SkillTag, WorkExperience, CustomLink } from '@/lib/types';
import {
  User,
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Award,
  Github,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  ThumbsUp,
  MapPin,
  Building,
  Twitter,
  Link as LinkIcon,
  ShieldCheck,
  Check,
  Zap,
  X
} from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, allUsers, updateCurrentProfile, updateSkills, endorseUserSkill } = useApp();

  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  const [isAddingLink, setIsAddingLink] = useState(false);

  // Profile Form States
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || 'redx7988');
  const [headline, setHeadline] = useState(currentUser.headline);
  const [location, setLocation] = useState(currentUser.location || 'Chennai, Tamil Nadu, India');
  const [pronouns, setPronouns] = useState(currentUser.pronouns || 'he/him');
  const [collegeOrOrg, setCollegeOrOrg] = useState(currentUser.collegeOrOrg || '');
  const [about, setAbout] = useState(currentUser.about || currentUser.bio);
  const [hoursPerWeek, setHoursPerWeek] = useState(currentUser.availability.hoursPerWeek || 20);
  const [hackathonReady, setHackathonReady] = useState(currentUser.availability.hackathonReady);

  // Links State
  const [github, setGithub] = useState(currentUser.links.github || '');
  const [linkedin, setLinkedin] = useState(currentUser.links.linkedin || '');
  const [portfolio, setPortfolio] = useState(currentUser.links.portfolio || '');
  const [twitter, setTwitter] = useState(currentUser.links.twitter || '');
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(currentUser.links.customLinks || []);

  // New Link inputs
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Experience State
  const [experiences, setExperiences] = useState<WorkExperience[]>(currentUser.experiences || []);
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpPeriod, setNewExpPeriod] = useState('');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Skills
  const [skills, setSkills] = useState<SkillTag[]>(currentUser.skills || []);

  const handleSaveIntro = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentProfile({
      name,
      username,
      headline,
      location,
      pronouns,
      collegeOrOrg,
      availability: {
        ...currentUser.availability,
        hoursPerWeek: Number(hoursPerWeek),
        hackathonReady,
      },
      links: {
        github,
        linkedin,
        portfolio,
        twitter,
        customLinks,
      }
    });
    setIsEditingIntro(false);
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentProfile({ about, bio: about });
    setIsEditingAbout(false);
  };

  const handleAddCustomLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    const newLink: CustomLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: newLinkUrl.trim(),
    };

    const updated = [...customLinks, newLink];
    setCustomLinks(updated);
    await updateCurrentProfile({
      links: {
        github,
        linkedin,
        portfolio,
        twitter,
        customLinks: updated,
      }
    });

    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleRemoveCustomLink = async (id: string) => {
    const updated = customLinks.filter((l) => l.id !== id);
    setCustomLinks(updated);
    await updateCurrentProfile({
      links: {
        github,
        linkedin,
        portfolio,
        twitter,
        customLinks: updated,
      }
    });
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpOrg.trim()) return;

    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      title: newExpTitle.trim(),
      organization: newExpOrg.trim(),
      period: newExpPeriod.trim() || 'Present',
      description: newExpDesc.trim(),
    };

    const updated = [newExp, ...experiences];
    setExperiences(updated);
    await updateCurrentProfile({ experiences: updated });

    setNewExpTitle('');
    setNewExpOrg('');
    setNewExpPeriod('');
    setNewExpDesc('');
    setIsAddingExperience(false);
  };

  const handleRemoveExperience = async (id: string) => {
    const updated = experiences.filter((e) => e.id !== id);
    setExperiences(updated);
    await updateCurrentProfile({ experiences: updated });
  };

  const handleEndorse = async (skillName: string) => {
    await endorseUserSkill(currentUser.id, skillName);
  };

  const handleRemoveSkillDirect = async (skillName: string) => {
    const updated = currentUser.skills.filter((s) => s.name !== skillName);
    setSkills(updated);
    await updateSkills(updated);
  };

  const handleSaveSkillChanges = async (newSkills: SkillTag[]) => {
    setSkills(newSkills);
    await updateSkills(newSkills);
  };

  return (
    <AuthGuard
      pageTitle="Your Profile & Skill Tags"
      description="Sign in with your Google account to edit your public developer profile, manage verified skill tags, and sync your credentials across all your devices."
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* LinkedIn-Style Profile Header Card in GitHub Dark Palette */}
      <div className="rounded-xl bg-card border border-border overflow-hidden shadow-lg">
        {/* Cover Banner (Clean dark slate/mesh without bright purple) */}
        <div className="relative h-40 sm:h-48 w-full bg-background border-b border-border overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#30363d_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <div className="absolute top-4 right-4 px-3 py-1 rounded-md bg-card/80 border border-border text-[11px] text-muted-foreground font-mono">
            {currentUser.username ? `@${currentUser.username}` : 'developer.profile'}
          </div>
        </div>

        {/* Profile Info Overlay Section */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="relative inline-block">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover ring-4 ring-[#161b22] shadow-2xl bg-card"
              />
              {currentUser.availability.hackathonReady && (
                <span
                  className="absolute bottom-1 right-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent text-heading ring-2 ring-[#161b22] shadow-md flex items-center gap-1"
                  title="Open to Hackathon Teams"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  #OpenToSprint
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingIntro(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-border hover:border-[#8b949e] text-heading text-xs font-semibold bg-muted transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-heading tracking-tight">{currentUser.name}</h1>
              {currentUser.pronouns && (
                <span className="text-xs text-muted-foreground">({currentUser.pronouns})</span>
              )}
              <span className="text-xs text-accent font-mono">@{currentUser.username || 'redx7988'}</span>
            </div>

            <p className="text-sm text-foreground leading-snug font-medium max-w-2xl">
              {currentUser.headline}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {currentUser.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {currentUser.location}
                </span>
              )}
              {currentUser.collegeOrOrg && (
                <span className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-muted-foreground" />
                  {currentUser.collegeOrOrg}
                </span>
              )}
              <span className="flex items-center gap-1 text-success font-semibold">
                <Clock className="w-3.5 h-3.5" />
                {currentUser.availability.hoursPerWeek} hrs/week commitment
              </span>
            </div>

            {/* Custom Links & Social Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/80">
              {currentUser.links.github && (
                <a
                  href={currentUser.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-foreground hover:text-heading text-xs border border-border transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
              )}
              {currentUser.links.linkedin && (
                <a
                  href={currentUser.links.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-accent hover:text-heading text-xs border border-border transition-colors"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
              {currentUser.links.portfolio && (
                <a
                  href={currentUser.links.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-success hover:text-heading text-xs border border-border transition-colors"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
              )}
              {currentUser.links.twitter && (
                <a
                  href={currentUser.links.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-cyan-400 hover:text-heading text-xs border border-border transition-colors"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Twitter/X</span>
                </a>
              )}
              {customLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted text-accent hover:text-heading text-xs border border-border transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{link.title}</span>
                </a>
              ))}
              <button
                onClick={() => setIsAddingLink(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-dashed border-border text-muted-foreground hover:text-heading text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About / Summary Section */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-heading">About</h2>
          <button
            onClick={() => setIsEditingAbout(true)}
            className="p-1 text-muted-foreground hover:text-heading"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line">
          {currentUser.about || currentUser.bio}
        </p>
      </div>

      {/* Skills & Endorsements Section (with Hover-to-Delete Red Trash Button) */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-heading flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent" />
              <span>Skills & Peer Endorsements</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hover over your skills to manage or remove. Teammates can validate and endorse your capabilities.
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {currentUser.skills.length} skills
          </span>
        </div>

        {/* Skills Cards with hover red delete icon */}
        <div className="space-y-2.5">
          {currentUser.skills.map((skill) => {
            const endorserIds = skill.endorsements || [];
            const hasEndorsed = endorserIds.includes(currentUser.id);
            const endorsers = allUsers.filter((u) => endorserIds.includes(u.id));

            return (
              <div
                key={skill.name}
                className="group relative p-3.5 rounded-lg bg-background border border-border hover:border-slate-500 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-heading">{skill.name}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-muted text-accent border border-border">
                      {skill.level}
                    </span>
                  </div>

                  {/* Endorsement list */}
                  {endorserIds.length > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {endorsers.slice(0, 3).map((e) => (
                          <img
                            key={e.id}
                            src={e.avatarUrl}
                            alt={e.name}
                            className="inline-block h-5 w-5 rounded-full ring-1 ring-[#161b22]"
                            title={e.name}
                          />
                        ))}
                      </div>
                      <span>
                        Endorsed by{' '}
                        <strong className="text-foreground">
                          {endorsers[0]?.name || 'Teammates'}
                        </strong>
                        {endorserIds.length > 1 && ` and ${endorserIds.length - 1} other`}
                      </span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">No endorsements yet</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEndorse(skill.name)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                      hasEndorsed
                        ? 'bg-[#1f6feb]/20 text-accent border-[#1f6feb]/40'
                        : 'bg-muted text-foreground border-border hover:border-[#8b949e]'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{hasEndorsed ? 'Endorsed' : 'Endorse'}</span>
                    <span className="ml-1 text-[11px] font-bold opacity-80">
                      ({endorserIds.length})
                    </span>
                  </button>

                  {/* Hover-to-Delete Red Trash Button at corner */}
                  <button
                    onClick={() => handleRemoveSkillDirect(skill.name)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#f85149] hover:text-red-300 rounded hover:bg-muted"
                    title={`Delete ${skill.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Skill Matrix Editor */}
        <div className="pt-3 border-t border-border space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Add New Skill Tag
          </h3>
          <SkillTagInput skills={skills} onChange={handleSaveSkillChanges} isOwner={true} />
        </div>
      </div>

      {/* Experience & Hackathon History Showcase */}
      <div className="rounded-xl bg-card border border-border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-heading">Experience & Hackathon Track Record</h2>
          <button
            onClick={() => setIsAddingExperience(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-muted text-foreground hover:text-heading text-xs border border-border"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>

        {experiences.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No experience entries listed yet.</p>
        ) : (
          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-lg bg-background border border-border flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-heading">{exp.title}</h3>
                    {exp.badge && (
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-muted text-success border border-border">
                        {exp.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-accent font-medium">{exp.organization} • <span className="text-muted-foreground">{exp.period}</span></p>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">{exp.description}</p>
                </div>

                <button
                  onClick={() => handleRemoveExperience(exp.id)}
                  className="p-1.5 text-muted-foreground hover:text-[#f85149] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Intro Modal */}
      {isEditingIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-heading">Edit Profile Intro</h3>
              <button onClick={() => setIsEditingIntro(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIntro} className="space-y-4 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Username / Unique ID</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">Pronouns</label>
                  <input
                    type="text"
                    value={pronouns}
                    onChange={(e) => setPronouns(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">College / Organization</label>
                <input
                  type="text"
                  value={collegeOrOrg}
                  onChange={(e) => setCollegeOrOrg(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-foreground font-semibold mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
                <div>
                  <label className="block text-foreground font-semibold mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingIntro(false)}
                  className="px-4 py-1.5 rounded-md bg-muted text-foreground hover:text-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-md bg-accent hover:bg-[#2ea043] text-heading font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit About Modal */}
      {isEditingAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-heading">Edit About</h3>
              <button onClick={() => setIsEditingAbout(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAbout} className="space-y-4">
              <textarea
                rows={6}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Talk about your background, hackathons, and technical goals..."
                className="w-full bg-background border border-border rounded-lg p-3 text-xs text-heading placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] resize-none leading-relaxed"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingAbout(false)}
                  className="px-4 py-1.5 rounded-md bg-muted text-foreground text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-md bg-accent text-heading text-xs font-bold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Link Modal */}
      {isAddingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-heading">Add Custom Link</h3>
              <button onClick={() => setIsAddingLink(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomLink} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Hackathon Demo, Research Paper"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingLink(false)}
                  className="px-4 py-1.5 rounded-md bg-muted text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-md bg-accent text-heading font-bold"
                >
                  Add Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {isAddingExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-sm font-bold text-heading">Add Experience</h3>
              <button onClick={() => setIsAddingExperience(false)} className="text-muted-foreground hover:text-heading">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExperience} className="space-y-3 text-xs">
              <div>
                <label className="block text-foreground font-semibold mb-1">Role / Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Frontend Developer / Hackathon Winner"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Organization / Event</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. F.AST Hackathon 2026, SRM Lab"
                  value={newExpOrg}
                  onChange={(e) => setNewExpOrg(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Period</label>
                <input
                  type="text"
                  placeholder="e.g. Feb 2026, 2024 - Present"
                  value={newExpPeriod}
                  onChange={(e) => setNewExpPeriod(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2 text-heading focus:outline-none focus:border-[#58a6ff]"
                />
              </div>

              <div>
                <label className="block text-foreground font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Key contributions and tech stack..."
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg p-3 text-heading focus:outline-none focus:border-[#58a6ff] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingExperience(false)}
                  className="px-4 py-1.5 rounded-md bg-muted text-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-md bg-accent text-heading font-bold"
                >
                  Save Entry
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
