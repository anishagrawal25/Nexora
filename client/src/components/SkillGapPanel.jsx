import { useState, useMemo } from 'react';
import {
  Target,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Check,
} from 'lucide-react';
import { apiRequest } from '../api';
import Combobox from './Combobox';
import {
  getSkillDomain,
  getSkillEstimate,
  getSkillTopics,
  getSkillResource,
  getContextualReason,
} from '../utils/skillMetadata';

function SkillGapPanel({
  skillGap,
  targetRole,
  roles = [],
  analysis = null,
  onSelectTargetRole,
  onSkillGapUpdated,
  onNavigateTab,
  hasResume,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'high' | 'medium' | 'verified'

  const targetRoleName =
    typeof targetRole === 'string'
      ? targetRole
      : targetRole?.name || skillGap?.targetRole || '';

  async function handleGenerateSkillGap(customRoleName) {
    const roleToUse = customRoleName || targetRoleName;
    if (!roleToUse) return;

    if (!hasResume) {
      setError('Please upload and analyze your resume first in the Resume tab.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload =
        targetRole && targetRole.id && !customRoleName
          ? { targetRoleId: targetRole.id }
          : { targetRole: roleToUse };

      const data = await apiRequest('/profile/skill-gap', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (onSkillGapUpdated) {
        onSkillGapUpdated(data.skillGap);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const missingSkills = useMemo(() => skillGap?.missingSkills || [], [skillGap]);
  const priorityMap = useMemo(() => skillGap?.priority || {}, [skillGap]);

  // Extract candidate's verified skills from resume analysis
  const resumeSkills = useMemo(() => {
    return Array.isArray(analysis?.extractedSkills) ? analysis.extractedSkills : [];
  }, [analysis]);

  // Determine all expected benchmark skills for current target role
  const roleExpectedSkills = useMemo(() => {
    if (targetRole && Array.isArray(targetRole.expected_skills)) {
      return targetRole.expected_skills;
    }
    const matched = roles.find((r) => r.name?.toLowerCase() === targetRoleName.toLowerCase());
    if (matched && Array.isArray(matched.expected_skills)) {
      return matched.expected_skills;
    }
    // Fallback based on missing + verified skills
    const combined = [...missingSkills];
    resumeSkills.forEach((s) => {
      if (!combined.some((item) => item.toLowerCase() === s.toLowerCase())) {
        combined.push(s);
      }
    });
    return combined;
  }, [targetRole, roles, targetRoleName, missingSkills, resumeSkills]);

  // Compute verified skills that match the benchmark
  const verifiedBenchmarkSkills = useMemo(() => {
    return roleExpectedSkills.filter(
      (skill) => !missingSkills.some((m) => m.toLowerCase() === skill.toLowerCase())
    );
  }, [roleExpectedSkills, missingSkills]);

  // Categorize missing skills by priority
  const highPriorityGaps = useMemo(() => {
    return missingSkills.filter(
      (s) => String(priorityMap[s] || 'Medium').toLowerCase() === 'high'
    );
  }, [missingSkills, priorityMap]);

  const mediumAndSupportingGaps = useMemo(() => {
    return missingSkills.filter(
      (s) => String(priorityMap[s] || 'Medium').toLowerCase() !== 'high'
    );
  }, [missingSkills, priorityMap]);

  const totalBenchmarkCount = roleExpectedSkills.length;
  const verifiedCount = verifiedBenchmarkSkills.length;
  const matchPercentage =
    totalBenchmarkCount > 0 ? Math.round((verifiedCount / totalBenchmarkCount) * 100) : 0;

  function getPriorityBadge(priority) {
    const p = String(priority).toLowerCase();
    if (p === 'high') {
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-medium bg-[#FDF0ED] text-[#9E2A2B] border-[#F5CAC3]">
          High Priority
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-medium bg-[#FEF6E9] text-[#8C5819] border-[#F6E0B8]">
          Medium Priority
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-medium bg-[#F2EFE9] text-[#5B6670] border-[#E4E1D8]">
        Supporting
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
          <div>
            <div className="flex items-center gap-2">
              {skillGap?.isEstimate && (
                <span className="text-xs text-[#5B6670]">
                  General guidance
                </span>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#12181B] mt-0.5">
              Skill gaps
            </h2>
            <p className="text-xs text-[#5B6670] mt-1">
              {targetRoleName ? (
                <>
                  Comparing your resume with the skills for{' '}
                  <strong className="text-[#12181B] font-medium">{targetRoleName}</strong> technical
                  .
                </>
              ) : (
                'Choose or enter a role to see the skills it calls for.'
              )}
            </p>
          </div>

          {targetRoleName && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleGenerateSkillGap()}
                disabled={loading}
                className="bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] text-white text-xs font-medium px-4 py-2 rounded-xl transition disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Re-evaluating...' : skillGap ? 'Refresh Gaps' : 'Run Gap Analysis'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {skillGap?.isEstimate && (
          <div className="mt-4 p-3.5 rounded-xl bg-[#F2EFE9] border border-[#E4E1D8] text-xs text-[#5B6670] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-[#1F6F5C] mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-[#12181B]">General guidance: </span>
              {skillGap.note ||
                `We do not have a saved benchmark for '${targetRoleName}', so this comparison is approximate.`}
            </div>
          </div>
        )}

        {/* Empty Role Selector State */}
        {!targetRoleName && (
          <div className="mt-6 text-center py-10 px-4 border border-dashed border-[#E4E1D8] rounded-xl bg-[#FBFAF6]">
            <Target className="w-8 h-8 text-[#5B6670] mx-auto mb-2" />
            <h3 className="font-serif text-base text-[#12181B] mb-1">Choose a role</h3>
            <p className="text-xs text-[#5B6670] max-w-sm mx-auto mb-4">
              Type any career goal or choose from established engineering tracks to evaluate your
              skill profile.
            </p>
            <div className="max-w-xs mx-auto">
              <Combobox
                options={roles}
                placeholder="e.g. Full Stack Developer..."
                onChange={(val, matchedOpt) => {
                  if (val && val.trim()) {
                    if (onSelectTargetRole) {
                      onSelectTargetRole(matchedOpt ? matchedOpt.id : null, val.trim());
                    }
                  }
                }}
              />
            </div>
          </div>
        )}

        {targetRoleName && !hasResume && (
          <div className="mt-6 border-t border-[#E4E1D8] pt-6">
            <h3 className="text-base font-semibold text-[#12181B]">Add a resume to compare skills</h3>
            <p className="mt-1 text-xs text-[#5B6670]">
              We need an analyzed resume before we can identify your gaps for {targetRoleName}.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab?.('resume')}
              className="mt-4 rounded-lg bg-[#1F6F5C] px-4 py-2 text-xs font-medium text-white hover:bg-[#185849]"
            >
              Go to your resume
            </button>
          </div>
        )}

        {/* Benchmark Overview Metrics Bar */}
        {targetRoleName && skillGap && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex flex-col justify-between">
              <span className="text-xs text-[#5B6670] font-medium">
                Benchmark Match
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-[#12181B]">
                  {matchPercentage}%
                </span>
                <span className="text-[11px] font-mono text-[#5B6670]">
                  ({verifiedCount}/{totalBenchmarkCount || missingSkills.length})
                </span>
              </div>
              <p className="text-[11px] text-[#5B6670]">Requirements met</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex flex-col justify-between">
              <span className="text-xs text-[#5B6670] font-medium">
                Core Gaps (High)
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-[#9E2A2B]">
                  {highPriorityGaps.length}
                </span>
                <span className="text-[11px] font-mono text-[#5B6670]">critical</span>
              </div>
              <p className="text-[11px] text-[#5B6670]">High priority focus</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex flex-col justify-between">
              <span className="text-xs text-[#5B6670] font-medium">
                Supporting Gaps
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-[#8C5819]">
                  {mediumAndSupportingGaps.length}
                </span>
                <span className="text-[11px] font-mono text-[#5B6670]">secondary</span>
              </div>
              <p className="text-[11px] text-[#5B6670]">Medium / low priority</p>
            </div>

            <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex flex-col justify-between">
              <span className="text-xs text-[#5B6670] font-medium">
                Skills on your resume
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-[#1F6F5C]">
                  {verifiedCount}
                </span>
                <span className="text-[11px] font-mono text-[#5B6670]">on resume</span>
              </div>
              <p className="text-[11px] text-[#5B6670]">Verified competencies</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Body when role & skillGap exist */}
      {targetRoleName && skillGap && (
        <div className="space-y-6">
          {/* Segmented Filter Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F2EFE9] p-1 border border-[#E4E1D8] rounded-xl shadow-xs">
            <div className="flex items-center gap-1">
              <span className="text-xs text-[#5B6670] px-2 hidden sm:inline">
                Filter:
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                All Requirements ({roleExpectedSkills.length || missingSkills.length})
              </button>
              <button
                onClick={() => setActiveFilter('high')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'high'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                High Priority ({highPriorityGaps.length})
              </button>
              <button
                onClick={() => setActiveFilter('medium')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'medium'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                Supporting ({mediumAndSupportingGaps.length})
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  activeFilter === 'verified'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                Verified on Resume ({verifiedCount})
              </button>
            </div>

            <div className="text-[11px] text-[#5B6670] font-mono pr-2 hidden md:inline">
              Sorted by hiring weight
            </div>
          </div>

          {/* ZERO GAPS STATE */}
          {missingSkills.length === 0 && (
            <div className="p-6 rounded-2xl bg-[#EBF3F0] border border-[#CDE3DC] text-[#1F6F5C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F6F5C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-base text-[#12181B]">All listed role skills appear on your resume</h4>
                  <p className="text-xs text-[#5B6670] mt-1 max-w-xl">
                    Your profile matches all expected technical competencies for{' '}
                    <strong className="text-[#12181B]">{targetRoleName}</strong> in this comparison.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('eligibility')}
                className="text-xs font-medium text-[#12181B] bg-white border border-[#E4E1D8] px-4 py-2 rounded-xl hover:bg-[#F2EFE9] transition cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
              >
                Check Company Eligibility →
              </button>
            </div>
          )}

          {/* SECTION 1: HIGH PRIORITY GAPS */}
          {(activeFilter === 'all' || activeFilter === 'high') && highPriorityGaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9E2A2B]" />
                  <h3 className="text-sm font-semibold text-[#12181B]">
                    Core Missing Competencies ({highPriorityGaps.length})
                  </h3>
                </div>
                <span className="text-[11px] text-[#5B6670]">
                  Critical prerequisites for technical screening
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {highPriorityGaps.map((skill) => {
                  const domain = getSkillDomain(skill);
                  const estimate = getSkillEstimate(skill);
                  const topics = getSkillTopics(skill);
                  const resource = getSkillResource(skill);
                  const reason = getContextualReason(skill, targetRoleName, false);

                  return (
                    <div
                      key={skill}
                      className="bg-white border border-[#E4E1D8] rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-[#1F6F5C]/40 transition"
                    >
                      <div>
                        {/* Card Top: Name, Domain, Priority */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-[#12181B]">{skill}</h4>
                              <span className="text-[11px] text-[#5B6670]">
                                {domain}
                              </span>
                            </div>
                          </div>
                          {getPriorityBadge('High')}
                        </div>

                        {/* Contextual Reason */}
                        <div className="p-3 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] mb-3.5">
                          <p className="text-xs text-[#5B6670] leading-relaxed font-normal">
                            {reason}
                          </p>
                        </div>

                        {/* Metadata Specs */}
                        <div className="grid grid-cols-2 gap-2 mb-3.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-[#5B6670]">
                            <Clock className="w-3.5 h-3.5 text-[#5B6670] shrink-0" />
                            <span>Prep Time: </span>
                            <strong className="text-[#12181B] font-medium">{estimate.time}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#5B6670]">
                            <Layers className="w-3.5 h-3.5 text-[#5B6670] shrink-0" />
                            <span>Target Stage: </span>
                            <strong className="text-[#12181B] font-medium">
                              {estimate.level}
                            </strong>
                          </div>
                        </div>

                        {/* Key Focus Topics */}
                        <div className="mb-4">
                          <span className="text-xs text-[#5B6670] font-medium block mb-1.5">
                            Topics to explore:
                          </span>
                          <ul className="space-y-1">
                            {topics.slice(0, 3).map((topic, i) => (
                              <li
                                key={i}
                                className="text-xs text-[#5B6670] flex items-center gap-1.5"
                              >
                                <span className="w-1 h-1 rounded-full bg-[#5B6670]" />
                                <span className="truncate">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Purposeful Action Bar */}
                      <div className="pt-3 border-t border-[#E4E1D8] flex items-center justify-between gap-2">
                        <button
                          onClick={() => onNavigateTab && onNavigateTab('recommendations')}
                          className="text-xs font-medium text-[#12181B] bg-[#F2EFE9] hover:bg-[#EAE6DD] border border-[#E4E1D8] px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#1F6F5C]" />
                          <span>Start Roadmap</span>
                          <ArrowRight className="w-3 h-3 text-[#5B6670]" />
                        </button>

                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#5B6670] hover:text-[#1F6F5C] inline-flex items-center gap-1 font-medium group"
                        >
                          <span>{resource.label}</span>
                          <ExternalLink className="w-3 h-3 text-[#5B6670] group-hover:text-[#1F6F5C] transition-colors" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: MEDIUM & SUPPORTING GAPS */}
          {(activeFilter === 'all' || activeFilter === 'medium') &&
            mediumAndSupportingGaps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8C5819]" />
                    <h3 className="text-sm font-semibold text-[#12181B]">
                      Supporting Technical Gaps ({mediumAndSupportingGaps.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#5B6670]">Secondary requirements & tooling</span>
                </div>

                <div className="bg-white border border-[#E4E1D8] rounded-2xl divide-y divide-[#E4E1D8] shadow-xs overflow-hidden">
                  {mediumAndSupportingGaps.map((skill) => {
                    const priority = priorityMap[skill] || 'Medium';
                    const domain = getSkillDomain(skill);
                    const estimate = getSkillEstimate(skill);
                    const resource = getSkillResource(skill);
                    const reason = getContextualReason(skill, targetRoleName, false);

                    return (
                      <div
                        key={skill}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FBFAF6] transition"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8C5819] mt-1.5 sm:mt-0 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-[#12181B]">{skill}</span>
                              <span className="text-[11px] text-[#5B6670]">
                                {domain}
                              </span>
                              {getPriorityBadge(priority)}
                            </div>
                            <p className="text-xs text-[#5B6670] mt-1 leading-relaxed">{reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pl-4 sm:pl-0">
                          <span className="text-[11px] font-mono text-[#5B6670] hidden md:inline">
                            Est: {estimate.time}
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#12181B] hover:text-[#1F6F5C] bg-white border border-[#E4E1D8] px-3 py-1.5 rounded-lg hover:bg-[#F2EFE9] inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <span>Open Docs</span>
                            <ExternalLink className="w-3 h-3 text-[#5B6670]" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* SECTION 3: VERIFIED COMPETENCIES */}
          {(activeFilter === 'all' || activeFilter === 'verified') &&
            verifiedBenchmarkSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#1F6F5C]" />
                    <h3 className="text-sm font-semibold text-[#12181B]">
                      Skills found on your resume ({verifiedBenchmarkSkills.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-[#5B6670]">
                    Found in your uploaded resume
                  </span>
                </div>

                <div className="bg-white border border-[#E4E1D8] rounded-2xl divide-y divide-[#E4E1D8] shadow-xs overflow-hidden">
                  {verifiedBenchmarkSkills.map((skill) => {
                    const domain = getSkillDomain(skill);
                    const resource = getSkillResource(skill);

                    return (
                      <div
                        key={skill}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FBFAF6] transition"
                      >
                        <div className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-[#1F6F5C] shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-[#12181B]">{skill}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F2EFE9] text-[#5B6670] border border-[#E4E1D8]">
                                {domain}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5B6670] mt-0.5">
                              Verified competency matched to {targetRoleName} benchmark
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border font-medium bg-[#EBF3F0] text-[#1F6F5C] border-[#CDE3DC]">
                            Verified
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#5B6670] hover:text-[#1F6F5C] p-1"
                            title="Reference documentation"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default SkillGapPanel;
