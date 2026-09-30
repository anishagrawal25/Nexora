import { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  Briefcase,
  Layers,
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
    <div className="space-y-8">
      {/* SECTION 1: Single Company Checker */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
              CRITERIA EVALUATOR
            </p>
            <h2
              className="italic text-2xl text-[#12181B]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Check a company
            </h2>
            <p className="text-xs text-[#5B6670] mt-1">
              Check your profile against automated recruitment cut-offs and skill filters.
            </p>
          </div>

          {/* Combobox Company Selector (Free-form typing or pick suggestion) */}
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
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Selected Company Result Card */}
        {evaluation && (
          <div className="mt-6">
            <div className="p-5 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E1D8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E4E1D8] flex items-center justify-center text-[#1F6F5C]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3
                      className="italic text-lg text-[#12181B] flex items-center gap-2"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      <span>{evaluation.company}</span>
                      {evaluation.isEstimate && (
                        <span className="text-[10px] font-mono tracking-normal not-italic px-2 py-0.5 rounded-full bg-[#FEF6E6] text-[#975A16] border border-[#FCE1B3]">
                          Estimate
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#5B6670]">Hiring Criteria Assessment</p>
                  </div>
                </div>

                <div>
                  {evaluation.eligible ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-xs font-semibold px-3 py-1.5 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ELIGIBLE TO APPLY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-300 font-mono text-xs font-semibold px-3 py-1.5 rounded-full">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      NOT CURRENTLY ELIGIBLE
                    </span>
                  )}
                </div>
              </div>

              {/* Estimate Note Disclaimer Banner */}
              {evaluation.isEstimate && (
                <div className="mt-4 p-3 rounded-xl bg-[#FEF6E6] border border-[#FCE1B3] text-xs text-[#975A16] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#975A16]" />
                  <span>
                    {evaluation.note ||
                      `General guidance — we don't have specific data for '${evaluation.company}' yet.`}
                  </span>
                </div>
              )}

              {/* Criteria Breakdown Grid */}
              <div className="grid sm:grid-cols-3 gap-4 mt-4">
                {/* CGPA Criterion */}
                <div className="p-3.5 bg-white border border-[#E4E1D8] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670]">Minimum CGPA</span>
                    {evaluation.meetsCgpa ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[#12181B]">
                      {profile?.cgpa || 'Not set'}
                    </span>
                    <span className="text-xs text-[#5B6670]">
                      / Req: {evaluation.minimumCgpa ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5B6670] mt-1">
                    {evaluation.meetsCgpa
                      ? 'CGPA requirement satisfied'
                      : 'CGPA below minimum cutoff'}
                  </p>
                </div>

                {/* Grad Year Criterion */}
                <div className="p-3.5 bg-white border border-[#E4E1D8] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670]">Batch / Grad Year</span>
                    {evaluation.meetsGradYear ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[#12181B]">
                      {profile?.grad_year || 'Not set'}
                    </span>
                    <span className="text-xs text-[#5B6670]">
                      / Min: {evaluation.minimumGradYear ?? 'N/A'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#5B6670] mt-1">
                    {evaluation.meetsGradYear
                      ? 'Graduation batch eligible'
                      : 'Graduation year ineligible'}
                  </p>
                </div>

                {/* Skills Match Criterion */}
                <div className="p-3.5 bg-white border border-[#E4E1D8] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#5B6670]">Mandatory Skills</span>
                    {evaluation.missingSkills?.length === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-[#12181B]">
                      {(evaluation.requiredSkills?.length || 0) -
                        (evaluation.missingSkills?.length || 0)}
                      /{evaluation.requiredSkills?.length || 0}
                    </span>
                    <span className="text-xs text-[#5B6670]">Skills matched</span>
                  </div>
                  <p className="text-[10px] text-[#5B6670] mt-1">
                    {evaluation.missingSkills?.length === 0
                      ? 'All required skills verified'
                      : `${evaluation.missingSkills?.length} mandatory skill(s) missing`}
                  </p>
                </div>
              </div>

              {/* Required Skills Chips */}
              {evaluation.requiredSkills && evaluation.requiredSkills.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#E4E1D8]">
                  <p className="text-xs text-[#5B6670] mb-2 font-medium">
                    Required Skill Verification:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.requiredSkills.map((skill) => {
                      const isMissing = evaluation.missingSkills?.includes(skill);
                      return (
                        <span
                          key={skill}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border ${
                            isMissing
                              ? 'bg-rose-50 text-rose-800 border-rose-200 line-through opacity-80'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
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

      {/* SECTION 2: TASK 6 — "Which companies fit you?" (Reverse Match) */}
      <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7 shadow-2xs">
        <div className="pb-5 border-b border-[#E4E1D8]">
          <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
            REVERSE MATCH
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2
              className="italic text-2xl text-[#12181B]"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              See where you already stand
            </h2>
            <p className="text-xs text-[#5B6670]">
              Automated comparison across all 15 tracked companies
            </p>
          </div>

          {/* Group Filter Tabs: Qualify Now / Close / Not Yet / All */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => setActiveGroup('all')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer ${
                activeGroup === 'all'
                  ? 'bg-[#1F6F5C] text-white border-[#1F6F5C]'
                  : 'bg-[#FBFAF6] text-[#5B6670] border-[#D8D5CA] hover:bg-[#F4F2EB]'
              }`}
            >
              All Companies ({matches.length})
            </button>
            <button
              onClick={() => setActiveGroup('qualify')}
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer inline-flex items-center gap-1.5 ${
                activeGroup === 'qualify'
                  ? 'bg-emerald-700 text-white border-emerald-700'
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
                  ? 'bg-amber-700 text-white border-amber-700'
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
                  ? 'bg-[#5B6670] text-white border-[#5B6670]'
                  : 'bg-[#F4F2EB] text-[#5B6670] border-[#D8D5CA] hover:bg-[#EFECE2]'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Not Yet ({notYetMatches.length})
            </button>
          </div>
        </div>

        {/* Compact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {displayedMatches.map((m) => {
            const isSelected = selectedCompanyName.toLowerCase() === m.company.toLowerCase();

            return (
              <div
                key={m.companyId + m.company}
                className={`p-4 rounded-xl border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#1F6F5C] bg-[#FBFAF6] ring-1 ring-[#1F6F5C]/30'
                    : 'border-[#E4E1D8] bg-[#FBFAF6]/70 hover:border-[#1F6F5C]/40 hover:bg-[#FBFAF6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4
                      className="italic text-base text-[#12181B] font-semibold"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {m.company}
                    </h4>

                    {m.tier === 'qualify' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Qualify Now
                      </span>
                    ) : m.tier === 'close' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full">
                        <Sparkles className="w-3 h-3 text-amber-700" />
                        Close (1-2 Gaps)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-[#EFECE2] text-[#5B6670] text-[11px] font-mono font-medium px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3 text-[#5B6670]" />
                        Not Yet
                      </span>
                    )}
                  </div>

                  {/* Cutoff Criteria Specs */}
                  <div className="flex items-center gap-3 text-xs text-[#5B6670] mb-3">
                    <span>
                      Min CGPA: <strong>{m.minimumCgpa || 'N/A'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Batch: <strong>{m.minimumGradYear || 'N/A'}+</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Skills: <strong>{m.matchedSkills?.length || 0}/{m.requiredSkills?.length || 0}</strong>
                    </span>
                  </div>

                  {/* Specific granular unmet reasons (not just flat yes/no) */}
                  {m.unmetReasons && m.unmetReasons.length > 0 ? (
                    <div className="space-y-1.5 mb-3 bg-white p-3 rounded-lg border border-[#E4E1D8]">
                      {m.unmetReasons.map((reason, i) => (
                        <p key={i} className="text-xs text-[#A32A15] flex items-start gap-1.5 leading-snug">
                          <span className="mt-0.5 text-rose-500">•</span>
                          <span>{reason}</span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-3 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        All academic and skill criteria satisfied!
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Action */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompanyName(m.company);
                      fetchCompanyEligibility(m.company);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-xs font-medium text-[#1F6F5C] hover:text-[#195A4A] inline-flex items-center gap-1 hover:underline cursor-pointer"
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
