export type ResumeAnalysisResult = {
  score: number;
  grade: string;
  summary: string;
  recommendations: string[];
  details: {
    lengthScore: number;
    keywordScore: number;
    structureScore: number;
  };
};

const resumeKeywords = [
  "experience",
  "leadership",
  "project",
  "achievement",
  "results",
  "skilled",
  "managed",
  "developed",
  "collaborated",
  "certified",
  "analysis",
  "training",
  "strategy",
  "performance",
  "process",
  "designed",
  "implemented",
  "improved",
  "optimized",
  "built",
];

export function calculateScore(resumeText: string): ResumeAnalysisResult {
  const normalized = resumeText.trim().toLowerCase();
  const length = normalized.length;

  const lengthScore = Math.min(30, Math.max(10, Math.floor(length / 40)));

  const keywordHits = resumeKeywords.reduce((count, keyword) => {
    return normalized.includes(keyword) ? count + 1 : count;
  }, 0);
  const keywordScore = Math.min(30, keywordHits * 6);

  const structureScore = ["experience", "education", "skills"].reduce(
    (count, section) => (normalized.includes(section) ? count + 1 : count),
    0
  );
  const structurePoints = Math.min(30, structureScore * 8);

  const score = Math.min(100, lengthScore + keywordScore + structurePoints + 5);

  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  const recommendations: string[] = [];
  if (length < 800) {
    recommendations.push("Add more detailed experience and accomplishments to your resume.");
  }
  if (!normalized.includes("experience") || !normalized.includes("education")) {
    recommendations.push("Include clear Experience and Education sections for better structure.");
  }
  if (keywordHits < 3) {
    recommendations.push("Use more resume keywords related to work, leadership, and accomplishments.");
  }
  if (!normalized.includes("skills")) {
    recommendations.push("Add a Skills section to highlight your technical and soft skills.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your resume looks well-structured. Consider adding more measurable outcomes and detail.");
  }

  return {
    score,
    grade,
    summary: `This quick analysis gave your resume a ${score}% score and grade ${grade}. Use the recommendations to improve clarity, keywords, and structure.`,
    recommendations,
    details: {
      lengthScore,
      keywordScore,
      structureScore: structurePoints,
    },
  };
}

export function validateResumeContent(resumeText: string): string[] {
  const normalized = resumeText.trim().toLowerCase();
  const issues: string[] = [];

  if (normalized.length < 600) {
    issues.push("Resume content is too short. Aim for a fuller summary of your experience and achievements.");
  }
  if (!normalized.includes("experience")) {
    issues.push("Add an Experience section to show your work history and accomplishments.");
  }
  if (!normalized.includes("education")) {
    issues.push("Add an Education section to highlight your academic background.");
  }
  if (!normalized.includes("skills")) {
    issues.push("List your skills clearly so recruiters and ATS systems can match your profile.");
  }
  if (normalized.includes("objectives") || normalized.includes("objective")) {
    issues.push("Avoid long objective statements; focus instead on achievements and impact.");
  }

  return issues;
}
