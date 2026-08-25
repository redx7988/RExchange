import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import {
  UserProfile,
  Project,
  MatchRequest,
  Team,
  ChatMessage,
  SkillTag,
  TeamDemoLink
} from './types';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_REQUESTS,
  INITIAL_TEAMS
} from './mockData';

// Local storage keys for hybrid / demo mode fallback
const STORAGE_KEYS = {
  USERS: 'pm_users',
  PROJECTS: 'pm_projects',
  REQUESTS: 'pm_requests',
  TEAMS: 'pm_teams',
  MESSAGES: 'pm_messages',
};

// Helper to get local data
function getLocal<T>(key: string, defaultVal: T[]): T[] {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setLocal<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// ----------------------------------------------------
// USERS SERVICE (Cross-Device Cloud Sync)
// ----------------------------------------------------

export async function getAllUsers(): Promise<UserProfile[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        const firestoreUsers = snap.docs.map(d => ({ ...d.data(), id: d.id } as UserProfile));
        setLocal(STORAGE_KEYS.USERS, firestoreUsers);
        return firestoreUsers;
      }
    } catch (err) {
      console.warn('Firestore getAllUsers fallback:', err);
    }
  }
  return getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore getUserProfile fallback:', err);
    }
  }
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  return users.find(u => u.id === userId || u.username === userId) || null;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  if (!email) return null;
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { ...d.data(), id: d.id } as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore getUserByEmail fallback:', err);
    }
  }
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  return users.find(u => u.email?.toLowerCase() === email.toLowerCase()) || null;
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
    } catch (err) {
      console.warn('Firestore saveUserProfile fallback:', err);
    }
  }
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = users.findIndex(u => u.id === profile.id || (profile.email && u.email === profile.email));
  if (idx >= 0) {
    users[idx] = profile;
  } else {
    users.push(profile);
  }
  setLocal(STORAGE_KEYS.USERS, users);
}

export async function updateUserSkillTags(userId: string, skills: SkillTag[]): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), { skills });
    } catch (err) {
      console.warn('Firestore updateUserSkillTags fallback:', err);
    }
  }
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].skills = skills;
    setLocal(STORAGE_KEYS.USERS, users);
  }
}

export async function endorseSkill(
  targetUserId: string,
  skillName: string,
  endorserId: string
): Promise<UserProfile | null> {
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = users.findIndex(u => u.id === targetUserId);
  if (idx < 0) return null;

  const user = users[idx];
  const skillIdx = user.skills.findIndex(s => s.name.toLowerCase() === skillName.toLowerCase());

  if (skillIdx >= 0) {
    const skill = user.skills[skillIdx];
    const currentEndorsements = skill.endorsements || [];

    if (currentEndorsements.includes(endorserId)) {
      skill.endorsements = currentEndorsements.filter(id => id !== endorserId);
      user.endorsementsCount = Math.max(0, (user.endorsementsCount || 1) - 1);
    } else {
      skill.endorsements = [...currentEndorsements, endorserId];
      user.endorsementsCount = (user.endorsementsCount || 0) + 1;
    }

    user.skills[skillIdx] = skill;
    users[idx] = user;
    setLocal(STORAGE_KEYS.USERS, users);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'users', targetUserId), {
          skills: user.skills,
          endorsementsCount: user.endorsementsCount,
        });
      } catch (err) {
        console.warn('Firestore endorseSkill fallback:', err);
      }
    }

    return user;
  }

  return null;
}

export async function updateUserStatusText(userId: string, statusText: string): Promise<void> {
  const users = getLocal<UserProfile>(STORAGE_KEYS.USERS, INITIAL_USERS);
  const idx = users.findIndex(u => u.id === userId);
  if (idx >= 0) {
    users[idx].statusText = statusText;
    setLocal(STORAGE_KEYS.USERS, users);
  }

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'users', userId), { statusText });
    } catch (err) {
      console.warn('Firestore updateUserStatusText fallback:', err);
    }
  }
}

