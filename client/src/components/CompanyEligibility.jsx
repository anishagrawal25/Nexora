import { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../api';
import Combobox from './Combobox';

function CompanyEligibility({ profile }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [matches, setMatches] = useState([]);
  const [activeGroup, setActiveGroup] = useState('all'); // 'all' | 'qualify' | 'close' | 'not_yet'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch companies list, initial evaluation, and reverse matches
  useEffect(() => {
    async function loadEligibilityData() {
      try {
        setLoading(true);
        const [compData, matchesData] = await Promise.all([
          apiRequest('/profile/companies'),
          apiRequest('/profile/matches').catch(() => ({ matches: [] })),
        ]);

        const compList = compData.companies || [];
        setCompanies(compList);
        setMatches(matchesData.matches || []);

        if (compList.length > 0) {
          const firstCompany = compList[0].name;
          setSelectedCompanyName(firstCompany);
          fetchCompanyEligibility(firstCompany);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadEligibilityData();
  }, [profile]);

  async function fetchCompanyEligibility(companyNameOrId) {
    if (!companyNameOrId) return;
    setError('');
    try {
      const data = await apiRequest(
        `/profile/eligibility?company=${encodeURIComponent(companyNameOrId)}`
      );
      setEvaluation(data);
      if (data.company) {
        setSelectedCompanyName(data.company);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  function handleCompanySelect(nameOrVal) {
    if (!nameOrVal || !nameOrVal.trim()) return;
    setSelectedCompanyName(nameOrVal);
    fetchCompanyEligibility(nameOrVal);
  }

  // Filter matches based on active tab
  const qualifyMatches = matches.filter((m) => m.tier === 'qualify');
  const closeMatches = matches.filter((m) => m.tier === 'close');
  const notYetMatches = matches.filter((m) => m.tier === 'not_yet');

  const displayedMatches =
    activeGroup === 'qualify'
      ? qualifyMatches
      : activeGroup === 'close'
      ? closeMatches
      : activeGroup === 'not_yet'
      ? notYetMatches
      : matches;

  return (
    <div className="space-y-6">
      {/* SECTION 1: Single Company Checker */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#12181B]">
              Check a company
            </h2>
            <p className="text-xs text-[#5B6670] mt-1">
              Compare your profile with the example criteria available for a company.
            </p>
            <p className="text-xs text-[#5B6670] mt-2">
              Criteria are approximate examples, not official company requirements.
            </p>
          </div>

          {/* Combobox Company Selector */}
          <div className="w-full sm:w-72 self-start sm:self-auto">
            <Combobox
              value={selectedCompanyName}
              options={companies}
              placeholder="Type or select a company..."
              disabled={loading}
              onChange={(val) => {
                if (val && val.trim()) {
                  handleCompanySelect(val.trim());
                }
              }}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Selected Company Result Card */}
        {evaluation && (
          <div className="mt-5">
            <div className="p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E4E1D8] flex items-center justify-center text-[#12181B] shadow-xs">
                    <Building2 className="w-4 h-4 text-[#1F6F5C]" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#12181B] flex items-center gap-2">
                      <span>{evaluation.company}</span>
                      {evaluation.isEstimate && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FEF6E9] text-[#8C5819] border border-[#F6E0B8] font-medium">
                          Estimate
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#5B6670]">
                      {evaluation.isEstimate ? 'General guidance' : 'Approximate criteria comparison'}
                    </p>
                  </div>
                </div>

                <div>
                  {evaluation.eligible ? (
                    <span className="inline-flex items-center gap-1.5 bg-[#EBF3F0] text-[#1F6F5C] border border-[#CDE3DC] font-mono text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F5C]" />
                      ELIGIBLE TO APPLY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-[#FDF0ED] text-[#9E2A2B] border border-[#F5CAC3] font-mono text-xs font-semibold px-2.5 py-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      NOT CURRENTLY ELIGIBLE
                    </span>
                  )}
                </div>
              </div>

              {/* Estimate Note Disclaimer Banner */}
              {evaluation.isEstimate && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#FEF6E9] border border-[#F6E0B8] text-xs text-[#8C5819] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#8C5819]" />
                  <span>
                    {evaluation.note ||
                      `General guidance — we don't have specific data for '${evaluation.company}' yet.`}
                  </span>
                </div>
              )}

              {/* Criteria Breakdown Grid */}
              <div className="grid sm:grid-cols-3 gap-3.5 mt-4">
                {/* CGPA Criterion */}
                <div className="p-4 bg-white border border-[#E4E1D8] rounded-xl shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670] font-medium">Minimum CGPA</span>
                    {evaluation.meetsCgpa ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6F5C]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-[#12181B]">
                      {profile?.cgpa || 'Not set'}
                    </span>
                    <span className="text-xs font-mono text-[#5B6670]">
                      / Req: {evaluation.minimumCgpa ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6670] mt-1">
                    {evaluation.meetsCgpa
                      ? 'CGPA requirement satisfied'
                      : 'CGPA below minimum cutoff'}
                  </p>
                </div>

                {/* Grad Year Criterion */}
                <div className="p-4 bg-white border border-[#E4E1D8] rounded-xl shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670] font-medium">Batch / Grad Year</span>
                    {evaluation.meetsGradYear ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6F5C]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-[#12181B]">
                      {profile?.grad_year || 'Not set'}
                    </span>
                    <span className="text-xs font-mono text-[#5B6670]">
                      / Min: {evaluation.minimumGradYear ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#5B6670] mt-1">
                    {evaluation.meetsGradYear
                      ? 'Graduation batch eligible'
                      : 'Graduation year ineligible'}
                  </p>
                </div>

                {/* Skills Match Criterion */}
                <div className="p-4 bg-white border border-[#E4E1D8] rounded-xl shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670] font-medium">Mandatory Skills</span>
                    {evaluation.missingSkills?.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F6F5C]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#9E2A2B]" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-[#12181B]">
                      {(evaluation.requiredSkills?.length || 0) -
                        (evaluation.missingSkills?.length || 0)}
                      /{evaluation.requiredSkills?.length || 0}
                    </span>
                    <span className="text-xs text-[#5B6670] font-mono">Matched</span>
                  </div>
                  <p className="text-[11px] text-[#5B6670] mt-1">
                    {evaluation.missingSkills?.length === 0
                      ? 'All required skills verified'
                      : `${evaluation.missingSkills?.length} mandatory skill(s) missing`}
                  </p>
                </div>
              </div>

              {/* Required Skills Chips */}
              {evaluation.requiredSkills && evaluation.requiredSkills.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-[#E4E1D8]">
                  <p className="text-xs text-[#5B6670] mb-2 font-medium">
                    Listed skills:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.requiredSkills.map((skill) => {
                      const isMissing = evaluation.missingSkills?.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium ${
                            isMissing
                              ? 'bg-[#FDF0ED] text-[#9E2A2B] border-[#F5CAC3] line-through opacity-75'
                              : 'bg-[#EBF3F0] text-[#1F6F5C] border-[#CDE3DC]'
                          }`}
                        >
                          {isMissing ? (
                            <XCircle className="w-3 h-3 text-[#9E2A2B]" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-[#1F6F5C]" />
                          )}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: "Which companies fit you?" (Reverse Match) */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="pb-5 border-b border-[#E4E1D8]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="font-serif text-xl sm:text-2xl text-[#12181B]">
              Where you stand today
            </h2>
            <p className="text-xs text-[#5B6670]">
              Compared with {matches.length || companies.length || 0} available companies
            </p>
          </div>

          {/* Group Filter Tabs: Qualify Now / Close / Not Yet / All */}
          <div className="flex flex-wrap items-center gap-1 bg-[#F2EFE9] p-1 rounded-xl border border-[#E4E1D8] mt-4">
            <button
              onClick={() => setActiveGroup('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                activeGroup === 'all'
                  ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                  : 'text-[#5B6670] hover:text-[#12181B]'
              }`}
            >
              All Companies ({matches.length || companies.length || 0})
            </button>
            <button
              onClick={() => setActiveGroup('qualify')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'qualify'
                  ? 'bg-white text-[#1F6F5C] shadow-xs font-semibold'
                  : 'text-[#5B6670] hover:text-[#1F6F5C]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Qualify Now ({qualifyMatches.length})
            </button>
            <button
              onClick={() => setActiveGroup('close')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'close'
                  ? 'bg-white text-[#8C5819] shadow-xs font-semibold'
                  : 'text-[#5B6670] hover:text-[#8C5819]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Close ({closeMatches.length})
            </button>
            <button
              onClick={() => setActiveGroup('not_yet')}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'not_yet'
                  ? 'bg-white text-[#12181B] shadow-xs font-semibold'
                  : 'text-[#5B6670] hover:text-[#12181B]'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Not Yet ({notYetMatches.length})
            </button>
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {displayedMatches.map((m) => {
            const isSelected = selectedCompanyName.toLowerCase() === m.company.toLowerCase();

            return (
              <div
                key={m.companyId + m.company}
                className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1F6F5C] bg-white ring-1 ring-[#1F6F5C] shadow-xs'
                    : 'border-[#E4E1D8] bg-[#FBFAF6] hover:bg-white hover:border-[#1F6F5C]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-[#12181B]">
                      {m.company}
                    </h4>

                    {m.tier === 'qualify' ? (
                      <span className="inline-flex items-center gap-1 bg-[#EBF3F0] text-[#1F6F5C] border border-[#CDE3DC] text-[11px] font-mono font-medium px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3 text-[#1F6F5C]" />
                        Qualify Now
                      </span>
                    ) : m.tier === 'close' ? (
                      <span className="inline-flex items-center gap-1 bg-[#FEF6E9] text-[#8C5819] border border-[#F6E0B8] text-[11px] font-mono font-medium px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3 text-[#8C5819]" />
                        Close (1-2 Gaps)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#F2EFE9] text-[#5B6670] border border-[#E4E1D8] text-[11px] font-mono font-medium px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3 text-[#5B6670]" />
                        Not Yet
                      </span>
                    )}
                  </div>

                  {/* Cutoff Criteria Specs */}
                  <div className="flex items-center gap-2 text-xs text-[#5B6670] font-mono mb-3">
                    <span>CGPA: {m.minimumCgpa || 'N/A'}</span>
                    <span>•</span>
                    <span>Batch: {m.minimumGradYear || 'N/A'}+</span>
                    <span>•</span>
                    <span>
                      Skills: {m.matchedSkills?.length || 0}/{m.requiredSkills?.length || 0}
                    </span>
                  </div>

                  {/* Specific granular unmet reasons */}
                  {m.unmetReasons && m.unmetReasons.length > 0 ? (
                    <div className="space-y-1 mb-3 bg-white p-3 rounded-xl border border-[#E4E1D8]">
                      {m.unmetReasons.map((reason, i) => (
                        <p key={i} className="text-[11px] text-[#9E2A2B] flex items-start gap-1.5 leading-snug">
                          <span className="mt-0.5 text-[#9E2A2B] shrink-0">•</span>
                          <span>{reason}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 bg-[#EBF3F0] p-3 rounded-xl border border-[#CDE3DC]">
                      <p className="text-[11px] text-[#1F6F5C] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6F5C] shrink-0" />
                        All academic and skill criteria satisfied
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-3 flex items-center justify-end border-t border-[#E4E1D8]">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompanyName(m.company);
                      fetchCompanyEligibility(m.company);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium text-[#12181B] hover:text-[#1F6F5C] inline-flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Check detailed criteria</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CompanyEligibility;
