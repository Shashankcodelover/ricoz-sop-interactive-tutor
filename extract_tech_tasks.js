const fs = require('fs');
const text = fs.readFileSync('phase_3_and_4.txt', 'utf8');

// Find all deliverables in Phase 3 and Phase 4
const regex = /Deliverable ID[\s\S]*?(?=DAY\s+[0-9]+|PHASE|\n\n\n)/g;
let match;
while ((match = regex.exec(text)) !== null) {
  console.log('--- DELIVERABLES TABLE ---');
  console.log(match[0].substring(0, 1500));
}

// Find Day 11-17 tasks for Technology Department
const techRegex = /2\.[0-9]+\.[0-9]+\s+TECHNOLOGY DEPARTMENT[\s\S]*?(?=2\.[0-9]+\.[0-9]+\s+[A-Z\s]+|DAY\s+[0-9]+)/g;
let tMatch;
let count = 0;
while ((tMatch = techRegex.exec(text)) !== null) {
  count++;
  if (count <= 6) {
    console.log('=== TECH DEPT SECTION ===');
    console.log(tMatch[0].substring(0, 1200));
  }
}

