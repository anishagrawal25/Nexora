import { useState } from 'react';
import { Target, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { apiRequest } from '../api';

function SkillGapPanel({ skillGap, targetRole, onSkillGapUpdated, hasResume }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerateSkillGap() {
    if (!targetRole) {
      setError('Please select a target role in your profile first.');
      return;
    }
    if (!hasResume) {
      setError('Please upload and analyze your resume first.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await apiRequest('/profile/skill-gap', {
        method: 'POST',
        body: JSON.stringify({ targetRoleId: targetRole.id }),
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

  function getBadgeColor(priority) {
    switch (String(priority).toLowerCase()) {
      case 'high':
        return 'bg-[#FCEBE6] text-[#A32A15] border-[#F5C2B8]';
      case 'medium':
        return 'bg-[#FEF6E6] text-[#975A16] border-[#FCE1B3]';
      case 'low':
      default:
        return 'bg-[#EFECE2] text-[#5B6670] border-[#D8D5CA]';
    }
  }

  return (
    <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
        <div>
          <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
            GAP ASSESSMENT
          </p>
          <h2
            className="italic text-2xl text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Role Skill Gap Analysis
          </h2>
          <p className="text-xs text-[#5B6670] mt-1">
            Targeting:{' '}
            <strong className="text-[#12181B]">
              {targetRole?.name || skillGap?.targetRole || 'No target role selected'}
            </strong>
          </p>
        </div>

        <button
          onClick={handleGenerateSkillGap}
          disabled={loading}
          className="bg-[#1F6F5C] text-white text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-[#195A4A] transition disabled:opacity-60 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : skillGap ? 'Refresh Gaps' : 'Analyze Skill Gap'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-6">
        {!skillGap ? (
          <div className="text-center py-8 px-4 border border-dashed border-[#D8D5CA] rounded-xl bg-[#FBFAF6]">
            <Target className="w-8 h-8 text-[#5B6670] mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium text-[#12181B] mb-1">No Skill Gap Assessment Yet</p>
            <p className="text-xs text-[#5B6670] max-w-sm mx-auto mb-4">
              Click &ldquo;Analyze Skill Gap&rdquo; above to compare your resume skills against {targetRole?.name || 'your target role'}.
            </p>
            <button
              onClick={handleGenerateSkillGap}
              disabled={loading}
              className="text-xs font-medium text-[#1F6F5C] bg-[#EFECE2] px-4 py-2 rounded-lg hover:bg-[#E4E1D8] transition"
            >
              Run Analysis Now
            </button>
          </div>
        ) : missingSkills.length === 0 ? (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">Zero Skill Gaps Detected!</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                Your resume matches all expected technical skills for this role benchmark.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#5B6670]">
                Missing requirements ({missingSkills.length} skill{missingSkills.length === 1 ? '' : 's'})
              </span>
              <span className="text-[11px] text-[#5B6670]">Ranked by hiring priority</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {missingSkills.map((skill) => {
                const priority = priorityMap[skill] || 'Medium';
                return (
                  <div
                    key={skill}
                    className="p-3.5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F6F5C]" />
                      <span className="text-sm font-medium text-[#12181B]">{skill}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(
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
