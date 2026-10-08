import { useState, useEffect, useMemo } from 'react';
import {
  RefreshCw,
  BookOpen,
  Clock,
  ArrowUpRight,
  ListOrdered,
} from 'lucide-react';
import { apiRequest } from '../api';
import {
  getSkillDomain,
  getSkillEstimate,
  getSkillTopics,
  getSkillResource,
  getContextualReason,
} from '../utils/skillMetadata';

function RecommendationsList({ targetRole, hasResume }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // 'all' | 'high' | 'medium'

  const targetRoleName =
    typeof targetRole === 'string' ? targetRole : targetRole?.name || '';

  async function refreshRecommendations() {
    if (!hasResume || !targetRoleName) return;

    setRefreshing(true);
    setError('');

    try {
      const data = await apiRequest(
        `/profile/recommendations?targetRole=${encodeURIComponent(targetRoleName)}`
      );
      setRecommendations(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    if (!hasResume || !targetRoleName) {
      Promise.resolve().then(() => {
        if (cancelled) return;
        setRecommendations([]);
        setLoading(false);
        setError('');
      });
      return () => {
        cancelled = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setLoading(true);
        setError('');
        return apiRequest(`/profile/recommendations?targetRole=${encodeURIComponent(targetRoleName)}`);
      })
      .then((data) => {
        if (!cancelled && data) setRecommendations(data.items || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [targetRoleName, hasResume]);

  const highPriorityItems = useMemo(() => {
    return recommendations.filter(
      (item) => String(item.priority || '').toLowerCase() === 'high'
    );
  }, [recommendations]);

  const mediumItems = useMemo(() => {
    return recommendations.filter(
      (item) => String(item.priority || '').toLowerCase() !== 'high'
    );
  }, [recommendations]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'high') return highPriorityItems;
    if (selectedFilter === 'medium') return mediumItems;
    return recommendations;
  }, [selectedFilter, highPriorityItems, mediumItems, recommendations]);

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
      {/* Header Container */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
          <div>
            <div className="flex items-center gap-2">
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#12181B] mt-0.5">
              What to learn next
            </h2>
            <p className="text-xs text-[#5B6670] mt-1">
              Learning suggestions come from skills missing for your selected role.
            </p>
          </div>

          <button
            onClick={refreshRecommendations}
            disabled={!hasResume || !targetRoleName || loading || refreshing}
            className="text-xs font-medium text-[#12181B] bg-white border border-[#E4E1D8] px-3.5 py-2 rounded-xl hover:bg-[#F2EFE9] transition disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Pathway'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Roadmap Summary Strip */}
        {recommendations.length > 0 && (
          <p className="mt-4 text-xs text-[#5B6670]">
            {recommendations.length} skills to work on, including {highPriorityItems.length} high-priority {highPriorityItems.length === 1 ? 'skill' : 'skills'}.
          </p>
        )}
      </div>

      {/* Main Roadmap Content */}
      <div>
        {loading ? (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-12 text-center shadow-xs">
            <div className="w-6 h-6 border-2 border-[#1F6F5C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-[#5B6670] tracking-wider uppercase">
              Assembling curated roadmap...
            </p>
          </div>
        ) : !hasResume || !targetRoleName ? (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-8 text-center shadow-xs">
            <h3 className="font-serif text-base text-[#12181B] mb-1">
              What to learn next
            </h3>
            <p className="text-xs text-[#5B6670] max-w-md mx-auto">
              Upload a resume and choose a role to see what to learn next.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-8 text-center shadow-xs">
            <h3 className="font-serif text-base text-[#12181B] mb-1">
              No skill gaps found
            </h3>
            <p className="text-xs text-[#5B6670] max-w-md mx-auto">
              Your resume includes all skills listed for {targetRoleName}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#F2EFE9] p-1 border border-[#E4E1D8] rounded-xl shadow-xs">
              <span className="text-[11px] font-mono text-[#5B6670] uppercase font-medium px-2">
                Phase:
              </span>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                All Modules ({recommendations.length})
              </button>
              <button
                onClick={() => setSelectedFilter('high')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'high'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                Phase 1: High Priority ({highPriorityItems.length})
              </button>
              <button
                onClick={() => setSelectedFilter('medium')}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                  selectedFilter === 'medium'
                    ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                    : 'text-[#5B6670] hover:text-[#12181B]'
                }`}
              >
                Phase 2: Supporting ({mediumItems.length})
              </button>
            </div>

            {/* Structured Module Cards */}
            <div className="space-y-4">
              {filteredItems.map((item, idx) => {
                const skill = item.skill;
                const domain = getSkillDomain(skill);
                const estimate = getSkillEstimate(skill);
                const topics = getSkillTopics(skill);
                const resource = getSkillResource(skill);
                const reason = getContextualReason(skill, targetRoleName, false);
                return (
                  <div
                    key={skill + idx}
                    className="bg-white border border-[#E4E1D8] rounded-2xl p-5 sm:p-6 shadow-xs hover:border-[#1F6F5C]/40 transition"
                  >
                    {/* Top Row: Module Index, Skill Name, Domain, Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-[#F2EFE9] font-mono text-[11px] font-semibold text-[#12181B] flex items-center justify-center shrink-0 border border-[#E4E1D8]">
                          0{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-[#12181B]">
                              {skill}
                            </h3>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F2EFE9] text-[#5B6670] border border-[#E4E1D8]">
                              {domain}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 text-[11px] text-[#5B6670] font-mono">
                          <Clock className="w-3.5 h-3.5 text-[#5B6670]" />
                          <span>Est: {estimate.time}</span>
                        </div>
                        {getPriorityBadge(item.priority)}
                      </div>
                    </div>

                    {/* Contextual Objective Body */}
                    <div className="py-4">
                      <p className="text-xs text-[#5B6670] leading-relaxed font-normal">
                        {reason}
                      </p>
                    </div>

                    {/* Curated Syllabus Topics Breakdown */}
                    <div className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] mb-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-xs text-[#5B6670] font-medium flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-[#1F6F5C]" />
                          Topics to explore
                        </span>
                        <span className="text-[10px] font-mono text-[#5B6670]">
                          Suggested level: {estimate.level}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {topics.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className="text-xs text-[#12181B] flex items-start gap-2 py-1.5 border-b border-[#E4E1D8] last:border-0"
                          >
                            <span className="text-[#5B6670] font-mono text-[10px] mt-0.5">
                              {tIdx + 1}.
                            </span>
                            <span className="leading-tight">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E4E1D8]">
                      <div className="text-[11px] text-[#5B6670]">
                        Learning resource for {skill}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={item.resourceUrl || resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-white bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] px-4 py-2 rounded-xl inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-white/90" />
                          <span>Open learning resource</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-white/80" />
                        </a>
                      </div>
                    </div>
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

export default RecommendationsList;
