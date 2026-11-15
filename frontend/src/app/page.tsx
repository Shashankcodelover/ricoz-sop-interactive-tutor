'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Database,
  Search,
  AlertTriangle,
  FileText,
  Filter,
  RefreshCw,
  Terminal,
  Compass,
  Check,
  Copy,
  Info,
  X,
  ChevronRight,
  SlidersHorizontal,
  Lock,
  Calendar,
  UserCheck,
  RotateCcw,
  Sun,
  Moon
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
  department?: string;
  effectiveDate?: string;
}

interface ConflictReport {
  hasConflict: boolean;
  detectedSeverity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  supersededPolicy: string;
  activePolicy: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  steps?: Step[];
  citations?: Citation[];
  relevanceScore?: number;
  conflictReport?: ConflictReport | null;
  timestamp: string;
}

interface KnowledgeDoc {
  id: string;
  sourcePlatform: 'notion' | 'google_drive' | 'confluence';
  title: string;
  sourceUrl: string;
  category: string;
  department: string;
  version: string;
  effectiveDate: string;
  author: string;
  tags: string[];
  content: string;
}

const PRESET_QUERIES = [
  { label: "45% Teammate Allocation", query: "What is the required progress for teammates group allocation and engineering standards?" },
  { label: "Leave & Emergency Absence", query: "How do I apply for annual or emergency medical leave?" },
  { label: "Expense Reimbursement", query: "What is the reimbursement procedure for a project expense of 4,000 INR?" },
  { label: "Customer Refund Dispute", query: "How do we handle customer refund requests and dispute escalations?" },
  { label: "Production Incident SOP", query: "What are the severity levels and incident response escalation steps for production outages?" },
  { label: "7-Day Onboarding SOP", query: "What is the new employee 7-day technical onboarding checklist?" },
  { label: "Daily Attendance SOP", query: "How do I record daily attendance check-in, tasks, and standup reporting?" },
  { label: "API Key & OAuth Security", query: "What are the mandatory security standards for API keys, database credentials, and OAuth tokens?" }
];

