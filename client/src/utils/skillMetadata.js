/**
 * Skill Intelligence & Contextual Metadata Utility
 * Provides truthful, non-fabricated contextual explanations and metadata
 * for technical skills analyzed against industry target roles.
 */

export const SKILL_DOMAINS = {
  // Frontend
  React: 'Frontend',
  'React.js': 'Frontend',
  JavaScript: 'Frontend / Core',
  TypeScript: 'Frontend / Core',
  CSS: 'Frontend & UI',
  HTML: 'Frontend & UI',
  Vue: 'Frontend',
  Angular: 'Frontend',
  NextJS: 'Frontend & SSR',
  'Next.js': 'Frontend & SSR',
  Tailwind: 'Frontend & UI',

  // Backend
  'Node.js': 'Backend Runtime',
  Express: 'Backend Framework',
  'Express.js': 'Backend Framework',
  Python: 'Backend & Data',
  Java: 'Backend & Enterprise',
  'C#': 'Backend & Enterprise',
  Go: 'Backend & Systems',
  Golang: 'Backend & Systems',
  Django: 'Backend Framework',
  FastAPI: 'Backend Framework',
  'Spring Boot': 'Backend & Enterprise',

  // Database & Storage
  PostgreSQL: 'Relational Database',
  MongoDB: 'Document Database',
  SQL: 'Data Layer',
  MySQL: 'Relational Database',
  Redis: 'Caching & Key-Value',
  Prisma: 'ORM & Data Access',

  // DevOps & Infrastructure
  Docker: 'DevOps & Containers',
  Kubernetes: 'DevOps & Orchestration',
  Git: 'Version Control',
  CI_CD: 'DevOps & Automation',
  AWS: 'Cloud Infrastructure',
  Azure: 'Cloud Infrastructure',
  Linux: 'Systems & OS',

  // Architecture & Core CS
  'REST APIs': 'API Architecture',
  'System Design': 'Architecture & Scalability',
  'Data Structures': 'Core CS & Algorithms',
  Algorithms: 'Core CS & Algorithms',
  GraphQL: 'API Architecture',
  Microservices: 'Architecture',

  // Data & Analytics
  'Data Visualization': 'Data Analytics',
  Excel: 'Data & Reporting',
  Pandas: 'Data Analysis',
  Tableau: 'Business Intelligence',
};

export const SKILL_ESTIMATES = {
  React: { time: '4–6 hrs', level: 'Intermediate', difficulty: 'Moderate' },
  'Node.js': { time: '5–7 hrs', level: 'Intermediate', difficulty: 'Moderate' },
  Express: { time: '2–3 hrs', level: 'Foundational', difficulty: 'Low' },
  PostgreSQL: { time: '4–6 hrs', level: 'Intermediate', difficulty: 'Moderate' },
  MongoDB: { time: '3–4 hrs', level: 'Foundational', difficulty: 'Low' },
  JavaScript: { time: '6–8 hrs', level: 'Core Fluency', difficulty: 'Moderate' },
  TypeScript: { time: '4–5 hrs', level: 'Intermediate', difficulty: 'Moderate' },
  Docker: { time: '3–5 hrs', level: 'Foundational', difficulty: 'Moderate' },
  Git: { time: '1–2 hrs', level: 'Core Tooling', difficulty: 'Low' },
  'REST APIs': { time: '2–4 hrs', level: 'Intermediate', difficulty: 'Low' },
  SQL: { time: '3–5 hrs', level: 'Foundational', difficulty: 'Low' },
  Python: { time: '5–7 hrs', level: 'Core Fluency', difficulty: 'Moderate' },
  CSS: { time: '2–4 hrs', level: 'Core Tooling', difficulty: 'Low' },
  'System Design': { time: '8–12 hrs', level: 'Advanced', difficulty: 'High' },
  'Data Structures': { time: '10–15 hrs', level: 'Core CS', difficulty: 'High' },
  'Data Visualization': { time: '3–4 hrs', level: 'Intermediate', difficulty: 'Low' },
  Excel: { time: '2–3 hrs', level: 'Foundational', difficulty: 'Low' },
};