// ----------------------------------------------------
// PROJECTS SERVICE (Cross-Device Cloud Sync)
// ----------------------------------------------------

export async function getAllProjects(): Promise<Project[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      if (!snap.empty) {
        const firestoreProjects = snap.docs.map(d => ({ ...d.data(), id: d.id } as Project));
        setLocal(STORAGE_KEYS.PROJECTS, firestoreProjects);
        return firestoreProjects;
      }
    } catch (err) {
      console.warn('Firestore getAllProjects fallback:', err);
    }
  }
  return getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'projects', projectId));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Project;
      }
    } catch (err) {
      console.warn('Firestore getProjectById fallback:', err);
    }
  }
  const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  return projects.find(p => p.id === projectId) || null;
}

export async function createProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
  const newId = `proj-${Date.now()}`;
  const newProject: Project = {
    ...project,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'projects', newId), newProject);
    } catch (err) {
      console.warn('Firestore createProject fallback:', err);
    }
  }

  const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  projects.unshift(newProject);
  setLocal(STORAGE_KEYS.PROJECTS, projects);
  
  // Also create a team immediately for the owner and sync to Firestore
  const newTeam: Team = {
    id: `team-${newId}`,
    projectId: newId,
    projectTitle: project.title,
    ownerId: project.ownerId,
    members: [{
      userId: project.ownerId,
      name: project.ownerName,
      avatarUrl: project.ownerAvatar || '',
      roleTitle: 'Project Lead',
      joinedAt: newProject.createdAt,
    }],
    tasks: [],
    demoLinks: [],
    createdAt: newProject.createdAt,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'teams', newTeam.id), newTeam);
    } catch (err) {
      console.warn('Firestore createTeam fallback:', err);
    }
  }

  const teams = getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  teams.push(newTeam);
  setLocal(STORAGE_KEYS.TEAMS, teams);
  
  return newProject;
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
    } catch (err) {
      console.warn('Firestore updateProject fallback:', err);
    }
  }

  const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  const idx = projects.findIndex(p => p.id === projectId);
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], ...updates, updatedAt: new Date().toISOString() };
    setLocal(STORAGE_KEYS.PROJECTS, projects);
  }
}

// ----------------------------------------------------
// MATCH REQUESTS SERVICE (Cross-Device Cloud Sync)
// ----------------------------------------------------

export async function getRequestsForUser(userId: string): Promise<{ received: MatchRequest[]; sent: MatchRequest[] }> {
  const allProjects = await getAllProjects();
  const ownedProjectIds = allProjects.filter(p => p.ownerId === userId).map(p => p.id);

  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'match_requests'));
      if (!snap.empty) {
        const all = snap.docs.map(d => ({ ...d.data(), id: d.id } as MatchRequest));
        setLocal(STORAGE_KEYS.REQUESTS, all);
        const sent = all.filter(r => r.fromUserId === userId);
        const received = all.filter(r => r.toUserId === userId || (r.direction === 'user_to_project' && ownedProjectIds.includes(r.projectId)));
        return { received, sent };
      }
    } catch (err) {
      console.warn('Firestore getRequests fallback:', err);
    }
  }

  const all = getLocal<MatchRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  const sent = all.filter(r => r.fromUserId === userId);
  const received = all.filter(r => r.toUserId === userId || (r.direction === 'user_to_project' && ownedProjectIds.includes(r.projectId)));
  return { received, sent };
}

export async function createMatchRequest(request: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>): Promise<MatchRequest> {
  const newId = `req-${Date.now()}`;
  const newRequest: MatchRequest = {
    ...request,
    id: newId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'match_requests', newId), newRequest);
    } catch (err) {
      console.warn('Firestore createMatchRequest fallback:', err);
    }
  }

  const requests = getLocal<MatchRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  requests.unshift(newRequest);
  setLocal(STORAGE_KEYS.REQUESTS, requests);
  return newRequest;
}

