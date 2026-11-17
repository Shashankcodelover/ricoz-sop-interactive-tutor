const fs = require('fs');
const html = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');

// Find artboards or board sections
const matches = html.match(/data-screen-label="([^"]+)"/g) || [];
console.log('Screen labels / boards in TechPulse v2:', matches);

// Let's also check TechPulse Deadline Desk
const html2 = fs.readFileSync('uiux_reference/TechPulse Deadline Desk.dc.html', 'utf8');
const matches2 = html2.match(/data-screen-label="([^"]+)"/g) || [];
console.log('Screen labels / boards in TechPulse Deadline Desk:', matches2);
