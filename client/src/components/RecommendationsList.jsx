import { useState, useEffect, useMemo } from 'react';
import {
  ExternalLink,
  RefreshCw,
  BookOpen,
  Sparkles,
  Clock,
  Layers,
  ChevronRight,
  ArrowUpRight,
  CheckCircle2,
  Code2,
  ListOrdered,
  GraduationCap,
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
  const [expandedSkill, setExpandedSkill] = useState(null);

  const targetRoleName =
    typeof targetRole === 'string' ? targetRole : targetRole?.name || '';

  async function fetchRecommendations(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const endpoint = targetRoleName
        ? `/profile/recommendations?targetRole=${encodeURIComponent(targetRoleName)}`
        : '/profile/recommendations';
      const data = await apiRequest(endpoint);
      setRecommendations(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchRecommendations();
  }, [targetRoleName]);

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
      {/* Header Container */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                LEARNING ROADMAP
              </span>
              {targetRoleName && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {targetRoleName} Track
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
              Curated Skill Roadmaps
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Structured learning pathways and official documentation mapped directly to your
              missing benchmark requirements.
            </p>
          </div>

          <button
            onClick={() => fetchRecommendations(true)}
            disabled={loading || refreshing}
            className="text-xs font-medium text-zinc-900 bg-white border border-zinc-300 px-3.5 py-2 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Pathway'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Roadmap Summary Strip */}
        {recommendations.length > 0 && (
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Active Modules
              </span>
              <div className="my-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-zinc-900">
                  {recommendations.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">skills</span>
              </div>
              <p className="text-[11px] text-zinc-500">Total roadmap syllabus</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Phase 1 Core Focus
              </span>
              <div className="my-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-rose-700">
                  {highPriorityItems.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">high priority</span>
              </div>
              <p className="text-[11px] text-zinc-500">Recommended first</p>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200/80 flex flex-col justify-between">
              <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
                Phase 2 Tooling
              </span>
              <div className="my-1 flex items-baseline gap-1">
                <span className="text-2xl font-semibold font-mono text-amber-700">
                  {mediumItems.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">supporting</span>
              </div>
              <p className="text-[11px] text-zinc-500">Infrastructure & APIs</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Roadmap Content */}
      <div>
        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center shadow-xs">
            <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-mono text-xs text-zinc-500 tracking-wider uppercase">
              Assembling curated roadmap...
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center shadow-xs">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-zinc-900 mb-1">
              No Missing Skill Modules
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Your resume already matches all core benchmark competencies for {targetRoleName || 'your target role'}, or no target role is currently set.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 bg-white p-2 border border-zinc-200 rounded-lg shadow-xs">
              <span className="text-[11px] font-mono text-zinc-400 uppercase font-medium px-2">
                Phase:
              </span>
              <button
                onClick={() => setSelectedFilter('all')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                All Modules ({recommendations.length})
              </button>
              <button
                onClick={() => setSelectedFilter('high')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  selectedFilter === 'high'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Phase 1: High Priority ({highPriorityItems.length})
              </button>
              <button
                onClick={() => setSelectedFilter('medium')}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  selectedFilter === 'medium'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                Phase 2: Supporting ({mediumItems.length})
              </button>
            </div>

            {/* Structured Module Cards (Rich, purposeful, non-repetitive) */}
            <div className="space-y-4">
              {filteredItems.map((item, idx) => {
                const skill = item.skill;
                const domain = getSkillDomain(skill);
                const estimate = getSkillEstimate(skill);
                const topics = getSkillTopics(skill);
                const resource = getSkillResource(skill);
                const reason = getContextualReason(skill, targetRoleName, false);
                const isExpanded = expandedSkill === skill;

                return (
                  <div
                    key={skill + idx}
                    className="bg-white border border-zinc-200 rounded-xl p-5 sm:p-6 shadow-xs hover:border-zinc-300 transition"
                  >
                    {/* Top Row: Module Index, Skill Name, Domain, Priority */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-zinc-100 font-mono text-[11px] font-semibold text-zinc-700 flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-zinc-900">
                              {skill}
                            </h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                              {domain}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Est: {estimate.time}</span>
                        </div>
                        {getPriorityBadge(item.priority)}
                      </div>
                    </div>

                    {/* Contextual Objective Body */}
                    <div className="py-4">
                      <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                        {reason}
                      </p>
                    </div>

                    {/* Curated Syllabus Topics Breakdown */}
                    <div className="p-3.5 rounded-lg bg-zinc-50/70 border border-zinc-200/80 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
                          <ListOrdered className="w-3.5 h-3.5 text-zinc-400" />
                          Curated Learning Modules & Core Concepts
                        </span>
                        <span className="text-[10px] font-mono text-zinc-400">
                          Target: {estimate.level}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {topics.map((topic, tIdx) => (
                          <div
                            key={tIdx}
                            className="text-xs text-zinc-700 flex items-start gap-2 bg-white px-2.5 py-1.5 rounded border border-zinc-200/60"
                          >
                            <span className="text-zinc-400 font-mono text-[10px] mt-0.5">
                              {tIdx + 1}.
                            </span>
                            <span className="leading-tight">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions: Official Docs Link + Quiet Resources */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                      <div className="text-[11px] text-zinc-400">
                        Official canonical learning path for {skill}
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={item.resourceUrl || resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Open Official Documentation</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
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
