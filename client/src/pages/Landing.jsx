import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Award, Compass, Building2, CheckCircle2, ChevronRight } from 'lucide-react';

function Landing() {
  const steps = [
    {
      num: '01',
      title: 'Upload your resume',
      desc: 'Drop your PDF resume for instant parsing and structured extraction.',
    },
    {
      num: '02',
      title: 'Get AI feedback',
      desc: 'Gemini AI evaluates your strengths, weaknesses, and key technical skills.',
    },
    {
      num: '03',
      title: 'See your skill gaps',
      desc: 'Compare your profile directly against target roles and company criteria.',
    },
    {
      num: '04',
      title: 'Know what to learn next',
      desc: 'Follow curated, prioritized learning resources to bridge every missing gap.',
    },
  ];

  const features = [
    {
      icon: Sparkles,
      title: 'AI Resume Analysis',
      desc: 'Extracts skills, highlights key achievements, and pinpoints improvement areas using Google Gemini.',
      badge: 'Powered by Gemini',
    },
    {
      icon: Award,
      title: 'Deterministic Readiness Score',
      desc: 'A multi-factor mathematical score weighted by profile completeness, resume quality, skill match, and experience.',
      badge: 'Transparent Formula',
    },
    {
      icon: Target,
      title: 'Skill Gap Detection',
      desc: 'Maps your current competencies against industry benchmarks and ranks missing requirements by priority.',
      badge: 'Role-Aligned',
    },
    {
      icon: Compass,
      title: 'Curated Recommendations',
      desc: 'Direct, vetted learning resources and official documentation for every missing technical skill.',
      badge: 'Actionable Roadmap',
    },
    {
      icon: Building2,
      title: 'Company Eligibility Checker',
      desc: 'Instantly evaluate your eligibility against hiring criteria for top tech companies and startups.',
      badge: 'Instant Evaluation',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] flex flex-col font-sans selection:bg-[#EFECE2]">
      {/* Navigation Header */}
      <header className="border-b border-[#E4E1D8] bg-[#FBFAF6]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#12181B] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#9BC4B4]" />
            </div>
            <span className="font-mono text-sm tracking-[0.25em] font-semibold text-[#12181B]">
              NEXORA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-[#5B6670] hover:text-[#12181B] px-4 py-2 rounded-lg transition"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-[#1F6F5C] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#195A4A] transition shadow-sm inline-flex items-center gap-2"
            >
              Get started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFECE2] border border-[#D8D5CA] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#1F6F5C] animate-pulse" />
            <span className="font-mono text-xs tracking-widest uppercase font-medium text-[#1F6F5C]">
              AI Career Readiness Platform
            </span>
          </div>

          <h1
            className="italic text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.08] text-[#12181B] mb-8 tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            One score. Every gap.<br />
            <span className="text-[#1F6F5C]">What to learn next.</span>
          </h1>

          <p className="text-lg sm:text-xl text-[#5B6670] max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your resume, pick your dream role, and let AI reveal your exact readiness score, skill gaps, and custom learning roadmap.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-[#1F6F5C] text-white text-base font-medium px-8 py-3.5 rounded-xl hover:bg-[#195A4A] transition shadow-sm inline-flex items-center justify-center gap-2 group"
            >
              Get started for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto text-[#12181B] bg-white border border-[#D8D5CA] text-base font-medium px-8 py-3.5 rounded-xl hover:bg-[#F4F2EB] transition shadow-2xs inline-flex items-center justify-center"
            >
              Sign in to your account
            </Link>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 pt-10 border-t border-[#E4E1D8] grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div className="p-4 rounded-xl bg-white border border-[#E4E1D8]">
              <p className="font-mono text-xs text-[#1F6F5C] uppercase tracking-wider mb-1">AI Model</p>
              <p className="text-xl font-semibold text-[#12181B]" style={{ fontFamily: "'Fraunces', serif" }}>Gemini Flash</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E4E1D8]">
              <p className="font-mono text-xs text-[#1F6F5C] uppercase tracking-wider mb-1">Scoring Engine</p>
              <p className="text-xl font-semibold text-[#12181B]" style={{ fontFamily: "'Fraunces', serif" }}>Deterministic</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E4E1D8]">
              <p className="font-mono text-xs text-[#1F6F5C] uppercase tracking-wider mb-1">Target Roles</p>
              <p className="text-xl font-semibold text-[#12181B]" style={{ fontFamily: "'Fraunces', serif" }}>Full Stack & Data</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#E4E1D8]">
              <p className="font-mono text-xs text-[#1F6F5C] uppercase tracking-wider mb-1">Eligibility</p>
              <p className="text-xl font-semibold text-[#12181B]" style={{ fontFamily: "'Fraunces', serif" }}>Tier-1 Companies</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 border-t border-[#E4E1D8] bg-[#F4F2EB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-2">HOW IT WORKS</p>
            <h2
              className="italic text-3xl sm:text-4xl text-[#12181B]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Four steps from resume to offer
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div
                key={s.num}
                className="bg-white border border-[#E4E1D8] rounded-2xl p-6 relative hover:border-[#1F6F5C]/40 transition"
              >
                <span className="font-mono text-xs font-semibold text-[#1F6F5C] bg-[#EFECE2] px-2.5 py-1 rounded-md mb-4 inline-block">
                  STEP {s.num}
                </span>
                <h3
                  className="text-lg font-medium text-[#12181B] mb-2"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {s.title}
                </h3>
                <p className="text-sm text-[#5B6670] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-2">CORE CAPABILITIES</p>
            <h2
              className="italic text-3xl sm:text-4xl text-[#12181B]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Engineered for career readiness
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.slice(0, 3).map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white border border-[#E4E1D8] rounded-2xl p-7 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#EFECE2] flex items-center justify-center text-[#1F6F5C]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6670] bg-[#F4F2EB] px-2.5 py-1 rounded-md">
                        {f.badge}
                      </span>
                    </div>
                    <h3
                      className="italic text-xl text-[#12181B] mb-2"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#5B6670] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {features.slice(3).map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white border border-[#E4E1D8] rounded-2xl p-7 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#EFECE2] flex items-center justify-center text-[#1F6F5C]">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#5B6670] bg-[#F4F2EB] px-2.5 py-1 rounded-md">
                        {f.badge}
                      </span>
                    </div>
                    <h3
                      className="italic text-xl text-[#12181B] mb-2"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {f.title}
                    </h3>
                    <p className="text-sm text-[#5B6670] leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Callout */}
      <section className="py-16 px-6 bg-[#12181B] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-[#9BC4B4] uppercase mb-3">GET STARTED TODAY</p>
          <h2
            className="italic text-3xl sm:text-4xl text-white mb-4"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Ready to measure your placement readiness?
          </h2>
          <p className="text-sm text-[#B7BEC1] max-w-md mx-auto mb-8">
            Create an account in 30 seconds and receive instant AI analysis of your resume and target role fit.
          </p>
          <Link
            to="/register"
            className="bg-[#1F6F5C] text-white text-sm font-medium px-7 py-3 rounded-xl hover:bg-[#195A4A] transition inline-flex items-center gap-2"
          >
            Create your account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-[#E4E1D8] bg-[#FBFAF6] py-10 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B6670]">
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-[#12181B] tracking-wider">NEXORA</span>
            <span>—</span>
            <span>AI Career Readiness & Placement Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/anishagrawal25/Nexora"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#12181B] transition underline underline-offset-4"
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
