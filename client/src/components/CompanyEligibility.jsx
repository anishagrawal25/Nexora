import { useState, useEffect } from 'react';
import { Building2, CheckCircle2, XCircle, ChevronDown, Award, Briefcase } from 'lucide-react';
import { apiRequest } from '../api';

function CompanyEligibility({ profile }) {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [allCompaniesOverview, setAllCompaniesOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  // Fetch companies list and overall evaluation
  useEffect(() => {
    async function loadCompaniesData() {
      try {
        setLoading(true);
        const [compData, overviewData] = await Promise.all([
          apiRequest('/profile/companies'),
          apiRequest('/profile/eligibility'),
        ]);

        const compList = compData.companies || [];
        setCompanies(compList);
        setAllCompaniesOverview(overviewData.companies || []);

        if (compList.length > 0) {
          const firstId = compList[0].id;
          setSelectedCompanyId(firstId);
          fetchCompanyEligibility(firstId);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCompaniesData();
  }, [profile]);

  async function fetchCompanyEligibility(companyId) {
    if (!companyId) return;
    setEvaluating(true);
    setError('');
    try {
      const data = await apiRequest(`/profile/eligibility?companyId=${companyId}`);
      setEvaluation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  }

  function handleCompanyChange(e) {
    const newId = e.target.value;
    setSelectedCompanyId(newId);
    fetchCompanyEligibility(newId);
  }

  return (
    <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1D8]">
        <div>
          <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
            CRITERIA EVALUATOR
          </p>
          <h2
            className="italic text-2xl text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Company Eligibility Checker
          </h2>
          <p className="text-xs text-[#5B6670] mt-1">
            Check your profile against automated recruitment cut-offs and skill filters.
          </p>
        </div>

        {/* Company Dropdown Selector */}
        <div className="relative min-w-[200px] self-start sm:self-auto">
          <select
            value={selectedCompanyId}
            onChange={handleCompanyChange}
            disabled={loading || companies.length === 0}
            className="w-full appearance-none bg-[#F4F2EB] border border-[#D8D5CA] text-sm text-[#12181B] font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1F6F5C]/30 focus:border-[#1F6F5C] transition cursor-pointer"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#5B6670] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                    className="italic text-lg text-[#12181B]"
                    style={{ fontFamily: "'Fraunces', serif" }}
                  >
                    {evaluation.company}
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
                    / Req: {evaluation.minimumCgpa || 'N/A'}
                  </span>
                </div>
                <p className="text-[10px] text-[#5B6670] mt-1">
                  {evaluation.meetsCgpa ? 'CGPA requirement satisfied' : 'CGPA below minimum cutoff'}
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
                    / Min: {evaluation.minimumGradYear || 'N/A'}
                  </span>
                </div>
                <p className="text-[10px] text-[#5B6670] mt-1">
                  {evaluation.meetsGradYear ? 'Graduation batch eligible' : 'Graduation year ineligible'}
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
                    {evaluation.requiredSkills?.length - (evaluation.missingSkills?.length || 0)}/
                    {evaluation.requiredSkills?.length || 0}
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
                <p className="text-xs text-[#5B6670] mb-2 font-medium">Required Skill Verification:</p>
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

          {/* Quick Companies Eligibility Matrix */}
          {allCompaniesOverview.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#E4E1D8]">
              <p className="text-xs font-mono tracking-wider text-[#5B6670] uppercase mb-3">
                All Tracked Companies Overview
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {allCompaniesOverview.map((item) => (
                  <button
                    key={item.companyId + item.company}
                    onClick={() => {
                      setSelectedCompanyId(item.companyId);
                      fetchCompanyEligibility(item.companyId);
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      Number(selectedCompanyId) === Number(item.companyId)
                        ? 'border-[#1F6F5C] bg-[#EFECE2]/70'
                        : 'border-[#E4E1D8] bg-white hover:border-[#1F6F5C]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#12181B] truncate">
                        {item.company}
                      </span>
                      {item.eligible ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-[#5B6670]">
                      {item.eligible ? 'Eligible' : `${item.missingSkills?.length || 0} gaps`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompanyEligibility;
