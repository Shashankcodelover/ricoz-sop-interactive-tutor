const fs = require('fs');

function extractDesignTokens(filename) {
  const content = fs.readFileSync('uiux_reference/' + filename, 'utf8');
  
  // Extract hex colors
  const hexColors = content.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/g) || [];
  const colorCounts = {};
  hexColors.forEach(c => {
    const norm = c.toUpperCase();
    colorCounts[norm] = (colorCounts[norm] || 0) + 1;
  });
  
  // Extract font definitions
  const fonts = content.match(/font:[^;]+/g) || [];
  const fontFamilies = content.match(/font-family:[^;]+/g) || [];
  
  // Extract gradients and box-shadows
  const gradients = content.match(/linear-gradient\([^)]+\)/g) || [];
  const shadows = content.match(/box-shadow:[^;]+/g) || [];
  const borders = content.match(/border(?:-radius)?:[^;]+/g) || [];

  return {
    filename,
    topColors: Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 20),
    sampleFonts: [...new Set(fonts)].slice(0, 10),
    sampleFontFamilies: [...new Set(fontFamilies)].slice(0, 5),
    sampleGradients: [...new Set(gradients)].slice(0, 5),
    sampleShadows: [...new Set(shadows)].slice(0, 5),
    sampleBorders: [...new Set(borders)].slice(0, 10)
  };
}

const report1 = extractDesignTokens('TechPulse Deadline Desk.dc.html');
const report2 = extractDesignTokens('TechPulse v2.dc.html');

console.log('=== TechPulse Deadline Desk Design System ===');
console.log('Top Colors:', report1.topColors);
console.log('Fonts:', report1.sampleFonts);
console.log('Font Families:', report1.sampleFontFamilies);
console.log('Gradients:', report1.sampleGradients);
console.log('Shadows:', report1.sampleShadows);

console.log('\n=== TechPulse v2 Design System ===');
console.log('Top Colors:', report2.topColors);
