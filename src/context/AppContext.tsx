'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  UserProfile,
  Project,
  MatchRequest,
  Team,
  SkillTag,
  TeamDemoLink
} from '@/lib/types';
import {
  getAllUsers,
  getAllProjects,
  getRequestsForUser,
  getTeamsForUser,
  saveUserProfile,
  updateUserSkillTags,
  createProject,
  createMatchRequest,
  updateRequestStatus,
  endorseSkill,
  updateUserStatusText,
  addTeamDemoLink,
  removeTeamDemoLink,
  resetDemoData
} from '@/lib/firestoreService';
import {
  signInWithGoogle as fbSignIn,
  signOutFromFirebase,
  subscribeToAuth,
  isFirebaseConfigured,
  FirebaseUser
} from '@/lib/firebase';
import { INITIAL_USERS } from '@/lib/mockData';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  allProjects: Project[];
  requests: { received: MatchRequest[]; sent: MatchRequest[] };
  myTeams: Team[];
  isLoading: boolean;
  theme: 'light' | 'dark';
  highContrast: boolean;
  fontSize: 'normal' | 'large';
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isFirebaseConfigured: boolean;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  setHighContrast: (val: boolean) => void;
  setFontSize: (size: 'normal' | 'large') => void;
  switchUser: (userId: string) => void;
  refreshData: () => Promise<void>;
  updateCurrentProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateSkills: (skills: SkillTag[]) => Promise<void>;
  endorseUserSkill: (targetUserId: string, skillName: string) => Promise<void>;
  updateStatus: (statusText: string) => Promise<void>;
  addNewProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  sendJoinOrInviteRequest: (req: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => Promise<MatchRequest>;
  handleRequestAction: (requestId: string, action: 'accepted' | 'declined') => Promise<void>;
  addDemoLinkToTeam: (teamId: string, link: Omit<TeamDemoLink, 'id' | 'addedAt'>) => Promise<void>;
  removeDemoLinkFromTeam: (teamId: string, linkId: string) => Promise<void>;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<{ received: MatchRequest[]; sent: MatchRequest[] }>({ received: [], sent: [] });
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

  // Firebase Auth State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const currentUserIdRef = useRef(currentUser.id);
  useEffect(() => {
    currentUserIdRef.current = currentUser.id;
  }, [currentUser.id]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const loadData = useCallback(async (userToLoad?: UserProfile) => {
    try {
      const activeUserId = userToLoad?.id || currentUserIdRef.current;

      const [users, projects, reqs, teams] = await Promise.all([
        getAllUsers(),
        getAllProjects(),
        getRequestsForUser(activeUserId),
        getTeamsForUser(activeUserId),
      ]);

      setAllUsers(users);
      setAllProjects(projects);
      setRequests(reqs);
      setMyTeams(teams);

      const foundCurrent = users.find(u => u.id === activeUserId);
      if (foundCurrent) {
        setCurrentUser(foundCurrent);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // no longer depends on currentUser

  // Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);

      if (user) {
        try {
          const users = await getAllUsers();
          const existing = users.find(u => u.id === user.uid || u.email === user.email);
          if (!existing) {
            const newProfile: UserProfile = {
              id: user.uid,
              username: user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || `user_${user.uid.slice(0, 6)}`,
              name: user.displayName || 'Google User',
              email: user.email || '',
              avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              headline: 'New Member',
              bio: '',
              skills: [],
              interests: [],
              availability: {
                hoursPerWeek: 20,
                timezone: 'UTC/Local',
                status: 'available',
                hackathonReady: true,
              },
              links: {},
              experienceYears: 2,
              endorsementsCount: 0,
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(newProfile);
            await loadData(newProfile);
          } else {
            await loadData(existing);
          }
        } catch (e) {
          console.warn('Error syncing Firebase user profile:', e);
        }
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loginWithGoogle = async () => {
    try {
      setAuthLoading(true);
      await fbSignIn();
    } catch (err: any) {
      console.error('Google sign-in failed:', err);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOutFromFirebase();
      setFirebaseUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const switchUser = async (userId: string) => {
    const selected = allUsers.find(u => u.id === userId);
    if (selected) {
      setCurrentUser(selected);
      setIsLoading(true);
      await loadData(selected);
    }
  };

  const refreshData = async () => {
    await loadData();
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    const updated: UserProfile = {
      ...currentUser,
      ...updates,
    };
    setCurrentUser(updated);
    await saveUserProfile(updated);
    await loadData(updated);
  };

  const updateSkills = async (skills: SkillTag[]) => {
    const updated: UserProfile = {
      ...currentUser,
      skills,
    };
    setCurrentUser(updated);
    await updateUserSkillTags(currentUser.id, skills);
    await loadData(updated);
  };

  const endorseUserSkill = async (targetUserId: string, skillName: string) => {
    await endorseSkill(targetUserId, skillName, currentUser.id);
    await loadData();
  };

  const updateStatus = async (statusText: string) => {
    await updateUserStatusText(currentUser.id, statusText);
    await loadData();
  };

  const addNewProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    const created = await createProject(projectData);
    await loadData();
    return created;
  };

  const sendJoinOrInviteRequest = async (reqData: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => {
    const created = await createMatchRequest(reqData);
    await loadData();
    return created;
  };

  const handleRequestAction = async (requestId: string, action: 'accepted' | 'declined') => {
    await updateRequestStatus(requestId, action);
    await loadData();
  };

  const addDemoLinkToTeam = async (teamId: string, link: Omit<TeamDemoLink, 'id' | 'addedAt'>) => {
    await addTeamDemoLink(teamId, link);
    await loadData();
  };

  const removeDemoLinkFromTeam = async (teamId: string, linkId: string) => {
    await removeTeamDemoLink(teamId, linkId);
    await loadData();
  };

  const resetAllDemoData = () => {
    resetDemoData();
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        allProjects,
        requests,
        myTeams,
        isLoading,
        theme,
        toggleTheme,
        highContrast,
        fontSize,
        firebaseUser,
        isAuthenticated: Boolean(firebaseUser),
        isFirebaseConfigured,
        authLoading,
        loginWithGoogle,
        logout,
        setHighContrast,
        setFontSize,
        switchUser,
        refreshData,
        updateCurrentProfile,
        updateSkills,
        endorseUserSkill,
        updateStatus,
        addNewProject,
        sendJoinOrInviteRequest,
        handleRequestAction,
        addDemoLinkToTeam,
        removeDemoLinkFromTeam,
        resetAllDemoData,
      }}
    >
      <div className={`${highContrast ? 'contrast-125' : ''} ${fontSize === 'large' ? 'text-[15px]' : ''}`}>
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
