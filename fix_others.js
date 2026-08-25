const fs = require('fs');

function patchFetch(file, fetchStr, apiPath, hasAuthImport = false) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes("import { auth }")) {
    content = content.replace("import React", "import { auth } from '@/lib/firebase';\nimport React");
  }
  
  const tokenSetup = `const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';`;
  const oldHeaders = `headers: { 'Content-Type': 'application/json' },`;
  const newHeaders = `headers: { \n          'Content-Type': 'application/json',\n          'Authorization': \`Bearer \${token}\`\n        },`;
  
  // Find the exact line and insert the token line before it
  // This is tricky if there are multiple fetches. 
  // A simple replace might fail if formatting is different.
}

// Easier to just use specific replace
let newFile = fs.readFileSync('src/app/projects/new/page.tsx', 'utf8');
newFile = newFile.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { auth } from '@/lib/firebase';");
newFile = newFile.replace("const res = await fetch('/api/ai/skill-suggest', {", "const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';\n      const res = await fetch('/api/ai/skill-suggest', {\n");
newFile = newFile.replace("headers: { 'Content-Type': 'application/json' },", "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },");
fs.writeFileSync('src/app/projects/new/page.tsx', newFile);

let copilotFile = fs.readFileSync('src/app/copilot/page.tsx', 'utf8');
copilotFile = copilotFile.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { auth } from '@/lib/firebase';");
copilotFile = copilotFile.replace("const res = await fetch('/api/ai/copilot', {", "const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';\n      const res = await fetch('/api/ai/copilot', {");
copilotFile = copilotFile.replace("headers: {\n        'Content-Type': 'application/json',\n      },", "headers: {\n        'Content-Type': 'application/json',\n        'Authorization': `Bearer ${token}`\n      },");
fs.writeFileSync('src/app/copilot/page.tsx', copilotFile);

let teamBuilderFile = fs.readFileSync('src/app/team-builder/page.tsx', 'utf8');
teamBuilderFile = teamBuilderFile.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { auth } from '@/lib/firebase';");

// Multiple fetches in teamBuilderFile
teamBuilderFile = teamBuilderFile.replace("const res = await fetch('/api/ai/team-search', {", "const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';\n      const res = await fetch('/api/ai/team-search', {");
teamBuilderFile = teamBuilderFile.replace("const res = await fetch('/api/ai/team-balance', {", "const token = auth.currentUser ? await auth.currentUser.getIdToken() : '';\n      const res = await fetch('/api/ai/team-balance', {");
teamBuilderFile = teamBuilderFile.replace(/headers: \{ 'Content-Type': 'application\/json' \},/g, "headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },");

fs.writeFileSync('src/app/team-builder/page.tsx', teamBuilderFile);

console.log('Done!');
