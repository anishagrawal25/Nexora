import { useState } from 'react';
import { Target, RefreshCw, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { apiRequest } from '../api';
import Combobox from './Combobox';

function SkillGapPanel({
  skillGap,
  targetRole,
  roles = [],
  onSelectTargetRole,
  onSkillGapUpdated,
  hasResume,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const targetRoleName =
    typeof targetRole === 'string'
      ? targetRole
      : targetRole?.name || skillGap?.targetRole || '';

  async function handleGenerateSkillGap(customRoleName) {
    const roleToUse = customRoleName || targetRoleName;
    if (!roleToUse) {
      return;
    }
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

  const missingSkills = skillGap?.missingSkills || [];
  const priorityMap = skillGap?.priority || {};

  function getBadgeStyle(priority) {
    switch (String(priority).toLowerCase()) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'low':
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
            GAP ASSESSMENT
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
            Role Skill Gap Analysis
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {targetRoleName ? (
              <>
                Benchmarked against: <strong className="text-zinc-900 font-medium">{targetRoleName}</strong>
              </>
            ) : (
              'Compare your resume skills against target engineering benchmarks'
            )}
          </p>
        </div>

        {targetRoleName && (
          <button
            onClick={() => handleGenerateSkillGap()}
            disabled={loading}
            className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-zinc-800 transition disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : skillGap ? 'Refresh Gaps' : 'Analyze Skill Gap'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Estimate Note Banner if custom fallback role was used */}
      {skillGap?.isEstimate && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 shrink-0 text-amber-700" />
          <span>
            {skillGap.note ||
              `General guidance — we don't have specific data for '${targetRoleName}' yet.`}
          </span>
        </div>
      )}

      <div className="mt-6">
        {!targetRoleName ? (
          <div className="text-center py-10 px-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              Your dream role
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Type any career track or select a suggestion to calculate your skill gaps.
            </p>
            <div className="max-w-xs mx-auto">
              <Combobox
                options={roles}
                placeholder="Type your dream role..."
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
        ) : !skillGap ? (
          <div className="text-center py-8 px-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50">
            <Target className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-zinc-900 mb-1">
              Ready to analyze {targetRoleName}
            </p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-4">
              Compare your extracted skills against the {targetRoleName} benchmark.
            </p>
            <button
              onClick={() => handleGenerateSkillGap()}
              disabled={loading}
              className="text-xs font-medium text-zinc-900 bg-white border border-zinc-300 px-4 py-2 rounded-lg hover:bg-zinc-50 transition cursor-pointer shadow-xs"
            >
              {loading ? 'Analyzing...' : 'Run Skill Gap Analysis'}
            </button>
          </div>
        ) : missingSkills.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-50/75 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-xs font-semibold">Zero Skill Gaps Detected</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your profile matches all expected technical requirements for {targetRoleName}.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-600">
                Missing requirements ({missingSkills.length} skill
                {missingSkills.length === 1 ? '' : 's'})
              </span>
              <span className="text-[11px] text-zinc-400">Ranked by hiring priority</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-2.5">
              {missingSkills.map((skill) => {
                const priority = priorityMap[skill] || 'Medium';
                return (
                  <div
                    key={skill}
                    className="p-3 rounded-lg bg-zinc-50/70 border border-zinc-200/80 flex items-center justify-between hover:bg-zinc-50 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                      <span className="text-xs font-medium text-zinc-900">{skill}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${getBadgeStyle(
                        priority
                      )}`}
                    >
                      {priority} Priority
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillGapPanel;

