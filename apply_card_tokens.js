const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'frontend', 'src', 'app', 'page.tsx');
let code = fs.readFileSync(pageFile, 'utf8');

// Replace background and borders of main panels
// 1. Conversational Tutor Card
code = code.replace(
  /<section className="lg:col-span-7 flex flex-col bg-\[#121215\] border border-\[#27272a\] rounded-xl overflow-hidden shadow-2xl">/,
  `<section className="lg:col-span-7 flex flex-col border rounded-2xl overflow-hidden transition-all" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>`
);

// Tutor inner header
code = code.replace(
  /<div className="p-4 border-b border-\[#27272a\] bg-\[#18181b\] flex items-center justify-between">/,
  `<div className="p-4 border-b flex items-center justify-between" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>`
);

// Grounded SOP Tutor title
code = code.replace(
  /<h2 className="text-xs font-semibold uppercase tracking-wider text-white">Grounded SOP Tutor<\/h2>/,
  `<h2 className="text-sm font-editorial font-semibold tracking-wide" style={{ color: 'var(--ink)' }}>Grounded SOP Tutor</h2>`
);

// Tutor bot avatar
code = code.replace(
  /<div className="h-7 w-7 rounded-md bg-white text-black flex items-center justify-center font-bold">/,
  `<div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>`
);

// Chat feed background
code = code.replace(
  /<div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-\[560px\] min-h-\[420px\]">/,
  `<div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[560px] min-h-[420px]" style={{ background: 'var(--canvas)' }}>`
);

// Message styling
code = code.replace(
  /m\.sender === 'user'[\s\S]*?\? 'bg-white text-black border-white shadow-md font-medium'[\s\S]*?: 'bg-\[#18181b\] text-zinc-100 border-\[#27272a\] shadow-sm'/,
  `m.sender === 'user'
                        ? 'border shadow-sm font-medium'
                        : 'border shadow-sm'`
);

// User and Tutor message bubble styles (apply inline style based on sender)
code = code.replace(
  /<div className=\{`max-w-\[85%\] rounded-xl p-4 text-sm leading-relaxed border transition-all \$\{[\s\S]*?m\.sender === 'user'[\s\S]*?\}`\}>/,
  `<div className="max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border transition-all" style={{
    background: m.sender === 'user' ? 'var(--pill)' : 'var(--card)',
    borderColor: m.sender === 'user' ? 'var(--line-strong)' : 'var(--line)',
    color: 'var(--ink)'
  }}>`
);

// Suggested chips container
code = code.replace(
  /<div className="px-4 py-2\.5 bg-\[#18181b\] border-t border-\[#27272a\] flex items-center gap-2 overflow-x-auto text-xs">/,
  `<div className="px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto text-xs" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>`
);

// Preset pills
code = code.replace(
  /className="whitespace-nowrap rounded-md bg-\[#121215\] hover:bg-white hover:text-black border border-\[#27272a\] px-2\.5 py-1 text-zinc-300 text-xs font-medium transition-colors"/g,
  'className="whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all" style={{ background: "var(--card)", borderColor: "var(--line-strong)", color: "var(--ink)" }}'
);

// Chat input bar
code = code.replace(
  /<div className="p-4 bg-\[#121215\] border-t border-\[#27272a\] flex items-center gap-3">/,
  `<div className="p-4 border-t flex items-center gap-3" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>`
);

code = code.replace(
  /className="flex-1 bg-\[#09090b\] border border-\[#27272a\] rounded-lg px-4 py-2\.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white transition-colors font-sans"/,
  'className="flex-1 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none" style={{ background: "var(--canvas)", borderColor: "var(--line-strong)", color: "var(--ink)" }}'
);

code = code.replace(
  /className="bg-white hover:bg-zinc-200 disabled:opacity-40 text-black rounded-lg px-4 py-2\.5 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"/,
  'className="rounded-xl px-5 py-2.5 font-medium text-xs flex items-center gap-2 transition-all shadow-sm hover:opacity-95 disabled:opacity-40" style={{ background: "var(--accent)", color: "var(--on-accent)" }}'
);

// Right Column: Stepper Card
code = code.replace(
  /<div className="bg-\[#121215\] border border-\[#27272a\] rounded-xl p-5 shadow-xl flex flex-col">/,
  `<div className="border rounded-2xl p-5 flex flex-col transition-all" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>`
);

// System Architecture card
code = code.replace(
  /<div className="bg-\[#121215\] border border-\[#27272a\] rounded-xl p-5 shadow-xl space-y-4">/,
  `<div className="border rounded-2xl p-5 space-y-4 transition-all" style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}>`
);

// Stepper steps inside card
code = code.replace(
  /step\.isCompleted \? 'bg-\[#18181b\] border-white\/40 text-zinc-300' : 'bg-\[#09090b\] border-\[#27272a\] hover:border-zinc-500 text-zinc-100'/g,
  `step.isCompleted ? 'border' : 'border'`
);

// Footer
code = code.replace(
  /<footer className="border-t border-\[#27272a\] bg-\[#09090b\] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">/,
  `<footer className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 transition-colors" style={{ background: 'var(--canvas)', borderColor: 'var(--line)', color: 'var(--ink-3)' }}>`
);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('Successfully upgraded cards, chat feed, inputs, and stepper to TechPulse luxury tokens.');
