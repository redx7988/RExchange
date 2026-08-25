export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillTag {
  name: string;
  level: SkillLevel;
  category?: 'frontend' | 'backend' | 'ai_ml' | 'design' | 'devops' | 'mobile' | 'data' | 'other';
  endorsements?: string[]; // Array of user IDs who endorsed this skill
}

export interface CustomLink {
  id: string;
  title: string;
  url: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  badge?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name: string;
  email: string;
  avatarUrl: string;
  coverUrl?: string;
  headline: string;
  pronouns?: string;
  location?: string;
  statusText?: string;
  bio: string;
  about?: string;
  skills: SkillTag[];
  interests: string[];
  availability: {
    hoursPerWeek: number;
    timezone: string;
    status: 'available' | 'busy' | 'exploring';
    hackathonReady: boolean;
  };
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
    customLinks?: CustomLink[];
  };
  experiences?: WorkExperience[];
  experienceYears: number;
  collegeOrOrg?: string;
  endorsementsCount?: number;
  featuredBadges?: string[];
  createdAt: string;
}

export interface ProjectRole {
  id: string;
  title: string;
  requiredSkills: {
    name: string;
    minLevel?: SkillLevel;
  }[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'any';
  filled: boolean;
  assignedUserId?: string;
  assignedUserName?: string;
}

export interface Project {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar?: string;
  title: string;
  tagline: string;
  description: string;
  type: 'hackathon' | 'startup' | 'research' | 'open_source';
  eventName?: string;
  domain: string[];
  timeline: string;
  teamSizeLimit: number;
  roles: ProjectRole[];
  status: 'recruiting' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt?: string;
  teamId?: string;
}

export interface MatchRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId?: string;
  projectId: string;
  projectTitle: string;
  roleId?: string;
  roleTitle?: string;
  direction: 'user_to_project' | 'project_to_user';
  status: 'pending' | 'accepted' | 'declined';
  message: string;
  createdAt: string;
}

export interface TeamMember {
  userId: string;
  name: string;
  avatarUrl: string;
  roleTitle: string;
  joinedAt: string;
}

export interface TeamTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  assignedTo?: string;
  assignedName?: string;
  dueDate?: string;
}

export interface TeamDemoLink {
  id: string;
  title: string;
  url: string;
  type: 'live_demo' | 'github' | 'figma' | 'deck' | 'video' | 'other';
  addedBy?: string;
  addedAt: string;
}

export interface Team {
  id: string;
  projectId: string;
  projectTitle: string;
  ownerId: string;
  members: TeamMember[];
  tasks: TeamTask[];
  demoLinks: TeamDemoLink[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  createdAt: string;
}

export interface MatchScoreResult {
  overallScore: number;
  skillMatchScore: number;
  interestMatchScore: number;
  availabilityScore: number;
  experienceScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  synergyHighlights: string[];
  gapAnalysis: string[];
  pitchTip: string;
  aiExplanation: string;
  recommendedRole?: string;
}

export interface TeamBalanceRecommendation {
  teamName: string;
  overallSynergyScore: number;
  balanceRationale: string;
  strengths: string[];
  roleAssignments: {
    roleId: string;
    roleTitle: string;
    candidateId: string;
    candidateName: string;
    matchScore: number;
    keyContribution: string;
  }[];
  unassignedSkillGaps: string[];
  recommendations: string[];
}
