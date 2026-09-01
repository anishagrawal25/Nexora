import { Award, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

function ReadinessBreakdown({ readiness, targetRoleName }) {
  if (!readiness) return null;

  const {
    score = 0,
    profileCompleteness = 0,
    resumeQuality = 0,
    skillMatch = 0,
    experienceBonus = 0,
  } = readiness;

  const metrics = [
    {
      label: 'Profile Completeness',
      weight: '25% weight',
      value: profileCompleteness,
      color: 'bg-[#1F6F5C]',
      desc: 'Academic details, graduation year, and portfolio links.',
    },
    {
      label: 'Resume Quality',
      weight: '35% weight',
      value: resumeQuality,
      color: 'bg-[#2E8B73]',
      desc: 'Skill breadth, project strengths, and structural clarity.',
    },
    {
      label: `Skill Match (${targetRoleName || 'Target Role'})`,
      weight: '30% weight',
      value: skillMatch,
      color: 'bg-[#40A58A]',
      desc: 'Overlap between your skills and target role requirements.',
    },
    {
      label: 'Experience & Signals',
      weight: '10% weight',
      value: experienceBonus,
      color: 'bg-[#6DB8A5]',
      desc: 'Portfolio presence, production projects, and internships.',
    },
  ];

  return (
    <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E1D8]">
        <div>
          <p className="font-mono text-xs tracking-widest text-[#1F6F5C] uppercase mb-1">
            READINESS ENGINE
          </p>
          <h2
            className="italic text-2xl sm:text-3xl text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Placement Readiness Breakdown
          </h2>
          <p className="text-xs text-[#5B6670] mt-1">
            Deterministic multi-factor score evaluating profile, resume quality, and role alignment.
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 bg-[#F4F2EB] border border-[#E4E1D8] px-5 py-3 rounded-xl self-start sm:self-auto">
          <span
            className="text-4xl sm:text-5xl font-semibold text-[#12181B]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {score}
          </span>
          <span className="text-sm font-mono text-[#5B6670]">/100</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mt-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-4 rounded-xl bg-[#FBFAF6] border border-[#E4E1D8]/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-[#12181B]">{m.label}</span>
                <span className="font-mono text-xs font-semibold text-[#1F6F5C]">{m.value}%</span>
              </div>
              <div className="w-full bg-[#E4E1D8] rounded-full h-2 overflow-hidden mb-2">
                <div
                  className={`h-full ${m.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#5B6670] mt-1">
              <span>{m.desc}</span>
              <span className="font-mono text-[10px] bg-white border border-[#E4E1D8] px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">
                {m.weight}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#5B6670]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#1F6F5C]" />
          <span>
            Formula: <code className="font-mono text-[11px] text-[#12181B]">Completeness×0.25 + Quality×0.35 + Match×0.30 + Exp×0.10</code>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReadinessBreakdown;
