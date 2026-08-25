const fs = require('fs');
let content = fs.readFileSync('src/app/projects/new/page.tsx', 'utf8');

const replacement = `
    try {
      // Add a 10 second timeout to prevent indefinite hangs if Firebase network fails
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Network timeout: Please check your Firebase configuration and database setup.")), 10000)
      );
      
      const newProj = await Promise.race([
        addNewProject({
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          ownerAvatar: currentUser.avatarUrl,
          title,
          tagline: tagline || title,
          description,
          type,
          eventName: type === 'hackathon' ? eventName : '',
          domain: domains.length > 0 ? domains : ['AI Agents'],
          timeline,
          teamSizeLimit,
          roles,
          status: 'recruiting',
        }),
        timeoutPromise
      ]);

      router.push(\`/projects/\${(newProj as any).id}\`);
    } catch (err: any) {
`;

content = content.replace(/try\s*\{\s*const newProj = await addNewProject\(\{[\s\S]*?status: 'recruiting',\s*\}\);\s*router.push\(\`\/projects\/\$\{newProj.id\}\`\);\s*\}\s*catch\s*\(err\)\s*\{/g, replacement);

fs.writeFileSync('src/app/projects/new/page.tsx', content);
