const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'app', 'page.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Ensure Sun and Moon icons imported from lucide-react
if (!code.includes('Sun,') && !code.includes('Sun }')) {
  code = code.replace('RotateCcw', 'RotateCcw,\n  Sun,\n  Moon');
}

// 2. Expand PRESET_QUERIES with PRD problem statements
const targetPresets = `const PRESET_QUERIES = [
  { label: "45% Teammate Allocation", query: "What is the required progress for teammates group allocation and engineering standards?" },
  { label: "30-Day GTM & Gate G3", query: "What are the requirements for Phase 3 MVP build and Gate G3 sign-off in the 30-Day Playbook?" },
  { label: "Daily Attendance SOP", query: "How do I record daily attendance check-in, tasks, and standup reporting?" },
  { label: "API Key & OAuth Security", query: "What are the mandatory security standards for API keys, database credentials, and OAuth tokens?" },
  { label: "PR Review Acceptance", query: "What is the code review and pull request acceptance protocol?" }
];`;

const replacementPresets = `const PRESET_QUERIES = [
  { label: "45% Teammate Allocation", query: "What is the required progress for teammates group allocation and engineering standards?" },
  { label: "Leave & Emergency Absence", query: "How do I apply for annual or emergency medical leave?" },
  { label: "Expense Reimbursement", query: "What is the reimbursement procedure for a project expense of 4,000 INR?" },
  { label: "Customer Refund Dispute", query: "How do we handle customer refund requests and dispute escalations?" },
  { label: "Production Incident SOP", query: "What are the severity levels and incident response escalation steps for production outages?" },
  { label: "7-Day Onboarding SOP", query: "What is the new employee 7-day technical onboarding checklist?" },
  { label: "Daily Attendance SOP", query: "How do I record daily attendance check-in, tasks, and standup reporting?" },
  { label: "API Key & OAuth Security", query: "What are the mandatory security standards for API keys, database credentials, and OAuth tokens?" }
];`;

if (code.includes(targetPresets)) {
  code = code.replace(targetPresets, replacementPresets);
}

// 3. Add theme state and persistence if not already added
if (!code.includes("const [theme, setTheme]")) {
  code = code.replace("export default function Home() {", `export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('ricoz_theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('ricoz_theme', nextTheme);
  };`);
}

// 4. Update the root container classes to handle light and dark theme seamlessly
const oldRoot = '<div className="min-h-screen bg-[#09090b] text-[#fafafa] flex flex-col font-sans selection:bg-white selection:text-black antialiased">';
const newRoot = `<div className={\`min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased \${
  theme === 'dark' 
    ? 'bg-[#09090b] text-[#fafafa] selection:bg-white selection:text-black' 
    : 'bg-[#f4f4f5] text-[#09090b] selection:bg-black selection:text-white'
}\`}>`;

if (code.includes(oldRoot)) {
  code = code.replace(oldRoot, newRoot);
}

// 5. Update header and add theme toggle button
const oldHeaderRight = `{/* Status Indicators */}
        <div className="hidden xl:flex items-center gap-3 text-xs">`;

const newHeaderRight = `{/* Theme Toggle & Status Indicators */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={\`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all shadow-sm \${
              theme === 'dark'
                ? 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white hover:border-zinc-500'
                : 'bg-white border-zinc-300 text-zinc-700 hover:text-black hover:border-zinc-400'
            }\`}
            title={\`Switch to \${theme === 'dark' ? 'Light' : 'Dark'} Mode\`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span className="hidden md:inline font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-zinc-800" />
                <span className="hidden md:inline font-medium">Dark</span>
              </>
            )}
          </button>

          <div className="hidden xl:flex items-center gap-3 text-xs">`;

if (code.includes(oldHeaderRight)) {
  code = code.replace(oldHeaderRight, newHeaderRight);
  // close the div in status indicators
  code = code.replace(
    `            <span className="text-[11px]">Notion · Drive · Confluence</span>
          </div>
        </div>
      </header>`,
    `            <span className="text-[11px]">Notion · Drive · Confluence</span>
          </div>
          </div>
        </div>
      </header>`
  );
}

// 6. Make card surfaces, borders, and sub-headers adapt to theme cleanly
code = code.replace(/className="bg-\[#121215\] border-b border-\[#27272a\] px-4 py-2\.5 flex items-center justify-between transition-all"/g,
  'className={`border-b px-4 py-2.5 flex items-center justify-between transition-all ${theme === "dark" ? "bg-[#121215] border-[#27272a]" : "bg-amber-50 border-amber-200"}`}'
);

code = code.replace(/border-b border-\[#27272a\] bg-\[#09090b\]\/90 backdrop-blur sticky/g,
  'border-b backdrop-blur sticky transition-colors ${theme === "dark" ? "border-[#27272a] bg-[#09090b]/90" : "border-zinc-200 bg-white/90"}'
);

code = code.replace(/border-b border-\[#27272a\] bg-\[#121215\] px-6 py-2 flex items-center justify-between text-xs text-zinc-400/g,
  'border-b px-6 py-2 flex items-center justify-between text-xs transition-colors ${theme === "dark" ? "border-[#27272a] bg-[#121215] text-zinc-400" : "border-zinc-200 bg-zinc-100 text-zinc-600"}'
);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully updated page.tsx with theme toggle and light theme styling.');

