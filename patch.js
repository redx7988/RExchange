const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
content = content.replace(/<p className="px-3 py-1 text-\[10px\] uppercase font-bold text-muted-foreground tracking-wider">\s*<\/button>/g, '');
fs.writeFileSync('src/components/Navbar.tsx', content);
