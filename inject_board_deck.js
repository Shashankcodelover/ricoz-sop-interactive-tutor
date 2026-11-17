const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'frontend', 'src', 'app', 'page.tsx');
let code = fs.readFileSync(pageFile, 'utf8');

// 1. Add viewMode state: 'standard' | 'boards'
if (!code.includes("const [viewMode, setViewMode]")) {
  code = code.replace(
    "const [theme, setTheme] = useState<'dark' | 'light'>('light');",
    `const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [viewMode, setViewMode] = useState<'standard' | 'boards'>('standard');`
  );
}

// 2. Add Board Toggle in the top header
const targetHeader = `<div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}`;

const replacementHeader = `<div className="flex items-center gap-3">
          {/* Dual Board Mode Toggle (Standard App vs. Responsive Board Deck) */}
          <div className="flex items-center border rounded-full p-0.5" style={{ background: 'var(--pill)', borderColor: 'var(--line-strong)' }}>
            <button
              onClick={() => setViewMode('standard')}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: viewMode === 'standard' ? 'var(--card)' : 'transparent',
                color: viewMode === 'standard' ? 'var(--ink)' : 'var(--ink-2)',
                boxShadow: viewMode === 'standard' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              Standard
            </button>
            <button
              onClick={() => setViewMode('boards')}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all"
              style={{
                background: viewMode === 'boards' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'boards' ? 'var(--on-accent)' : 'var(--ink-2)',
                boxShadow: viewMode === 'boards' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              Board View
            </button>
          </div>

          <button
            onClick={toggleTheme}`;

if (code.includes(targetHeader)) {
  code = code.replace(targetHeader, replacementHeader);
}

