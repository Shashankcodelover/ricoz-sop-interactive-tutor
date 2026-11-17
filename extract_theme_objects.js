const fs = require('fs');
const html = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');

// The second script tag contains the application logic and theme definitions!
const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
const scriptContent = scriptTags[1];

// Find occurrences of canvas, card, pill, ink, accent
const lines = scriptContent.split('\n');
const themeDefs = lines.filter(l => l.includes('canvas:') || l.includes('card:') || l.includes('palette') || l.includes('themes =') || l.includes('theme ='));
console.log('Theme definitions in script:');
themeDefs.forEach(l => console.log(l.trim()));