export default function Home() {
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
  };
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'tutor' | 'stepper' | 'knowledge' | 'compliance'>('tutor');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_welcome',
      sender: 'tutor',
      text: "Welcome to the RicoZ Operational Knowledge & SOP Interactive Tutor. I synthesize verified internal standards across Notion, Google Drive, and Confluence into deterministic execution steps with verifiable citations. How can I assist your operational workflow today?",
      timestamp: "10:00 AM"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Stepper State
  const [activeSteps, setActiveSteps] = useState<Step[]>([
    {
      stepNumber: 1,
      instruction: "All new full stack web development projects must use Next.js for frontend, Node.js + Express.js for backend, and MongoDB for database management.",
      prerequisites: ["Verify authorization and governance credentials"],
      isCompleted: true
    },
    {
      stepNumber: 2,
      instruction: "Build reusable modular components, maintain consistent formatting with ESLint/Prettier, and implement clean layered architecture.",
      prerequisites: ["Complete Step 1"],
      isCompleted: true
    },
    {
      stepNumber: 3,
      instruction: "Implement proper authentication, role-based authorization, input validation on every endpoint, and robust error handling.",
      prerequisites: ["Complete Step 2"],
      isCompleted: false
    },
    {
      stepNumber: 4,
      instruction: "Use Git and GitHub with descriptive branch names (feat/ or fix/) and peer pull-request reviews.",
      prerequisites: ["Complete Step 3"],
      isCompleted: false
    },
    {
      stepNumber: 5,
      instruction: "Interns and engineers must achieve at least 45% independent development progress before requesting group teammate allocation.",
      prerequisites: ["Complete Step 4"],
      isCompleted: false
    }
  ]);
  const [currentSopTitle, setCurrentSopTitle] = useState('RicoZ Tech Stack & Engineering Standards SOP (v2.0)');

  // Knowledge Base State
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  // Active Conflict Alert Banner
  const [activeConflict, setActiveConflict] = useState<ConflictReport | null>({
    hasConflict: true,
    detectedSeverity: 'medium',
    title: 'Version Policy Discrepancy Detected',
    description: 'Notice: Legacy SOP v1.0 permitted PostgreSQL for relational workflows. Under Active SOP v2.0, all new projects MUST standardize on MongoDB for primary data persistence.',
    supersededPolicy: 'RicoZ Tech Stack SOP v1.0',
    activePolicy: 'RicoZ Tech Stack SOP v2.0'
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch knowledge corpus
    fetch('/api/tutor')
      .then(res => res.json())
      .then(data => {
        if (data.documents) {
          setDocs(data.documents);
          if (data.documents.length > 0 && !selectedDoc) {
            setSelectedDoc(data.documents[0]);
          }
        }
      })
      .catch(() => {});
  }, [selectedDoc]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = { 
      id: `usr_${Date.now()}`,
      sender: 'user', 
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

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
        id: `tut_${Date.now()}`,
        sender: 'tutor',
        text: data.answer || "No response received.",
        steps: data.steps || [],
        citations: data.citations || [],
        relevanceScore: data.relevanceScore,
        conflictReport: data.conflictReport,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, tutorMsg]);

      if (data.steps && data.steps.length > 0) {
        setActiveSteps(data.steps);
        if (data.citations && data.citations[0]) {
          setCurrentSopTitle(`${data.citations[0].documentTitle} (${data.citations[0].version})`);
        }
      }

      if (data.conflictReport) {
        setActiveConflict(data.conflictReport);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: 'tutor',
        text: "Error communicating with the knowledge engine. Please check your connectivity and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  const resetAllSteps = () => {
    setActiveSteps(prev => prev.map(s => ({ ...s, isCompleted: false })));
  };

  const completeAllSteps = () => {
    setActiveSteps(prev => prev.map(s => ({ ...s, isCompleted: true })));
  };

  const completedCount = activeSteps.filter(s => s.isCompleted).length;
  const progressPercent = activeSteps.length > 0 
    ? Math.round((completedCount / activeSteps.length) * 100) 
    : 0;

  const filteredDocs = docs.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Array.from(new Set(docs.map(d => d.category)))];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDocId(id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 antialiased ${
  theme === 'dark' 
    ? 'bg-[#09090b] text-[#fafafa] selection:bg-white selection:text-black' 
    : 'bg-[#f4f4f5] text-[#09090b] selection:bg-black selection:text-white'
}`}>
      
      {/* Policy Discrepancy & Conflict Alert Banner */}
      {activeConflict && (
        <div className={`border-b px-4 py-2.5 flex items-center justify-between transition-all ${theme === "dark" ? "bg-[#121215] border-[#27272a]" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-3 text-xs max-w-5xl">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 text-white font-medium border border-white/20 shrink-0">
              <AlertTriangle className="h-3 w-3 text-amber-400" />
              <span>{activeConflict.title}</span>
            </div>
            <p className="text-zinc-300 truncate">
              {activeConflict.description}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('compliance')}
              className="text-xs text-white hover:text-zinc-300 underline underline-offset-2 flex items-center gap-1"
            >
              <span>Review Audit</span>
              <ChevronRight className="h-3 w-3" />
            </button>
            <button 
              onClick={() => setActiveConflict(null)}
              className="text-zinc-500 hover:text-white p-1 rounded transition-colors"
              title="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Header */}
      <header className={`border-b backdrop-blur sticky transition-colors top-0 z-40 px-6 py-3.5 flex items-center justify-between ${
        theme === "dark" ? "border-[#27272a] bg-[#09090b]/90 text-white" : "border-zinc-200 bg-white/90 text-zinc-900"
      }`}>
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-base shadow-sm">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-semibold text-sm tracking-tight">RicoZ SOP Interactive Tutor</h1>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border font-mono ${
                theme === 'dark' ? 'bg-white/10 text-zinc-300 border-[#27272a]' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}>
                CATALOG #86
              </span>
              <span className={`text-[11px] px-2 py-0.5 rounded-md border ${
                theme === 'dark' ? 'bg-zinc-900 text-zinc-400 border-[#27272a]' : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}>
                v2.0 PRODUCTION
              </span>
            </div>
            <p className={`text-xs hidden sm:block ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Automated SOP Tutor, RAG Document Retrieval &amp; Governance Engine
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className={`flex items-center border rounded-lg p-0.5 ${
          theme === 'dark' ? 'bg-[#121215] border-[#27272a]' : 'bg-zinc-100 border-zinc-200'
        }`}>
          <button
            onClick={() => setActiveTab('tutor')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'tutor' 
                ? (theme === 'dark' ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold')
                : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tutor Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('stepper')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'stepper' 
                ? (theme === 'dark' ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold')
                : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>SOP Stepper</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === 'stepper' 
                ? (theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-200 text-black')
                : (theme === 'dark' ? 'bg-[#27272a] text-zinc-300' : 'bg-zinc-200 text-zinc-700')
            }`}>
              {completedCount}/{activeSteps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'knowledge' 
                ? (theme === 'dark' ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold')
                : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Knowledge Base</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'compliance' 
                ? (theme === 'dark' ? 'bg-white text-black font-semibold' : 'bg-black text-white font-semibold')
                : (theme === 'dark' ? 'text-zinc-400 hover:text-white' : 'text-zinc-600 hover:text-black')
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Compliance Monitor</span>
          </button>
        </div>

        {/* Theme Toggle & Status Indicators */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all shadow-sm ${
              theme === 'dark'
                ? 'bg-[#18181b] border-[#27272a] text-zinc-300 hover:text-white hover:border-zinc-500'
                : 'bg-white border-zinc-300 text-zinc-700 hover:text-black hover:border-zinc-400'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
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

          <div className="hidden xl:flex items-center gap-3 text-xs">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              theme === 'dark' ? 'bg-[#121215] border-[#27272a] text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
            }`}>
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span className="font-mono text-[11px]">RAG Vector Indexed: 9 Docs</span>
            </div>
            <div className={`flex items-center gap-1.5 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Database className="h-3.5 w-3.5" />
              <span className="text-[11px]">Notion · Drive · Confluence</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Banner */}
      <div className={`border-b px-6 py-2 flex items-center justify-between text-xs transition-colors ${
        theme === 'dark' ? 'border-[#27272a] bg-[#121215] text-zinc-400' : 'border-zinc-200 bg-white text-zinc-600'
      }`}>
        <div className="flex items-center gap-2">
          <Compass className="h-3.5 w-3.5" />
          <span>Active Objective:</span>
          <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
            Independent Milestone Progress &gt;45% &amp; SOP Execution
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}>ENGINE: Dense 384d Cosine + BM25 Sparse</span>
          <span className={theme === 'dark' ? 'text-zinc-600' : 'text-zinc-300'}>|</span>
          <span className={theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}>FIRSTRICOZ GOVERNANCE</span>
        </div>
      </div>

      {/* Main Multi-Tab View Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">

        {/* ========================================================================= */}
        {/* TAB 1: TUTOR CHAT & COMPANION STEPPER VIEW                                */}
        {/* ========================================================================= */}
        {activeTab === 'tutor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Left Column: Conversational Tutor */}
            <section className="lg:col-span-7 flex flex-col bg-[#121215] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl">
              
              {/* Tutor Header */}
              <div className="p-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-md bg-white text-black flex items-center justify-center font-bold">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-white">Grounded SOP Tutor</h2>
                    <p className="text-[11px] text-zinc-400">Parent-child document chunks with deterministic step extraction</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#27272a] text-zinc-300">
                    Live Session
                  </span>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[560px] min-h-[420px]">
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.sender === 'tutor' && (
                      <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 font-bold shadow-sm">
                        <Bot className="h-4 w-4 text-black" />
                      </div>
                    )}

                    <div className={`max-w-[85%] rounded-xl p-4 text-sm leading-relaxed border transition-all ${
                      m.sender === 'user'
                        ? 'bg-white text-black border-white shadow-md font-medium'
                        : 'bg-[#18181b] text-zinc-100 border-[#27272a] shadow-sm'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${
                          m.sender === 'user' ? 'text-zinc-600' : 'text-zinc-400'
                        }`}>
                          {m.sender === 'user' ? 'Operator' : 'RicoZ SOP Tutor'}
                        </span>
                        <span className={`text-[10px] font-mono ${
                          m.sender === 'user' ? 'text-zinc-500' : 'text-zinc-500'
                        }`}>
                          {m.timestamp}
                        </span>
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                        {m.text}
                      </div>

                      {/* Verified Citation Badges */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#27272a] space-y-2">
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <div className="flex items-center gap-1.5 font-medium">
                              <ShieldCheck className="h-3.5 w-3.5 text-white" />
                              <span>Verified Citations ({m.citations.length})</span>
                            </div>
                            {m.relevanceScore && (
                              <span className="font-mono text-[10px] text-zinc-500">
                                Match Score: {(m.relevanceScore * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            {m.citations.map((c, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="flex items-center justify-between p-2 rounded-lg bg-[#121215] border border-[#27272a] text-xs hover:border-zinc-500 transition-colors"
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <BookOpen className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
                                  <span className="font-medium text-white truncate">{c.documentTitle}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#27272a] text-zinc-400 font-mono">
                                    {c.sourcePlatform.toUpperCase()}
                                  </span>
                                </div>
                                <a 
                                  href={c.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-zinc-400 hover:text-white p-1 ml-2 shrink-0 transition-colors"
                                  title="Open primary document"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 items-center py-2 text-zinc-400 text-xs">
                    <div className="h-8 w-8 rounded-lg bg-white text-black flex items-center justify-center shrink-0 animate-pulse">
                      <Bot className="h-4 w-4 text-black" />
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Synthesizing authorized SOP procedure & citations...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Preset Query Chips */}
              <div className="px-4 py-2.5 bg-[#18181b] border-t border-[#27272a] flex items-center gap-2 overflow-x-auto text-xs">
                <span className="text-zinc-400 shrink-0 text-[11px] font-mono">SUGGESTED:</span>
                {PRESET_QUERIES.map((pq, pqIdx) => (
                  <button
                    key={pqIdx}
                    onClick={() => handleSend(pq.query)}
                    className="whitespace-nowrap rounded-md bg-[#121215] hover:bg-white hover:text-black border border-[#27272a] px-2.5 py-1 text-zinc-300 text-xs font-medium transition-colors"
                  >
                    {pq.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 bg-[#121215] border-t border-[#27272a] flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask an operational procedure question (e.g., Gate G3, MongoDB stack, attendance SOP)..."
                  className="flex-1 bg-[#09090b] border border-[#27272a] rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white transition-colors font-sans"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="bg-white hover:bg-zinc-200 disabled:opacity-40 text-black rounded-lg px-4 py-2.5 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
                >
                  <span>Query</span>
                  <Send className="h-3.5 w-3.5 text-black" />
                </button>
              </div>
            </section>

            {/* Right Column: Mini Interactive Stepper Preview & Architecture */}
            <section className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stepper Card */}
              <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-white" />
                    <div>
                      <h3 className="font-semibold text-xs uppercase tracking-wider text-white">Interactive SOP Stepper</h3>
                      <p className="text-[11px] text-zinc-400 truncate max-w-[200px]">{currentSopTitle}</p>
                    </div>
                  </div>
                  
                  {/* Circular Completion Ring */}
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 flex items-center justify-center">
                      <svg className="h-9 w-9 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#27272a]"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-white transition-all duration-500 ease-out"
                          strokeDasharray={`${progressPercent}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-mono font-bold text-white">{progressPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 pb-1 text-xs">
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {completedCount} OF {activeSteps.length} STEPS VERIFIED
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={resetAllSteps} 
                      className="text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                    <button 
                      onClick={completeAllSteps} 
                      className="text-[11px] text-white hover:underline transition-colors"
                    >
                      Check All
                    </button>
                  </div>
                </div>

                {/* Steps List */}
                <div className="mt-2 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {activeSteps.map((step, sIdx) => (
                    <div 
                      key={sIdx} 
                      onClick={() => toggleStep(sIdx)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        step.isCompleted 
                          ? 'bg-[#18181b] border-white/40 text-zinc-300' 
                          : 'bg-[#09090b] border-[#27272a] hover:border-zinc-500 text-zinc-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {step.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-white shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono font-semibold text-white">
                              STEP {step.stepNumber}
                            </span>
                            {step.isCompleted ? (
                              <span className="text-[10px] bg-white text-black px-1.5 py-0.2 rounded font-mono font-semibold">
                                EXECUTED
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 font-mono">PENDING</span>
                            )}
                          </div>
                          <p className={`text-xs mt-1 leading-relaxed ${step.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-200'}`}>
                            {step.instruction}
                          </p>
                          {step.prerequisites && step.prerequisites.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-400">
                              <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                              <span className="truncate">Prereq: {step.prerequisites.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stepper Footer View Mode Link */}
                <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center justify-between text-xs">
                  <span className="text-zinc-400 text-[11px]">Need expanded visual workflow?</span>
                  <button 
                    onClick={() => setActiveTab('stepper')}
                    className="text-white hover:text-zinc-300 font-medium flex items-center gap-1 text-xs"
                  >
                    <span>Full Screen Stepper</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* System Architecture Specifications */}
              <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-semibold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-white" />
                    <span>System Specifications</span>
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                    AUDITED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-zinc-400 text-[11px] block">Full Stack Core</span>
                    <span className="font-semibold text-white mt-1 block">Next.js + Node + Mongo</span>
                    <span className="text-[10px] font-mono text-zinc-400">REST API /api/tutor</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-zinc-400 text-[11px] block">Retrieval Engine</span>
                    <span className="font-semibold text-white mt-1 block">Dense 384d + Sparse</span>
                    <span className="text-[10px] font-mono text-zinc-400">Deterministic RAG</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-zinc-400 text-[11px] block">Milestone Progress</span>
                    <span className="font-semibold text-white mt-1 block">50%+ Validated</span>
                    <span className="text-[10px] font-mono text-zinc-400">&gt;45% Rule Cleared</span>
                  </div>
                  <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-zinc-400 text-[11px] block">Design Language</span>
                    <span className="font-semibold text-white mt-1 block">Monochrome Enterprise</span>
                    <span className="text-[10px] font-mono text-zinc-400">Obsidian #09090b</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                  <span>FirstRicoZ Innovation Hub</span>
                  <a 
                    href="https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor"
                    target="_blank" 
                    rel="noreferrer"
                    className="text-white hover:text-zinc-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>View Repository</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DEDICATED FULL INTERACTIVE SOP STEPPER                             */}
        {/* ========================================================================= */}
        {activeTab === 'stepper' && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Stepper Banner */}
            <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                    ACTIVE PROCEDURE
                  </span>
                  <span className="text-xs text-zinc-400">Sequential Execution Standard</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-white">{currentSopTitle}</h2>
                <p className="text-xs text-zinc-400 max-w-2xl">
                  Follow each prerequisite step in order. Evidence standards dictate that no procedure step can be bypassed or marked complete without functional execution.
                </p>
              </div>

              {/* Progress Summary Card */}
              <div className="flex items-center gap-4 bg-[#09090b] border border-[#27272a] p-4 rounded-xl shrink-0">
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="h-14 w-14 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#27272a]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-white transition-all duration-500 ease-out"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono font-bold text-white">{progressPercent}%</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Execution Completion</div>
                  <div className="text-xs text-zinc-400 mt-0.5 font-mono">{completedCount} of {activeSteps.length} Steps Finished</div>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={resetAllSteps} 
                      className="text-[11px] text-zinc-400 hover:text-white transition-colors"
                    >
                      Reset All
                    </button>
                    <span className="text-zinc-600">·</span>
                    <button 
                      onClick={completeAllSteps} 
                      className="text-[11px] text-white hover:underline transition-colors"
                    >
                      Mark All Executed
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid grid-cols-1 gap-4">
              {activeSteps.map((step, sIdx) => (
                <div 
                  key={sIdx}
                  onClick={() => toggleStep(sIdx)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    step.isCompleted 
                      ? 'bg-[#121215] border-white/40 shadow-sm' 
                      : 'bg-[#09090b] border-[#27272a] hover:border-zinc-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {step.isCompleted ? (
                        <div className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center font-bold">
                          <Check className="h-4 w-4 text-black" />
                        </div>
                      ) : (
                        <div className="h-7 w-7 rounded-full border border-zinc-600 flex items-center justify-center text-xs font-mono text-zinc-400">
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                            Phase Step 0{step.stepNumber}
                          </span>
                          {step.isCompleted ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-black font-semibold">
                              VERIFIED COMPLETE
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#18181b] text-zinc-400 border border-[#27272a]">
                              ACTION REQUIRED
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 font-mono">
                          {step.isCompleted ? 'Gate Signed Off' : 'Pending Verification'}
                        </span>
                      </div>

                      <p className={`text-sm leading-relaxed ${step.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-100'}`}>
                        {step.instruction}
                      </p>

                      {step.prerequisites && step.prerequisites.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400 bg-[#18181b] p-2.5 rounded-lg border border-[#27272a]">
                          <Lock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                          <span className="font-medium text-zinc-300">Governance Prerequisite:</span>
                          <span className="text-zinc-400">{step.prerequisites.join(' & ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stepper Completion Celebration Banner */}
            {activeSteps.length > 0 && activeSteps.every(s => s.isCompleted) && (
              <div className="bg-[#121215] border border-white p-6 rounded-xl text-center space-y-2">
                <div className="inline-flex h-12 w-12 rounded-full bg-white text-black items-center justify-center mb-1">
                  <CheckCircle2 className="h-6 w-6 text-black" />
                </div>
                <h3 className="text-base font-bold text-white">Full Procedure Execution Verified</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  All sequential gates and clauses have been executed in strict adherence to company governance and technical standards.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveTab('tutor')}
                    className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors"
                  >
                    Return to Tutor
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: KNOWLEDGE BASE EXPLORER (NOTION / DRIVE / CONFLUENCE)              */}
        {/* ========================================================================= */}
        {activeTab === 'knowledge' && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Search and Category Filter Toolbar */}
            <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Notion, Google Drive, or Confluence documents..."
                  className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto text-xs">
                <Filter className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                      selectedCategory === cat 
                        ? 'bg-white text-black font-semibold' 
                        : 'bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Split View: Document Master List + Active Document Preview Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              
              {/* Document List */}
              <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedDoc?.id === doc.id 
                        ? 'bg-[#18181b] border-white shadow-md' 
                        : 'bg-[#121215] border-[#27272a] hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#27272a] text-zinc-300 uppercase">
                        {doc.sourcePlatform.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">v{doc.version}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-white tracking-tight">{doc.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{doc.content}</p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#27272a] text-[11px] text-zinc-500">
                      <span>{doc.department}</span>
                      <span className="text-white hover:underline flex items-center gap-1">
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}

                {filteredDocs.length === 0 && (
                  <div className="text-center py-12 text-zinc-500 text-xs bg-[#121215] border border-[#27272a] rounded-xl">
                    <p>No organizational documents match your search criteria.</p>
                  </div>
                )}
              </div>

              {/* Document Details Drawer */}
              <div className="lg:col-span-7 bg-[#121215] border border-[#27272a] rounded-xl p-6 flex flex-col justify-between">
                {selectedDoc ? (
                  <div className="space-y-5">
                    {/* Drawer Header */}
                    <div className="border-b border-[#27272a] pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                          SOURCE: {selectedDoc.sourcePlatform.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(selectedDoc.id, selectedDoc.content)}
                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181b] border border-[#27272a] transition-colors"
                          >
                            {copiedDocId === selectedDoc.id ? (
                              <>
                                <Check className="h-3 w-3 text-white" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Text</span>
                              </>
                            )}
                          </button>
                          <a
                            href={selectedDoc.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-black bg-white hover:bg-zinc-200 px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white tracking-tight">{selectedDoc.title}</h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-zinc-400">
                        <div>
                          <span className="block text-zinc-500">Category</span>
                          <span className="text-zinc-200">{selectedDoc.category}</span>
                        </div>
                        <div>
                          <span className="block text-zinc-500">Department</span>
                          <span className="text-zinc-200">{selectedDoc.department}</span>
                        </div>
                        <div>
                          <span className="block text-zinc-500">Effective Date</span>
                          <span className="text-zinc-200">{selectedDoc.effectiveDate}</span>
                        </div>
                        <div>
                          <span className="block text-zinc-500">Version</span>
                          <span className="text-zinc-200 font-mono">v{selectedDoc.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                        Authorized Operational Text & Clauses
                      </h4>
                      <div className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-[320px] overflow-y-auto">
                        {selectedDoc.content}
                      </div>
                    </div>

                    {/* Tag Cloud */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                        Indexed Tags & Vectors
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.tags.map((tag, tIdx) => (
                          <span 
                            key={tIdx}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-[#18181b] border border-[#27272a] text-zinc-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ask Tutor About this Doc Action */}
                    <div className="pt-4 border-t border-[#27272a] flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Want to generate interactive execution steps?</span>
                      <button
                        onClick={() => {
                          setActiveTab('tutor');
                          handleSend(`Extract sequential execution steps for ${selectedDoc.title}`);
                        }}
                        className="px-3.5 py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-black" />
                        <span>Query Document in Tutor</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-20 text-zinc-500 text-xs">
                    <p>Select a document from the left list to review clauses and metadata.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: COMPLIANCE MONITOR & AUDIT VERIFICATION                           */}
        {/* ========================================================================= */}
        {activeTab === 'compliance' && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Compliance Banner */}
            <div className="bg-[#121215] border border-[#27272a] rounded-xl p-6 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-white" />
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Governance & Conflict Resolution Engine
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">Active Policy Supersedence & Version Clashes</h2>
              <p className="text-xs text-zinc-400 max-w-2xl">
                Continuous reconciliation ensures that legacy instructions (e.g. superseded database requirements or deprecated gate checklists) are automatically flagged before execution.
              </p>
            </div>

            {/* Conflict Audits Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Conflict Case 1 */}
              <div className="bg-[#121215] border border-zinc-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 font-semibold">
                    STATUS: RECONCILED
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">SEVERITY: MEDIUM</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">Engineering Database Mandate (SOP v1.0 vs v2.0)</h3>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    Prior SOP v1.0 permitted PostgreSQL or MongoDB depending on project scope. Revised SOP v2.0 strictly mandates MongoDB with Node.js + Express.js across all new full-stack builds.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Superseded Instruction (Deprecated)</span>
                    <span className="text-zinc-400 line-through">Permitted relational PostgreSQL schemas for intern projects</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#09090b] border border-white/40">
                    <span className="text-[10px] font-mono text-white block uppercase font-bold">Active Mandatory Standard (Enforced)</span>
                    <span className="text-white font-medium">Next.js + Node.js + Express.js + MongoDB primary stack</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                  <span>Authorized by: Principal Architect</span>
                  <span className="text-emerald-400 font-mono">Policy v2.0 Active</span>
                </div>
              </div>

              {/* Conflict Case 2 */}
              <div className="bg-[#121215] border border-zinc-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/20 font-semibold">
                    STATUS: ENFORCED
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">SEVERITY: HIGH</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white">Evidence Attachment Standard (Principle 3)</h3>
                  <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                    Under the 30-Day Product Execution Playbook, subjective or verbal declarations of task completion are rejected. Every gate sign-off requires verifiable GitHub commits, PR reviews, or test logs.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                    <span className="text-[10px] font-mono text-zinc-400 block uppercase">Superseded Instruction (Deprecated)</span>
                    <span className="text-zinc-400 line-through">Self-certified status update in standup chat without code links</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#09090b] border border-white/40">
                    <span className="text-[10px] font-mono text-white block uppercase font-bold">Active Mandatory Standard (Enforced)</span>
                    <span className="text-white font-medium">Verifiable artifact submission required for Gate G1 through G6</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-xs text-zinc-400">
                  <span>Authorized by: Chief Operating Officer</span>
                  <span className="text-emerald-400 font-mono">Principle 3 Active</span>
                </div>
              </div>

            </div>

            {/* Continuous Verification Status */}
            <div className="bg-[#121215] border border-[#27272a] rounded-xl p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-zinc-200 font-mono">All 5 Organizational Documents Synchronized Across Sources</span>
              </div>
              <span className="text-zinc-400 font-mono">Last Ingestion Check: Today at 19:45 IST</span>
            </div>

          </div>
        )}

      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">FIRSTRICOZ PRIVATE LIMITED</span>
          <span>·</span>
          <span>Internal Knowledge & SOP Interactive Tutor</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>Obsidian Monochrome Architecture</span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">Zero-Layout Shift Certified</span>
        </div>
      </footer>

    </div>
  );
}