// 3. Inject the Dual Board Deck (Mobile 375 + Desktop 1280) when viewMode === 'boards'
const mainTag = '<main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">';
const newMainContent = `<main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">

        {/* ========================================================================= */}
        {/* RESPONSIVE BOARD DECK (TECHPULSE DUAL VIEW: MOBILE 375 + DESKTOP 1280)    */}
        {/* ========================================================================= */}
        {viewMode === 'boards' && (
          <div className="flex flex-col gap-8 pb-12">
            <div className="flex flex-col gap-2">
              <span className="font-mono-code text-xs uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                TECHPULSE · DUAL-BOARD PROTOTYPE WORKSPACE
              </span>
              <h2 className="font-editorial text-3xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                Side-by-Side Viewport Boards: Mobile (375px) &amp; Desktop (1280px)
              </h2>
              <p className="text-sm max-w-3xl leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                Simultaneous multi-surface board rendering modeled directly on the TechPulse v2 design canvas. Test touch ergonomics, thumb reach, and desk workflows against the verified SOP knowledge engine.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 items-start justify-center xl:justify-start">
              
              {/* BOARD 1: MOBILE 375 x 812 SIMULATION */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs font-mono-code" style={{ color: 'var(--ink-2)' }}>
                  <span className="px-2 py-0.5 rounded font-bold" style={{ background: 'var(--ink)', color: 'var(--page)' }}>M</span>
                  <span>Mobile Viewport</span>
                  <span style={{ color: 'var(--ink-3)' }}>375 × 812</span>
                </div>

                <div 
                  className="rounded-[36px] border shadow-2xl overflow-hidden relative flex flex-col"
                  style={{
                    width: '375px',
                    height: '812px',
                    background: 'var(--canvas)',
                    borderColor: 'var(--line-strong)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  {/* Status Bar */}
                  <div 
                    className="h-11 px-6 flex items-center justify-between text-xs font-semibold"
                    style={{ background: 'var(--canvas)', color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}
                  >
                    <span className="font-mono-code text-[11px]">10:00 AM</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-5 h-2.5 border rounded-xs p-0.5 flex" style={{ borderColor: 'var(--ink)' }}>
                        <div className="w-3/4 h-full rounded-xs" style={{ background: 'var(--ink)' }} />
                      </div>
                    </div>
                  </div>

                  {/* Mobile Header */}
                  <div 
                    className="h-13 px-4 flex items-center justify-between border-b"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg flex items-center justify-center font-bold" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="font-editorial text-base font-semibold" style={{ color: 'var(--ink)' }}>RicoZ SOP</span>
                    </div>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border" style={{ background: 'var(--pill)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                      v2.0
                    </span>
                  </div>

                  {/* Mobile Feed */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3" style={{ background: 'var(--page)' }}>
                    <div className="p-3 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono-code font-semibold" style={{ color: 'var(--accent)' }}>ACTIVE PROCEDURE</span>
                        <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>{progressPercent}%</span>
                      </div>
                      <h4 className="font-editorial text-sm font-semibold" style={{ color: 'var(--ink)' }}>{currentSopTitle}</h4>
                      <div className="mt-2 w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                        <div className="h-full" style={{ width: \`\${progressPercent}%\`, background: 'var(--accent)' }} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {activeSteps.slice(0, 3).map((s, idx) => (
                        <div 
                          key={idx}
                          onClick={() => toggleStep(idx)}
                          className="p-2.5 rounded-xl border text-xs cursor-pointer"
                          style={{
                            background: s.isCompleted ? 'var(--pill)' : 'var(--card)',
                            borderColor: s.isCompleted ? 'var(--ok)' : 'var(--line)'
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {s.isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--ok)' }} />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--ink-3)' }} />
                            )}
                            <span className="font-medium truncate" style={{ color: 'var(--ink)' }}>Step {s.stepNumber}: {s.instruction}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-2xl border text-xs space-y-1.5" style={{ background: 'var(--card)', borderColor: 'var(--line)' }}>
                      <span className="text-[10px] font-mono-code font-semibold" style={{ color: 'var(--ink-2)' }}>QUICK TUTOR QUERY</span>
                      <p className="text-[11px]" style={{ color: 'var(--ink-2)' }}>Ask about leave, reimbursements, or tech stack standards.</p>
                      <button
                        onClick={() => handleSend("What is the required progress for teammates group allocation and engineering standards?")}
                        className="w-full py-1.5 rounded-xl font-medium text-[11px] shadow-xs cursor-pointer"
                        style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                      >
                        Ask 45% Milestone SOP
                      </button>
                    </div>
                  </div>

                  {/* Mobile Bottom Bar */}
                  <div 
                    className="h-14 px-6 flex items-center justify-around border-t"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
                  >
                    <button onClick={() => setActiveTab('tutor')} className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: activeTab === 'tutor' ? 'var(--accent)' : 'var(--ink-3)' }}>
                      <Sparkles className="h-4 w-4" />
                      <span>Tutor</span>
                    </button>
                    <button onClick={() => setActiveTab('stepper')} className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: activeTab === 'stepper' ? 'var(--accent)' : 'var(--ink-3)' }}>
                      <Layers className="h-4 w-4" />
                      <span>Stepper</span>
                    </button>
                    <button onClick={() => setActiveTab('knowledge')} className="flex flex-col items-center gap-0.5 text-[10px] font-medium" style={{ color: activeTab === 'knowledge' ? 'var(--accent)' : 'var(--ink-3)' }}>
                      <BookOpen className="h-4 w-4" />
                      <span>Docs</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOARD 2: DESKTOP 1280 x 812 SIMULATION */}
              <div className="flex flex-col gap-2 flex-1 min-w-[700px] max-w-full">
                <div className="flex items-center gap-2 text-xs font-mono-code" style={{ color: 'var(--ink-2)' }}>
                  <span className="px-2 py-0.5 rounded font-bold" style={{ background: 'var(--ink)', color: 'var(--page)' }}>D</span>
                  <span>Desktop Viewport</span>
                  <span style={{ color: 'var(--ink-3)' }}>1280 × 812 Extended Desk</span>
                </div>

                <div 
                  className="rounded-2xl border shadow-2xl overflow-hidden relative flex flex-col"
                  style={{
                    height: '812px',
                    background: 'var(--canvas)',
                    borderColor: 'var(--line-strong)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  {/* Desktop Nav Header */}
                  <div 
                    className="h-14 px-6 flex items-center justify-between border-b"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center font-bold" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <span className="font-editorial text-lg font-semibold" style={{ color: 'var(--ink)' }}>RicoZ Operational Desk</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="cursor-pointer pb-1 border-b-2" style={{ color: 'var(--ink)', borderColor: 'var(--accent)' }}>Interactive Desk</span>
                      <span className="cursor-pointer pb-1 border-b-2 border-transparent" style={{ color: 'var(--ink-2)' }}>RAG Matrix</span>
                      <span className="cursor-pointer pb-1 border-b-2 border-transparent" style={{ color: 'var(--ink-2)' }}>Gate Governance</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono-code text-xs">
                      <span className="px-2.5 py-0.5 rounded-full border" style={{ background: 'var(--pill)', borderColor: 'var(--line-strong)', color: 'var(--ok)' }}>
                        System Online (100%)
                      </span>
                    </div>
                  </div>

                  {/* Desktop Work Desk Layout (2-Column Split Desk) */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Left Desk: Conversational Tutor & Citations */}
                    <div className="w-1/2 border-r p-5 overflow-y-auto space-y-4" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-editorial text-base font-semibold" style={{ color: 'var(--ink)' }}>Live Guidance Stream</h3>
                        <span className="font-mono-code text-[11px]" style={{ color: 'var(--ink-3)' }}>Cosine Dense + BM25</span>
                      </div>

                      <div className="space-y-3">
                        {messages.slice(-2).map((m) => (
                          <div key={m.id} className="p-4 rounded-xl border text-xs space-y-2" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
                            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--line)' }}>
                              <span className="font-mono-code font-bold uppercase" style={{ color: 'var(--accent)' }}>{m.sender}</span>
                              <span className="font-mono-code text-[10px]" style={{ color: 'var(--ink-3)' }}>{m.timestamp}</span>
                            </div>
                            <p className="leading-relaxed">{m.text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Input */}
                      <div className="pt-2 flex items-center gap-2">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Type inquiry for instant verification..."
                          className="flex-1 border rounded-lg px-3 py-2 text-xs focus:outline-none"
                          style={{ background: 'var(--page)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                        />
                        <button
                          onClick={() => handleSend()}
                          className="px-4 py-2 rounded-lg text-xs font-semibold shadow-xs"
                          style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                        >
                          Dispatch
                        </button>
                      </div>
                    </div>

                    {/* Right Desk: Stepper Checklist & Document Inspector */}
                    <div className="w-1/2 p-5 overflow-y-auto space-y-4" style={{ background: 'var(--page)' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-editorial text-base font-semibold" style={{ color: 'var(--ink)' }}>Verified Procedure Steps</h3>
                        <span className="font-mono-code text-xs font-bold" style={{ color: 'var(--accent)' }}>{progressPercent}% Complete</span>
                      </div>

                      <div className="space-y-2.5">
                        {activeSteps.map((st, idx) => (
                          <div 
                            key={idx}
                            onClick={() => toggleStep(idx)}
                            className="p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-101"
                            style={{
                              background: st.isCompleted ? 'var(--pill)' : 'var(--card)',
                              borderColor: st.isCompleted ? 'var(--ok)' : 'var(--line)'
                            }}
                          >
                            <div className="flex items-start gap-2.5">
                              {st.isCompleted ? (
                                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--ok)' }} />
                              ) : (
                                <Circle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'var(--ink-3)' }} />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono-code font-bold text-[11px]" style={{ color: 'var(--ink)' }}>Step {st.stepNumber}</span>
                                  <span className="font-mono-code text-[10px]" style={{ color: st.isCompleted ? 'var(--ok)' : 'var(--ink-3)' }}>
                                    {st.isCompleted ? 'EXECUTED' : 'PENDING'}
                                  </span>
                                </div>
                                <p className="mt-1 leading-relaxed" style={{ color: st.isCompleted ? 'var(--ink-2)' : 'var(--ink)' }}>{st.instruction}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Standard View Container */}
        {viewMode === 'standard' && (
          <>`;

code = code.replace(mainTag, newMainContent);

// Close the standard view conditional before closing main
code = code.replace(
  '      </main>',
  `          </>
        )}
      </main>`
);

fs.writeFileSync(pageFile, code, 'utf8');
console.log('Successfully injected TechPulse Dual Board deck (Mobile 375 + Desktop 1280) into page.tsx');
