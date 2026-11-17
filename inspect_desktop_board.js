const fs = require('fs');
const html = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');

// Find desktop board section
const desktopStart = html.indexOf('data-screen-label="Desktop 1280"');
console.log('Desktop 1280 found at pos:', desktopStart);
if (desktopStart !== -1) {
  const slice = html.substring(desktopStart, desktopStart + 3500);
  console.log('Desktop 1280 snippet:\n', slice);
}
