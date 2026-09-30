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
  ShieldCheck,
  Filter,
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
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium bg-rose-50 text-rose-700 border-rose-200">
          High Priority
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium bg-amber-50 text-amber-800 border-amber-200">
          Medium Priority
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium bg-zinc-100 text-zinc-700 border-zinc-200">
        Supporting
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                GAP ASSESSMENT
              </span>
              {skillGap?.isEstimate && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Heuristic Baseline
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
              Role Skill Gap Matrix
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              {targetRoleName ? (
                <>
                  Benchmarking your resume against{' '}
                  <strong className="text-zinc-900 font-medium">{targetRoleName}</strong> technical
                  competencies.
                </>
              ) : (
                'Select a target role to benchmark technical competencies and identify missing requirements.'
              )}
            </p>
          </div>

          {targetRoleName && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => handleGenerateSkillGap()}
                disabled={loading}
                className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Re-evaluating...' : skillGap ? 'Refresh Gaps' : 'Run Gap Analysis'}
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {skillGap?.isEstimate && (
          <div className="mt-4 p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-950">General Role Guidance: </span>
              {skillGap.note ||
                `Using standard industry competencies for '${targetRoleName}' since custom benchmark data is evolving.`}
            </div>
          </div>
        )}

        {/* Empty Role Selector State */}
        {!targetRoleName && (
          <div className="mt-6 text-center py-10 px-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">Select your target track</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
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

        {/* Benchmark Overview Metrics Bar */}
        {targetRoleName && skillGap && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Benchmark Match
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-zinc-900">
                  {matchPercentage}%
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  ({verifiedCount}/{totalBenchmarkCount || missingSkills.length})
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Requirements met</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Core Gaps (High)
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-rose-700">
                  {highPriorityGaps.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">critical</span>
              </div>
              <p className="text-[11px] text-zinc-500">High priority focus</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Supporting Gaps
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-amber-700">
                  {mediumAndSupportingGaps.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">secondary</span>
              </div>
              <p className="text-[11px] text-zinc-500">Medium / low priority</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Verified Skills
              </span>
              <div className="my-1.5 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-emerald-700">
                  {verifiedCount}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">on resume</span>
              </div>
              <p className="text-[11px] text-zinc-500">Verified competencies</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Analysis Body when role & skillGap exist */}
      {targetRoleName && skillGap && (
        <div className="space-y-6">
          {/* Segmented Filter Control */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 border border-zinc-200 rounded-lg shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-medium px-2 hidden sm:inline">
                Filter:
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  activeFilter === 'all'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                All Requirements ({roleExpectedSkills.length || missingSkills.length})
              </button>
              <button
                onClick={() => setActiveFilter('high')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  activeFilter === 'high'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                High Priority ({highPriorityGaps.length})
              </button>
              <button
                onClick={() => setActiveFilter('medium')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  activeFilter === 'medium'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Supporting ({mediumAndSupportingGaps.length})
              </button>
              <button
                onClick={() => setActiveFilter('verified')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  activeFilter === 'verified'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Verified on Resume ({verifiedCount})
              </button>
            </div>

            <div className="text-[11px] text-zinc-400 font-mono pr-2 hidden md:inline">
              Sorted by hiring weight
            </div>
          </div>

          {/* ZERO GAPS STATE */}
          {missingSkills.length === 0 && (
            <div className="p-6 rounded-xl bg-emerald-50/75 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold">100% Benchmark Coverage</h4>
                  <p className="text-xs text-emerald-800 mt-1 max-w-xl">
                    Your profile matches all expected technical competencies for{' '}
                    <strong>{targetRoleName}</strong>. You are fully positioned for technical
                    interview rounds on this track.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('eligibility')}
                className="text-xs font-medium text-emerald-950 bg-white border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-50 transition cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
              >
                Check Company Eligibility →
              </button>
            </div>
          )}

          {/* SECTION 1: HIGH PRIORITY GAPS (Structured Cards with Context & Focus Areas) */}
          {(activeFilter === 'all' || activeFilter === 'high') && highPriorityGaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
                    Core Missing Competencies ({highPriorityGaps.length})
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-500">
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
                      className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-zinc-300 transition"
                    >
                      <div>
                        {/* Card Top: Name, Domain, Priority */}
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-zinc-900">{skill}</h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                {domain}
                              </span>
                            </div>
                          </div>
                          {getPriorityBadge('High')}
                        </div>

                        {/* Contextual Reason */}
                        <div className="p-2.5 rounded-lg bg-zinc-50/80 border border-zinc-200/80 mb-3.5">
                          <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                            {reason}
                          </p>
                        </div>

                        {/* Honest Metadata Specs (No fake progress) */}
                        <div className="grid grid-cols-2 gap-2 mb-3.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>Prep Time: </span>
                            <strong className="text-zinc-900 font-medium">{estimate.time}</strong>
                          </div>
                          <div className="flex items-center gap-1.5 text-zinc-600">
                            <Layers className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>Target Stage: </span>
                            <strong className="text-zinc-900 font-medium">
                              {estimate.level}
                            </strong>
                          </div>
                        </div>

                        {/* Key Focus Topics */}
                        <div className="mb-4">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1.5">
                            Key Benchmark Concepts:
                          </span>
                          <ul className="space-y-1">
                            {topics.slice(0, 3).map((topic, i) => (
                              <li
                                key={i}
                                className="text-xs text-zinc-600 flex items-center gap-1.5"
                              >
                                <span className="w-1 h-1 rounded-full bg-zinc-400" />
                                <span className="truncate">{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Purposeful Action Bar */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onNavigateTab && onNavigateTab('recommendations')}
                          className="text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-zinc-700" />
                          <span>Start Roadmap</span>
                          <ArrowRight className="w-3 h-3 text-zinc-500" />
                        </button>

                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 font-medium group"
                        >
                          <span>{resource.label}</span>
                          <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: MEDIUM & SUPPORTING GAPS (Compact Structured Rows - Not Big Cards) */}
          {(activeFilter === 'all' || activeFilter === 'medium') &&
            mediumAndSupportingGaps.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
                      Supporting Technical Gaps ({mediumAndSupportingGaps.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-500">Secondary requirements & tooling</span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-xs overflow-hidden">
                  {mediumAndSupportingGaps.map((skill) => {
                    const priority = priorityMap[skill] || 'Medium';
                    const domain = getSkillDomain(skill);
                    const estimate = getSkillEstimate(skill);
                    const resource = getSkillResource(skill);
                    const reason = getContextualReason(skill, targetRoleName, false);

                    return (
                      <div
                        key={skill}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/80 transition"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 sm:mt-0 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-zinc-900">{skill}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                {domain}
                              </span>
                              {getPriorityBadge(priority)}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{reason}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pl-4 sm:pl-0">
                          <span className="text-[11px] font-mono text-zinc-400 hidden md:inline">
                            Est: {estimate.time}
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-zinc-700 hover:text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-md hover:bg-zinc-50 inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <span>Open Docs</span>
                            <ExternalLink className="w-3 h-3 text-zinc-400" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* SECTION 3: VERIFIED COMPETENCIES (Skills Already Present on Resume) */}
          {(activeFilter === 'all' || activeFilter === 'verified') &&
            verifiedBenchmarkSkills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-900 font-semibold">
                      Verified Benchmark Competencies ({verifiedBenchmarkSkills.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    Detected in uploaded resume & projects
                  </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl divide-y divide-zinc-100 shadow-xs overflow-hidden">
                  {verifiedBenchmarkSkills.map((skill) => {
                    const domain = getSkillDomain(skill);
                    const resource = getSkillResource(skill);

                    return (
                      <div
                        key={skill}
                        className="p-3.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-zinc-50/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-zinc-900">{skill}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                                {domain}
                              </span>
                            </div>
                            <p className="text-[11px] text-emerald-800 mt-0.5">
                              Verified competency matched to {targetRoleName} benchmark
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                            Verified
                          </span>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-zinc-400 hover:text-zinc-700 p-1"
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
