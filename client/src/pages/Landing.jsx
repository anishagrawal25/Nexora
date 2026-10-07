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
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] flex flex-col font-sans selection:bg-[#EBF3F0] selection:text-[#1F6F5C]">
      {/* SaaS Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FBFAF6]/95 backdrop-blur-md border-b border-[#E4E1D8]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#1F6F5C] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
            </div>
            <span className="font-mono text-xs tracking-widest font-semibold text-[#12181B] uppercase">
              NEXORA
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-[#5B6670] hover:text-[#12181B] px-3.5 py-2 rounded-xl hover:bg-[#F2EFE9] transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 px-6 border-b border-[#E4E1D8] bg-[#FBFAF6]">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-[#1F6F5C] font-medium block mb-4">
            ENGINEERING CAREER READINESS PLATFORM
          </span>

          <h1 className="font-serif italic text-3xl sm:text-5xl lg:text-6xl font-medium text-[#12181B] tracking-tight leading-[1.12] mb-6">
            Deterministic readiness scoring &amp; role gap analysis for software engineers.
          </h1>

          <p className="text-base sm:text-lg text-[#5B6670] max-w-2xl mx-auto leading-relaxed mb-8">
            Upload your resume to benchmark against verified hiring criteria at top tech companies. Receive transparent mathematical scoring, missing skill matrices, and direct documentation roadmaps.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] text-white text-sm font-medium px-6 py-3 rounded-xl transition shadow-sm inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Evaluate Your Resume (Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white border border-[#E4E1D8] text-[#12181B] text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#F2EFE9] transition shadow-xs inline-flex items-center justify-center"
            >
              Sign in to Dashboard
            </Link>
          </div>

          {/* Key Engineering Highlights Strip */}
          <div className="mt-14 pt-8 border-t border-[#E4E1D8] grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6670] font-medium">Scoring Engine</span>
              <p className="text-sm font-semibold text-[#12181B] mt-1">Deterministic (0-100)</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6670] font-medium">AI Extraction</span>
              <p className="text-sm font-semibold text-[#12181B] mt-1">Google Gemini</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6670] font-medium">Companies Tracked</span>
              <p className="text-sm font-semibold text-[#12181B] mt-1">15 Top Tech &amp; FinTech</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6670] font-medium">Custom Dream Roles</span>
              <p className="text-sm font-semibold text-[#12181B] mt-1">Heuristic Fallbacks</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Product Interface Walkthrough */}
      <section className="py-20 px-6 bg-[#FBFAF6]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase font-medium">
              PRODUCT INTERFACE
            </span>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#12181B] tracking-tight mt-1">
              Engineered for clarity and actionable execution
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6670] mt-1.5">
              Explore the exact dashboard workflows and calculations inside Nexora.
            </p>
          </div>

          {/* Interactive UI Demo Shell */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl shadow-xs overflow-hidden">
            {/* Interactive Demo Top Toolbar */}
            <div className="bg-[#F2EFE9] px-4 py-3 border-b border-[#E4E1D8] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4E1D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4E1D8]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4E1D8]" />
                <span className="text-xs font-mono text-[#5B6670] ml-2">app.nexora.dev/dashboard</span>
              </div>

              {/* Demo Tabs Switcher */}
              <div className="flex items-center gap-1 bg-[#EAE6DD] p-1 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('score')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                    activeDemoTab === 'score'
                      ? 'bg-white text-[#12181B] shadow-xs'
                      : 'text-[#5B6670] hover:text-[#12181B]'
                  }`}
                >
                  Readiness Scorecard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('gaps')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                    activeDemoTab === 'gaps'
                      ? 'bg-white text-[#12181B] shadow-xs'
                      : 'text-[#5B6670] hover:text-[#12181B]'
                  }`}
                >
                  Skill Gap Matrix
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('fit')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer font-medium ${
                    activeDemoTab === 'fit'
                      ? 'bg-white text-[#12181B] shadow-xs'
                      : 'text-[#5B6670] hover:text-[#12181B]'
                  }`}
                >
                  Reverse Company Fit
                </button>
              </div>
            </div>

            {/* Demo Tab 1: Scorecard */}
            {activeDemoTab === 'score' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6670]">Readiness Score</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold font-mono text-[#12181B]">82</span>
                      <span className="text-xs font-mono text-[#5B6670]">/100</span>
                    </div>
                    <span className="text-[11px] text-[#1F6F5C] font-medium">Strong Benchmark Fit</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6670]">Profile Completeness</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-3xl font-semibold font-mono text-[#12181B]">100%</span>
                    </div>
                    <span className="text-[11px] text-[#5B6670]">CGPA 8.40 • Batch 2026</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6670]">Target Benchmark</span>
                    <div className="my-2 flex items-baseline gap-1">
                      <span className="text-base font-semibold text-[#12181B]">Full Stack Engineer</span>
                    </div>
                    <span className="text-[11px] text-[#5B6670]">8 of 9 required skills matched</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-semibold text-[#12181B]">Extracted Competencies (12)</span>
                    <span className="text-[11px] font-mono text-[#5B6670]">PDF Parsed</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Docker', 'REST APIs', 'Git', 'Python', 'Redis', 'Jest', 'CI/CD'].map((s) => (
                      <span key={s} className="text-xs bg-white border border-[#E4E1D8] text-[#12181B] px-2.5 py-1 rounded-lg font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Demo Tab 2: Skill Gaps */}
            {activeDemoTab === 'gaps' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
                  <div>
                    <h4 className="font-serif italic text-base font-medium text-[#12181B]">Full Stack Engineer — Missing Requirements</h4>
                    <p className="text-xs text-[#5B6670]">Ranked by hiring priority based on industry benchmarks</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#F2EFE9] border border-[#E4E1D8] text-[#12181B]">
                    1 Gap Found
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12181B]" />
                      <span className="text-xs font-medium text-[#12181B]">System Design (Scalability)</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#FDF0ED] text-[#9E2A2B] border border-[#F5CAC3] px-2 py-0.5 rounded-md font-medium">
                      High Priority
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#12181B]" />
                      <span className="text-xs font-medium text-[#12181B]">Kubernetes Deployment</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-[#FEF6E9] text-[#8C5819] border border-[#F6E0B8] px-2 py-0.5 rounded-md font-medium">
                      Medium Priority
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#EBF3F0] border border-[#CDE3DC] text-[#1F6F5C] text-xs">
                  <strong>Learning Action:</strong> Official documentation roadmap and system design tutorials mapped for these specific gaps.
                </div>
              </div>
            )}

            {/* Demo Tab 3: Reverse Company Fit */}
            {activeDemoTab === 'fit' && (
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
                  <div>
                    <h4 className="font-serif italic text-base font-medium text-[#12181B]">Automated Company Eligibility Screening</h4>
                    <p className="text-xs text-[#5B6670]">Evaluated across 15 tracked companies with strict cutoffs</p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#EBF3F0] text-[#1F6F5C] border border-[#CDE3DC] font-medium">
                    12 of 15 Eligible
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#12181B]">Razorpay (FinTech)</span>
                      <span className="text-[10px] font-mono bg-[#EBF3F0] text-[#1F6F5C] border border-[#CDE3DC] px-2 py-0.5 rounded-md font-medium">
                        Qualify Now
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5B6670] font-mono">Min CGPA 7.50 • Batch 2026 • 4/4 Skills Matched</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#12181B]">Google (Tech)</span>
                      <span className="text-[10px] font-mono bg-[#FEF6E9] text-[#8C5819] border border-[#F6E0B8] px-2 py-0.5 rounded-md font-medium">
                        Close (1 Gap)
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E2A2B] font-mono">Missing: System Design</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works (4 Steps) */}
      <section className="py-20 px-6 border-b border-[#E4E1D8] bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase font-medium">
              HOW IT WORKS
            </span>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#12181B] tracking-tight mt-1">
              Four deterministic steps to readiness
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-[#FBFAF6] border border-[#E4E1D8] p-6 rounded-2xl flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono font-semibold text-[#1F6F5C] bg-[#EBF3F0] border border-[#CDE3DC] px-2.5 py-1 rounded-lg mb-3 inline-block">
                    {s.num}
                  </span>
                  <h3 className="text-sm font-semibold text-[#12181B] mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#5B6670] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracked Companies Grid */}
      <section className="py-20 px-6 bg-[#FBFAF6] border-b border-[#E4E1D8]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase font-medium">
              VERIFIED RECRUITMENT BENCHMARKS
            </span>
            <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-[#12181B] tracking-tight mt-1">
              15 Pre-Seeded Company Criteria
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6670] mt-1.5">
              Real-world academic cutoffs and technical requirements. Supports any unseeded company via heuristic fallback.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {companiesList.map((c) => (
              <div
                key={c.name}
                className="p-5 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-[#12181B]">{c.name}</span>
                    <span className="text-[10px] font-mono text-[#5B6670] bg-[#F2EFE9] border border-[#E4E1D8] px-2 py-0.5 rounded-md">
                      {c.tier}
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6670] font-mono mb-3.5">Min CGPA: {c.minCgpa}</p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.skills.map((sk) => (
                    <span key={sk} className="text-[10px] bg-[#F2EFE9] text-[#12181B] border border-[#E4E1D8] px-2 py-0.5 rounded-md font-mono">
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
      <section className="py-20 px-6 bg-[#12181B] text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-serif italic text-2xl sm:text-3xl font-medium text-white mb-3">
            Ready to benchmark your placement readiness?
          </h2>
          <p className="text-xs sm:text-sm text-[#A0AAB3] mb-8 leading-relaxed">
            Upload your resume, select your dream role, and get instant multi-factor scoring with zero fluff.
          </p>
          <Link
            to="/register"
            className="bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] text-white text-xs sm:text-sm font-medium px-6 py-3 rounded-xl transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Clean SaaS Footer */}
      <footer className="py-8 px-6 bg-[#FBFAF6] border-t border-[#E4E1D8] text-xs text-[#5B6670]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-[#12181B]">NEXORA</span>
            <span>•</span>
            <span>Career Readiness &amp; Skill Gap Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/anishagrawal25/Nexora"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5B6670] hover:text-[#12181B] underline underline-offset-4"
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
