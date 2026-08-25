const fs = require('fs');
let content = fs.readFileSync('src/lib/firestoreService.ts', 'utf8');

// Add a helper at the top
const helper = `
function cleanObj(obj: any) {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => newObj[key] === undefined && delete newObj[key]);
  return newObj;
}
`;

content = content.replace("export async function getAllUsers", helper + "\nexport async function getAllUsers");

// Replace all setDoc(doc(db, col, id), obj) with setDoc(..., cleanObj(obj))
content = content.replace(/setDoc\(([^,]+),\s*([^)]+)\)/g, 'setDoc($1, cleanObj($2))');

fs.writeFileSync('src/lib/firestoreService.ts', content);
