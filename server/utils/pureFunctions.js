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

module.exports = {
  RESOURCE_MAP,
  normalizeSkill,
  getPriorityByIndex,
  findResource,
  calculateProfileCompleteness,
  calculateResumeQuality,
  calculateSkillMatch,
  calculateExperienceBonus,
  calculateReadiness,
  validateEmail,
  validatePassword,
};
