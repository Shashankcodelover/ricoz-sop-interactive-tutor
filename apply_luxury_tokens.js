const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'frontend', 'src', 'app', 'page.tsx');
let code = fs.readFileSync(pageFile, 'utf8');

// Replace top root container
code = code.replace(
  /<div className=\{`min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased \$\{[\s\S]*?`\}>/,
  `<div className={\`min-h-screen flex flex-col transition-colors duration-200 antialiased \${
    theme === 'dark' ? 'dark' : ''
  }\`} style={{ background: 'var(--page)', color: 'var(--ink)' }}>`
);

// Replace active conflict banner
code = code.replace(
  /\{activeConflict && \([\s\S]*?className=\{`border-b px-4 py-2\.5 flex items-center justify-between transition-all \$\{theme === "dark" \? "bg-\[#121215\] border-\[#27272a\]" : "bg-amber-50 border-amber-200"\}`\}/,
  `{activeConflict && (
        <div className="border-b px-4 py-2.5 flex items-center justify-between transition-all" style={{ background: 'var(--warn-bg)', borderColor: 'var(--line-strong)' }}`
);

// Update banner badge and text
code = code.replace(
  /<div className="flex items-center gap-1\.5 px-2 py-0\.5 rounded-full bg-white\/10 text-white font-medium border border-white\/20 shrink-0">[\s\S]*?<AlertTriangle className="h-3 w-3 text-amber-400" \/>[\s\S]*?<span>\{activeConflict\.title\}<\/span>[\s\S]*?<\/div>[\s\S]*?<p className="text-zinc-300 truncate">/,
  `<div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium shrink-0 text-xs" style={{ background: 'var(--card)', color: 'var(--warn)', border: '1px solid var(--line-strong)' }}>
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--warn)' }} />
              <span className="font-editorial text-sm tracking-wide">{activeConflict.title}</span>
            </div>
            <p className="truncate text-xs" style={{ color: 'var(--ink-2)' }}>`
);

// Update banner button
code = code.replace(
  /className="text-xs text-white hover:text-zinc-300 underline underline-offset-2 flex items-center gap-1"/,
  'className="text-xs font-medium underline underline-offset-2 flex items-center gap-1" style={{ color: "var(--accent)" }}'
);
code = code.replace(
  /className="text-zinc-500 hover:text-white p-1 rounded transition-colors"/,
  'className="p-1 rounded transition-colors" style={{ color: "var(--ink-3)" }}'
);

// Update Header
code = code.replace(
  /<header className=\{`border-b backdrop-blur sticky transition-colors top-0 z-40 px-6 py-3\.5 flex items-center justify-between \$\{[\s\S]*?`\}>/,
  `<header className="border-b backdrop-blur sticky transition-colors top-0 z-40 px-6 py-3.5 flex items-center justify-between" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>`
);

// Update logo box
code = code.replace(
  /<div className="h-9 w-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-base shadow-sm">/,
  `<div className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm transition-transform hover:scale-105" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>`
);

// Update header titles
code = code.replace(
  /<h1 className="font-semibold text-sm tracking-tight">RicoZ SOP Interactive Tutor<\/h1>/,
  `<h1 className="font-editorial text-xl font-medium tracking-tight" style={{ color: 'var(--ink)' }}>RicoZ SOP Interactive Tutor</h1>`
);

// View Switchers pill container
code = code.replace(
  /<div className=\{`flex items-center border rounded-lg p-0\.5 \$\{[\s\S]*?`\}>/,
  `<div className="flex items-center border rounded-full p-1" style={{ background: 'var(--pill)', borderColor: 'var(--line)' }}>`
);

// View Switcher Buttons
code = code.replace(
  /className=\{`px-3 py-1\.5 rounded-md text-xs font-medium transition-all flex items-center gap-1\.5 \$\{[\s\S]*?activeTab === 'tutor'[\s\S]*?\}`\}/,
  `className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5" style={{ background: activeTab === 'tutor' ? 'var(--card)' : 'transparent', color: activeTab === 'tutor' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: activeTab === 'tutor' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', border: activeTab === 'tutor' ? '1px solid var(--line-strong)' : '1px solid transparent' }}`
);

code = code.replace(
  /className=\{`px-3 py-1\.5 rounded-md text-xs font-medium transition-all flex items-center gap-1\.5 \$\{[\s\S]*?activeTab === 'stepper'[\s\S]*?\}`\}/,
  `className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5" style={{ background: activeTab === 'stepper' ? 'var(--card)' : 'transparent', color: activeTab === 'stepper' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: activeTab === 'stepper' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', border: activeTab === 'stepper' ? '1px solid var(--line-strong)' : '1px solid transparent' }}`
);

code = code.replace(
  /className=\{`px-3 py-1\.5 rounded-md text-xs font-medium transition-all flex items-center gap-1\.5 \$\{[\s\S]*?activeTab === 'knowledge'[\s\S]*?\}`\}/,
  `className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5" style={{ background: activeTab === 'knowledge' ? 'var(--card)' : 'transparent', color: activeTab === 'knowledge' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: activeTab === 'knowledge' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', border: activeTab === 'knowledge' ? '1px solid var(--line-strong)' : '1px solid transparent' }}`
);

code = code.replace(
  /className=\{`px-3 py-1\.5 rounded-md text-xs font-medium transition-all flex items-center gap-1\.5 \$\{[\s\S]*?activeTab === 'compliance'[\s\S]*?\}`\}/,
  `className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5" style={{ background: activeTab === 'compliance' ? 'var(--card)' : 'transparent', color: activeTab === 'compliance' ? 'var(--ink)' : 'var(--ink-2)', boxShadow: activeTab === 'compliance' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', border: activeTab === 'compliance' ? '1px solid var(--line-strong)' : '1px solid transparent' }}`
);

// Subheader banner
code = code.replace(
  /<div className=\{`border-b px-6 py-2 flex items-center justify-between text-xs transition-colors \$\{[\s\S]*?`\}>/,
  `<div className="border-b px-6 py-2 flex items-center justify-between text-xs transition-colors" style={{ background: 'var(--pill)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>`
);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('Successfully injected TechPulse luxury tokens into page.tsx header & banners');

