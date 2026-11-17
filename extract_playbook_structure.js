const fs = require('fs');
const text = fs.readFileSync('playbook_full_text.txt', 'utf8');

// Find headings, parts, chapters
const lines = text.split('\n');
console.log('Total lines:', lines.length);

const structure = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('PART ') || 
      line.startsWith('PHASE ') || 
      line.startsWith('DAY ') || 
      line.includes('GATE G') ||
      line.match(/^[0-9]\.[0-9]+/) ||
      line.match(/^CHAPTER/i)) {
    structure.push({ lineNum: i + 1, text: line });
  }
}

console.log('Detected key structural anchors:', structure.length);
fs.writeFileSync('playbook_structure.json', JSON.stringify(structure.slice(0, 150), null, 2), 'utf8');
console.log('Sample structural anchors:');
structure.slice(0, 30).forEach(s => console.log('L' + s.lineNum + ': ' + s.text));

