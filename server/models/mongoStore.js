/**
 * Memory fallback store for when MongoDB Atlas network is blocked or unreachable.
 * Ensures seamless local development and automated testing without external dependencies.
 */

const memoryStore = {
  resumeAnalyses: [
    {
      _id: "res_mock_001",
      userId: 1,
      resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample_resume.pdf",
      extractedSkills: ["React", "JavaScript", "Node.js", "Express", "PostgreSQL", "Git", "REST APIs"],
      strengths: [
        "Strong foundation in full-stack JavaScript/Node development",
        "Experience building scalable REST APIs and relational databases",
        "Hands-on project work with modern React and Tailwind CSS",
      ],
      weaknesses: [
        "Docker and container orchestration skills could be expanded",
        "Limited exposure to cloud deployment architectures (AWS/GCP)",
      ],
      suggestions: [
        "Containerize backend services using Docker and Docker Compose",
        "Add automated CI/CD GitHub Actions pipelines to active projects",
        "Practice system design and microservice patterns",
      ],
      readinessScore: 82,
      deterministicReadinessScore: 85,
      createdAt: new Date("2026-08-20T10:00:00Z"),
    },
  ],
  skillGaps: [],
  recommendations: [],
};

module.exports = { memoryStore };
