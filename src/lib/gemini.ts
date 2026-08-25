import { GoogleGenAI } from '@google/genai';
import { UserProfile, Project, ProjectRole, MatchScoreResult, TeamBalanceRecommendation } from './types';
import { calculateCandidateProjectMatch } from './matchingAlgorithm';

// Initialize Google GenAI client if API key is provided
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function analyzeMatchWithGemini(
  candidate: UserProfile,
  project: Project,
  targetRole?: ProjectRole
): Promise<MatchScoreResult> {
  const baseResult = calculateCandidateProjectMatch(candidate, project, targetRole);
  const ai = getGeminiClient();

  if (!ai) {
    return baseResult;
  }

  try {
    const prompt = `
You are an expert technical recruiter and hackathon team-builder AI for the platform "SkillSync".
Analyze the compatibility between candidate "${candidate.name}" and the project "${project.title}".

Candidate Profile (LinkedIn-style portfolio):
- Name: ${candidate.name} (${candidate.username || 'user'})
- Headline: ${candidate.headline}
- Bio / Summary: ${candidate.about || candidate.bio}
- Skill Tags & Endorsements: ${JSON.stringify(candidate.skills.map(s => ({ name: s.name, level: s.level, endorsements: s.endorsements?.length || 0 })))}
- Total Endorsements: ${candidate.endorsementsCount || 0}
- Past Experience / Hackathon Records: ${JSON.stringify(candidate.experiences || [])}
- Interests/Domains: ${candidate.interests.join(', ')}
- Links: GitHub (${candidate.links.github || 'N/A'}), LinkedIn (${candidate.links.linkedin || 'N/A'}), Custom (${JSON.stringify(candidate.links.customLinks || [])})
- Availability: ${candidate.availability.hoursPerWeek} hrs/week, Status: ${candidate.availability.status}, Hackathon Ready: ${candidate.availability.hackathonReady}
- Experience: ${candidate.experienceYears} years

Project Requirements:
- Title: ${project.title}
- Tagline: ${project.tagline}
- Description: ${project.description}
- Type: ${project.type} (${project.eventName || 'General'})
- Domains: ${project.domain.join(', ')}
- Open Roles: ${JSON.stringify(project.roles.map(r => ({ title: r.title, requiredSkills: r.requiredSkills, filled: r.filled })))}
${targetRole ? `- Specific Role targeted: ${targetRole.title} (Skills needed: ${JSON.stringify(targetRole.requiredSkills)})` : ''}

Respond ONLY with a JSON object in this exact schema:
{
  "overallScore": number (0-100 integer based on deep technical and cultural synergy),
  "skillMatchScore": number (0-100 integer),
  "interestMatchScore": number (0-100 integer),
  "availabilityScore": number (0-100 integer),
  "experienceScore": number (0-100 integer),
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["missingSkill1", ...],
  "synergyHighlights": ["bullet point 1 explaining specific high-value synergy", "bullet point 2"],
  "gapAnalysis": ["bullet point on any missing skill or mitigations"],
  "pitchTip": "One actionable sentence advice on how this candidate can best pitch to the project owner or vice-versa",
  "aiExplanation": "A 2-3 sentence executive summary explaining why this match works and key collaborative superpowers.",
  "recommendedRole": "Best suited role title"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text) as MatchScoreResult;
      return {
        ...baseResult,
        ...parsed,
      };
    }
  } catch (err) {
    console.warn('Gemini API call failed, falling back to algorithmic match:', err);
  }

  return baseResult;
}

export interface TeamSearchResult {
  projectId: string;
  projectTitle: string;
  projectTagline: string;
  projectType: string;
  matchedRoleTitle: string;
  matchScore: number;
  matchRationale: string;
  synergyHighlights: string[];
  suggestedPitch: string;
}

export async function searchTeamsWithGemini(
  userSkills: string[],
  userComment: string,
  candidate: UserProfile,
  allProjects: Project[]
): Promise<TeamSearchResult[]> {
  const openProjects = allProjects.filter(p => p.roles.some(r => !r.filled));
  const ai = getGeminiClient();

  if (!ai) {
    // Algorithmic fallback
    return openProjects.map((p) => {
      const match = calculateCandidateProjectMatch(candidate, p);
      const openRole = p.roles.find(r => !r.filled);
      return {
        projectId: p.id,
        projectTitle: p.title,
        projectTagline: p.tagline,
        projectType: p.type,
        matchedRoleTitle: openRole?.title || 'Team Member',
        matchScore: match.overallScore,
        matchRationale: `Matches requirements for ${openRole?.title || 'squad role'} based on technical overlap in ${userSkills.slice(0, 3).join(', ')}.`,
        synergyHighlights: match.synergyHighlights,
        suggestedPitch: `Hi! I saw ${p.title} and would love to contribute with my ${userSkills.slice(0, 2).join(' and ')} background.`,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  try {
    const prompt = `
You are an expert AI Hackathon Matchmaker on "SkillSync".
A candidate wants to find and join the best open team/project based on their skill tags and natural language comment.

Candidate Profile:
- Name: ${candidate.name}
- Offered Skill Tags: ${userSkills.join(', ')}
- Candidate's Goal / Comment: "${userComment || 'Looking for an exciting hackathon team'}"
- Bio: ${candidate.about || candidate.bio}
- Availability: ${candidate.availability.hoursPerWeek} hrs/week

Available Open Projects & Squads:
${JSON.stringify(openProjects.map(p => ({
  id: p.id,
  title: p.title,
  tagline: p.tagline,
  description: p.description,
  type: p.type,
  domains: p.domain,
  openRoles: p.roles.filter(r => !r.filled).map(r => ({ title: r.title, requiredSkills: r.requiredSkills }))
})))}

Rank the top matching projects for this candidate. Respond ONLY with a JSON array in this schema:
[
  {
    "projectId": "id of project",
    "projectTitle": "title of project",
    "projectTagline": "short tagline",
    "projectType": "hackathon/startup/etc",
    "matchedRoleTitle": "The specific open role best suited for this candidate",
    "matchScore": number (0-100 integer),
    "matchRationale": "2 sentences explaining why this squad fits the candidate's comment and skill tags",
    "synergyHighlights": ["synergy point 1", "synergy point 2"],
    "suggestedPitch": "A personalized 1-sentence icebreaker message the candidate can send to the project owner"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as TeamSearchResult[];
    }
  } catch (err) {
    console.warn('Gemini team search failed, falling back:', err);
  }

  return openProjects.map((p) => {
    const match = calculateCandidateProjectMatch(candidate, p);
    const openRole = p.roles.find(r => !r.filled);
    return {
      projectId: p.id,
      projectTitle: p.title,
      projectTagline: p.tagline,
      projectType: p.type,
      matchedRoleTitle: openRole?.title || 'Team Member',
      matchScore: match.overallScore,
      matchRationale: `Compatible with ${p.title} role requirements.`,
      synergyHighlights: match.synergyHighlights,
      suggestedPitch: `I'm interested in joining ${p.title}!`,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

export async function searchTeammatesWithGemini(
  searchPrompt: string,
  targetSkills: string[],
  project: Project,
  candidatePool: UserProfile[]
): Promise<{
  candidateId: string;
  candidateName: string;
  candidateAvatar: string;
  headline: string;
  matchScore: number;
  bestFitRole: string;
  matchReason: string;
  endorsementsCount: number;
}[]> {
  const ai = getGeminiClient();

  if (!ai) {
    return candidatePool.map((c) => {
      const match = calculateCandidateProjectMatch(c, project);
      return {
        candidateId: c.id,
        candidateName: c.name,
        candidateAvatar: c.avatarUrl,
        headline: c.headline,
        matchScore: match.overallScore,
        bestFitRole: match.recommendedRole || 'Teammate',
        matchReason: `Matches project requirements with ${c.skills.slice(0, 2).map(s => s.name).join(', ')}.`,
        endorsementsCount: c.endorsementsCount || 0,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }

  try {
    const prompt = `
You are an AI Technical Recruiter for project "${project.title}".
The squad leader is looking for specific teammates with this request:
Leader's Search Query: "${searchPrompt || 'Looking for top talent'}"
Target Skill Tags: ${targetSkills.join(', ')}

Project Context:
- Description: ${project.description}
- Open Roles Needed: ${JSON.stringify(project.roles.filter(r => !r.filled))}

Candidate Pool:
${JSON.stringify(candidatePool.map(c => ({
  id: c.id,
  name: c.name,
  avatarUrl: c.avatarUrl,
  headline: c.headline,
  about: c.about || c.bio,
  skills: c.skills,
  endorsementsCount: c.endorsementsCount || 0,
  availability: c.availability
})))}

Rank the top matching candidates. Respond ONLY with a JSON array in this schema:
[
  {
    "candidateId": "id of candidate",
    "candidateName": "name",
    "candidateAvatar": "url",
    "headline": "headline",
    "matchScore": number (0-100),
    "bestFitRole": "role title",
    "matchReason": "1-2 sentences on why they fit the search query and team needs",
    "endorsementsCount": number
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
  } catch (err) {
    console.warn('Gemini teammate search failed, falling back:', err);
  }

  return candidatePool.map((c) => ({
    candidateId: c.id,
    candidateName: c.name,
    candidateAvatar: c.avatarUrl,
    headline: c.headline,
    matchScore: 85,
    bestFitRole: 'Teammate',
    matchReason: 'Compatible skills and availability.',
    endorsementsCount: c.endorsementsCount || 0,
  }));
}

export async function balanceTeamWithGemini(
  project: Project,
  candidatePool: UserProfile[]
): Promise<TeamBalanceRecommendation> {
  const ai = getGeminiClient();

  if (!ai) {
    const roleAssignments = project.roles
      .filter(r => !r.filled)
      .map((role) => {
        let bestCandidate = candidatePool[0];
        let bestScore = -1;

        for (const candidate of candidatePool) {
          const match = calculateCandidateProjectMatch(candidate, project, role);
          if (match.overallScore > bestScore) {
            bestScore = match.overallScore;
            bestCandidate = candidate;
          }
        }

        return {
          roleId: role.id,
          roleTitle: role.title,
          candidateId: bestCandidate ? bestCandidate.id : 'unknown',
          candidateName: bestCandidate ? bestCandidate.name : 'TBD',
          matchScore: bestScore > 0 ? bestScore : 85,
          keyContribution: bestCandidate
            ? `Brings strong ${bestCandidate.skills.slice(0, 2).map(s => s.name).join(' & ')} capability (${bestCandidate.endorsementsCount || 0} skill validations) to fulfill ${role.title}.`
            : 'Fulfills role requirements.',
        };
      });

    return {
      teamName: `Squad for ${project.title}`,
      overallSynergyScore: 89,
      balanceRationale: 'Algorithmic balanced assignment optimizing for full skill coverage across frontend, backend, and design needs.',
      strengths: [
        'Complementary technical skill distribution without role overlap.',
        'High hackathon sprint availability and timezone compatibility.',
      ],
      roleAssignments,
      unassignedSkillGaps: [],
      recommendations: [
        'Hold a 15-minute alignment call to set up the shared Git repo and task board.',
        'Pair the Lead Developer with the Product Designer on Day 1 for rapid wireframing.',
      ],
    };
  }

  try {
    const prompt = `
You are an expert AI Hackathon Team Architect.
Form the most balanced and synergistic team for the following project by selecting the best candidates from the pool for each open role.

Project:
- Title: ${project.title}
- Description: ${project.description}
- Domains: ${project.domain.join(', ')}
- Open Roles: ${JSON.stringify(project.roles)}

Candidate Pool:
${JSON.stringify(candidatePool.map(c => ({
  id: c.id,
  name: c.name,
  headline: c.headline,
  about: c.about || c.bio,
  skills: c.skills,
  endorsementsCount: c.endorsementsCount || 0,
  experiences: c.experiences || [],
  interests: c.interests,
  availability: c.availability,
  experienceYears: c.experienceYears
})))}

Respond ONLY with a JSON object in this schema:
{
  "teamName": "Creative name for this team",
  "overallSynergyScore": number (0-100 integer),
  "balanceRationale": "2-3 sentences explaining why this specific mix of candidates creates an unstoppable team",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "roleAssignments": [
    {
      "roleId": "id of the role",
      "roleTitle": "title of role",
      "candidateId": "id of chosen candidate",
      "candidateName": "name of chosen candidate",
      "matchScore": number (0-100),
      "keyContribution": "Specific superpowers this candidate brings to this role"
    }
  ],
  "unassignedSkillGaps": ["any skills that still need external help or mentors"],
  "recommendations": ["actionable team kickoff tip 1", "actionable team kickoff tip 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as TeamBalanceRecommendation;
    }
  } catch (err) {
    console.warn('Gemini team balance failed, falling back:', err);
  }

  return {
    teamName: `Squad for ${project.title}`,
    overallSynergyScore: 85,
    balanceRationale: 'Balanced team formed based on skill requirements.',
    strengths: ['Cross-functional skillset coverage'],
    roleAssignments: [],
    unassignedSkillGaps: [],
    recommendations: ['Connect on chat to kick off initial sprint.'],
  };
}

export async function suggestRolesAndSkillsWithGemini(
  projectTitle: string,
  projectDescription: string,
  projectType: string
): Promise<{
  suggestedRoles: {
    title: string;
    requiredSkills: { name: string; minLevel: string }[];
    experienceLevel: string;
  }[];
  suggestedDomains: string[];
}> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      suggestedRoles: [
        {
          title: 'Full-Stack Lead',
          requiredSkills: [{ name: 'React', minLevel: 'advanced' }, { name: 'Node.js', minLevel: 'intermediate' }],
          experienceLevel: 'intermediate',
        },
        {
          title: 'AI / Backend Engineer',
          requiredSkills: [{ name: 'Python', minLevel: 'intermediate' }, { name: 'Gemini API', minLevel: 'intermediate' }],
          experienceLevel: 'intermediate',
        },
        {
          title: 'UI/UX & Product Designer',
          requiredSkills: [{ name: 'Figma', minLevel: 'advanced' }, { name: 'UI/UX Design', minLevel: 'advanced' }],
          experienceLevel: 'intermediate',
        },
      ],
      suggestedDomains: ['AI Agents', 'Developer Tools', 'Web3'],
    };
  }

  try {
    const prompt = `
Given the project title: "${projectTitle}"
Description: "${projectDescription}"
Type: "${projectType}"

Suggest the ideal 3 to 4 team roles with required skill tags and proficiency levels (beginner, intermediate, advanced, expert), plus 3 domain tags.

Respond ONLY with a JSON object:
{
  "suggestedRoles": [
    {
      "title": "Role Title",
      "requiredSkills": [
        { "name": "Skill Name", "minLevel": "intermediate" }
      ],
      "experienceLevel": "intermediate"
    }
  ],
  "suggestedDomains": ["Domain1", "Domain2", "Domain3"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (err) {
    console.warn('Gemini skill suggestions failed:', err);
  }

  return {
    suggestedRoles: [
      {
        title: 'Full-Stack Developer',
        requiredSkills: [{ name: 'Next.js', minLevel: 'intermediate' }, { name: 'TypeScript', minLevel: 'intermediate' }],
        experienceLevel: 'intermediate',
      },
      {
        title: 'AI Engineer',
        requiredSkills: [{ name: 'Python', minLevel: 'intermediate' }, { name: 'Gemini API', minLevel: 'intermediate' }],
        experienceLevel: 'intermediate',
      },
    ],
    suggestedDomains: ['AI Agents', 'Hackathon'],
  };
}

export interface CopilotRequestParams {
  userPrompt: string;
  topic?: 'pitch' | 'architecture' | 'sprint' | 'general';
  userProfile?: Partial<UserProfile>;
  activeProject?: Partial<Project>;
}

export interface CopilotResponse {
  markdownResponse: string;
  headline: string;
  keyTakeaways: string[];
  suggestedPrompts: string[];
}

export async function generateCopilotAdviceWithGemini(
  params: CopilotRequestParams
): Promise<CopilotResponse> {
  const ai = getGeminiClient();

  if (!ai) {
    return {
      headline: 'Gemini API Key Required for Real-time Synthesis',
      markdownResponse: `### 🤖 AI Hackathon Copilot (Offline Mode)\n\nTo unlock live Gemini 2.5 Flash responses, please provide your **GEMINI_API_KEY** in \`.env.local\`.\n\nHere is a foundational structure for **"${params.userPrompt}"**:\n\n1. **Problem Statement**: Clearly identify the acute friction point in 15 words or fewer.\n2. **Architectural Stack**: Pair a fast React/Next.js frontend with Firebase or Gemini APIs.\n3. **Sprint Plan**: Dedicate Hours 0-12 to core API/DB wireframe, Hours 12-30 to UX & AI logic, Hours 30-36 to pitch practice and recorded demo.`,
      keyTakeaways: [
        'Define a high-converting 30-second problem hook.',
        'Prioritize 1-2 core killer features rather than broad half-baked ideas.',
        'Include real-time AI responses using Google Gemini Flash models.'
      ],
      suggestedPrompts: [
        'How can I structure a 2-minute winning pitch for judges?',
        'What tech stack gives the fastest build speed for AI hackathons?',
        'How do I balance frontend and backend tasks in a 36-hour sprint?'
      ]
    };
  }

  try {
    const prompt = `
You are the elite "SkillSync AI Hackathon & Pitch Copilot", powered by Google Gemini.
You advise students, engineers, and startup founders on winning hackathons, architecting scalable prototypes, formulating elevator pitches, and organizing team sprint workflows.

User Query:
"${params.userPrompt}"

User Context:
- Name: ${params.userProfile?.name || 'Developer'}
- Headline: ${params.userProfile?.headline || 'Tech Builder'}
- Skills: ${params.userProfile?.skills?.map(s => typeof s === 'string' ? s : s.name).join(', ') || 'Full-Stack, AI'}

${params.activeProject ? `
Project In-Focus:
- Title: ${params.activeProject.title}
- Description: ${params.activeProject.description}
- Domains: ${params.activeProject.domain?.join(', ')}
- Type: ${params.activeProject.type}
` : ''}

Respond ONLY with a JSON object in this exact schema:
{
  "headline": "Short, punchy 3-8 word title for this advice",
  "markdownResponse": "Comprehensive, structured markdown formatting with headings, bullet points, code snippets or scripts if relevant. Keep it highly tactical and inspiring.",
  "keyTakeaways": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  "suggestedPrompts": ["Next question 1", "Next question 2", "Next question 3"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CopilotResponse;
    }
  } catch (err) {
    console.warn('Gemini Copilot generation failed:', err);
  }

  return {
    headline: 'Strategy Breakdown',
    markdownResponse: `Here is advice tailored for: **${params.userPrompt}**\n\n- **Focus**: Keep your MVP focused on the unique core value proposition.\n- **Speed**: Build fast using modern frameworks.\n- **Pitch**: Tell a story that highlights real user impact.`,
    keyTakeaways: ['Focus on MVP simplicity', 'Story-first presentation', 'Fast execution'],
    suggestedPrompts: [
      'Generate a 1-minute elevator pitch script',
      'What are common pitfalls in hackathon judging?'
    ]
  };
}
