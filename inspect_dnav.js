const fs = require('fs');
const html = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');

// Search for nav items or view modes in Desktop 1280
const lines = html.split('\n');
const dLines = lines.filter(l => l.includes('dNav') || l.includes('Explore') || l.includes('Shield') || l.includes('Desk') || l.includes('Calendar'));
console.log('Key views / navigation labels in TechPulse:');
dLines.slice(0, 20).forEach(l => console.log(l.trim()));
