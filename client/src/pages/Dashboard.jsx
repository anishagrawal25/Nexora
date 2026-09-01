import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  LogOut,
  User,
  Target,
  FileText,
  Edit3,
  Check,
  Globe,
  GraduationCap,
  Award,
  Link as LinkIcon,
} from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
    </svg>
  );
}
import { apiRequest } from '../api';
import ResumeUpload from '../components/ResumeUpload';
import ReadinessBreakdown from '../components/ReadinessBreakdown';
import SkillGapPanel from '../components/SkillGapPanel';
import CompanyEligibility from '../components/CompanyEligibility';
import RecommendationsList from '../components/RecommendationsList';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [readinessData, setReadinessData] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Profile Edit Form State
  const [formData, setFormData] = useState({
    cgpa: '',
    grad_year: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    target_role_id: '',
  });

  const navigate = useNavigate();

  // Load all initial dashboard data
  async function loadDashboardData() {
    try {
      setLoading(true);
      setError('');

      const [profileRes, rolesRes, readinessRes, skillGapRes] = await Promise.all([
        apiRequest('/profile'),
        apiRequest('/profile/roles'),
        apiRequest('/profile/readiness').catch(() => null),
        apiRequest('/profile/skill-gap').catch(() => null),
      ]);

      setProfile(profileRes);
      setRoles(rolesRes.roles || []);

      if (readinessRes) {
        setReadinessData(readinessRes.readiness);
        if (readinessRes.latestAnalysis) {
          setAnalysis(readinessRes.latestAnalysis);
        }
      }

      if (skillGapRes?.skillGap) {
        setSkillGap(skillGapRes.skillGap);
      }

      setFormData({
        cgpa: profileRes.cgpa ?? '',
        grad_year: profileRes.grad_year ?? '',
        github_url: profileRes.github_url ?? '',
        linkedin_url: profileRes.linkedin_url ?? '',
        portfolio_url: profileRes.portfolio_url ?? '',
        target_role_id: profileRes.target_role_id ?? '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  // Handle Target Role Dropdown Direct Change
  async function handleTargetRoleChange(newRoleId) {
    const roleIdNum = newRoleId ? Number(newRoleId) : null;
    try {
      const updated = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          ...profile,
          target_role_id: roleIdNum,
        }),
      });

      setProfile(updated);
      setFormData((prev) => ({ ...prev, target_role_id: newRoleId }));

      // Refresh readiness & skill gap for new role
      const [newReadiness, newSkillGap] = await Promise.all([
        apiRequest('/profile/readiness').catch(() => null),
        apiRequest('/profile/skill-gap', {
          method: 'POST',
          body: JSON.stringify({ targetRoleId: roleIdNum }),
        }).catch(() => null),
      ]);

      if (newReadiness) setReadinessData(newReadiness.readiness);
      if (newSkillGap?.skillGap) setSkillGap(newSkillGap.skillGap);
    } catch (err) {
      setError(err.message);
    }
  }

  // Handle Full Profile Modal / Inline Save
  async function handleSaveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setError('');

    try {
      const payload = {
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        grad_year: formData.grad_year ? parseInt(formData.grad_year, 10) : null,
        github_url: formData.github_url || null,
        linkedin_url: formData.linkedin_url || null,
        portfolio_url: formData.portfolio_url || null,
        target_role_id: formData.target_role_id ? parseInt(formData.target_role_id, 10) : null,
      };

      const updated = await apiRequest('/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setProfile(updated);
      setIsEditingProfile(false);

      // Refresh readiness score
      const readinessRes = await apiRequest('/profile/readiness');
      setReadinessData(readinessRes.readiness);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  // When AI resume analysis completes
  async function handleAnalysisComplete(newAnalysis) {
    setAnalysis(newAnalysis);
    try {
      const [readinessRes, skillGapRes] = await Promise.all([
        apiRequest('/profile/readiness').catch(() => null),
        profile?.target_role_id
          ? apiRequest('/profile/skill-gap', {
              method: 'POST',
              body: JSON.stringify({ targetRoleId: profile.target_role_id }),
            }).catch(() => null)
          : null,
      ]);

      if (readinessRes) setReadinessData(readinessRes.readiness);
      if (skillGapRes?.skillGap) setSkillGap(skillGapRes.skillGap);
    } catch (err) {
      console.error('Error refreshing metrics after analysis:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFAF6] flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 text-[#1F6F5C] animate-pulse" />
        <p className="font-mono text-xs tracking-widest text-[#5B6670] uppercase">
          Loading Nexora Workspace...
        </p>
      </div>
    );
  }

  const currentRole = roles.find((r) => Number(r.id) === Number(profile?.target_role_id));

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] flex flex-col font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-[#E4E1D8] bg-[#FBFAF6]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-xl bg-[#12181B] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#9BC4B4]" />
            </Link>
            <div>
              <span className="font-mono text-xs tracking-[0.25em] font-semibold text-[#12181B]">
                NEXORA
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-[#5B6670] px-2 py-0.5 rounded bg-[#EFECE2]">
                v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#5B6670] bg-[#F4F2EB] px-3 py-1.5 rounded-lg border border-[#E4E1D8]">
              <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
              <span>Signed in as <strong className="text-[#12181B]">{profile.email}</strong></span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-[#5B6670] hover:text-[#12181B] border border-[#D8D5CA] rounded-xl px-3.5 py-2 hover:bg-white transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="max-w-6xl mx-auto px-6 pt-10 w-full flex-1">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
              STUDENT DASHBOARD
            </p>
            <h1
              className="italic text-3xl sm:text-4xl text-[#12181B]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Welcome back, {profile.name}.
            </h1>
            <p className="text-sm text-[#5B6670] mt-1">
              Your personalized career readiness, skill gap analysis, and placement eligibility overview.
            </p>
          </div>

          {/* Quick Target Role Selector Pill in Header */}
          <div className="flex items-center gap-2 bg-white border border-[#E4E1D8] p-1.5 rounded-xl shadow-2xs">
            <Target className="w-4 h-4 text-[#1F6F5C] ml-2 shrink-0" />
            <span className="text-xs font-medium text-[#5B6670] whitespace-nowrap">Target Role:</span>
            <select
              value={profile.target_role_id || ''}
              onChange={(e) => handleTargetRoleChange(e.target.value)}
              className="text-xs font-semibold bg-[#F4F2EB] text-[#12181B] border border-[#D8D5CA] rounded-lg py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-[#1F6F5C] cursor-pointer"
            >
              <option value="">Select target role...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Profile Card & Details */}
        <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#EFECE2] flex items-center justify-center text-[#1F6F5C]">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className="italic text-xl text-[#12181B]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Candidate Profile
                </h3>
                <p className="text-xs text-[#5B6670]">Academic and portfolio credentials</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="text-xs font-medium text-[#1F6F5C] bg-[#F4F2EB] border border-[#D8D5CA] px-3.5 py-2 rounded-xl hover:bg-[#EFECE2] transition inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Form */}
          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">Target Role</label>
                  <select
                    value={formData.target_role_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, target_role_id: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  >
                    <option value="">None Selected</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">CGPA (out of 10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.50"
                    value={formData.cgpa}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cgpa: e.target.value }))}
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">Graduation Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={formData.grad_year}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, grad_year: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/yourhandle"
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/yourhandle"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={formData.portfolio_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#1F6F5C] text-white text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-[#195A4A] transition disabled:opacity-60 cursor-pointer"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs text-[#5B6670] px-4 py-2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="p-3.5 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                <p className="text-[11px] text-[#5B6670] uppercase font-mono tracking-wider mb-1">
                  Target Role
                </p>
                <p className="text-sm font-semibold text-[#12181B]">
                  {currentRole?.name || 'Not selected'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                <p className="text-[11px] text-[#5B6670] uppercase font-mono tracking-wider mb-1">
                  CGPA
                </p>
                <p className="text-sm font-semibold text-[#12181B]">
                  {profile.cgpa ? `${profile.cgpa} / 10.0` : 'Not set'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                <p className="text-[11px] text-[#5B6670] uppercase font-mono tracking-wider mb-1">
                  Graduation Year
                </p>
                <p className="text-sm font-semibold text-[#12181B]">
                  {profile.grad_year || 'Not set'}
                </p>
              </div>

              <div className="p-3.5 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl flex items-center gap-3">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-[#E4E1D8] text-[#12181B] hover:text-[#1F6F5C] transition"
                    title="GitHub Profile"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedin_url && (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-[#E4E1D8] text-[#12181B] hover:text-[#1F6F5C] transition"
                    title="LinkedIn Profile"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.portfolio_url && (
                  <a
                    href={profile.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white border border-[#E4E1D8] text-[#12181B] hover:text-[#1F6F5C] transition"
                    title="Portfolio Website"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {!profile.github_url && !profile.linkedin_url && !profile.portfolio_url && (
                  <span className="text-xs text-[#5B6670]">No links added</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="space-y-8">
          {/* Readiness Score Breakdown Panel */}
          {readinessData && (
            <ReadinessBreakdown readiness={readinessData} targetRoleName={currentRole?.name} />
          )}

          {/* Resume Upload & AI Analysis Section */}
          {!analysis ? (
            <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
                <div>
                  <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
                    AI RESUME INSIGHTS
                  </p>
                  <h2
                    className="italic text-2xl text-[#12181B]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    Extracted Resume Analysis
                  </h2>
                  <p className="text-xs text-[#5B6670] mt-1">
                    Generated by Google Gemini structured parser.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#F4F2EB] px-3.5 py-1.5 rounded-xl border border-[#E4E1D8] flex items-center gap-2">
                    <span className="text-xs text-[#5B6670]">AI Quality:</span>
                    <span
                      className="text-lg font-semibold text-[#12181B]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {analysis.readinessScore || 0}/100
                    </span>
                  </div>
                  <button
                    onClick={() => setAnalysis(null)}
                    className="text-xs font-medium text-[#5B6670] hover:text-[#12181B] bg-white border border-[#D8D5CA] rounded-xl px-3 py-2 transition hover:bg-[#F4F2EB] cursor-pointer"
                  >
                    Upload New Resume
                  </button>
                </div>
              </div>

              {/* Skills Found Chips */}
              <div className="mt-6 mb-6">
                <h3 className="text-xs font-mono tracking-wider text-[#5B6670] uppercase mb-2.5">
                  Verified Skills in Resume ({analysis.extractedSkills?.length || 0})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.extractedSkills && analysis.extractedSkills.length > 0 ? (
                    analysis.extractedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs font-medium bg-[#EFECE2] text-[#12181B] border border-[#D8D5CA] rounded-full px-3 py-1"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#5B6670]">No skills extracted</span>
                  )}
                </div>
              </div>

              {/* 3-Column Highlights: Strengths, Weaknesses, Suggestions */}
              <div className="grid md:grid-cols-3 gap-5 pt-4 border-t border-[#E4E1D8]">
                <div className="p-4 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                  <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    Key Strengths
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#5B6670]">
                    {analysis.strengths && analysis.strengths.length > 0 ? (
                      analysis.strengths.map((s, i) => (
                        <li key={i} className="leading-relaxed">
                          • {s}
                        </li>
                      ))
                    ) : (
                      <li>No strengths noted</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                  <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#5B6670]">
                    {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                      analysis.weaknesses.map((w, i) => (
                        <li key={i} className="leading-relaxed">
                          • {w}
                        </li>
                      ))
                    ) : (
                      <li>No weaknesses noted</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 bg-[#FBFAF6] border border-[#E4E1D8] rounded-xl">
                  <h4 className="text-xs font-semibold text-[#1F6F5C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
                    Actionable Advice
                  </h4>
                  <ul className="space-y-1.5 text-xs text-[#5B6670]">
                    {analysis.suggestions && analysis.suggestions.length > 0 ? (
                      analysis.suggestions.map((s, i) => (
                        <li key={i} className="leading-relaxed">
                          • {s}
                        </li>
                      ))
                    ) : (
                      <li>No suggestions provided</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Skill-Gap Analysis Panel */}
          <SkillGapPanel
            skillGap={skillGap}
            targetRole={currentRole}
            onSkillGapUpdated={setSkillGap}
            hasResume={Boolean(analysis)}
          />

          {/* Company Eligibility Evaluator */}
          <CompanyEligibility profile={profile} />

          {/* Curated Recommendations */}
          <RecommendationsList targetRole={currentRole} hasResume={Boolean(analysis)} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;