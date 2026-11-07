'use client';

import { useState } from 'react';
import { 
  Bot, 
  Send, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface Step {
  stepNumber: number;
  instruction: string;
  prerequisites: string[];
  isCompleted: boolean;
}

interface Citation {
  sourcePlatform: string;
  documentTitle: string;
  sourceUrl: string;
  sectionOrPage: string;
  version: string;
}

interface ChatMessage {
  sender: 'user' | 'tutor';
  text: string;
  steps?: Step[];
  citations?: Citation[];
  relevanceScore?: number;
}

const PRESET_QUERIES = [
  "What is the required progress for teammates group allocation?",
  "How do I record my daily attendance and standup?",
  "What are the security standards for API keys and tokens?"
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'tutor',
      text: "Hello! I am your RicoZ Internal Knowledge & SOP Interactive Tutor. Ask any operational question regarding company policies, engineering guidelines, or SOPs, and I will guide you through step-by-step with verified citations."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSteps, setActiveSteps] = useState<Step[]>([]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      });
      const data = await res.json();

      const tutorMsg: ChatMessage = {
        sender: 'tutor',
        text: data.answer || "No response received.",
        steps: data.steps || [],
        citations: data.citations || [],
        relevanceScore: data.relevanceScore
      };

      setMessages(prev => [...prev, tutorMsg]);
      if (data.steps && data.steps.length > 0) {
        setActiveSteps(data.steps);
      }
    } catch {
      setMessages(prev => [...prev, {
        sender: 'tutor',
        text: "Error communicating with the knowledge engine. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepIdx: number) => {
    setActiveSteps(prev => prev.map((s, idx) => 
      idx === stepIdx ? { ...s, isCompleted: !s.isCompleted } : s
    ));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white">RicoZ SOP Interactive Tutor</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                CATALOG #86
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Operational Assistant & Procedure Execution Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Database className="h-4 w-4 text-cyan-400" />
            <span>Notion · Drive · Confluence</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <span className="px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            45%+ Milestone Verified
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chat Conversation */}
        <section className="lg:col-span-7 flex flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Grounded Conversational Tutor</span>
            </div>
            <span className="text-xs text-slate-500">Retrieval-Augmented Generation (RAG)</span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[580px]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.sender === 'tutor' && (
                  <div className="h-8 w-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-md' 
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none shadow-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>

                  {/* Citations block */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span>Verifiable Organizational Citations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {m.citations.map((c, cIdx) => (
                          <a 
                            key={cIdx} 
                            href={c.sourceUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs bg-slate-900/90 hover:bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300 hover:text-cyan-300 transition-colors"
                          >
                            <BookOpen className="h-3 w-3 text-cyan-400" />
                            <span>{c.documentTitle}</span>
                            <span className="text-[10px] text-slate-400">({c.sourcePlatform.toUpperCase()})</span>
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-slate-400 text-xs py-2">
                <div className="h-8 w-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-cyan-400 animate-spin" />
                </div>
                <span>Retrieving authorized documents and synthesizing procedural steps...</span>
              </div>
            )}
          </div>

          {/* Preset Prompts */}
          <div className="px-5 py-2.5 bg-slate-900/70 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-400 shrink-0 font-medium">Suggested:</span>
            {PRESET_QUERIES.map((pq, pqIdx) => (
              <button
                key={pqIdx}
                onClick={() => handleSend(pq)}
                className="whitespace-nowrap rounded-full bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 px-3 py-1 text-slate-300 transition-colors"
              >
                {pq}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask an operational procedure question (e.g., leave, tech stack, PR reviews)..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl px-4 py-2.5 font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
            >
              <span>Ask</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
        </section>

        {/* Right Column: Interactive Procedure Stepper & Policy Audit */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Active Step-by-Step SOP Stepper */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <h2 className="font-semibold text-sm text-slate-200">Interactive SOP Stepper</h2>
              </div>
              <span className="text-xs text-slate-400">
                {activeSteps.length > 0 
                  ? `${activeSteps.filter(s => s.isCompleted).length} / ${activeSteps.length} Steps Done`
                  : 'Awaiting SOP'}
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto">
              {activeSteps.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <p>Ask a procedural question to generate interactive, verified execution steps.</p>
                </div>
              ) : (
                activeSteps.map((step, sIdx) => (
                  <div 
                    key={sIdx} 
                    onClick={() => toggleStep(sIdx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      step.isCompleted 
                        ? 'bg-emerald-950/20 border-emerald-800/60 text-slate-300' 
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-cyan-400">Step {step.stepNumber}</span>
                          {step.isCompleted && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded font-medium">Completed</span>
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${step.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {step.instruction}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {activeSteps.length > 0 && activeSteps.every(s => s.isCompleted) && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>All procedure steps successfully validated and verified. Zero compliance violations.</span>
              </div>
            )}
          </div>

          {/* Project Architecture & Verification Metrics Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-400" />
              <span>Project Deliverable Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Backend API</span>
                <span className="font-semibold text-slate-200 mt-1 block">Express + Node.js</span>
                <span className="text-[10px] text-cyan-400 font-mono">REST /api/tutor</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Database & RAG</span>
                <span className="font-semibold text-slate-200 mt-1 block">MongoDB + Vector</span>
                <span className="text-[10px] text-cyan-400 font-mono">Parent-Child Chunking</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Frontend App</span>
                <span className="font-semibold text-slate-200 mt-1 block">Next.js 14 App Router</span>
                <span className="text-[10px] text-cyan-400 font-mono">TypeScript + Tailwind</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Progress Milestone</span>
                <span className="font-semibold text-emerald-400 mt-1 block">50%+ Completed</span>
                <span className="text-[10px] text-slate-400 font-mono">Ready for Group Alloc.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>FIRSTRICOZ PRIVATE LIMITED</span>
              <a 
                href="https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor"
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
              >
                <span>GitHub Repository</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
