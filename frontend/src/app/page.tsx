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
  Moon,
  Clock,
  Activity,
  LogIn,
  LogOut,
  UserPlus,
  PlusCircle,
  CheckSquare
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
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [viewMode, setViewMode] = useState<'standard' | 'boards'>('standard');

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
    // Authentication State
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; department: string } | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', department: 'Engineering', role: 'employee' as const });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // New Document Upload State (Allow user to enter their own live operational data)
  const [showDocModal, setShowDocModal] = useState<boolean>(false);
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Engineering',
    department: 'Technology',
    sourcePlatform: 'custom_upload' as const,
    sourceUrl: 'https://internal.ricoz.in/docs/custom-sop',
    version: '1.0',
    content: ''
  });
  const [docLoading, setDocLoading] = useState<boolean>(false);
  const [docError, setDocError] = useState<string | null>(null);

  // Step Exception / Feedback State
  const [stepNotes, setStepNotes] = useState<Record<number, string>>({});
  const [activeNoteStep, setActiveNoteStep] = useState<number | null>(null);
  const [tempNoteText, setTempNoteText] = useState<string>('');

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

  // Verify session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('ricoz_auth_token');
    if (savedToken) {
      setAuthToken(savedToken);
      fetch('/api/auth', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          localStorage.removeItem('ricoz_auth_token');
        }
      })
      .catch(() => {});
    }

    // Load saved step notes from localStorage
    const savedNotes = localStorage.getItem('ricoz_step_notes');
    if (savedNotes) {
      try { setStepNotes(JSON.parse(savedNotes)); } catch {}
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          ...authForm
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.error || 'Authentication failed');
        setAuthLoading(false);
        return;
      }

      setAuthToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('ricoz_auth_token', data.token);
      setShowAuthModal(false);
      setAuthForm({ name: '', email: '', password: '', department: 'Engineering', role: 'employee' });
    } catch {
      setAuthError('Connection error during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthToken('');
    localStorage.removeItem('ricoz_auth_token');
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setDocError(null);
    setDocLoading(true);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(docForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setDocError(data.error || 'Failed to ingest document');
        setDocLoading(false);
        return;
      }

      // Add to live docs list and select it
      setDocs(prev => [data.document, ...prev]);
      setSelectedDoc(data.document);
      setShowDocModal(false);
      setDocForm({
        title: '',
        category: 'Engineering',
        department: currentUser.department || 'Technology',
        sourcePlatform: 'custom_upload',
        sourceUrl: 'https://internal.ricoz.in/docs/custom-sop',
        version: '1.0',
        content: ''
      });
      setActiveTab('knowledge');
    } catch {
      setDocError('Error uploading document to RAG engine.');
    } finally {
      setDocLoading(false);
    }
  };

  const saveStepNote = (stepNum: number) => {
    const updated = { ...stepNotes, [stepNum]: tempNoteText };
    setStepNotes(updated);
    localStorage.setItem('ricoz_step_notes', JSON.stringify(updated));
    setActiveNoteStep(null);
    setTempNoteText('');
  };

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
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-200 antialiased ${theme === 'dark' ? 'dark' : ''}`}
      style={{ background: 'var(--page)', color: 'var(--ink)' }}
    >
      
      {/* Policy Discrepancy & Conflict Alert Banner */}
      {activeConflict && (
        <div 
          className="border-b px-4 py-2.5 flex items-center justify-between transition-all"
          style={{ background: 'var(--warn-bg)', borderColor: 'var(--line-strong)' }}
        >
          <div className="flex items-center gap-3 text-xs max-w-5xl">
            <div 
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium shrink-0 text-xs shadow-sm"
              style={{ background: 'var(--card)', color: 'var(--warn)', border: '1px solid var(--line-strong)' }}
            >
              <AlertTriangle className="h-3.5 w-3.5" style={{ color: 'var(--warn)' }} />
              <span className="font-editorial text-sm font-semibold tracking-wide">{activeConflict.title}</span>
            </div>
            <p className="truncate text-xs" style={{ color: 'var(--ink-2)' }}>
              {activeConflict.description}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => setActiveTab('compliance')}
              className="text-xs font-medium underline underline-offset-2 flex items-center gap-1"
              style={{ color: 'var(--accent)' }}
            >
              <span>Review Audit</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => setActiveConflict(null)}
              className="p-1 rounded-md transition-colors hover:opacity-75"
              style={{ color: 'var(--ink-3)' }}
              title="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Enterprise Editorial Header */}
      <header 
        className="border-b backdrop-blur sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between transition-colors shadow-xs"
        style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center font-bold text-base shadow-sm transition-transform hover:scale-105"
            style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
          >
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-editorial text-xl font-medium tracking-tight" style={{ color: 'var(--ink)' }}>
                RicoZ SOP Interactive Tutor
              </h1>
              <span 
                className="text-[11px] px-2 py-0.5 rounded-full font-mono-code border"
                style={{ background: 'var(--pill)', borderColor: 'var(--line-strong)', color: 'var(--ink-2)' }}
              >
                CATALOG #86
              </span>
              <span 
                className="text-[11px] px-2 py-0.5 rounded-full font-mono-code border"
                style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', color: 'var(--accent)' }}
              >
                v2.0 PRODUCTION
              </span>
            </div>
            <p className="text-xs hidden sm:block mt-0.5" style={{ color: 'var(--ink-2)' }}>
              Operational Procedure Execution, Multi-Source RAG &amp; Conflict Governance Engine
            </p>
          </div>
        </div>

        {/* View Switchers (Editorial Pill Segmented Control) */}
        <div 
          className="flex items-center border rounded-full p-1"
          style={{ background: 'var(--pill)', borderColor: 'var(--line)' }}
        >
          <button
            onClick={() => setActiveTab('tutor')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
            style={{
              background: activeTab === 'tutor' ? 'var(--card)' : 'transparent',
              color: activeTab === 'tutor' ? 'var(--ink)' : 'var(--ink-2)',
              boxShadow: activeTab === 'tutor' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              border: activeTab === 'tutor' ? '1px solid var(--line-strong)' : '1px solid transparent'
            }}
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: activeTab === 'tutor' ? 'var(--accent)' : 'inherit' }} />
            <span>Tutor Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('stepper')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
            style={{
              background: activeTab === 'stepper' ? 'var(--card)' : 'transparent',
              color: activeTab === 'stepper' ? 'var(--ink)' : 'var(--ink-2)',
              boxShadow: activeTab === 'stepper' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              border: activeTab === 'stepper' ? '1px solid var(--line-strong)' : '1px solid transparent'
            }}
          >
            <Layers className="h-3.5 w-3.5" style={{ color: activeTab === 'stepper' ? 'var(--accent)' : 'inherit' }} />
            <span>SOP Stepper</span>
            <span 
              className="text-[10px] px-1.5 py-0.2 rounded-full font-mono-code"
              style={{ background: 'var(--pill)', color: 'var(--ink)' }}
            >
              {completedCount}/{activeSteps.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
            style={{
              background: activeTab === 'knowledge' ? 'var(--card)' : 'transparent',
              color: activeTab === 'knowledge' ? 'var(--ink)' : 'var(--ink-2)',
              boxShadow: activeTab === 'knowledge' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              border: activeTab === 'knowledge' ? '1px solid var(--line-strong)' : '1px solid transparent'
            }}
          >
            <BookOpen className="h-3.5 w-3.5" style={{ color: activeTab === 'knowledge' ? 'var(--accent)' : 'inherit' }} />
            <span>Knowledge Base</span>
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
            style={{
              background: activeTab === 'compliance' ? 'var(--card)' : 'transparent',
              color: activeTab === 'compliance' ? 'var(--ink)' : 'var(--ink-2)',
              boxShadow: activeTab === 'compliance' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              border: activeTab === 'compliance' ? '1px solid var(--line-strong)' : '1px solid transparent'
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: activeTab === 'compliance' ? 'var(--accent)' : 'inherit' }} />
            <span>Compliance Monitor</span>
          </button>
        </div>

        {/* Theme Toggle & Status Indicators */}
        <div className="flex items-center gap-3">
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

          {/* User Auth Status / Sign In Pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border shadow-xs" style={{ background: 'var(--card)', borderColor: 'var(--line-strong)' }}>
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold font-mono-code" style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-medium leading-none" style={{ color: 'var(--ink)' }}>{currentUser.name}</span>
                <span className="text-[9px] font-mono-code leading-none mt-0.5" style={{ color: 'var(--ink-2)' }}>{currentUser.role}</span>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1 rounded-full hover:opacity-75 transition-opacity"
                style={{ color: 'var(--ink-3)' }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setAuthMode('signin'); }}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 shadow-xs transition-transform hover:scale-102 cursor-pointer"
              style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
            >
              <LogIn className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
              <span>Sign In / Sign Up</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="px-3 py-1.5 rounded-full border text-xs flex items-center gap-2 transition-all shadow-xs hover:border-zinc-400"
            style={{
              background: 'var(--card)',
              borderColor: 'var(--line-strong)',
              color: 'var(--ink)'
            }}
            title={`Switch to ${theme === 'dark' ? 'Warm Paper & Ink (Light)' : 'Obsidian Studio (Dark)'} Theme`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                <span className="hidden md:inline font-mono-code text-[11px]">Light (Paper)</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
                <span className="hidden md:inline font-mono-code text-[11px]">Dark (Obsidian)</span>
              </>
            )}
          </button>

          <div className="hidden xl:flex items-center gap-3 text-xs">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-xs"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
            >
              <span className="h-2 w-2 rounded-full inline-block animate-pulse" style={{ background: 'var(--ok)' }} />
              <span className="font-mono-code text-[11px]">RAG Indexed: 9 Docs</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--ink-3)' }}>
              <Database className="h-3.5 w-3.5" />
              <span className="text-[11px]">Notion · Drive · Confluence</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header Context Bar */}
      <div 
        className="border-b px-6 py-2 flex items-center justify-between text-xs transition-colors"
        style={{ background: 'var(--pill)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
      >
        <div className="flex items-center gap-2">
          <Compass className="h-3.5 w-3.5" style={{ color: 'var(--accent)' }} />
          <span>Active Objective:</span>
          <span className="font-medium" style={{ color: 'var(--ink)' }}>
            Independent Milestone Progress &gt;45% &amp; SOP Execution
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono-code text-[11px]">
          <span>ENGINE: Dense 384d Cosine + BM25 Sparse</span>
          <span style={{ color: 'var(--line-strong)' }}>|</span>
          <span style={{ color: 'var(--ink)' }}>FIRSTRICOZ GOVERNANCE</span>
        </div>
      </div>

      {/* Main Multi-Tab View Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col">

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
                        <div className="h-full" style={{ width: `${progressPercent}%`, background: 'var(--accent)' }} />
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
          <>

        {/* ========================================================================= */}
        {/* TAB 1: TUTOR CHAT & COMPANION STEPPER VIEW                                */}
        {/* ========================================================================= */}
        {activeTab === 'tutor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* Left Column: Conversational Tutor */}
            <section 
              className="lg:col-span-7 flex flex-col border rounded-2xl overflow-hidden transition-all shadow-sm"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
            >
              
              {/* Tutor Header */}
              <div 
                className="p-4 border-b flex items-center justify-between"
                style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-lg flex items-center justify-center font-bold"
                    style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-editorial font-semibold tracking-wide" style={{ color: 'var(--ink)' }}>
                      Grounded SOP Tutor
                    </h2>
                    <p className="text-[11px]" style={{ color: 'var(--ink-2)' }}>
                      Parent-child document chunks with deterministic step extraction
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[11px] font-mono-code px-2.5 py-0.5 rounded-full border"
                    style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', color: 'var(--ink-2)' }}
                  >
                    Live Session
                  </span>
                </div>
              </div>

              {/* Chat Feed */}
              <div 
                className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[560px] min-h-[420px]"
                style={{ background: 'var(--canvas)' }}
              >
                {messages.map((m) => (
                  <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.sender === 'tutor' && (
                      <div 
                        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold shadow-xs"
                        style={{ background: 'var(--card)', border: '1px solid var(--line-strong)', color: 'var(--accent)' }}
                      >
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div 
                      className="max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed border transition-all"
                      style={{
                        background: m.sender === 'user' ? 'var(--pill)' : 'var(--card)',
                        borderColor: m.sender === 'user' ? 'var(--line-strong)' : 'var(--line)',
                        color: 'var(--ink)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b" style={{ borderColor: 'var(--line)' }}>
                        <span className="text-[10px] font-mono-code uppercase tracking-wider font-semibold" style={{ color: 'var(--ink-2)' }}>
                          {m.sender === 'user' ? 'Operator' : 'RicoZ SOP Tutor'}
                        </span>
                        <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>
                          {m.timestamp}
                        </span>
                      </div>

                      <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                        {m.text}
                      </div>

                      {/* Verified Citation Badges */}
                      {m.citations && m.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: 'var(--line)' }}>
                          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--ink-2)' }}>
                            <div className="flex items-center gap-1.5 font-medium">
                              <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'var(--ok)' }} />
                              <span>Verified Citations ({m.citations.length})</span>
                            </div>
                            {m.relevanceScore && (
                              <span className="font-mono-code text-[10px]" style={{ color: 'var(--ink-3)' }}>
                                Match Score: {(m.relevanceScore * 100).toFixed(1)}%
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-1.5">
                            {m.citations.map((c, cIdx) => (
                              <div 
                                key={cIdx} 
                                className="flex items-center justify-between p-2 rounded-xl border text-xs transition-colors hover:border-zinc-400"
                                style={{ background: 'var(--pill)', borderColor: 'var(--line)' }}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <BookOpen className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                                  <span className="font-medium truncate" style={{ color: 'var(--ink)' }}>{c.documentTitle}</span>
                                  <span 
                                    className="text-[10px] px-1.5 py-0.2 rounded font-mono-code"
                                    style={{ background: 'var(--card)', color: 'var(--ink-2)' }}
                                  >
                                    {c.sourcePlatform.toUpperCase()}
                                  </span>
                                </div>
                                <a 
                                  href={c.sourceUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="p-1 ml-2 shrink-0 transition-colors hover:opacity-75"
                                  style={{ color: 'var(--accent)' }}
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
                  <div className="flex gap-3 items-center py-2 text-xs" style={{ color: 'var(--ink-2)' }}>
                    <div 
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 animate-pulse"
                      style={{ background: 'var(--card)', border: '1px solid var(--line-strong)' }}
                    >
                      <Bot className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--accent)' }} />
                      <span>Synthesizing authorized SOP procedure & citations...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Preset Query Chips */}
              <div 
                className="px-4 py-2.5 border-t flex items-center gap-2 overflow-x-auto text-xs"
                style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}
              >
                <span className="shrink-0 text-[11px] font-mono-code" style={{ color: 'var(--ink-3)' }}>SUGGESTED:</span>
                {PRESET_QUERIES.map((pq, pqIdx) => (
                  <button
                    key={pqIdx}
                    onClick={() => handleSend(pq.query)}
                    className="whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium transition-all hover:scale-102"
                    style={{
                      background: 'var(--card)',
                      borderColor: 'var(--line-strong)',
                      color: 'var(--ink)'
                    }}
                  >
                    {pq.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div 
                className="p-4 border-t flex items-center gap-3"
                style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask an operational procedure question (e.g., Gate G3, MongoDB stack, attendance SOP)..."
                  className="flex-1 border rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none"
                  style={{
                    background: 'var(--canvas)',
                    borderColor: 'var(--line-strong)',
                    color: 'var(--ink)'
                  }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !input.trim()}
                  className="rounded-xl px-5 py-2.5 font-medium text-xs flex items-center gap-2 transition-all shadow-sm hover:opacity-95 disabled:opacity-40 cursor-pointer"
                  style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                >
                  <span>Query</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </section>

            {/* Right Column: Mini Interactive Stepper Preview & Architecture */}
            <section className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Stepper Card */}
              <div 
                className="border rounded-2xl p-5 flex flex-col transition-all shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--line)' }}>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <div>
                      <h3 className="font-editorial text-sm font-semibold tracking-wide" style={{ color: 'var(--ink)' }}>
                        Interactive SOP Stepper
                      </h3>
                      <p className="text-[11px] truncate max-w-[200px]" style={{ color: 'var(--ink-2)' }}>{currentSopTitle}</p>
                    </div>
                  </div>
                  
                  {/* Circular Completion Ring */}
                  <div className="flex items-center gap-2">
                    <div className="relative h-9 w-9 flex items-center justify-center">
                      <svg className="h-9 w-9 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          style={{ color: 'var(--line-strong)' }}
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="transition-all duration-500 ease-out"
                          style={{ color: 'var(--accent)' }}
                          strokeDasharray={`${progressPercent}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-mono-code font-bold" style={{ color: 'var(--ink)' }}>{progressPercent}%</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3 w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--line)' }}>
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ width: `${progressPercent}%`, background: 'var(--accent)' }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 pb-1 text-xs">
                  <span className="text-[11px] font-mono-code font-medium" style={{ color: 'var(--ink-2)' }}>
                    {completedCount} OF {activeSteps.length} STEPS VERIFIED
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={resetAllSteps} 
                      className="text-[11px] flex items-center gap-1 transition-colors hover:opacity-75"
                      style={{ color: 'var(--ink-2)' }}
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset</span>
                    </button>
                    <button 
                      onClick={completeAllSteps} 
                      className="text-[11px] font-medium underline transition-colors"
                      style={{ color: 'var(--accent)' }}
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
                      className="p-3 rounded-xl border cursor-pointer transition-all hover:scale-101"
                      style={{
                        background: step.isCompleted ? 'var(--pill)' : 'var(--canvas)',
                        borderColor: step.isCompleted ? 'var(--ok)' : 'var(--line)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {step.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--ok)' }} />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--ink-3)' }} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono-code font-semibold" style={{ color: 'var(--ink)' }}>
                              STEP {step.stepNumber}
                            </span>
                            {step.isCompleted ? (
                              <span 
                                className="text-[10px] px-2 py-0.2 rounded-full font-mono-code font-semibold"
                                style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}
                              >
                                EXECUTED
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>PENDING</span>
                            )}
                          </div>
                          <p 
                            className={`text-xs mt-1 leading-relaxed ${step.isCompleted ? 'line-through' : ''}`}
                            style={{ color: step.isCompleted ? 'var(--ink-3)' : 'var(--ink)' }}
                          >
                            {step.instruction}
                          </p>
                          {step.prerequisites && step.prerequisites.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--ink-2)' }}>
                              <Lock className="h-3 w-3 shrink-0" style={{ color: 'var(--ink-3)' }} />
                              <span className="truncate">Prereq: {step.prerequisites.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stepper Footer View Mode Link */}
                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-[11px]" style={{ color: 'var(--ink-2)' }}>Need expanded visual workflow?</span>
                  <button 
                    onClick={() => setActiveTab('stepper')}
                    className="font-medium flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Full Screen Stepper</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* System Architecture Specifications */}
              <div 
                className="border rounded-2xl p-5 space-y-4 transition-all shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
              >
                <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
                  <h3 className="font-editorial text-sm font-semibold tracking-wide flex items-center gap-2" style={{ color: 'var(--ink)' }}>
                    <Terminal className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                    <span>System Specifications</span>
                  </h3>
                  <span 
                    className="text-[10px] font-mono-code px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                  >
                    AUDITED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-2)' }}>Full Stack Core</span>
                    <span className="font-semibold mt-1 block" style={{ color: 'var(--ink)' }}>Next.js + Node + Mongo</span>
                    <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>REST API /api/tutor</span>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-2)' }}>Retrieval Engine</span>
                    <span className="font-semibold mt-1 block" style={{ color: 'var(--ink)' }}>Dense 384d + Sparse</span>
                    <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>Deterministic RAG</span>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-2)' }}>Milestone Progress</span>
                    <span className="font-semibold mt-1 block" style={{ color: 'var(--ink)' }}>95.6% Validated</span>
                    <span className="text-[10px] font-mono-code" style={{ color: 'var(--ok)' }}>Gate G3 Cleared</span>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[11px] block" style={{ color: 'var(--ink-2)' }}>Design Language</span>
                    <span className="font-semibold mt-1 block" style={{ color: 'var(--ink)' }}>Editorial TechPulse</span>
                    <span className="text-[10px] font-mono-code" style={{ color: 'var(--accent)' }}>Warm Ink &amp; Studio</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                  <span>FirstRicoZ Innovation Hub</span>
                  <a 
                    href="https://github.com/Shashankcodelover/ricoz-sop-interactive-tutor"
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1 font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent)' }}
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
            <div 
              className="border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[11px] font-mono-code px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                  >
                    ACTIVE PROCEDURE
                  </span>
                  <span className="text-xs" style={{ color: 'var(--ink-2)' }}>Sequential Execution Standard</span>
                </div>
                <h2 className="font-editorial text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                  {currentSopTitle}
                </h2>
                <p className="text-xs max-w-2xl leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                  Follow each prerequisite step in order. Evidence standards dictate that no procedure step can be bypassed or marked complete without functional execution.
                </p>
              </div>

              {/* Progress Summary Card */}
              <div 
                className="flex items-center gap-4 border p-4 rounded-2xl shrink-0"
                style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)' }}
              >
                <div className="relative h-14 w-14 flex items-center justify-center">
                  <svg className="h-14 w-14 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      style={{ color: 'var(--line-strong)' }}
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="transition-all duration-500 ease-out"
                      style={{ color: 'var(--accent)' }}
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-mono-code font-bold" style={{ color: 'var(--ink)' }}>{progressPercent}%</span>
                </div>
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--ink)' }}>Execution Completion</div>
                  <div className="text-xs mt-0.5 font-mono-code" style={{ color: 'var(--ink-2)' }}>
                    {completedCount} of {activeSteps.length} Steps Finished
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={resetAllSteps} 
                      className="text-[11px] transition-colors hover:opacity-75"
                      style={{ color: 'var(--ink-2)' }}
                    >
                      Reset All
                    </button>
                    <span style={{ color: 'var(--line-strong)' }}>·</span>
                    <button 
                      onClick={completeAllSteps} 
                      className="text-[11px] font-medium underline transition-colors"
                      style={{ color: 'var(--accent)' }}
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
                  className="p-5 rounded-2xl border transition-all cursor-pointer shadow-xs hover:scale-101"
                  style={{
                    background: step.isCompleted ? 'var(--pill)' : 'var(--card)',
                    borderColor: step.isCompleted ? 'var(--ok)' : 'var(--line)',
                    boxShadow: 'var(--shadow)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {step.isCompleted ? (
                        <div 
                          className="h-7 w-7 rounded-full flex items-center justify-center font-bold"
                          style={{ background: 'var(--ok)', color: '#FFFFFF' }}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                      ) : (
                        <div 
                          className="h-7 w-7 rounded-full border flex items-center justify-center text-xs font-mono-code font-semibold"
                          style={{ borderColor: 'var(--line-strong)', color: 'var(--ink-2)' }}
                        >
                          {step.stepNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--ink)' }}>
                            Phase Step 0{step.stepNumber}
                          </span>
                          {step.isCompleted ? (
                            <span 
                              className="text-[10px] px-2.5 py-0.5 rounded-full font-mono-code font-semibold"
                              style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}
                            >
                              VERIFIED COMPLETE
                            </span>
                          ) : (
                            <span 
                              className="text-[10px] px-2.5 py-0.5 rounded-full font-mono-code border"
                              style={{ background: 'var(--canvas)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
                            >
                              ACTION REQUIRED
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono-code" style={{ color: 'var(--ink-3)' }}>
                          {step.isCompleted ? 'Gate Signed Off' : 'Pending Verification'}
                        </span>
                      </div>

                      <p 
                        className={`text-sm leading-relaxed ${step.isCompleted ? 'line-through' : ''}`}
                        style={{ color: step.isCompleted ? 'var(--ink-2)' : 'var(--ink)' }}
                      >
                        {step.instruction}
                      </p>

                      {/* Operator Note / Exception Log */}
                      {stepNotes[step.stepNumber] && (
                        <div className="mt-2.5 p-2.5 rounded-xl border text-xs" style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)' }}>
                          <span className="font-mono-code font-semibold text-[10px] block" style={{ color: 'var(--accent)' }}>OPERATOR LOG / EXCEPTION:</span>
                          <span className="mt-0.5 block" style={{ color: 'var(--ink)' }}>{stepNotes[step.stepNumber]}</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-3">
                        {activeNoteStep === step.stepNumber ? (
                          <div className="flex-1 flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={tempNoteText}
                              onChange={(e) => setTempNoteText(e.target.value)}
                              placeholder="Record real execution note or blocker..."
                              className="flex-1 border rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                              style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                            />
                            <button
                              onClick={() => saveStepNote(step.stepNumber)}
                              className="px-3 py-1 rounded-lg text-xs font-semibold shadow-xs"
                              style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                            >
                              Save Log
                            </button>
                            <button
                              onClick={() => setActiveNoteStep(null)}
                              className="px-2 py-1 text-xs"
                              style={{ color: 'var(--ink-3)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveNoteStep(step.stepNumber);
                              setTempNoteText(stepNotes[step.stepNumber] || '');
                            }}
                            className="text-[11px] font-mono-code flex items-center gap-1 hover:underline cursor-pointer"
                            style={{ color: 'var(--accent)' }}
                          >
                            <span>+ {stepNotes[step.stepNumber] ? 'Edit Step Log' : 'Add Execution Note / Blocker'}</span>
                          </button>
                        )}
                      </div>

                      {step.prerequisites && step.prerequisites.length > 0 && (
                        <div 
                          className="mt-3 flex items-center gap-2 text-xs p-2.5 rounded-xl border"
                          style={{ background: 'var(--canvas)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
                        >
                          <Lock className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                          <span className="font-medium" style={{ color: 'var(--ink)' }}>Governance Prerequisite:</span>
                          <span>{step.prerequisites.join(' & ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stepper Completion Celebration Banner */}
            {activeSteps.length > 0 && activeSteps.every(s => s.isCompleted) && (
              <div 
                className="border p-6 rounded-2xl text-center space-y-2 shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--ok)', boxShadow: 'var(--shadow)' }}
              >
                <div 
                  className="inline-flex h-12 w-12 rounded-full items-center justify-center mb-1"
                  style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}
                >
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-editorial text-xl font-bold" style={{ color: 'var(--ink)' }}>
                  Full Procedure Execution Verified
                </h3>
                <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--ink-2)' }}>
                  All sequential gates and clauses have been executed in strict adherence to company governance and technical standards.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => setActiveTab('tutor')}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs transition-opacity hover:opacity-90"
                    style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
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
            <div 
              className="border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
            >
              <div className="relative flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3.5 top-3" style={{ color: 'var(--ink-3)' }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Notion, Google Drive, or Confluence documents..."
                  className="w-full border rounded-xl pl-10 pr-4 py-2 text-xs transition-colors focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDocModal(true)}
                  className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer shrink-0"
                  style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>+ Ingest Custom SOP</span>
                </button>

                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--ink-3)' }} />
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border font-medium"
                    style={{
                      background: selectedCategory === cat ? 'var(--accent)' : 'var(--pill)',
                      borderColor: selectedCategory === cat ? 'var(--accent)' : 'var(--line)',
                      color: selectedCategory === cat ? 'var(--on-accent)' : 'var(--ink)'
                    }}
                  >
                    {cat}
                  </button>
                ))}
                </div>
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
                    className="p-4 rounded-2xl border cursor-pointer transition-all shadow-xs hover:scale-101"
                    style={{
                      background: selectedDoc?.id === doc.id ? 'var(--pill)' : 'var(--card)',
                      borderColor: selectedDoc?.id === doc.id ? 'var(--accent)' : 'var(--line)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span 
                        className="text-[10px] font-mono-code px-2 py-0.5 rounded-full border uppercase"
                        style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', color: 'var(--accent)' }}
                      >
                        {doc.sourcePlatform.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono-code" style={{ color: 'var(--ink-3)' }}>v{doc.version}</span>
                    </div>

                    <h4 className="font-editorial text-base font-semibold tracking-tight" style={{ color: 'var(--ink)' }}>
                      {doc.title}
                    </h4>
                    <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                      {doc.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: 'var(--line)', color: 'var(--ink-3)' }}>
                      <span>{doc.department}</span>
                      <span className="font-medium flex items-center gap-1 transition-colors hover:underline" style={{ color: 'var(--accent)' }}>
                        <span>Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                ))}

                {filteredDocs.length === 0 && (
                  <div 
                    className="text-center py-12 text-xs border rounded-2xl"
                    style={{ background: 'var(--card)', borderColor: 'var(--line)', color: 'var(--ink-3)' }}
                  >
                    <p>No organizational documents match your search criteria.</p>
                  </div>
                )}
              </div>

              {/* Document Details Drawer */}
              <div 
                className="lg:col-span-7 border rounded-2xl p-6 flex flex-col justify-between shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
              >
                {selectedDoc ? (
                  <div className="space-y-5">
                    {/* Drawer Header */}
                    <div className="border-b pb-4 space-y-2" style={{ borderColor: 'var(--line)' }}>
                      <div className="flex items-center justify-between">
                        <span 
                          className="text-[11px] font-mono-code px-2.5 py-0.5 rounded-full font-semibold"
                          style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}
                        >
                          SOURCE: {selectedDoc.sourcePlatform.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(selectedDoc.id, selectedDoc.content)}
                            className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors hover:border-zinc-400"
                            style={{ background: 'var(--pill)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                          >
                            {copiedDocId === selectedDoc.id ? (
                              <>
                                <Check className="h-3 w-3" style={{ color: 'var(--ok)' }} />
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
                            className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 transition-opacity hover:opacity-90 shadow-xs"
                            style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                          >
                            <span>Open URL</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      <h3 className="font-editorial text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                        {selectedDoc.title}
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px]">
                        <div>
                          <span className="block" style={{ color: 'var(--ink-3)' }}>Category</span>
                          <span className="font-medium" style={{ color: 'var(--ink)' }}>{selectedDoc.category}</span>
                        </div>
                        <div>
                          <span className="block" style={{ color: 'var(--ink-3)' }}>Department</span>
                          <span className="font-medium" style={{ color: 'var(--ink)' }}>{selectedDoc.department}</span>
                        </div>
                        <div>
                          <span className="block" style={{ color: 'var(--ink-3)' }}>Effective Date</span>
                          <span className="font-medium font-mono-code" style={{ color: 'var(--ink)' }}>{selectedDoc.effectiveDate}</span>
                        </div>
                        <div>
                          <span className="block" style={{ color: 'var(--ink-3)' }}>Version</span>
                          <span className="font-medium font-mono-code" style={{ color: 'var(--accent)' }}>v{selectedDoc.version}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 font-mono-code" style={{ color: 'var(--ink-2)' }}>
                        Authorized Operational Text &amp; Clauses
                      </h4>
                      <div 
                        className="border rounded-xl p-4 font-mono-code text-xs leading-relaxed whitespace-pre-wrap max-h-[320px] overflow-y-auto"
                        style={{ background: 'var(--canvas)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                      >
                        {selectedDoc.content}
                      </div>
                    </div>

                    {/* Tag Cloud */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 font-mono-code" style={{ color: 'var(--ink-2)' }}>
                        Indexed Tags &amp; Vectors
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.tags.map((tag, tIdx) => (
                          <span 
                            key={tIdx}
                            className="text-[11px] px-2.5 py-1 rounded-full border font-mono-code"
                            style={{ background: 'var(--pill)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Ask Tutor About this Doc Action */}
                    <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                      <span className="text-xs" style={{ color: 'var(--ink-2)' }}>Want to generate interactive execution steps?</span>
                      <button
                        onClick={() => {
                          setActiveTab('tutor');
                          handleSend(`Extract sequential execution steps for ${selectedDoc.title}`);
                        }}
                        className="px-4 py-2 rounded-full text-xs font-semibold transition-opacity hover:opacity-90 flex items-center gap-1.5 shadow-xs cursor-pointer"
                        style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Query Document in Tutor</span>
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="text-center py-20 text-xs" style={{ color: 'var(--ink-3)' }}>
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
            <div 
              className="border rounded-2xl p-6 space-y-2 shadow-sm"
              style={{ background: 'var(--card)', borderColor: 'var(--line)', boxShadow: 'var(--shadow)' }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-mono-code font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                  Governance &amp; Conflict Resolution Engine
                </span>
              </div>
              <h2 className="font-editorial text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                Active Policy Supersedence &amp; Version Clashes
              </h2>
              <p className="text-xs max-w-2xl leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                Continuous reconciliation ensures that legacy instructions (e.g. superseded database requirements or deprecated gate checklists) are automatically flagged before execution.
              </p>
            </div>

            {/* Conflict Audits Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Conflict Case 1 */}
              <div 
                className="border rounded-2xl p-5 space-y-4 shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono-code px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}
                  >
                    STATUS: RECONCILED
                  </span>
                  <span className="text-xs font-mono-code" style={{ color: 'var(--warn)' }}>SEVERITY: MEDIUM</span>
                </div>

                <div>
                  <h3 className="font-editorial text-lg font-bold" style={{ color: 'var(--ink)' }}>
                    Engineering Database Mandate (SOP v1.0 vs v2.0)
                  </h3>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                    Prior SOP v1.0 permitted PostgreSQL or MongoDB depending on project scope. Revised SOP v2.0 strictly mandates MongoDB with Node.js + Express.js across all new full-stack builds.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[10px] font-mono-code block uppercase font-medium" style={{ color: 'var(--ink-3)' }}>
                      Superseded Instruction (Deprecated)
                    </span>
                    <span className="line-through mt-0.5 block" style={{ color: 'var(--ink-3)' }}>
                      Permitted relational PostgreSQL schemas for intern projects
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--pill)', borderColor: 'var(--ok)' }}>
                    <span className="text-[10px] font-mono-code block uppercase font-bold" style={{ color: 'var(--ok)' }}>
                      Active Mandatory Standard (Enforced)
                    </span>
                    <span className="font-medium mt-0.5 block" style={{ color: 'var(--ink)' }}>
                      Next.js + Node.js + Express.js + MongoDB primary stack
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                  <span>Authorized by: Principal Architect</span>
                  <span className="font-mono-code font-semibold" style={{ color: 'var(--ok)' }}>Policy v2.0 Active</span>
                </div>
              </div>

              {/* Conflict Case 2 */}
              <div 
                className="border rounded-2xl p-5 space-y-4 shadow-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
              >
                <div className="flex items-center justify-between">
                  <span 
                    className="text-[10px] font-mono-code px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ background: 'var(--ok-bg)', color: 'var(--ok)' }}
                  >
                    STATUS: ENFORCED
                  </span>
                  <span className="text-xs font-mono-code" style={{ color: 'var(--clash)' }}>SEVERITY: HIGH</span>
                </div>

                <div>
                  <h3 className="font-editorial text-lg font-bold" style={{ color: 'var(--ink)' }}>
                    Evidence Attachment Standard (Principle 3)
                  </h3>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--ink-2)' }}>
                    Under the 30-Day Product Execution Playbook, subjective or verbal declarations of task completion are rejected. Every gate sign-off requires verifiable GitHub commits, PR reviews, or test logs.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--canvas)', borderColor: 'var(--line)' }}>
                    <span className="text-[10px] font-mono-code block uppercase font-medium" style={{ color: 'var(--ink-3)' }}>
                      Superseded Instruction (Deprecated)
                    </span>
                    <span className="line-through mt-0.5 block" style={{ color: 'var(--ink-3)' }}>
                      Self-certified status update in standup chat without code links
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: 'var(--pill)', borderColor: 'var(--ok)' }}>
                    <span className="text-[10px] font-mono-code block uppercase font-bold" style={{ color: 'var(--ok)' }}>
                      Active Mandatory Standard (Enforced)
                    </span>
                    <span className="font-medium mt-0.5 block" style={{ color: 'var(--ink)' }}>
                      Verifiable artifact submission required for Gate G1 through G6
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
                  <span>Authorized by: Chief Operating Officer</span>
                  <span className="font-mono-code font-semibold" style={{ color: 'var(--ok)' }}>Principle 3 Active</span>
                </div>
              </div>

            </div>

            {/* Continuous Verification Status */}
            <div 
              className="border rounded-2xl p-5 flex items-center justify-between text-xs shadow-xs"
              style={{ background: 'var(--card)', borderColor: 'var(--line)' }}
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full animate-pulse" style={{ background: 'var(--ok)' }} />
                <span className="font-mono-code font-medium" style={{ color: 'var(--ink)' }}>
                  All 9 Organizational Documents Synchronized Across Sources
                </span>
              </div>
              <span className="font-mono-code" style={{ color: 'var(--ink-2)' }}>Last Ingestion Check: Continuous Verified</span>
            </div>

          </div>
        )}

          </>
        )}
      </main>

      {/* Enterprise Editorial Footer */}
      <footer 
        className="border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 transition-colors"
        style={{ background: 'var(--canvas)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
      >
        <div className="flex items-center gap-2">
          <span className="font-editorial font-semibold text-sm" style={{ color: 'var(--ink)' }}>FIRSTRICOZ PRIVATE LIMITED</span>
          <span>·</span>
          <span>Internal Knowledge &amp; SOP Interactive Tutor</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono-code">
          <span>TechPulse Luxury Design Language</span>
          <span style={{ color: 'var(--line-strong)' }}>|</span>
          <span style={{ color: 'var(--ink)' }}>Zero-Layout Shift Certified</span>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: ENTERPRISE AUTHENTICATION (SIGN IN & SIGN UP)                   */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="w-full max-w-md border rounded-3xl p-6 shadow-2xl relative space-y-5"
            style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', boxShadow: 'var(--shadow)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-mono-code text-[11px] uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                  RicoZ Access Control
                </span>
                <h3 className="font-editorial text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                  {authMode === 'signin' ? 'Sign In to Workspace' : 'Create Enterprise Account'}
                </h3>
              </div>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="p-1 rounded-full hover:opacity-75 transition-opacity"
                style={{ color: 'var(--ink-3)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl border text-xs flex items-center gap-2" style={{ background: 'var(--clash-bg)', borderColor: 'var(--clash)', color: 'var(--clash)' }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    placeholder="e.g. Shashank J"
                    className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Work Email</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="name@ricoz.in or personal email"
                  className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Password</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
              </div>

              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Department</label>
                    <select
                      value={authForm.department}
                      onChange={(e) => setAuthForm({ ...authForm, department: e.target.value })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                    >
                      <option value="Technology">Technology</option>
                      <option value="Engineering">Engineering</option>
                      <option value="People & HR">People &amp; HR</option>
                      <option value="Finance">Finance</option>
                      <option value="Operations">Operations</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Role</label>
                    <select
                      value={authForm.role}
                      onChange={(e) => setAuthForm({ ...authForm, role: e.target.value as any })}
                      className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                      style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                    >
                      <option value="employee">Employee</option>
                      <option value="department_lead">Department Lead</option>
                      <option value="org_admin">Org Admin</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
              >
                {authLoading ? 'Verifying...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="text-center pt-2 border-t text-xs" style={{ borderColor: 'var(--line)', color: 'var(--ink-2)' }}>
              {authMode === 'signin' ? (
                <span>Need a new account? <button onClick={() => { setAuthMode('signup'); setAuthError(null); }} className="font-semibold underline" style={{ color: 'var(--accent)' }}>Sign up here</button></span>
              ) : (
                <span>Already registered? <button onClick={() => { setAuthMode('signin'); setAuthError(null); }} className="font-semibold underline" style={{ color: 'var(--accent)' }}>Sign in here</button></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIVE OPERATIONAL DOCUMENT INGESTION (ENTER YOUR OWN DATA)        */}
      {/* ========================================================================= */}
      {showDocModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowDocModal(false)}
        >
          <div 
            className="w-full max-w-2xl border rounded-3xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--card)', borderColor: 'var(--line-strong)', boxShadow: 'var(--shadow)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--line)' }}>
              <div>
                <span className="font-mono-code text-[11px] uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                  Enterprise Knowledge Intake
                </span>
                <h3 className="font-editorial text-2xl font-bold tracking-tight" style={{ color: 'var(--ink)' }}>
                  Ingest Custom SOP Document
                </h3>
              </div>
              <button 
                onClick={() => setShowDocModal(false)}
                className="p-1 rounded-full hover:opacity-75 transition-opacity"
                style={{ color: 'var(--ink-3)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {docError && (
              <div className="p-3 rounded-xl border text-xs flex items-center gap-2" style={{ background: 'var(--clash-bg)', borderColor: 'var(--clash)', color: 'var(--clash)' }}>
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Document Title</label>
                <input
                  type="text"
                  required
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="e.g. AWS Deployment Runbook or Payroll Approval SOP"
                  className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Category</label>
                  <input
                    type="text"
                    required
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                    placeholder="e.g. DevOps, Legal"
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Department</label>
                  <input
                    type="text"
                    required
                    value={docForm.department}
                    onChange={(e) => setDocForm({ ...docForm, department: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Source Platform</label>
                  <select
                    value={docForm.sourcePlatform}
                    onChange={(e) => setDocForm({ ...docForm, sourcePlatform: e.target.value as any })}
                    className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                    style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                  >
                    <option value="custom_upload">Direct Upload</option>
                    <option value="notion">Notion Workspace</option>
                    <option value="google_drive">Google Drive</option>
                    <option value="confluence">Confluence Cloud</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>Source Reference URL</label>
                <input
                  type="url"
                  required
                  value={docForm.sourceUrl}
                  onChange={(e) => setDocForm({ ...docForm, sourceUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-mono-code mb-1" style={{ color: 'var(--ink-2)' }}>
                  Operational Text &amp; Numbered Clauses (Enter your real SOP instructions)
                </label>
                <textarea
                  required
                  rows={6}
                  value={docForm.content}
                  onChange={(e) => setDocForm({ ...docForm, content: e.target.value })}
                  placeholder="1. Step 1: Verify prerequisites...&#10;2. Step 2: Trigger automated deployment...&#10;3. Step 3: Check system health metrics..."
                  className="w-full border rounded-xl p-3.5 text-xs font-mono-code leading-relaxed focus:outline-none"
                  style={{ background: 'var(--canvas)', borderColor: 'var(--line-strong)', color: 'var(--ink)' }}
                />
                <span className="text-[11px] mt-1 block" style={{ color: 'var(--ink-3)' }}>
                  Numbered lines (e.g. "1. Instruction") are automatically decomposed into interactive steps by the Tutor.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium"
                  style={{ color: 'var(--ink-2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={docLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  style={{ background: 'var(--accent)', color: 'var(--on-accent)' }}
                >
                  {docLoading ? 'Indexing in Vector Store...' : 'Ingest & Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
