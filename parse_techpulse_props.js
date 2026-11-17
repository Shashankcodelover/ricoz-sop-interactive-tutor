const fs = require('fs');
const code = fs.readFileSync('uiux_reference/TechPulse v2.dc.html', 'utf8');
const scriptMatch = code.match(/data-props="([^"]+)"/);
if (scriptMatch) {
  const decoded = scriptMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  const props = JSON.parse(decoded);
  console.log('Props keys:', Object.keys(props));
  if (props.t) console.log('Theme tokens (t):', JSON.stringify(props.t, null, 2));
  if (props.themes) console.log('Available themes:', Object.keys(props.themes));
}
