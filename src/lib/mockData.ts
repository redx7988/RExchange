import { UserProfile, Project, MatchRequest, Team } from './types';

export const GUEST_USER: UserProfile = {
  id: 'guest',
  username: 'guest',
  name: 'Guest User',
  email: '',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  headline: 'Sign in to create your profile',
  bio: '',
  skills: [],
  interests: [],
  availability: {
    hoursPerWeek: 0,
    timezone: 'UTC',
    status: 'exploring',
    hackathonReady: false
  },
  links: {},
  experienceYears: 0,
  createdAt: new Date().toISOString()
};

export const INITIAL_USERS: UserProfile[] = [GUEST_USER];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_REQUESTS: MatchRequest[] = [];
export const INITIAL_TEAMS: Team[] = [];