export async function updateRequestStatus(
  requestId: string,
  status: 'accepted' | 'declined'
): Promise<MatchRequest | null> {
  const requests = getLocal<MatchRequest>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  const idx = requests.findIndex(r => r.id === requestId);
  if (idx < 0) return null;

  requests[idx].status = status;
  const updated = requests[idx];
  setLocal(STORAGE_KEYS.REQUESTS, requests);

  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'match_requests', requestId), { status });
    } catch (err) {
      console.warn('Firestore updateRequestStatus fallback:', err);
    }
  }

  if (status === 'accepted') {
    await assignUserToProjectRole(updated.projectId, updated.roleId, updated.fromUserId, updated.fromUserName, updated.fromUserAvatar);
  }

  return updated;
}

// ----------------------------------------------------
// TEAMS & ROSTER SERVICE (Cross-Device Cloud Sync)
// ----------------------------------------------------

export async function assignUserToProjectRole(
  projectId: string,
  roleId?: string,
  userId?: string,
  userName?: string,
  userAvatar?: string
): Promise<void> {
  if (!userId || !userName) return;

  const project = await getProjectById(projectId);
  if (!project) return;
  if (project.roles.some((r) => r.assignedUserId === userId)) {
    console.warn("User already has a role in this project.");
    return;
  }

  const updatedRoles = project.roles.map(r => {
    if (roleId && r.id === roleId) {
      return { ...r, filled: true, assignedUserId: userId, assignedUserName: userName };
    }
    return r;
  });
  await updateProject(projectId, { roles: updatedRoles });

  const teams = await getAllTeams();
  let team = teams.find(t => t.projectId === projectId || t.id === project.teamId);

  const newMember = {
    userId,
    name: userName,
    avatarUrl: userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    roleTitle: project.roles.find(r => r.id === roleId)?.title || 'Team Member',
    joinedAt: new Date().toISOString(),
  };

  if (team) {
    if (!team.members.some(m => m.userId === userId)) {
      team.members.push(newMember);
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'teams', team.id), team, { merge: true });
        } catch (e) {
          console.warn('Firestore team update error:', e);
        }
      }
    }
  } else {
    team = {
      id: `team-${projectId}`,
      projectId: project.id,
      projectTitle: project.title,
      ownerId: project.ownerId,
      members: [
        {
          userId: project.ownerId,
          name: project.ownerName,
          avatarUrl: project.ownerAvatar || '',
          roleTitle: 'Project Lead',
          joinedAt: project.createdAt,
        },
        newMember,
      ],
      tasks: [
        { id: `task-${Date.now()}-1`, title: 'Kickoff meeting & Architecture sync', status: 'todo' },
        { id: `task-${Date.now()}-2`, title: 'Set up Git repo & environment', status: 'todo' },
      ],
      demoLinks: [
        {
          id: `demo-${Date.now()}`,
          title: 'Project Repository',
          url: 'https://github.com',
          type: 'github',
          addedAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
    };
    teams.push(team);

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'teams', team.id), team);
      } catch (e) {
        console.warn('Firestore team creation error:', e);
      }
    }
  }

  setLocal(STORAGE_KEYS.TEAMS, teams);
}

export async function getAllTeams(): Promise<Team[]> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'teams'));
      if (!snap.empty) {
        const firestoreTeams = snap.docs.map(d => ({ ...d.data(), id: d.id } as Team));
        setLocal(STORAGE_KEYS.TEAMS, firestoreTeams);
        return firestoreTeams;
      }
    } catch (err) {
      console.warn('Firestore getAllTeams fallback:', err);
    }
  }
  return getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
}

export async function getTeamById(teamIdOrProjectId: string): Promise<Team | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'teams', teamIdOrProjectId));
      if (snap.exists()) {
        return { ...snap.data(), id: snap.id } as Team;
      }
    } catch (err) {
      console.warn('Firestore getTeamById fallback:', err);
    }
  }
  const teams = await getAllTeams();
  return teams.find(t => t.id === teamIdOrProjectId || t.projectId === teamIdOrProjectId) || null;
}

