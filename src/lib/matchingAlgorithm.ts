import { UserProfile, Project, ProjectRole, MatchScoreResult, SkillLevel } from './types';

const LEVEL_WEIGHTS: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

export function calculateCandidateProjectMatch(
  candidate: UserProfile,
  project: Project,
  targetRole?: ProjectRole
): MatchScoreResult {
  // Collect target roles to evaluate
  const rolesToEvaluate = targetRole ? [targetRole] : project.roles.filter(r => !r.filled);
  const activeRoles = rolesToEvaluate.length > 0 ? rolesToEvaluate : project.roles;

  // 1. Skill Match Calculation
  const allRequiredSkills = new Map<string, SkillLevel>();
  for (const role of activeRoles) {
    for (const req of role.requiredSkills) {
      const currentMin = allRequiredSkills.get(req.name.toLowerCase());
      const reqMin = req.minLevel || 'intermediate';
      if (!currentMin || LEVEL_WEIGHTS[reqMin] > LEVEL_WEIGHTS[currentMin]) {
        allRequiredSkills.set(req.name.toLowerCase(), reqMin);
      }
    }
  }

  const candidateSkillMap = new Map<string, SkillLevel>();
  for (const skill of candidate.skills) {
    candidateSkillMap.set(skill.name.toLowerCase(), skill.level);
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  let totalSkillPointsEarned = 0;
  let totalSkillPointsPossible = 0;

  allRequiredSkills.forEach((minLevel, skillName) => {
    const requiredWeight = LEVEL_WEIGHTS[minLevel];
    totalSkillPointsPossible += requiredWeight;

    const candidateLevel = candidateSkillMap.get(skillName);
    if (candidateLevel) {
      matchedSkills.push(skillName.charAt(0).toUpperCase() + skillName.slice(1));
      const candWeight = LEVEL_WEIGHTS[candidateLevel];
      if (candWeight >= requiredWeight) {
        totalSkillPointsEarned += requiredWeight;
      } else {
        totalSkillPointsEarned += candWeight * 0.7; // Partial credit for having skill at lower tier
      }
    } else {
      missingSkills.push(skillName.charAt(0).toUpperCase() + skillName.slice(1));
    }
  });

  const skillScorePercent = totalSkillPointsPossible > 0
    ? Math.min(100, Math.round((totalSkillPointsEarned / totalSkillPointsPossible) * 100))
    : 75;

  // 2. Interest / Domain Alignment
  const projectDomains = project.domain.map(d => d.toLowerCase());
  const candidateInterests = candidate.interests.map(i => i.toLowerCase());
  
  let interestMatches = 0;
  for (const domain of projectDomains) {
    if (candidateInterests.some(i => i.includes(domain) || domain.includes(i))) {
      interestMatches++;
    }
  }

  const interestScorePercent = projectDomains.length > 0
    ? Math.min(100, Math.round((interestMatches / projectDomains.length) * 100 * 1.2))
    : 70;

  // 3. Availability & Hackathon Match
  let availabilityScore = 70;
  if (project.type === 'hackathon' && candidate.availability.hackathonReady) {
    availabilityScore += 20;
  }
  if (candidate.availability.status === 'available') {
    availabilityScore += 10;
  } else if (candidate.availability.status === 'busy') {
    availabilityScore -= 20;
  }
  if (candidate.availability.hoursPerWeek >= 20) {
    availabilityScore += 10;
  }
  availabilityScore = Math.max(20, Math.min(100, availabilityScore));

  // 4. Experience Level
  let experienceScore = 75;
  if (candidate.experienceYears >= 3) experienceScore += 15;
  else if (candidate.experienceYears >= 1) experienceScore += 5;
  experienceScore = Math.min(100, experienceScore);

  // Weighted overall calculation
  // Skill: 50%, Domain: 25%, Availability: 15%, Experience: 10%
  const overall = Math.round(
    skillScorePercent * 0.50 +
    interestScorePercent * 0.25 +
    availabilityScore * 0.15 +
    experienceScore * 0.10
  );

  // Best matching role recommendation
  let bestRole: ProjectRole | undefined = targetRole;
  if (!bestRole) {
    let bestRoleOverlap = -1;
    for (const role of activeRoles) {
      let overlap = 0;
      for (const req of role.requiredSkills) {
        if (candidateSkillMap.has(req.name.toLowerCase())) overlap++;
      }
      if (overlap > bestRoleOverlap) {
        bestRoleOverlap = overlap;
        bestRole = role;
      }
    }
  }

  // Synergy and Gap highlights
  const synergyHighlights: string[] = [];
  if (matchedSkills.length > 0) {
    synergyHighlights.push(`Direct proficiency in required core stack: ${matchedSkills.slice(0, 3).join(', ')}.`);
  }
  if (interestMatches > 0) {
    synergyHighlights.push(`Strong domain excitement in ${project.domain.slice(0, 2).join(' & ')}.`);
  }
  if (candidate.availability.hackathonReady && project.type === 'hackathon') {
    synergyHighlights.push(`Prime hackathon sprint readiness with ${candidate.availability.hoursPerWeek}h/wk capacity.`);
  }

  const gapAnalysis: string[] = [];
  if (missingSkills.length > 0) {
    gapAnalysis.push(`Open skill requirements: ${missingSkills.slice(0, 3).join(', ')}.`);
  } else {
    gapAnalysis.push('Full skill coverage across all required tech stack items.');
  }

  const pitchTip = matchedSkills.length > 1
    ? `Highlight your prior projects with ${matchedSkills.slice(0, 2).join(' and ')} to stand out.`
    : `Emphasize your versatility and passion for ${project.domain[0] || 'the project domain'}.`;

  const aiExplanation = `${candidate.name} is a ${overall}% match for "${project.title}". ` +
    `Possesses ${matchedSkills.length} key skill tags (${matchedSkills.slice(0, 3).join(', ') || 'adaptable profile'}) ` +
    `with strong affinity for ${project.domain.join(', ')}.`;

  return {
    overallScore: overall,
    skillMatchScore: skillScorePercent,
    interestMatchScore: interestScorePercent,
    availabilityScore,
    experienceScore,
    matchedSkills,
    missingSkills,
    synergyHighlights,
    gapAnalysis,
    pitchTip,
    aiExplanation,
    recommendedRole: bestRole?.title,
  };
}
