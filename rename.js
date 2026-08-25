const fs = require('fs');
const glob = require('glob');

// Since we know the specific files, we can just list them
const files = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/components/Navbar.tsx',
  'src/components/AuthModal.tsx',
  'src/lib/gemini.ts',
  'package.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/ProjectMatch/g, 'SkillSync');
    content = content.replace(/projectmatch/g, 'skillsync');
    fs.writeFileSync(file, content);
    console.log('Renamed in ' + file);
  }
});
