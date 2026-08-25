const fs = require('fs');
const content = fs.readFileSync('src/lib/firestoreService.ts', 'utf-8');

const newContent = content.replace(
  `  const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  projects.unshift(newProject);
  setLocal(STORAGE_KEYS.PROJECTS, projects);
  return newProject;`,
  `  const projects = getLocal<Project>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  projects.unshift(newProject);
  setLocal(STORAGE_KEYS.PROJECTS, projects);
  
  // Also create a team immediately for the owner
  const teams = getLocal<Team>(STORAGE_KEYS.TEAMS, INITIAL_TEAMS);
  const newTeam = {
    id: \`team-\${newId}\`,
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
  teams.push(newTeam);
  setLocal(STORAGE_KEYS.TEAMS, teams);
  
  return newProject;`
);

fs.writeFileSync('src/lib/firestoreService.ts', newContent);
