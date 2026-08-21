import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../api';
import ResumeUpload from '../components/ResumeUpload';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await apiRequest('/profile');
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFAF6] flex items-center justify-center">
        <p className="text-[#5B6670] text-sm">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBFAF6] flex items-center justify-center">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFAF6] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] mb-1">DASHBOARD</p>
            <h1 className="italic text-3xl text-[#12181B]" style={{ fontFamily: "'Fraunces', serif" }}>
              Welcome, {profile.name}.
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[#5B6670] border border-[#D8D5CA] rounded-lg px-4 py-2 hover:bg-white transition"
          >
            Log out
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5">
            <p className="text-xs text-[#5B6670] mb-1">Email</p>
            <p className="text-sm">{profile.email}</p>
          </div>
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-5">
            <p className="text-xs text-[#5B6670] mb-1">CGPA</p>
            <p className="text-sm">{profile.cgpa ?? 'Not set'}</p>
          </div>
        </div>

        {!analysis ? (
          <ResumeUpload onAnalysisComplete={setAnalysis} />
        ) : (
          <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-xs tracking-widest text-[#1F6F5C] mb-1">READINESS SCORE</p>
                <p className="text-4xl" style={{ fontFamily: "'Fraunces', serif" }}>
                  {analysis.readinessScore}<span className="text-lg text-[#5B6670]">/100</span>
                </p>
              </div>
              <button
                onClick={() => setAnalysis(null)}
                className="text-xs text-[#5B6670] underline"
              >
                Upload another
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#12181B] mb-2">Skills found</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.extractedSkills.map((skill) => (
                  <span key={skill} className="text-xs bg-[#EFECE2] text-[#12181B] rounded-full px-3 py-1">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#12181B] mb-2">Strengths</h3>
              <ul className="space-y-1">
                {analysis.strengths.map((s) => (
                  <li key={s} className="text-sm text-[#5B6670]">• {s}</li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-[#12181B] mb-2">Weaknesses</h3>
              <ul className="space-y-1">
                {analysis.weaknesses.map((w) => (
                  <li key={w} className="text-sm text-[#5B6670]">• {w}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#12181B] mb-2">Suggestions</h3>
              <ul className="space-y-1">
                {analysis.suggestions.map((s) => (
                  <li key={s} className="text-sm text-[#5B6670]">• {s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;