export const SKILL_CURATED_TOPICS = {
  React: [
    'Component Architecture & Props',
    'Core Hooks (useState, useEffect, useMemo, useCallback)',
    'State Management & Context API',
    'Client-Side Routing & Async Data Fetching',
  ],
  'Node.js': [
    'Event Loop & Non-Blocking Asynchronous I/O',
    'Core Modules (fs, path, http, crypto)',
    'RESTful Routing & Middleware Architecture',
    'Authentication & JWT Token Verification',
  ],
  Express: [
    'Router & Middleware Pipeline Configuration',
    'Request Body Parsing & Input Validation',
    'Global Centralized Error Handling',
    'CORS & Security Best Practices',
  ],
  PostgreSQL: [
    'Relational Schema Modeling & Foreign Keys',
    'Complex Joins, Aggregations & Subqueries',
    'B-Tree Indexes & Query Plan Optimization (EXPLAIN)',
    'ACID Transactions & Connection Pooling',
  ],
  MongoDB: [
    'Document-Oriented Schema Design & Embedding vs Referencing',
    'CRUD Operations & Index Strategies',
    'Aggregation Pipelines & Grouping',
    'Mongoose ODM Integration & Schema Validation',
  ],
  Docker: [
    'Container Lifecycle & Dockerfile Directives',
    'Multi-Stage Builds for Minimal Image Footprint',
    'Docker Compose Multi-Container Orchestration',
    'Port Mapping, Volumes & Container Networking',
  ],
  'REST APIs': [
    'HTTP Verbs, Idempotency & Standard Status Codes',
    'URI Resource Naming Conventions',
    'Pagination, Filtering & Sorting Standards',
    'Error Payload Consistency & Rate Limiting',
  ],
  Git: [
    'Branching Workflows & Pull Request Conventions',
    'Interactive Rebase & Conflict Resolution',
    'Stashing & Commit Hygiene',
    'Tagging & Semantic Release Workflows',
  ],
  SQL: [
    'DDL & DML Syntax (SELECT, INSERT, UPDATE, DELETE)',
    'JOIN Types (INNER, LEFT, RIGHT, FULL OUTER)',
    'Aggregate Functions (GROUP BY, HAVING, COUNT, SUM)',
    'Data Normalization (1NF to 3NF)',
  ],
  JavaScript: [
    'ES6+ Features (Destructuring, Spread, Modules)',
    'Promises, Async/Await & Event Loop Dynamics',
    'Closures, Scope & Prototype Inheritance',
    'DOM Manipulation & Event Propagation',
  ],
  'System Design': [
    'Horizontal vs Vertical Scaling & Load Balancing',
    'Database Sharding, Replication & CAP Theorem',
    'Caching Layers (Redis/Memcached) & CDN Edge Caching',
    'Message Queues & Asynchronous Worker Patterns',
  ],
  'Data Structures': [
    'Arrays, Strings, Hash Maps & Two-Pointer Techniques',
    'Linked Lists, Stacks & Queue Implementations',
    'Trees, Binary Search Trees & Graph Traversals (BFS/DFS)',
    'Time & Space Complexity Analysis (Big-O Notation)',
  ],
};

