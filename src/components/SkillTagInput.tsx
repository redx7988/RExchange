'use client';

import React, { useState } from 'react';
import { SkillTag, SkillLevel } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';

interface SkillTagInputProps {
  skills: SkillTag[];
  onChange: (skills: SkillTag[]) => void;
  isOwner?: boolean;
}

const POPULAR_SKILLS = [
  { name: 'React', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Python', category: 'backend' },
  { name: 'Gemini API', category: 'ai_ml' },
  { name: 'PyTorch', category: 'ai_ml' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'Go', category: 'backend' },
  { name: 'Rust', category: 'backend' },
  { name: 'Figma', category: 'design' },
  { name: 'UI/UX Design', category: 'design' },
  { name: 'Flutter', category: 'mobile' },
  { name: 'Docker', category: 'devops' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'Tailwind CSS', category: 'frontend' },
];

export default function SkillTagInput({ skills, onChange, isOwner = true }: SkillTagInputProps) {
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('intermediate');

  const handleAddSkill = (skillName: string, category?: string) => {
    if (!skillName.trim() || !isOwner) return;
    const cleanName = skillName.trim();
    if (skills.some((s) => s.name.toLowerCase() === cleanName.toLowerCase())) return;

    const newSkill: SkillTag = {
      name: cleanName,
      level: selectedLevel,
      category: (category as any) || 'other',
      endorsements: [],
    };

    onChange([...skills, newSkill]);
    setQuery('');
  };

  const handleRemoveSkill = (skillName: string) => {
    if (!isOwner) return;
    onChange(skills.filter((s) => s.name !== skillName));
  };

  const handleUpdateLevel = (skillName: string, newLevel: SkillLevel) => {
    if (!isOwner) return;
    onChange(
      skills.map((s) => (s.name === skillName ? { ...s, level: newLevel } : s))
    );
  };

  const unselectedPopular = POPULAR_SKILLS.filter(
    (pop) => !skills.some((s) => s.name.toLowerCase() === pop.name.toLowerCase())
  );

  return (
    <div className="space-y-3">
      {/* Input Bar (Only visible to owner) */}
      {isOwner && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input aria-label="Input field"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(query);
                }
              }}
              placeholder="Search or add skill tag (e.g. PyTorch, Figma, Web3)..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
            className="bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>

          <button
            type="button"
            onClick={() => handleAddSkill(query)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      )}

      {/* Suggested Fast Tags */}
      {isOwner && unselectedPopular.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-[#8b949e]">Suggestions:</span>
          {unselectedPopular.slice(0, 7).map((pop) => (
            <button
              key={pop.name}
              type="button"
              onClick={() => handleAddSkill(pop.name, pop.category)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-colors"
            >
              <Plus className="w-2.5 h-2.5 text-[#58a6ff]" />
              <span>{pop.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Active Skills List: Space-saving pill format with hover-to-delete icon */}
      <div className="flex flex-wrap gap-2 pt-1">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-slate-500 transition-all text-xs"
          >
            <span className="font-semibold text-[#f0f6fc]">{skill.name}</span>
            
            {/* Level badge */}
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#21262d] text-[#58a6ff]">
              {skill.level.slice(0, 3)}
            </span>

            {/* Hover-to-Delete Red Trash Button at corner (Owner only) */}
            {isOwner && (
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill.name)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0.5 text-[#f85149] hover:text-red-300 ml-0.5 rounded hover:bg-[#21262d]"
                title={`Remove ${skill.name}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
