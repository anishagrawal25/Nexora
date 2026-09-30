import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  Building2,
  Compass,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Edit2,
  X,
  LogOut,
  User,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { apiRequest } from '../api';
import ResumeUpload from '../components/ResumeUpload';
import SkillGapPanel from '../components/SkillGapPanel';
import CompanyEligibility from '../components/CompanyEligibility';
import RecommendationsList from '../components/RecommendationsList';
import Combobox from '../components/Combobox';

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
  const [selectedRoleName, setSelectedRoleName] = useState('');
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
      const fetchedRoles = rolesRes.roles || [];
      setRoles(fetchedRoles);

      if (profileRes?.target_role_id) {
        const found = fetchedRoles.find((r) => Number(r.id) === Number(profileRes.target_role_id));
        if (found) {
          setSelectedRoleName(found.name);
        }
      }

      if (readinessRes) {
        setReadinessData(readinessRes.readiness);
        if (readinessRes.latestAnalysis) {
          setAnalysis(readinessRes.latestAnalysis);
        }
        if (readinessRes.profile?.target_role_name) {
          setSelectedRoleName(readinessRes.profile.target_role_name);
        }
      }

      if (skillGapRes?.skillGap) {
        setSkillGap(skillGapRes.skillGap);
        if (skillGapRes.skillGap.targetRole) {
          setSelectedRoleName(skillGapRes.skillGap.targetRole);
        }
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

  async function handleTargetRoleChange(newRoleId, customRoleName) {
    const roleIdNum = newRoleId ? Number(newRoleId) : null;
    const roleName = customRoleName || (roles.find((r) => Number(r.id) === roleIdNum)?.name) || '';
    setSelectedRoleName(roleName);

    try {
      if (roleIdNum) {
        const updated = await apiRequest('/profile', {
          method: 'PUT',
          body: JSON.stringify({
            ...profile,
            target_role_id: roleIdNum,
          }),
        });
        setProfile(updated);
        setFormData((prev) => ({ ...prev, target_role_id: roleIdNum }));
      }

      // Refresh readiness & skill gap
      const readinessUrl = roleIdNum
        ? `/profile/readiness`
        : `/profile/readiness?targetRole=${encodeURIComponent(roleName)}`;

      const skillGapPayload = roleIdNum
        ? { targetRoleId: roleIdNum }
        : { targetRole: roleName };

      const [newReadiness, newSkillGap] = await Promise.all([
        apiRequest(readinessUrl).catch(() => null),
        apiRequest('/profile/skill-gap', {
          method: 'POST',
          body: JSON.stringify(skillGapPayload),
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
        selectedRoleName || profile?.target_role_id
          ? apiRequest('/profile/skill-gap', {
              method: 'POST',
              body: JSON.stringify(
                profile?.target_role_id
                  ? { targetRoleId: profile.target_role_id }
                  : { targetRole: selectedRoleName }
              ),
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
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-zinc-500 tracking-wider uppercase">
          Loading workspace...
        </p>
      </div>
    );
  }

  const currentRole =
    roles.find((r) => Number(r.id) === Number(profile?.target_role_id)) ||
    (selectedRoleName ? { name: selectedRoleName } : null);
  const completenessScore = calculateProfileCompleteness(profile);
  const displayScore = analysis?.readinessScore ?? readinessData?.score ?? null;

  const tabs = [
    { id: 'resume', label: 'Resume Analysis', icon: FileText },
    { id: 'skill-gap', label: 'Skill Gap Matrix', icon: Target },
    { id: 'eligibility', label: 'Company Eligibility', icon: Building2 },
    { id: 'recommendations', label: 'Curated Roadmaps', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex flex-col font-sans">
      {/* SaaS Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-white">
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <span className="font-mono text-xs tracking-widest font-semibold text-zinc-900 uppercase">
                NEXORA
              </span>
            </div>
            <span className="text-zinc-300 text-sm hidden sm:inline">/</span>
            <span className="text-xs text-zinc-500 hidden sm:inline font-mono">
              Placement Readiness
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono">{profile.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-zinc-600 hover:text-zinc-900 bg-white border border-zinc-200 hover:bg-zinc-50 px-3 py-1.5 rounded-md transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1">
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-6 border-b border-zinc-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900 tracking-tight">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review your placement readiness score, benchmark against role requirements, and bridge skill gaps.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
              Graduation: <strong>{profile.grad_year || 'Not Set'}</strong>
            </span>
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
              CGPA: <strong>{profile.cgpa || 'Not Set'}</strong>
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Row of 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Stat Card 1: Readiness Score */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                READINESS SCORE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                Formula
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1.5">
              {displayScore !== null ? (
                <>
                  <span className="text-3xl font-semibold font-mono text-zinc-900 tracking-tight">
                    {displayScore}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">/100</span>
                </>
              ) : (
                <span className="text-2xl text-zinc-400 font-mono">—</span>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {displayScore !== null ? 'Multi-factor weighted index' : 'Upload resume to calculate'}
            </p>
          </div>

          {/* Stat Card 2: Profile Completeness */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                COMPLETENESS
              </span>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-zinc-700 hover:text-zinc-900 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingProfile ? 'Close' : 'Edit info'}</span>
              </button>
            </div>
            <div className="my-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold font-mono text-zinc-900 tracking-tight">
                {completenessScore}%
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {profile.cgpa ? `CGPA ${profile.cgpa}` : 'CGPA missing'} •{' '}
              {profile.grad_year ? `Batch ${profile.grad_year}` : 'Batch missing'}
            </p>
          </div>

          {/* Stat Card 3: Target Role Compact Combobox */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium mb-1">
              Your dream role
            </span>
            <div className="my-1.5">
              <Combobox
                value={selectedRoleName}
                options={roles}
                placeholder="Where do you want to end up?"
                onChange={(val, matchedOpt) => {
                  handleTargetRoleChange(matchedOpt ? matchedOpt.id : null, val);
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-zinc-500">Benchmark for gap matrix</p>
              {skillGap?.isEstimate && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                  Estimate
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Optional Collapsible Profile Editor */}
        {isEditingProfile && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  Edit Academic & Portfolio Details
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  These values are used to evaluate eligibility against company criteria cutoffs.
                </p>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    CGPA (Scale of 10.0)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="e.g. 8.50"
                    value={formData.cgpa}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cgpa: e.target.value }))}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Graduation Batch (Year)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={formData.grad_year}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, grad_year: e.target.value }))
                    }
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
                    }
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={formData.portfolio_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
                    }
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs text-zinc-600 hover:text-zinc-900 px-3 py-2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabbed Navigation: "Resume" | "Skill Gap" | "Eligibility" | "Recommendations" */}
        <div className="border-b border-zinc-200 mb-6">
          <nav className="flex space-x-6 sm:space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-xs sm:text-sm font-medium transition cursor-pointer border-b-2 -mb-px inline-flex items-center gap-2 ${
                    isActive
                      ? 'border-zinc-900 text-zinc-900 font-semibold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-900' : 'text-zinc-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Container */}
        <div>
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
                        className="text-xs text-zinc-500 hover:text-zinc-900 hover:underline"
                      >
                        Cancel and view current analysis
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* AI Analysis Structured Display */
                <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-5 border-b border-zinc-200 mb-5">
                    <div>
                      <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                        AI RESUME ANALYSIS
                      </span>
                      <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
                        Structured Resume Feedback
                      </h2>
                    </div>

                    <button
                      onClick={() => setIsUploadingAnother(true)}
                      className="text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 rounded-lg px-3.5 py-1.5 hover:bg-zinc-50 transition cursor-pointer shadow-xs"
                    >
                      Upload new PDF
                    </button>
                  </div>

                  {/* Prominent Readiness Score Card */}
                  <div className="p-4 rounded-lg bg-zinc-50/70 border border-zinc-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-zinc-900">
                        Overall Resume Quality Score
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Evaluated across technical skill breadth, bullet impact, and structural depth.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 bg-white px-3.5 py-1.5 rounded-lg border border-zinc-200 shadow-xs self-start sm:self-auto">
                      <span className="text-2xl font-semibold font-mono text-zinc-900">
                        {analysis.readinessScore ?? 0}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">/100</span>
                    </div>
                  </div>

                  {/* Skills Tag Pills */}
                  <div className="mb-6">
                    <h3 className="text-xs font-mono tracking-wider text-zinc-500 uppercase font-medium mb-2.5">
                      Extracted Technical Skills ({analysis.extractedSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extractedSkills && analysis.extractedSkills.length > 0 ? (
                        analysis.extractedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200/80 rounded-md px-2.5 py-1"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-400">No skills extracted</span>
                      )}
                    </div>
                  </div>

                  {/* Strengths & Suggestions Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {/* Strengths */}
                    <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                          Key Strengths
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        {analysis.strengths && analysis.strengths.length > 0 ? (
                          analysis.strengths.map((s, i) => (
                            <li key={i} className="leading-relaxed flex items-start gap-2">
                              <span className="text-zinc-400 mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400">No specific strengths extracted</li>
                        )}
                      </ul>
                    </div>

                    {/* Suggestions */}
                    <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                          Actionable Improvements
                        </h4>
                      </div>
                      <ul className="space-y-2 text-xs text-zinc-700">
                        {analysis.suggestions && analysis.suggestions.length > 0 ? (
                          analysis.suggestions.map((s, i) => (
                            <li key={i} className="leading-relaxed flex items-start gap-2">
                              <span className="text-zinc-400 mt-0.5">•</span>
                              <span>{s}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-zinc-400">No suggestions provided</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Areas for Development */}
                  <div className="p-4 rounded-lg bg-zinc-50/50 border border-zinc-200">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      <h4 className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                        Areas for Development
                      </h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-600">
                      {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                        analysis.weaknesses.map((w, i) => (
                          <li key={i} className="leading-relaxed flex items-start gap-2">
                            <span className="text-zinc-400 mt-0.5">•</span>
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
              analysis={analysis}
              onSelectTargetRole={handleTargetRoleChange}
              onSkillGapUpdated={setSkillGap}
              onNavigateTab={(tab) => setActiveTab(tab)}
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