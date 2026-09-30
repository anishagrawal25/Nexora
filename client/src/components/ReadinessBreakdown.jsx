import { TrendingUp, CheckCircle2 } from 'lucide-react';

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
      desc: 'Academic CGPA, graduation batch, and portfolio profiles.',
    },
    {
      label: 'Resume Quality',
      weight: '35% weight',
      value: resumeQuality,
      desc: 'Skill breadth, project impacts, and structural depth.',
    },
    {
      label: `Skill Match (${targetRoleName || 'Target Role'})`,
      weight: '30% weight',
      value: skillMatch,
      desc: 'Overlap with required industry benchmarks.',
    },
    {
      label: 'Experience & Signals',
      weight: '10% weight',
      value: experienceBonus,
      desc: 'Live projects, GitHub activity, and internship signals.',
    },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase font-medium">
            READINESS ENGINE
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight mt-0.5">
            Placement Readiness Breakdown
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Deterministic multi-factor score evaluating profile completeness, resume quality, and role alignment.
          </p>
        </div>

        <div className="flex items-baseline gap-1.5 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-lg self-start sm:self-auto">
          <span className="text-3xl sm:text-4xl font-semibold font-mono text-zinc-900">
            {score}
          </span>
          <span className="text-xs font-mono text-zinc-400">/100</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-4 rounded-lg bg-zinc-50/60 border border-zinc-200/80 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-zinc-900">{m.label}</span>
                <span className="font-mono text-xs font-semibold text-zinc-900">{m.value}%</span>
              </div>
              <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden mb-2">
                <div
                  className="h-full bg-zinc-900 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1">
              <span>{m.desc}</span>
              <span className="font-mono text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600 shrink-0 ml-2">
                {m.weight}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-zinc-700" />
          <span>
            Formula: <code className="font-mono text-[11px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-800">Completeness×0.25 + Quality×0.35 + Match×0.30 + Exp×0.10</code>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ReadinessBreakdown;

