const fs = require('fs');
const js = fs.readFileSync('uiux_reference/support.js', 'utf8');

// Find theme definitions or color objects
const lines = js.split('\n');
console.log('Total lines in support.js:', lines.length);

const themeLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('canvas:') || lines[i].includes('card:') || lines[i].includes('--canvas') || lines[i].includes('warm') || lines[i].includes('palette')) {
    themeLines.push({ line: i + 1, text: lines[i].trim() });
  }
}

console.log('Theme references found:', themeLines.length);
themeLines.slice(0, 30).forEach(t => console.log('L' + t.line + ': ' + t.text));

