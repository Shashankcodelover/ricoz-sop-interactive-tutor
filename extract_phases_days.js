const fs = require('fs');
const text = fs.readFileSync('playbook_full_text.txt', 'utf8');

// Find all phases and days
const regex = /(PHASE\s+[0-9]+[^\n]*|DAY\s+[0-9]+[^\n]*|GATE\s+G[0-9]+[^\n]*)/gi;
let match;
const matches = [];
while ((match = regex.exec(text)) !== null) {
  matches.push({ pos: match.index, title: match[0].trim() });
}

// Remove duplicates / close occurrences
const unique = [];
for (const m of matches) {
  if (!unique.some(u => u.title === m.title)) {
    unique.push(m);
  }
}

console.log('Unique Phases, Days, and Gates in Playbook (' + unique.length + '):');
unique.forEach(u => console.log(' - ' + u.title));

