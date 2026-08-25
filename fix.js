const fs = require('fs');
const file = 'src/components/MatchAnalysisModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Move import to top
content = content.replace("import { auth } from '@/lib/firebase';\n\n// ... (in the component body, update the fetch call)\n", "");
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { auth } from '@/lib/firebase';");

// Fix the fetch block
const blockToReplace = `    const fetchMatch = async () => {
      try {
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
        const res = await fetch('/api/ai/match', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({ candidate, project, targetRole }),
        });
        const data = await res.json();
      .then((data) => {
        if (data.success && data.match) {
          setMatchResult(data.match);
          if (data.match.pitchTip) {
            setCustomMessage(
              \`Hi \${actionType === 'join' ? project.ownerName : candidate.name}! \${data.match.pitchTip} I’m excited about \${project.title}.\`
            );
          }
        }
      })
      .catch((err) => {
        console.error('AI Match Error:', err);
      })
      .finally(() => {
        setIsLoadingAi(false);
      });`;

const newBlock = `    const fetchMatch = async () => {
      try {
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';
        const res = await fetch('/api/ai/match', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${token}\`
          },
          body: JSON.stringify({ candidate, project, targetRole }),
        });
        const data = await res.json();
        if (data.success && data.match) {
          setMatchResult(data.match);
          if (data.match.pitchTip) {
            setCustomMessage(
              \`Hi \${actionType === 'join' ? project.ownerName : candidate.name}! \${data.match.pitchTip} I’m excited about \${project.title}.\`
            );
          }
        }
      } catch (err) {
        console.error('AI Match Error:', err);
      } finally {
        setIsLoadingAi(false);
      }
    };
    fetchMatch();`;

content = content.replace(blockToReplace, newBlock);
fs.writeFileSync(file, content);
console.log('Fixed!');
