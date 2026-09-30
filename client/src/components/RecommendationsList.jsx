import { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
import { apiRequest } from '../api';

function RecommendationsList({ targetRole, hasResume }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  async function fetchRecommendations(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const roleName = typeof targetRole === 'string' ? targetRole : targetRole?.name || '';
      const endpoint = roleName
        ? `/profile/recommendations?targetRole=${encodeURIComponent(roleName)}`
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
  }, [targetRole]);

  function getPriorityStyle(priority) {
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
            LEARNING ROADMAP
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
            Curated Skill Recommendations
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Official documentation and structured resources prioritized for your missing competencies.
          </p>
        </div>

        <button
          onClick={() => fetchRecommendations(true)}
          disabled={loading || refreshing}
          className="text-xs font-medium text-zinc-900 bg-white border border-zinc-300 px-3.5 py-2 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-xs text-zinc-500">Generating learning recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-6 rounded-lg bg-zinc-50 border border-dashed border-zinc-200 text-center">
            <Sparkles className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-zinc-900 mb-0.5">No Missing Skill Recommendations</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your resume already matches all key benchmark skills for this track, or no target role is currently set.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3.5">
            {recommendations.map((item, idx) => (
              <div
                key={item.skill + idx}
                className="p-4 rounded-lg bg-zinc-50/60 border border-zinc-200/80 hover:bg-zinc-50 hover:border-zinc-300 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-zinc-900">
                      {item.skill}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border font-medium ${getPriorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">
                    Master this core requirement to improve role match and interview readiness.
                  </p>
                </div>

                <a
                  href={item.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between text-xs font-medium text-zinc-900 bg-white border border-zinc-200 px-3 py-2 rounded-md hover:bg-zinc-100 hover:border-zinc-300 transition group shadow-xs"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                    Official Tutorial / Documentation
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationsList;

