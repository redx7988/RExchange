const fs = require('fs');
let content = fs.readFileSync('src/components/MatchAnalysisModal.tsx', 'utf8');

const regex = /const fetchMatch = async \(\) => \{\s*try \{\s*const token = auth\.currentUser \? await auth\.currentUser\.getIdToken\(\) : '';\s*const res = await fetch\('\/api\/ai\/match', \{\s*method: 'POST',\s*headers: \{\s*'Content-Type': 'application\/json',\s*'Authorization': `Bearer \$\{token\}`\s*\},\s*body: JSON\.stringify\(\{ candidate, project, targetRole \}\),\s*\}\);\s*const data = await res\.json\(\);\s*\.then\(\(data\) => \{\s*if \(data\.success && data\.match\) \{\s*setMatchResult\(data\.match\);\s*if \(data\.match\.pitchTip\) \{\s*setCustomMessage\(\s*`Hi \$\{actionType === 'join' \? project\.ownerName : candidate\.name\}! \$\{data\.match\.pitchTip\} I’m excited about \$\{project\.title\}\.`\s*\);\s*\}\s*\}\s*\}\)\s*\.catch\(\(err\) => \{\s*console\.error\('AI Match Error:', err\);\s*\}\)\s*\.finally\(\(\) => \{\s*setIsLoadingAi\(false\);\s*\}\);/g;

const newBlock = `const fetchMatch = async () => {
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

content = content.replace(regex, newBlock);
fs.writeFileSync('src/components/MatchAnalysisModal.tsx', content);
console.log('Fixed syntax error!');
