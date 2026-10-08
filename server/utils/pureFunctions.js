/**
 * Pure calculation and mapping functions for Nexora Career Readiness
 */

const RESOURCE_MAP = {
  React: { url: "https://react.dev/learn", priority: "High" },
  "Node.js": { url: "https://nodejs.org/en/learn", priority: "High" },
  Express: { url: "https://expressjs.com/en/guide/routing.html", priority: "High" },
  PostgreSQL: { url: "https://www.postgresql.org/docs/current/tutorial.html", priority: "High" },
  MongoDB: { url: "https://www.mongodb.com/docs/manual/", priority: "High" },
  JavaScript: { url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", priority: "Medium" },
  SQL: { url: "https://www.w3schools.com/sql/", priority: "Medium" },
  Git: { url: "https://git-scm.com/doc", priority: "Medium" },
  Docker: { url: "https://docs.docker.com/get-started/", priority: "Medium" },
  Python: { url: "https://docs.python.org/3/tutorial/", priority: "Medium" },
  REST: { url: "https://restfulapi.net/", priority: "High" },
  "REST APIs": { url: "https://restfulapi.net/", priority: "High" },
  "API Integration": { url: "https://developer.mozilla.org/en-US/docs/Web/API", priority: "Medium" },
  "System Design": { url: "https://github.com/donnemartin/system-design-primer", priority: "High" },
  "Data Structures": { url: "https://www.geeksforgeeks.org/data-structures/", priority: "High" },
  "C#": { url: "https://learn.microsoft.com/en-us/dotnet/csharp/", priority: "High" },
  Azure: { url: "https://learn.microsoft.com/en-us/azure/", priority: "Medium" },
  Java: { url: "https://dev.java/learn/", priority: "High" },
  CSS: { url: "https://developer.mozilla.org/en-US/docs/Web/CSS", priority: "Medium" },
  "Data Visualization": { url: "https://d3js.org/getting-started", priority: "Medium" },
  Excel: { url: "https://support.microsoft.com/en-us/excel", priority: "Low" },
};

function normalizeSkill(skill) {
  return String(skill || "").trim().toLowerCase();
}

function isValidResumeAnalysis(analysis) {
  return Boolean(
    analysis &&
      Array.isArray(analysis.skills) &&
      Array.isArray(analysis.strengths) &&
      Array.isArray(analysis.weaknesses) &&
      Array.isArray(analysis.suggestions) &&
      Number.isFinite(analysis.readinessScore) &&
      analysis.readinessScore >= 0 &&
      analysis.readinessScore <= 100
  );
}

function getPriorityByIndex(index) {
  if (index < 3) return "High";
  if (index < 6) return "Medium";
  return "Low";
}

function findResource(skill) {
  const norm = normalizeSkill(skill);
  for (const [key, val] of Object.entries(RESOURCE_MAP)) {
    if (normalizeSkill(key) === norm) return val;
  }

  // Common aliases & fallbacks using word boundary or distinct substring matching
  if (/\b(react|reactjs)\b/i.test(norm)) return RESOURCE_MAP.React;
  if (/\b(node|nodejs)\b/i.test(norm)) return RESOURCE_MAP["Node.js"];
  if (/\b(express|expressjs)\b/i.test(norm)) return RESOURCE_MAP.Express;
  if (/\b(postgres|postgresql|psql)\b/i.test(norm)) return RESOURCE_MAP.PostgreSQL;
  if (/\b(mongo|mongodb)\b/i.test(norm)) return RESOURCE_MAP.MongoDB;
  if (/\b(docker|container|containers)\b/i.test(norm)) return RESOURCE_MAP.Docker;
  if (/\b(python|py)\b/i.test(norm)) return RESOURCE_MAP.Python;
  if (/\b(git|github|gitlab)\b/i.test(norm)) return RESOURCE_MAP.Git;
  if (/\b(sql|rdbms)\b/i.test(norm)) return RESOURCE_MAP.SQL;
  if (/\b(rest|restful|api|apis)\b/i.test(norm)) return RESOURCE_MAP["REST APIs"];
  if (/\b(javascript|es6)\b/i.test(norm) || norm === "js") return RESOURCE_MAP.JavaScript;
  if (/\b(typescript)\b/i.test(norm) || norm === "ts") return { url: "https://www.typescriptlang.org/docs/", priority: "High" };
  if (/\b(system design|architecture)\b/i.test(norm)) return RESOURCE_MAP["System Design"];
  if (/\b(data structure|data structures|algorithms?|dsa)\b/i.test(norm)) return RESOURCE_MAP["Data Structures"];
  if (/\b(c#|csharp|\.net)\b/i.test(norm)) return RESOURCE_MAP["C#"];
  if (/\b(azure)\b/i.test(norm)) return RESOURCE_MAP.Azure;
  if (/\b(java)\b/i.test(norm) && !/\b(javascript)\b/i.test(norm)) return RESOURCE_MAP.Java;
  if (/\b(css|css3|tailwind|tailwindcss)\b/i.test(norm)) return RESOURCE_MAP.CSS;
  if (/\b(visualization|tableau|powerbi|d3)\b/i.test(norm)) return RESOURCE_MAP["Data Visualization"];
  if (/\b(excel|spreadsheets?)\b/i.test(norm)) return RESOURCE_MAP.Excel;

  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(skill + " developer documentation tutorial")}`,
    priority: "Medium",
  };
}

function calculateProfileCompleteness(profile) {
  if (!profile) return 0;

  const fields = [
    profile.cgpa,
    profile.grad_year,
    profile.github_url,
    profile.linkedin_url,
    profile.portfolio_url,
    profile.target_role_id,
  ];

  const filled = fields.filter((value) => value !== null && value !== undefined && String(value).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
}

function calculateResumeQuality(analysis) {
  if (!analysis) return 0;

  const skills = Array.isArray(analysis.extractedSkills) ? analysis.extractedSkills.length : 0;
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths.length : 0;
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses.length : 0;
  const suggestions = Array.isArray(analysis.suggestions) ? analysis.suggestions.length : 0;
  const aiScore = typeof analysis.readinessScore === "number" ? analysis.readinessScore : 0;

  // Weighted formula factoring extracted skills, strengths, suggestions, weaknesses, and AI score
  const rawScore = skills * 8 + strengths * 10 + suggestions * 8 + (5 - Math.min(weaknesses, 5)) * 4 + aiScore;
  return Math.min(100, Math.round(rawScore / 4));
}

function calculateSkillMatch(expectedSkills, analysisSkills) {
  if (!Array.isArray(expectedSkills) || expectedSkills.length === 0) return 0;

  const skillSet = new Set((analysisSkills || []).map(normalizeSkill));
  const matched = expectedSkills.filter((skill) => skillSet.has(normalizeSkill(skill))).length;

  return Math.round((matched / expectedSkills.length) * 100);
}

function calculateExperienceBonus(profile, analysis) {
  const hasPortfolio = Boolean(profile?.github_url || profile?.portfolio_url || profile?.linkedin_url);
  const hasExperienceSignal = Array.isArray(analysis?.strengths)
    ? analysis.strengths.some((item) => /experience|project|internship|leadership|work|production|built|developed/i.test(String(item)))
    : false;

  return hasPortfolio || hasExperienceSignal ? 100 : 0;
}

function calculateReadiness(profile, analysis, expectedSkills) {
  const profileCompleteness = calculateProfileCompleteness(profile);
  const resumeQuality = calculateResumeQuality(analysis);
  const skillMatch = calculateSkillMatch(expectedSkills, analysis?.extractedSkills || []);
  const experienceBonus = calculateExperienceBonus(profile, analysis);

  // Deterministic formula: profileCompleteness*0.25 + resumeQuality*0.35 + skillMatch*0.30 + experienceBonus*0.10
  const weighted = Math.round(
    profileCompleteness * 0.25 +
      resumeQuality * 0.35 +
      skillMatch * 0.30 +
      experienceBonus * 0.10
  );

  return {
    profileCompleteness,
    resumeQuality,
    skillMatch,
    experienceBonus,
    score: Math.min(100, Math.max(0, weighted)),
  };
}

function validateEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
  if (typeof password !== "string") return false;
  return password.length >= 6;
}

const ROLE_FALLBACK_MAP = [
  {
    regex: /\b(frontend|front-end|ui|client)\b/i,
    skills: ["React", "JavaScript", "CSS", "Git", "REST APIs", "HTML"],
  },
  {
    regex: /\b(backend|back-end|api|server|microservice)\b/i,
    skills: ["Node.js", "Express", "PostgreSQL", "SQL", "Docker", "REST APIs"],
  },
  {
    regex: /\b(full\s*stack|fullstack)\b/i,
    skills: ["React", "Node.js", "Express", "PostgreSQL", "MongoDB", "Git", "Docker", "REST APIs"],
  },
  {
    regex: /\b(data\s*analyst|analytics|bi|business\s*intelligence)\b/i,
    skills: ["Python", "SQL", "PostgreSQL", "Excel", "Data Visualization"],
  },
  {
    regex: /\b(data\s*science|machine\s*learning|ai|ml|deep\s*learning|nlp|computer\s*vision)\b/i,
    skills: ["Python", "SQL", "Data Structures", "Git"],
  },
  {
    regex: /\b(devops|cloud|sre|reliability|infrastructure|platform|kubernetes)\b/i,
    skills: ["Docker", "Git", "Linux", "Azure", "REST APIs"],
  },
  {
    regex: /\b(mobile|android|ios|flutter|react\s*native|swift|kotlin)\b/i,
    skills: ["JavaScript", "React", "Git", "REST APIs"],
  },
  {
    regex: /\b(design|designer|ui\/ux|ux|product\s*designer)\b/i,
    skills: ["CSS", "HTML", "JavaScript"],
  },
  {
    regex: /\b(qa|quality|test|tester|sdet|automation)\b/i,
    skills: ["JavaScript", "Git", "SQL", "REST APIs"],
  },
  {
    regex: /\b(security|cyber|cybersecurity|infosec)\b/i,
    skills: ["Python", "Git", "SQL", "REST APIs"],
  },
  {
    regex: /\b(engineer|developer|programmer|software|swe|architect)\b/i,
    skills: ["Data Structures", "Git", "JavaScript", "SQL", "REST APIs"],
  },
];

const DEFAULT_ROLE_SKILLS = ["Git", "JavaScript", "SQL", "REST APIs", "Data Structures"];

function getRoleFallback(roleName) {
  const name = String(roleName || "").trim();
  let expectedSkills = DEFAULT_ROLE_SKILLS;

  for (const item of ROLE_FALLBACK_MAP) {
    if (item.regex.test(name)) {
      expectedSkills = item.skills;
      break;
    }
  }

  return {
    name: name || "Custom Role",
    expected_skills: expectedSkills,
    isEstimate: true,
    note: `General guidance — we don't have specific data for '${name || "this role"}' yet.`,
  };
}

const COMPANY_FALLBACK_TIERS = [
  {
    regex: /\b(startup|labs?|studio|ventures?|tech|io|app|ai|digital)\b/i,
    minCgpa: 6.50,
    minGradYear: 2023,
    requiredSkills: ["Git", "REST APIs", "JavaScript"],
  },
  {
    regex: /\b(consulting|services|technologies|solutions|global|systems|infotech|corp)\b/i,
    minCgpa: 6.50,
    minGradYear: 2023,
    requiredSkills: ["Java", "SQL", "Git"],
  },
  {
    regex: /\b(bank|banking|capital|finance|financial|fintech|pay|payments|invest|securities)\b/i,
    minCgpa: 7.00,
    minGradYear: 2023,
    requiredSkills: ["SQL", "Data Structures", "Git"],
  },
];

const DEFAULT_COMPANY_TIER = {
  minCgpa: 6.50,
  minGradYear: 2023,
  requiredSkills: ["Git", "REST APIs"],
};

function getCompanyFallback(companyName) {
  const name = String(companyName || "").trim();
  let tier = DEFAULT_COMPANY_TIER;

  for (const item of COMPANY_FALLBACK_TIERS) {
    if (item.regex.test(name)) {
      tier = item;
      break;
    }
  }

  return {
    company: name || "Custom Company",
    companyId: null,
    minimumCgpa: tier.minCgpa,
    minimumGradYear: tier.minGradYear,
    requiredSkills: tier.requiredSkills,
    isEstimate: true,
    note: `General guidance — we don't have specific data for '${name || "this company"}' yet.`,
  };
}

module.exports = {
  RESOURCE_MAP,
  normalizeSkill,
  isValidResumeAnalysis,
  getPriorityByIndex,
  findResource,
  calculateProfileCompleteness,
  calculateResumeQuality,
  calculateSkillMatch,
  calculateExperienceBonus,
  calculateReadiness,
  validateEmail,
  validatePassword,
  getRoleFallback,
  getCompanyFallback,
  ROLE_FALLBACK_MAP,
  COMPANY_FALLBACK_TIERS,
};
