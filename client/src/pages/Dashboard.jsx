import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Target,
  Building2,
  Compass,
  Edit2,
  X,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../api';
import ResumeUpload from '../components/ResumeUpload';
import SkillGapPanel from '../components/SkillGapPanel';
import CompanyEligibility from '../components/CompanyEligibility';
import RecommendationsList from '../components/RecommendationsList';
import Combobox from '../components/Combobox';
import ReadinessBreakdown from '../components/ReadinessBreakdown';

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
    Promise.resolve().then(loadDashboardData);
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
      <div className="min-h-screen bg-[#FBFAF6] flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-[#1F6F5C] border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-xs text-[#5B6670] tracking-wider uppercase">
          Loading workspace...
        </p>
      </div>
    );
  }

  const currentRole =
    roles.find((r) => Number(r.id) === Number(profile?.target_role_id)) ||
    (selectedRoleName ? { name: selectedRoleName } : null);
  const completenessScore = calculateProfileCompleteness(profile);
  const displayScore = analysis ? readinessData?.score ?? null : null;

  const tabs = [
    { id: 'resume', label: 'Your resume', icon: FileText },
    { id: 'skill-gap', label: 'Skill gaps', icon: Target },
    { id: 'eligibility', label: 'Check a company', icon: Building2 },
    { id: 'recommendations', label: 'What to learn next', icon: Compass },
  ];

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#12181B] flex flex-col font-sans selection:bg-[#EBF3F0] selection:text-[#1F6F5C]">
      {/* SaaS Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#FBFAF6]/95 backdrop-blur-md border-b border-[#E4E1D8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1F6F5C] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
              </div>
              <span className="font-mono text-xs tracking-widest font-semibold text-[#12181B] uppercase">
                NEXORA
              </span>
            </div>
            <span className="text-[#E4E1D8] text-sm hidden sm:inline">/</span>
            <span className="text-xs text-[#5B6670] hidden sm:inline">
              Career readiness
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-[#E4E1D8] text-xs text-[#5B6670]">
              <div className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
              <span className="font-mono text-[#12181B]">{profile.email}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-[#5B6670] hover:text-[#12181B] bg-white border border-[#E4E1D8] hover:bg-[#F2EFE9] px-3 py-1.5 rounded-lg transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <LogOut className="w-3.5 h-3.5 text-[#5B6670]" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-6 py-8 w-full flex-1">
        {/* Page Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-[#E4E1D8]">
          <div>
            <h1 className="font-serif display-serif text-2xl sm:text-3xl font-medium text-[#12181B]">
              Welcome back, {profile.name}
            </h1>
            <p className="text-xs text-[#5B6670] mt-1">
              Your resume, role gaps, company checks, and next steps.
            </p>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-medium text-[#12181B] hover:text-[#1F6F5C] bg-white border border-[#E4E1D8] hover:border-[#1F6F5C]/40 px-3.5 py-2 rounded-xl transition shadow-xs inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#5B6670]" />
            <span>{isEditingProfile ? 'Close Editor' : 'Edit Academic Profile'}</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Row of 3 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Stat Card 1: Readiness Score (Restrained - No decorative pills) */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-[#5B6670] uppercase font-medium">
                READINESS SCORE
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-1.5">
              {displayScore !== null ? (
                <>
                  <span className="text-3xl font-semibold font-mono text-[#12181B] tracking-tight">
                    {displayScore}
                  </span>
                  <span className="text-xs font-mono text-[#5B6670]">/100</span>
                </>
              ) : (
                <>
                  <span className="text-3xl font-semibold font-mono text-[#5B6670]/40 tracking-tight">
                    --
                  </span>
                  <span className="text-xs font-mono text-[#5B6670]/60">/100</span>
                </>
              )}
            </div>
            <p className="text-xs text-[#5B6670] leading-relaxed">
              {displayScore !== null
                ? 'Based on your profile, resume, and chosen role.'
                : 'Upload a resume and choose a role to see your score.'}
            </p>
          </div>

          {/* Stat Card 2: Profile Completeness */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-widest text-[#5B6670] uppercase font-medium">
                COMPLETENESS
              </span>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="text-xs text-[#1F6F5C] hover:text-[#185849] font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingProfile ? 'Close' : 'Edit'}</span>
              </button>
            </div>
            <div className="my-2.5 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold font-mono text-[#12181B] tracking-tight">
                {completenessScore}%
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {profile.cgpa ? (
                <span className="text-xs text-[#12181B]">CGPA {profile.cgpa}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs text-[#1F6F5C] hover:underline cursor-pointer"
                >
                  + Set CGPA
                </button>
              )}
              {profile.grad_year ? (
                <span className="text-xs text-[#12181B]">Batch {profile.grad_year}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-xs text-[#1F6F5C] hover:underline cursor-pointer"
                >
                  + Set Batch
                </button>
              )}
            </div>
          </div>

          {/* Stat Card 3: Target Role Combobox */}
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono tracking-widest text-[#5B6670] uppercase font-medium">
                TARGET ROLE
              </span>
            </div>
            <div className="my-1">
              <Combobox
                value={selectedRoleName}
                options={roles}
                placeholder="Type or pick target role..."
                onChange={(val, matchedOpt) => {
                  handleTargetRoleChange(matchedOpt ? matchedOpt.id : null, val);
                }}
              />
            </div>
          </div>
        </div>

        {/* Optional Collapsible Profile Editor */}
        {isEditingProfile && (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 mb-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8] mb-5">
              <div>
                <h3 className="font-serif text-lg text-[#12181B]">
                  Edit your profile
                </h3>
                <p className="text-xs text-[#5B6670] mt-0.5">
                  These values are used to evaluate eligibility against company criteria cutoffs.
                </p>
              </div>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1 rounded-lg text-[#5B6670] hover:text-[#12181B] hover:bg-[#F2EFE9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#12181B] mb-1.5">
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
                    className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#12181B] focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#12181B] mb-1.5">
                    Graduation Batch (Year)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2026"
                    value={formData.grad_year}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, grad_year: e.target.value }))
                    }
                    className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#12181B] focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#12181B] mb-1.5">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, github_url: e.target.value }))
                    }
                    className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#12181B] focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#12181B] mb-1.5">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, linkedin_url: e.target.value }))
                    }
                    className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#12181B] focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#12181B] mb-1.5">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://yourportfolio.dev"
                    value={formData.portfolio_url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, portfolio_url: e.target.value }))
                    }
                    className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#12181B] focus:outline-none focus:border-[#1F6F5C] focus:ring-2 focus:ring-[#1F6F5C]/15"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#1F6F5C] text-white text-xs font-medium px-5 py-2.5 rounded-xl hover:bg-[#185849] active:bg-[#14493D] transition disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-xs text-[#5B6670] hover:text-[#12181B] px-3 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div role="tablist" aria-label="Career readiness sections" className="flex gap-5 overflow-x-auto border-b border-[#E4E1D8] mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 border-b-2 py-3 text-xs sm:text-sm font-medium cursor-pointer inline-flex items-center gap-2 ${
                  isActive
                    ? 'border-[#1F6F5C] text-[#12181B] font-semibold'
                    : 'border-transparent text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1F6F5C]' : 'text-[#5B6670]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
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
                        className="text-xs text-[#5B6670] hover:text-[#12181B] hover:underline"
                      >
                        Cancel and view current analysis
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* AI Analysis Structured Display */
                <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-xs">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E4E1D8] mb-6">
                    <div>
                      <h2 className="font-serif text-xl text-[#12181B]">
                        Resume feedback
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        onClick={() => setIsUploadingAnother(true)}
                        className="text-xs font-medium text-[#12181B] hover:text-[#1F6F5C] bg-white border border-[#E4E1D8] rounded-xl px-3.5 py-1.5 hover:bg-[#F2EFE9] transition cursor-pointer shadow-xs"
                      >
                        Upload new PDF
                      </button>
                      <button
                        onClick={() => setActiveTab('skill-gap')}
                        className="text-xs font-medium text-white bg-[#1F6F5C] hover:bg-[#185849] rounded-xl px-4 py-1.5 transition cursor-pointer shadow-sm inline-flex items-center gap-1.5"
                      >
                        <span>View skill gaps</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Prominent Readiness Score Card */}
                  <div className="p-4 sm:p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-[#12181B]">
                        Resume Technical Quality Index
                      </p>
                      <p className="text-xs text-[#5B6670] mt-1 max-w-lg">
                        Evaluated across technical skill breadth, bullet impact, and structural depth against standard software roles.
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 bg-white px-4 py-2 rounded-xl border border-[#E4E1D8] shadow-xs self-start sm:self-auto">
                      <span className="text-2xl sm:text-3xl font-semibold font-mono text-[#1F6F5C]">
                        {analysis.readinessScore ?? 0}
                      </span>
                      <span className="text-xs font-mono text-[#5B6670]">/100</span>
                    </div>
                  </div>

                  {/* Skills Tag Pills */}
                  <div className="mb-6">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[#5B6670] font-medium mb-2.5">
                      Extracted Technical Competencies ({analysis.extractedSkills?.length || 0})
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.extractedSkills && analysis.extractedSkills.length > 0 ? (
                        analysis.extractedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-[#F2EFE9] text-[#12181B] border border-[#E4E1D8] rounded-lg px-2.5 py-1"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#5B6670]">No skills extracted</span>
                      )}
                    </div>
                  </div>

                  {/* Strengths & Suggestions Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-5">
                    {/* Strengths */}
                    <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F5C]" />
                        <h4 className="text-xs font-semibold text-[#12181B] uppercase tracking-wider font-mono">
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
                    <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F5C]" />
                        <h4 className="text-xs font-semibold text-[#12181B] uppercase tracking-wider font-mono">
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

                  {/* Areas for Development */}
                  <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8C5819]" />
                      <h4 className="text-xs font-semibold text-[#12181B] uppercase tracking-wider font-mono">
                        Areas for Development
                      </h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#5B6670]">
                      {analysis.weaknesses && analysis.weaknesses.length > 0 ? (
                        analysis.weaknesses.map((w, i) => (
                          <li key={i} className="leading-relaxed flex items-start gap-2">
                            <span className="text-[#8C5819] mt-0.5">•</span>
                            <span>{w}</span>
                          </li>
                        ))
                      ) : (
                        <li>No areas for development highlighted</li>
                      )}
                    </ul>
                  </div>

                  {analysis && readinessData && (
                    <div className="mt-6">
                      <ReadinessBreakdown readiness={readinessData} targetRoleName={selectedRoleName} />
                    </div>
                  )}
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