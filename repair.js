const fs = require('fs');
let content = fs.readFileSync('src/components/MatchAnalysisModal.tsx', 'utf8');

// The `});` missing after body
content = content.replace("body: JSON.stringify({ candidate, project, targetRole }),\n        const data = await res.json();", "body: JSON.stringify({ candidate, project, targetRole }),\n        });\n        const data = await res.json();");

fs.writeFileSync('src/components/MatchAnalysisModal.tsx', content);
