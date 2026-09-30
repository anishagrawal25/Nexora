import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Target,
  Building2,
  Compass,
  Code2,
  Layers,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

function Landing() {
  const [activeDemoTab, setActiveDemoTab] = useState('score');

  const steps = [
    {
      num: '01',
      title: 'Resume Extraction & Parsing',
      desc: 'Structured parsing of your PDF resume extracts verified technical skills, project scope, and experience signals.',
    },
    {
      num: '02',
      title: 'Deterministic Multi-Factor Scoring',
      desc: 'Mathematical calculation weighted across completeness (25%), resume quality (35%), skill match (30%), and experience (10%).',
    },
    {
      num: '03',
      title: 'Role Gap & Priority Matrix',
      desc: 'Normalized set-difference matching against industry benchmarks, ranking every missing requirement by hiring priority.',
    },
    {
      num: '04',
      title: 'Curated Documentation Roadmaps',
      desc: 'Direct, prioritized links to official documentation and technical tutorials for each identified gap.',
    },
  ];

  const companiesList = [
    { name: 'Google', tier: 'Big Tech', minCgpa: '8.50', skills: ['Data Structures', 'System Design', 'Python'] },
    { name: 'Microsoft', tier: 'Big Tech', minCgpa: '8.00', skills: ['C#', 'Azure', 'SQL'] },
    { name: 'Stripe', tier: 'FinTech', minCgpa: '8.00', skills: ['Node.js', 'System Design', 'PostgreSQL'] },
    { name: 'Razorpay', tier: 'FinTech', minCgpa: '7.50', skills: ['Node.js', 'PostgreSQL', 'Docker'] },
    { name: 'Zomato', tier: 'Consumer Tech', minCgpa: '7.00', skills: ['React', 'Node.js', 'PostgreSQL'] },
    { name: 'Flipkart', tier: 'E-commerce', minCgpa: '7.50', skills: ['Java', 'Data Structures', 'SQL'] },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans selection:bg-zinc-200">
      {/* SaaS Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4 text-zinc-300" />
            </div>
            <span className="font-mono text-xs tracking-widest font-semibold text-zinc-900 uppercase">
              NEXORA
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-zinc-900 text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-16 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span className="font-mono text-[11px] tracking-wider uppercase font-medium text-zinc-700">
              Engineering Career Readiness Platform
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold text-zinc-900 tracking-tight leading-[1.15] mb-5">
            Deterministic readiness scoring &amp; role gap analysis for software engineers.
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Upload your resume to benchmark against verified hiring criteria at 15+ tech companies. Receive transparent mathematical scoring, missing skill matrices, and direct documentation roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-zinc-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-800 transition shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Evaluate Your Resume (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white border border-zinc-300 text-zinc-800 text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-50 transition shadow-xs inline-flex items-center justify-center"
            >
              Sign in to Dashboard
            </Link>
          </div>

          {/* Key Engineering Highlights Strip */}
          <div className="mt-12 pt-8 border-t border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">Scoring Engine</span>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">Deterministic (0-100)</p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">AI Extraction</span>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">Google Gemini</p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">Companies Tracked</span>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">15 Top Tech &amp; FinTech</p>
            </div>
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-medium">Custom Dream Roles</span>
              <p className="text-sm font-semibold text-zinc-900 mt-0.5">Heuristic Fallbacks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Product Interface Walkthrough */}
      <section className="py-16 px-6 bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
              PRODUCT INTERFACE
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight mt-1">
              Engineered for clarity and actionable execution
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Explore the exact dashboard workflows and calculations inside Nexora.
            </p>
          </div>

          {/* Interactive UI Demo Shell */}
          <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            {/* Mock Top Toolbar */}
            <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                <span className="text-xs font-mono text-zinc-500 ml-2">app.nexora.dev/dashboard</span>
              </div>

              {/* Demo Tabs Switcher */}
              <div className="flex items-center gap-1 bg-zinc-200/80 p-0.5 rounded-md text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('score')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-medium ${
                    activeDemoTab === 'score'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Readiness Scorecard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('gaps')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-medium ${
                    activeDemoTab === 'gaps'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Skill Gap Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('fit')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer font-medium ${
                    activeDemoTab === 'fit'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Reverse Company Fit
                </button>
              </div>
            </div>

            {/* Mock Tab 1: Scorecard */}
            {activeDemoTab === 'score' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Readiness Score</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold font-mono text-zinc-900">82</span>
                      <span className="text-xs font-mono text-zinc-400">/100</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">● Strong Benchmark Fit</span>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Profile Completeness</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold font-mono text-zinc-900">100%</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">CGPA 8.40 • Batch 2026</span>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">Target Benchmark</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-base font-semibold text-zinc-900">Full Stack Engineer</span>
                    </div>
                    <span className="text-[11px] text-zinc-500">8 of 9 required skills matched</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-zinc-50/70 border border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-900">Extracted Competencies (12)</span>
                    <span className="text-[11px] font-mono text-zinc-400">PDF Parsed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST APIs', 'Git', 'Python', 'Redis', 'Jest', 'CI/CD'].map((s) => (
                      <span key={s} className="text-xs bg-white border border-zinc-200 text-zinc-800 px-2.5 py-1 rounded-md font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mock Tab 2: Skill Gaps */}
            {activeDemoTab === 'gaps' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Full Stack Engineer — Missing Requirements</h4>
                    <p className="text-xs text-zinc-500">Ranked by hiring priority based on industry benchmarks</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
                    1 Gap Found
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      <span className="text-xs font-medium text-zinc-900">System Design (Scalability)</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-medium">
                      High Priority
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      <span className="text-xs font-medium text-zinc-900">Kubernetes Deployment</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-medium">
                      Medium Priority
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50/75 border border-emerald-200 text-emerald-900 text-xs">
                  <strong>Learning Action:</strong> Official documentation roadmap and system design tutorials mapped for these specific gaps.
                </div>
              </div>
            )}

            {/* Mock Tab 3: Reverse Company Fit */}
            {activeDemoTab === 'fit' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900">Automated Company Eligibility Screening</h4>
                    <p className="text-xs text-zinc-500">Evaluated across 15 tracked companies with strict cutoffs</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    12 of 15 Eligible
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-900">Razorpay (FinTech)</span>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                        Qualify Now
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono">Min CGPA 7.50 • Batch 2026 • 4/4 Skills Matched</p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-zinc-900">Google (Tech)</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                        Close (1 Gap)
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 text-xs">Missing: System Design</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="py-16 px-6 border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
              HOW IT WORKS
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight mt-1">
              Four deterministic steps to readiness
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-zinc-50/60 border border-zinc-200 p-5 rounded-lg flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-semibold text-zinc-900 bg-zinc-200/80 px-2 py-0.5 rounded mb-3 inline-block">
                    {s.num}
                  </span>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-1.5">
                    {s.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracked Companies Grid */}
      <section className="py-16 px-6 bg-[#FAFAFA] border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
              VERIFIED RECRUITMENT BENCHMARKS
            </span>
            <h2 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight mt-1">
              15 Pre-Seeded Company Criteria
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Real-world academic cutoffs and technical requirements. Supports any unseeded company via heuristic fallback.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-3.5">
            {companiesList.map((c) => (
              <div
                key={c.name}
                className="p-4 rounded-lg bg-white border border-zinc-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-zinc-900">{c.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                      {c.tier}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mb-3">Min CGPA: {c.minCgpa}</p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.skills.map((sk) => (
                    <span key={sk} className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-mono">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-zinc-900 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-2">
            Ready to benchmark your placement readiness?
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mb-6">
            Upload your resume, select your dream role, and get instant multi-factor scoring with zero fluff.
          </p>
          <Link
            to="/register"
            className="bg-white text-zinc-900 text-xs sm:text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-zinc-100 transition shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Clean SaaS Footer */}
      <footer className="py-8 px-6 bg-white border-t border-zinc-200 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-zinc-900">NEXORA</span>
            <span>•</span>
            <span>Career Readiness &amp; Skill Gap Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/anishagrawal25/Nexora"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 underline underline-offset-4"
            >
              GitHub Repository
            </a>
            <span>&copy; {new Date().getFullYear()} Nexora</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;