export const SKILL_RESOURCES = {
  React: { url: 'https://react.dev/learn', label: 'React Docs' },
  'Node.js': { url: 'https://nodejs.org/en/learn', label: 'Node.js Guide' },
  Express: { url: 'https://expressjs.com/en/guide/routing.html', label: 'Express Docs' },
  PostgreSQL: { url: 'https://www.postgresql.org/docs/current/tutorial.html', label: 'PostgreSQL Tutorial' },
  MongoDB: { url: 'https://www.mongodb.com/docs/manual/', label: 'MongoDB Manual' },
  JavaScript: { url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', label: 'MDN Web Docs' },
  TypeScript: { url: 'https://www.typescriptlang.org/docs/', label: 'TypeScript Handbook' },
  SQL: { url: 'https://www.w3schools.com/sql/', label: 'SQL Tutorial' },
  Git: { url: 'https://git-scm.com/doc', label: 'Git Reference' },
  Docker: { url: 'https://docs.docker.com/get-started/', label: 'Docker Docs' },
  Python: { url: 'https://docs.python.org/3/tutorial/', label: 'Python Docs' },
  'REST APIs': { url: 'https://restfulapi.net/', label: 'REST API Guide' },
  'System Design': { url: 'https://github.com/donnemartin/system-design-primer', label: 'System Design Primer' },
  'Data Structures': { url: 'https://www.geeksforgeeks.org/data-structures/', label: 'DSA Reference' },
  CSS: { url: 'https://developer.mozilla.org/en-US/docs/Web/CSS', label: 'MDN CSS Docs' },
  'Data Visualization': { url: 'https://d3js.org/getting-started', label: 'D3.js Docs' },
  Excel: { url: 'https://support.microsoft.com/en-us/excel', label: 'Excel Support' },
};

/**
 * Get domain classification for a skill.
 */
export function getSkillDomain(skillName) {
  if (!skillName) return 'Core Technical';
  return SKILL_DOMAINS[skillName] || 'Technical Skill';
}

/**
 * Get estimated study time and stage metadata.
 */
export function getSkillEstimate(skillName) {
  if (!skillName) {
    return { time: '3–5 hrs', level: 'Intermediate', difficulty: 'Moderate' };
  }
  return (
    SKILL_ESTIMATES[skillName] || {
      time: '3–5 hrs',
      level: 'Intermediate',
      difficulty: 'Moderate',
    }
  );
}

/**
 * Get curated study syllabus topics.
 */
export function getSkillTopics(skillName) {
  if (!skillName) return [];
  return (
    SKILL_CURATED_TOPICS[skillName] || [
      'Core syntax and structural principles',
      'Integration patterns and standard library usage',
      'Common performance pitfalls and optimization techniques',
    ]
  );
}

/**
 * Get canonical documentation resource.
 */
export function getSkillResource(skillName) {
  if (!skillName) return { url: 'https://google.com', label: 'Documentation' };
  return (
    SKILL_RESOURCES[skillName] || {
      url: `https://www.google.com/search?q=${encodeURIComponent(skillName + ' developer documentation')}`,
      label: `${skillName} Docs`,
    }
  );
}

/**
 * Contextual reason generator that explains WHY this skill is required or flagged as a gap.
 * Truthful, concise, without marketing fluff or fabricated percentages.
 */
export function getContextualReason(skillName, targetRole = '', isVerified = false) {
  const norm = String(skillName || '').trim().toLowerCase();
  const role = targetRole || 'your target role';

  if (isVerified) {
    return `Verified competency detected in your uploaded resume profile and project evidence.`;
  }

  // Domain-specific contextual copy
  if (norm.includes('react')) {
    return `Appears frequently in ${role} benchmarks. No frontend framework experience detected in current resume.`;
  }
  if (norm.includes('docker') || norm.includes('container')) {
    return `Infrastructure requirement for modern deployments. No containerization tooling detected in current projects.`;
  }
  if (norm.includes('postgres') || norm.includes('sql') || norm.includes('mysql')) {
    return `Relational data layer benchmark. Persistence modeling required for ${role} production services.`;
  }
  if (norm.includes('mongo')) {
    return `Document database benchmark. Relevant for flexible schema persistence in full-stack applications.`;
  }
  if (norm.includes('node')) {
    return `Core runtime for JavaScript backend services matching your ${role} benchmark.`;
  }
  if (norm.includes('express')) {
    return `Lightweight routing framework for Node.js services. Essential for building microservices and REST endpoints.`;
  }
  if (norm.includes('rest') || norm.includes('api')) {
    return `Standard architectural pattern for client-server integration and microservice communication.`;
  }
  if (norm.includes('git')) {
    return `Industry standard version control required for collaborative workflows and CI/CD pipelines.`;
  }
  if (norm.includes('python')) {
    return `Primary programming language for data workflows, scripting, and backend development in ${role}.`;
  }
  if (norm.includes('system design') || norm.includes('architecture')) {
    return `Evaluated in technical interview rounds for scalability, distributed systems, and data flow modeling.`;
  }
  if (norm.includes('data structure') || norm.includes('algorithm') || norm.includes('dsa')) {
    return `Foundational problem-solving benchmark evaluated during technical screening assessments.`;
  }

  return `Core requirement benchmarked for ${role}. Not found in your uploaded resume profile.`;
}
