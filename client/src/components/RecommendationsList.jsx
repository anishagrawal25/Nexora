import { useState, useEffect } from 'react';
import { Compass, ExternalLink, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
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
      const data = await apiRequest('/profile/recommendations');
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
            LEARNING ROADMAP
          </p>
          <h2
            className="italic text-2xl text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Curated Skill Recommendations
          </h2>
          <p className="text-xs text-[#5B6670] mt-1">
            Actionable learning paths and documentation tailored to your skill gaps.
          </p>
        </div>

        <button
          onClick={() => fetchRecommendations(true)}
          disabled={loading || refreshing}
          className="text-xs font-medium text-[#1F6F5C] bg-[#EFECE2] border border-[#D8D5CA] px-3.5 py-2 rounded-xl hover:bg-[#E4E1D8] transition disabled:opacity-60 inline-flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-xs text-[#5B6670]">Generating learning recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-6 rounded-xl bg-[#FBFAF6] border border-dashed border-[#D8D5CA] text-center">
            <Sparkles className="w-6 h-6 text-[#1F6F5C] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#12181B] mb-1">No Missing Skill Recommendations</p>
            <p className="text-xs text-[#5B6670] max-w-sm mx-auto">
              Your resume already matches all key benchmark skills for this track, or no target role is set.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {recommendations.map((item, idx) => (
              <div
                key={item.skill + idx}
                className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8] hover:border-[#1F6F5C]/40 hover:shadow-xs transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-base font-semibold text-[#12181B]"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.skill}
                    </span>
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityStyle(
                        item.priority
                      )}`}
                    >
                      {item.priority} Priority
                    </span>
                  </div>
                  <p className="text-xs text-[#5B6670] mb-4">
                    Master this core requirement to improve role match percentage.
                  </p>
                </div>

                <a
                  href={item.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between text-xs font-medium text-[#1F6F5C] bg-white border border-[#D8D5CA] px-3.5 py-2 rounded-lg hover:bg-[#F4F2EB] transition group"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Official Tutorial / Docs
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
