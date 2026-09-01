import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  Building2,
  Compass,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Edit2,
  X,
  Plus,
} from 'lucide-react';
import { apiRequest } from '../api';
import ResumeUpload from '../components/ResumeUpload';
import SkillGapPanel from '../components/SkillGapPanel';
import CompanyEligibility from '../components/CompanyEligibility';
import RecommendationsList from '../components/RecommendationsList';

function calculateProfileCompleteness(profile) {
  if (!profile) return 0;
  const fields = [
    profile.cgpa,
    profile.grad_year,
    profile.github_url,
    profile.linkedin_url,
    profile.portfolio_url,
    profile.target_role_id,
  ];
  const filled = fields.filter((v) => v !== null && v !== undefined && String(v).trim() !== '').length;
  return Math.round((filled / fields.length) * 100);
}

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [readinessData, setReadinessData] = useState(null);
  const [skillGap, setSkillGap] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('resume'); // 'resume' | 'skill-gap' | 'eligibility' | 'recommendations'
  const [isUploadingAnother, setIsUploadingAnother] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Edit Profile Form State
  const [formData, setFormData] = useState({
    cgpa: '',
    grad_year: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    target_role_id: '',
  });

  const navigate = useNavigate();

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

      // Refresh readiness & skill gap
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

      const readinessRes = await apiRequest('/profile/readiness').catch(() => null);
      if (readinessRes) setReadinessData(readinessRes.readiness);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAnalysisComplete(newAnalysis) {
    setAnalysis(newAnalysis);
    setIsUploadingAnother(false);
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
      console.error('Error refreshing after analysis:', err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFAF6] flex flex-col items-center justify-center gap-3">
        <Sparkles className="w-6 h-6 text-[#1F6F5C] animate-pulse" />
        <p className="font-mono text-xs tracking-widest text-[#5B6670] uppercase">
          Loading Nexora Dashboard...
        </p>
      </div>
    );
  }

  const currentRole = roles.find((r) => Number(r.id) === Number(profile?.target_role_id));
  const completenessScore = calculateProfileCompleteness(profile);
  const displayScore = analysis?.readinessScore ?? readinessData?.score ?? null;

  const tabs = [
    { id: 'resume', label: 'Resume' },
    { id: 'skill-gap', label: 'Skill Gap' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'recommendations', label: 'Recommendations' },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] flex flex-col font-sans pb-20 selection:bg-[#EFECE2]">
      <main className="max-w-4xl mx-auto px-6 pt-10 w-full flex-1">
        {/* 1a. Slim Header Row: "Welcome, {name}." on left, "Log out" on right */}
        <div className="flex items-center justify-between pb-8 border-b border-[#E4E1D8] mb-8">
          <h1
            className="italic text-3xl sm:text-4xl text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Welcome, {profile.name}.
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-[#5B6670] hover:text-[#12181B] border border-[#D8D5CA] rounded-xl px-4 py-2 hover:bg-white transition cursor-pointer"
          >
            Log out
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* 1b & 1d. Row of 3 Small Summary Stat Cards + Compact Target Role Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* Stat Card 1: Readiness Score */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
              READINESS SCORE
            </p>
            <div className="my-2">
              {displayScore !== null ? (
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-4xl font-semibold text-[#12181B]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {displayScore}
                  </span>
                  <span className="text-sm font-mono text-[#5B6670]">/100</span>
                </div>
              ) : (
                <span
                  className="text-3xl text-[#5B6670]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  —
                </span>
              )}
            </div>
            <p className="text-xs text-[#5B6670]">
              {displayScore !== null ? 'AI resume & profile rating' : 'Upload resume to calculate'}
            </p>
          </div>

          {/* Stat Card 2: Profile Completeness */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase">
                COMPLETENESS
              </p>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-[11px] text-[#5B6670] hover:text-[#1F6F5C] underline cursor-pointer"
              >
                {isEditingProfile ? 'Close' : 'Edit profile'}
              </button>
            </div>
            <div className="my-2 flex items-baseline gap-1">
              <span
                className="text-4xl font-semibold text-[#12181B]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {completenessScore}%
              </span>
            </div>
            <p className="text-xs text-[#5B6670]">
              {profile.cgpa ? `CGPA: ${profile.cgpa}` : 'CGPA not set'} •{' '}
              {profile.grad_year ? `Batch: ${profile.grad_year}` : 'Year not set'}
            </p>
          </div>

          {/* Stat Card 3: Target Role Compact Inline Dropdown */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
              TARGET ROLE
            </p>
            <div className="my-2">
              <select
                value={profile.target_role_id || ''}
                onChange={(e) => handleTargetRoleChange(e.target.value)}
                className="w-full text-sm font-medium bg-[#FBFAF6] text-[#12181B] border border-[#D8D5CA] rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#1F6F5C] cursor-pointer"
              >
                <option value="" disabled>
                  Select target role...
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-[#5B6670]">Benchmark for role gap analysis</p>
          </div>
        </div>

        {/* Optional Collapsible Profile Editor */}
        {isEditingProfile && (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 mb-10 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8] mb-5">
              <h3
                className="italic text-lg text-[#12181B]"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Edit Academic & Portfolio Info
              </h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-[#5B6670] hover:bg-[#F4F2EB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">
                    CGPA (out of 10)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.50"
                    value={formData.cgpa}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cgpa: e.target.value }))}
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3.5 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={formData.grad_year}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, grad_year: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3.5 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3.5 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3.5 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5B6670] mb-1">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://portfolio.dev"
                    value={formData.portfolio_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
                    }
                    className="w-full bg-[#FBFAF6] border border-[#D8D5CA] rounded-xl px-3.5 py-2 text-xs text-[#12181B] focus:ring-1 focus:ring-[#1F6F5C]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#1F6F5C] text-white text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-[#195A4A] transition disabled:opacity-60 cursor-pointer"
                >
                  {savingProfile ? 'Saving...' : 'Save Profile'}
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
          </div>
        )}

        {/* 1c. Tabbed Interface: "Resume" | "Skill Gap" | "Eligibility" | "Recommendations" */}
        <div className="border-b border-[#E4E1D8] mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3.5 text-sm font-medium transition cursor-pointer border-b-2 -mb-px ${
                    isActive
                      ? 'border-[#1F6F5C] text-[#1F6F5C] font-semibold'
                      : 'border-transparent text-[#5B6670] hover:text-[#12181B] hover:border-[#D8D5CA]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Container — Exactly ONE Tab visible at a time */}
        <div className="transition-opacity duration-200">
          {/* TAB 1: RESUME */}
          {activeTab === 'resume' && (
            <div>
              {!analysis || isUploadingAnother ? (
                <div>
                  <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
                  {analysis && isUploadingAnother && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={() => setIsUploadingAnother(false)}
                        className="text-xs text-[#5B6670] hover:underline"
                      >
                        Cancel and view current analysis
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* AI Analysis Structured Display */
                <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-2xs">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#E4E1D8] mb-6">
                    <div>
                      <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
                        AI RESUME ANALYSIS
                      </p>
                      <h2
                        className="italic text-2xl text-[#12181B]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        Structured Resume Feedback
                      </h2>
                    </div>

                    <button
                      onClick={() => setIsUploadingAnother(true)}
                      className="text-xs font-medium text-[#5B6670] hover:text-[#12181B] border border-[#D8D5CA] rounded-xl px-3.5 py-2 hover:bg-[#F4F2EB] transition cursor-pointer"
                    >
                      Upload another
                    </button>
                  </div>

                  {/* Prominent Readiness Score Card */}
                  <div className="p-5 rounded-xl bg-[#F4F2EB] border border-[#E4E1D8] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-wider text-[#1F6F5C] mb-0.5">
                        OVERALL RESUME QUALITY
                      </p>
                      <p className="text-xs text-[#5B6670]">
                        Evaluated across technical skill breadth, bullet specificity, and structure.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 self-start sm:self-auto bg-white px-4 py-2 rounded-xl border border-[#E4E1D8]">
                      <span
                        className="text-3xl font-semibold text-[#12181B]"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {analysis.readinessScore ?? 0}
                      </span>
                      <span className="text-xs font-mono text-[#5B6670]">/100</span>
                    </div>
                  </div>

                  {/* Skills Tag Pills */}
                  <div className="mb-8">
                    <h3 className="text-xs font-mono tracking-wider text-[#5B6670] uppercase mb-3">
                      Skills Found ({analysis.extractedSkills?.length || 0})
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

                  {/* Strengths & Suggestions — Positive Accent Visual Cue */}
                  <div className="grid md:grid-cols-2 gap-5 mb-6">
                    {/* Strengths */}
                    <div className="p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
                        <h4 className="text-xs font-semibold text-[#1F6F5C] uppercase tracking-wider">
                          Key Strengths
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-[#12181B]">
                        {analysis.strengths && analysis.strengths.length > 0 ? (
                          analysis.strengths.map((s, i) => (
                            <li key={i} className="leading-relaxed flex items-start gap-2">
                              <span className="text-[#1F6F5C] mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-[#5B6670]">No specific strengths extracted</li>
                        )}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
                        <h4 className="text-xs font-semibold text-[#1F6F5C] uppercase tracking-wider">
                          Actionable Improvements
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-[#12181B]">
                        {analysis.suggestions && analysis.suggestions.length > 0 ? (
                          analysis.suggestions.map((s, i) => (
                            <li key={i} className="leading-relaxed flex items-start gap-2">
                              <span className="text-[#1F6F5C] mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-[#5B6670]">No suggestions provided</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Weaknesses / Growth Areas — Neutral & Supportive Tone (NOT red/alarming) */}
                  <div className="p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-2 h-2 rounded-full bg-[#5B6670]" />
                      <h4 className="text-xs font-semibold text-[#5B6670] uppercase tracking-wider">
                        Areas for Development
                      </h4>
                    </div>
                    <ul className="space-y-2 text-xs text-[#5B6670]">
                      {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                        analysis.weaknesses.map((w, i) => (
                          <li key={i} className="leading-relaxed flex items-start gap-2">
                            <span className="text-[#5B6670] mt-0.5">•</span>
                            <span>{w}</span>
                          </li>
                        ))
                      ) : (
                        <li>No areas for development highlighted</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SKILL GAP */}
          {activeTab === 'skill-gap' && (
            <SkillGapPanel
              skillGap={skillGap}
              targetRole={currentRole}
              roles={roles}
              onSelectTargetRole={handleTargetRoleChange}
              onSkillGapUpdated={setSkillGap}
              hasResume={Boolean(analysis)}
            />
          )}

          {/* TAB 3: ELIGIBILITY */}
          {activeTab === 'eligibility' && <CompanyEligibility profile={profile} />}

          {/* TAB 4: RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <RecommendationsList targetRole={currentRole} hasResume={Boolean(analysis)} />
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;