export async function getTeamsForUser(userId: string): Promise<Team[]> {
  const teams = await getAllTeams();
  return teams.filter(t => t.members.some(m => m.userId === userId) || t.ownerId === userId);
}

export async function updateTeamTasks(teamId: string, tasks: Team['tasks']): Promise<void> {
  if (isFirebaseConfigured && db) {
    try {
      await updateDoc(doc(db, 'teams', teamId), { tasks });
    } catch (err) {
      console.warn('Firestore updateTeamTasks fallback:', err);
    }
  }

  const teams = getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  const idx = teams.findIndex(t => t.id === teamId || t.projectId === teamId);
  if (idx >= 0) {
    teams[idx].tasks = tasks;
    setLocal(STORAGE_KEYS.TEAMS, teams);
  }
}

export async function addTeamDemoLink(teamId: string, link: Omit<TeamDemoLink, 'id' | 'addedAt'>): Promise<TeamDemoLink> {
  const newLink: TeamDemoLink = {
    ...link,
    id: `demo-${Date.now()}`,
    addedAt: new Date().toISOString(),
  };

  const teams = getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  const idx = teams.findIndex(t => t.id === teamId || t.projectId === teamId);
  
  if (idx >= 0) {
    const updatedLinks = [...(teams[idx].demoLinks || []), newLink];
    teams[idx].demoLinks = updatedLinks;
    setLocal(STORAGE_KEYS.TEAMS, teams);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'teams', teams[idx].id), { demoLinks: updatedLinks });
      } catch (err) {
        console.warn('Firestore addTeamDemoLink fallback:', err);
      }
    }
  }

  return newLink;
}

export async function removeTeamDemoLink(teamId: string, linkId: string): Promise<void> {
  const teams = getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  const idx = teams.findIndex(t => t.id === teamId || t.projectId === teamId);
  if (idx >= 0) {
    const updatedLinks = (teams[idx].demoLinks || []).filter(l => l.id !== linkId);
    teams[idx].demoLinks = updatedLinks;
    setLocal(STORAGE_KEYS.TEAMS, teams);

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'teams', teams[idx].id), { demoLinks: updatedLinks });
      } catch (err) {
        console.warn('Firestore removeTeamDemoLink fallback:', err);
      }
    }
  }
}

// ----------------------------------------------------
// CHAT & MESSAGING SERVICE (Cross-Device Cloud Sync)
// ----------------------------------------------------

export async function getMessages(channelId: string): Promise<ChatMessage[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('channelId', '==', channelId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id } as ChatMessage));
      }
    } catch (err) {
      console.warn('Firestore getMessages fallback:', err);
    }
  }

  const all = getLocal<ChatMessage>(STORAGE_KEYS.MESSAGES, [
    {
      id: 'msg-1',
      channelId: 'team-mediscan',
      senderId: 'user-marcus',
      senderName: 'Marcus Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'Welcome to the MediScan team workspace! Let’s crush this hackathon!',
      createdAt: '2026-02-24T10:00:00Z',
    },
    {
      id: 'msg-2',
      channelId: 'team-mediscan',
      senderId: 'user-marcus',
      senderName: 'Marcus Vance',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: 'I have uploaded the initial PyTorch model weights. Check the task board and demo links hub for specs.',
      createdAt: '2026-02-24T10:05:00Z',
    }
  ]);
  return all.filter(m => m.channelId === channelId);
}

export async function sendChatMessage(msg: Omit<ChatMessage, 'id' | 'createdAt'>): Promise<ChatMessage> {
  const newId = `msg-${Date.now()}`;
  const newMsg: ChatMessage = {
    ...msg,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'messages', newId), newMsg);
    } catch (err) {
      console.warn('Firestore sendChatMessage fallback:', err);
    }
  }

  const all = getLocal<ChatMessage>(STORAGE_KEYS.MESSAGES, []);
  all.push(newMsg);
  setLocal(STORAGE_KEYS.MESSAGES, all);
  return newMsg;
}

export function resetDemoData(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_PROJECTS));
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
}
