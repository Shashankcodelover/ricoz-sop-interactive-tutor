const fs = require('fs');
const text = fs.readFileSync('playbook_full_text.txt', 'utf8');

// Find sections in Phase 3 (Days 11-17) and Phase 4 (Days 18-22)
const lines = text.split('\n');

let capturing = false;
let captured = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('PHASE 03') || line.includes('PHASE 3')) {
    capturing = true;
  }
  if (line.includes('PHASE 05') || line.includes('PHASE 5')) {
    capturing = false;
  }
  if (capturing) {
    captured.push(line);
  }
}

console.log('Captured lines from Phase 3 & 4:', captured.length);
fs.writeFileSync('phase_3_and_4.txt', captured.join('\n'), 'utf8');
console.log('Saved phase_3_and_4.txt');

