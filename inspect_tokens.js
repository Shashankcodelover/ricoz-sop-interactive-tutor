const fs = require('fs');
const html = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');

// Find all occurrences of t. or theme
const matches = html.match(/t\.[a-zA-Z0-9]+/g);
console.log('Unique t.* tokens in TechPulse v2:', [...new Set(matches)]);

// Search for theme objects in html
const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi);
console.log('Script tags count:', scriptTags ? scriptTags.length : 0);
if (scriptTags) {
  scriptTags.forEach((s, idx) => console.log('Script ' + idx + ' length:', s.length));
}
