const fs = require('fs');
const text = fs.readFileSync('playbook_full_text.txt', 'utf8');

const queries = ['86.', 'Catalog', 'Interactive Tutor', 'SOP', 'Internal Knowledge', 'Gate G1', 'Gate G2', 'Gate G3', 'Gate G4', 'Day 11', 'Day 17', '45%'];

queries.forEach(q => {
  let count = 0;
  let pos = -1;
  const matches = [];
  while ((pos = text.indexOf(q, pos + 1)) !== -1) {
    count++;
    if (matches.length < 3) {
      matches.push(text.substring(Math.max(0, pos - 100), Math.min(text.length, pos + 250)).replace(/\n+/g, ' '));
    }
  }
  console.log('=== Query: ' + q + ' | Count: ' + count + ' ===');
  matches.forEach((m, i) => console.log('  [' + (i + 1) + '] ' + m + '\n'));
});

