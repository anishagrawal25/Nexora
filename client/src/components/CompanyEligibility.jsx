import { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
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
  const [evaluating, setEvaluating] = useState(false);
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
    setEvaluating(true);
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
    } finally {
      setEvaluating(false);
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
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200">
          <div>
            <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
              CRITERIA EVALUATOR
            </span>
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
              Check a company
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Verify your academic profile and skills against hiring criteria and recruitment filters.
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
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* Selected Company Result Card */}
        {evaluation && (
          <div className="mt-5">
            <div className="p-5 rounded-lg bg-zinc-50/70 border border-zinc-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                      <span>{evaluation.company}</span>
                      {evaluation.isEstimate && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/80 text-amber-900 border border-amber-200 font-medium">
                          Estimate
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-zinc-500">Hiring Criteria Assessment</p>
                  </div>
                </div>

                <div>
                  {evaluation.eligible ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-semibold px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ELIGIBLE TO APPLY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 font-mono text-xs font-semibold px-2.5 py-1 rounded-md">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      NOT CURRENTLY ELIGIBLE
                    </span>
                  )}
                </div>
              </div>

              {/* Estimate Note Disclaimer Banner */}
              {evaluation.isEstimate && (
                <div className="mt-4 p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    {evaluation.note ||
                      `General guidance — we don't have specific data for '${evaluation.company}' yet.`}
                  </span>
                </div>
              )}

              {/* Criteria Breakdown Grid */}
              <div className="grid sm:grid-cols-3 gap-3.5 mt-4">
                {/* CGPA Criterion */}
                <div className="p-3.5 bg-white border border-zinc-200 rounded-lg shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 font-medium">Minimum CGPA</span>
                    {evaluation.meetsCgpa ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-zinc-900">
                      {profile?.cgpa || 'Not set'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      / Req: {evaluation.minimumCgpa ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {evaluation.meetsCgpa
                      ? 'CGPA requirement satisfied'
                      : 'CGPA below minimum cutoff'}
                  </p>
                </div>

                {/* Grad Year Criterion */}
                <div className="p-3.5 bg-white border border-zinc-200 rounded-lg shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 font-medium">Batch / Grad Year</span>
                    {evaluation.meetsGradYear ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-zinc-900">
                      {profile?.grad_year || 'Not set'}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      / Min: {evaluation.minimumGradYear ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {evaluation.meetsGradYear
                      ? 'Graduation batch eligible'
                      : 'Graduation year ineligible'}
                  </p>
                </div>

                {/* Skills Match Criterion */}
                <div className="p-3.5 bg-white border border-zinc-200 rounded-lg shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500 font-medium">Mandatory Skills</span>
                    {evaluation.missingSkills?.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold font-mono text-zinc-900">
                      {(evaluation.requiredSkills?.length || 0) -
                        (evaluation.missingSkills?.length || 0)}
                      /{evaluation.requiredSkills?.length || 0}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">Matched</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1">
                    {evaluation.missingSkills?.length === 0
                      ? 'All required skills verified'
                      : `${evaluation.missingSkills?.length} mandatory skill(s) missing`}
                  </p>
                </div>
              </div>

              {/* Required Skills Chips */}
              {evaluation.requiredSkills && evaluation.requiredSkills.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-zinc-200">
                  <p className="text-xs text-zinc-600 mb-2 font-medium">
                    Required Skill Verification:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {evaluation.requiredSkills.map((skill) => {
                      const isMissing = evaluation.missingSkills?.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium ${
                            isMissing
                              ? 'bg-rose-50 text-rose-800 border-rose-200 line-through opacity-75'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {isMissing ? (
                            <XCircle className="w-3 h-3 text-rose-500" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
      <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="pb-5 border-b border-zinc-200">
          <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
            REVERSE MATCH
          </span>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mt-0.5">
            <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">
              See where you already stand
            </h2>
            <p className="text-xs text-zinc-500">
              Automated comparison across all {matches.length || 15} tracked companies
            </p>
          </div>

          {/* Group Filter Tabs: Qualify Now / Close / Not Yet / All */}
          <div className="flex flex-wrap items-center gap-1.5 mt-4">
            <button
              onClick={() => setActiveGroup('all')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                activeGroup === 'all'
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900'
              }`}
            >
              All Companies ({matches.length})
            </button>
            <button
              onClick={() => setActiveGroup('qualify')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'qualify'
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Qualify Now ({qualifyMatches.length})
            </button>
            <button
              onClick={() => setActiveGroup('close')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'close'
                  ? 'bg-amber-800 text-white border-amber-800 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Close ({closeMatches.length})
            </button>
            <button
              onClick={() => setActiveGroup('not_yet')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'not_yet'
                  ? 'bg-zinc-800 text-white border-zinc-800 shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Not Yet ({notYetMatches.length})
            </button>
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-5">
          {displayedMatches.map((m) => {
            const isSelected = selectedCompanyName.toLowerCase() === m.company.toLowerCase();

            return (
              <div
                key={m.companyId + m.company}
                className={`p-4 rounded-lg border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-zinc-900 bg-white ring-1 ring-zinc-900 shadow-xs'
                    : 'border-zinc-200 bg-zinc-50/50 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-semibold text-zinc-900">
                      {m.company}
                    </h4>

                    {m.tier === 'qualify' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-mono font-medium px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Qualify Now
                      </span>
                    ) : m.tier === 'close' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-mono font-medium px-2 py-0.5 rounded">
                        <Sparkles className="w-3 h-3 text-amber-700" />
                        Close (1-2 Gaps)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-zinc-200/80 text-zinc-700 text-[11px] font-mono font-medium px-2 py-0.5 rounded">
                        <XCircle className="w-3 h-3 text-zinc-500" />
                        Not Yet
                      </span>
                    )}
                  </div>

                  {/* Cutoff Criteria Specs */}
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mb-3">
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
                    <div className="space-y-1 mb-3 bg-white p-2.5 rounded-md border border-zinc-200/80">
                      {m.unmetReasons.map((reason, i) => (
                        <p key={i} className="text-[11px] text-rose-700 flex items-start gap-1.5 leading-snug">
                          <span className="mt-0.5 text-rose-500 shrink-0">•</span>
                          <span>{reason}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 bg-emerald-50/70 p-2.5 rounded-md border border-emerald-200">
                      <p className="text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        All academic and skill criteria satisfied
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-end border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompanyName(m.company);
                      fetchCompanyEligibility(m.company);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium text-zinc-700 hover:text-zinc-900 inline-flex items-center gap-1 hover:underline cursor-pointer"
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

