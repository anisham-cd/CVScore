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
  skills: string[];
  sections: string[];
};

export type JDMatchAnalysis = {
  score: number;
  grade: string;
  summary: string;
  recommendations: string[];
  resumeScore: number;
  resumeGrade: string;
  matchScore: number;
  combinedScore: number;
  jdSkills: string[];
  resumeSkills: string[];
  matchedSkills: string[];
  jdRequirements: string[];
  matchedRequirements: string[];
  missingRequirements: string[];
  highlights: string[];
  keyPoints: string[];
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
  "delivered",
  "customer",
  "business",
  "technical",
  "innovation",
];

const skillKeywords = [
  "javascript",
  "typescript",
  "react",
  "node",
  "nodejs",
  "python",
  "java",
  "c#",
  "c++",
  "sql",
  "nosql",
  "mongodb",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "devops",
  "cloud",
  "html",
  "css",
  "rest",
  "graphql",
  "git",
  "testing",
  "jest",
  "pytest",
  "machine learning",
  "ml",
  "data",
  "analytics",
  "ai",
  "leadership",
  "management",
  "communication",
  "design",
  "seo",
  "salesforce",
  "ui",
  "ux",
  "security",
  "qa",
];

const sectionKeywords = [
  "experience",
  "education",
  "skills",
  "projects",
  "summary",
  "certifications",
  "achievements",
  "professional experience",
  "work experience",
  "technical skills",
];

const requirementPatterns = [
  "must have",
  "must",
  "required",
  "prefer",
  "responsible",
  "responsibilities",
  "qualification",
  "experience in",
  "knowledge of",
  "proficient in",
  "strong understanding",
  "ability to",
  "experience with",
  "familiar with",
  "ownership",
  "deliver",
  "deliverables",
];

const normalizeText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const uniqueMatches = (text: string, terms: string[]): string[] => {
  const normalized = normalizeText(text);
  const found = new Set<string>();
  for (const term of terms) {
    if (term && normalized.includes(term.toLowerCase())) {
      found.add(term);
    }
  }
  return Array.from(found);
};

const splitSentences = (text: string): string[] => {
  return text
    .split(/[\r\n]+|[.!?]+\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
};

const extractSkills = (text: string): string[] => {
  return uniqueMatches(text, skillKeywords);
};

const extractSections = (text: string): string[] => {
  return uniqueMatches(text, sectionKeywords);
};

const extractJDRequirements = (text: string): string[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const requirements = new Set<string>();
  for (const line of lines) {
    const normalized = line.toLowerCase();
    if (requirementPatterns.some((pattern) => normalized.includes(pattern))) {
      requirements.add(line.replace(/\s+/g, " ").trim());
    }
  }

  if (requirements.size === 0) {
    const sentences = splitSentences(text);
    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase();
      if (requirementPatterns.some((pattern) => normalized.includes(pattern))) {
        requirements.add(sentence);
      }
      if (requirements.size >= 8) {
        break;
      }
    }
  }

  return Array.from(requirements);
};

const requirementMatchesText = (requirement: string, text: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedRequirement = normalizeText(requirement);
  if (normalizedText.includes(normalizedRequirement)) {
    return true;
  }

  const requirementKeywords = normalizedRequirement
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  return requirementKeywords.some((keyword) => normalizedText.includes(keyword));
};

const pickHighlights = (resumeText: string, terms: string[], maxHighlights = 6): string[] => {
  const normalizedTerms = terms
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);
  const sentences = splitSentences(resumeText);
  const highlights: string[] = [];

  for (const sentence of sentences) {
    const lowerSentence = sentence.toLowerCase();
    if (
      normalizedTerms.some(
        (term) => term && lowerSentence.includes(term)
      ) &&
      !highlights.includes(sentence)
    ) {
      highlights.push(sentence);
      if (highlights.length >= maxHighlights) {
        break;
      }
    }
  }

  return highlights;
};

const buildRecommendations = (
  analysis: ResumeAnalysisResult,
  jdSkills: string[],
  matchedSkills: string[],
  jdRequirements: string[],
  matchedRequirements: string[]
) =>{
  const recommendations: string[] = [...analysis.recommendations];

  if (jdSkills.length > 0 && matchedSkills.length / jdSkills.length < 0.6) {
    const missing = jdSkills.filter((skill) => !matchedSkills.includes(skill));
    recommendations.push(
      `Add or emphasize these JD skills in your resume: ${missing.slice(0, 6).join(", ")}.`
    );
  }

  if (jdRequirements.length > 0 && matchedRequirements.length / jdRequirements.length < 0.6) {
    const missingReq = jdRequirements.filter(
      (requirement) => !matchedRequirements.includes(requirement)
    );
    recommendations.push(
      `Show more alignment to JD requirements by addressing: ${missingReq
        .slice(0, 4)
        .join(", ")}.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Your resume aligns well with the JD. Keep focusing on clear achievements and measurable outcomes."
    );
  }

  return recommendations;
};
 export const calculateScore = (resumeText: string): ResumeAnalysisResult => {
  const normalized = normalizeText(resumeText);
  const length = normalized.length;

  const lengthScore = Math.min(30, Math.max(10, Math.floor(length / 40)));

  const keywordHits = resumeKeywords.reduce((count, keyword) => {
    return normalized.includes(keyword) ? count + 1 : count;
  }, 0);
  const keywordScore = Math.min(30, keywordHits * 6);

  const detectedSections = extractSections(resumeText);
  const structurePoints = Math.min(30, detectedSections.length * 8);

  const score = Math.min(100, lengthScore + keywordScore + structurePoints + 5);
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  const recommendations: string[] = [];
  if (length < 800) {
    recommendations.push(
      "Add more detail about your projects and measurable achievements to strengthen your resume."
    );
  }
  if (!detectedSections.includes("experience") || !detectedSections.includes("education")) {
    recommendations.push(
      "Include clear Experience and Education sections for better structure and ATS readability."
    );
  }
  if (keywordHits < 3) {
    recommendations.push(
      "Use additional impactful keywords like achievements, results, and technical skills."
    );
  }
  if (!detectedSections.includes("skills")) {
    recommendations.push("Add a Skills section to highlight your most relevant technical and soft skills.");
  }
  if (recommendations.length === 0) {
    recommendations.push(
      "Your resume has a good structure. Continue to emphasize accomplishments and clarity."
    );
  }

  return {
    score,
    grade,
    summary: `Quick resume feedback: ${score}% (${grade}). This is a baseline ATS-style score based on content length, keyword usage, and structure.`,
    recommendations,
    details: {
      lengthScore,
      keywordScore,
      structureScore: structurePoints,
    },
    skills: extractSkills(resumeText),
    sections: detectedSections,
  };
};

export const compareResumeToJD = (resumeText: string, jdText: string): JDMatchAnalysis => {
  const baseAnalysis = calculateScore(resumeText);
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jdText);
  const matchedSkills = resumeSkills.filter((skill) => jdSkills.includes(skill));

  const jdRequirements = extractJDRequirements(jdText);
  const matchedRequirements = jdRequirements.filter((requirement) =>
    requirementMatchesText(requirement, resumeText)
  );
  const missingRequirements = jdRequirements.filter(
    (requirement) => !matchedRequirements.includes(requirement)
  );

  const skillMatchRate = jdSkills.length ? matchedSkills.length / jdSkills.length : 0;
  const requirementMatchRate = jdRequirements.length
    ? matchedRequirements.length / jdRequirements.length
    : skillMatchRate;

  const matchScore = Math.round((skillMatchRate * 0.7 + requirementMatchRate * 0.3) * 100);
  const combinedScore = Math.round((baseAnalysis.score * 0.45 + matchScore * 0.55));
  const grade = combinedScore >= 85 ? "A" : combinedScore >= 70 ? "B" : combinedScore >= 55 ? "C" : combinedScore >= 40 ? "D" : "F";

  const highlights = pickHighlights(resumeText, [...matchedSkills, ...matchedRequirements], 6);

  const keyPoints: string[] = [];
  keyPoints.push(
    `Resume score ${baseAnalysis.score}% with JD alignment score ${matchScore}%. ` +
      `Combined fit score is ${combinedScore}%.`
  );
  if (matchedSkills.length) {
    keyPoints.push(`Matched skills from the JD: ${matchedSkills.join(", ")}.`);
  }
  if (missingRequirements.length && missingRequirements.length <= 4) {
    keyPoints.push(`Resume should better address: ${missingRequirements.join(", ")}.`);
  } else if (missingRequirements.length) {
    keyPoints.push(
      `Resume is missing ${missingRequirements.length} important JD requirements; highlight relevant experience and responsibilities.`
    );
  }
  if (!matchedSkills.length && jdSkills.length) {
    keyPoints.push(
      "The resume does not yet include JD skills. Add terminology used in the job description to increase relevance."
    );
  }
  if (!highlights.length) {
    keyPoints.push(
      "Try adding stronger accomplishment statements that map directly to the JD requirements and skills."
    );
  }

  return {
    score: combinedScore,
    grade,
    summary: `This comparison scores how closely the resume aligns to the job description. A higher combined score means better JD-fit.`,
    recommendations: buildRecommendations(
      baseAnalysis,
      jdSkills,
      matchedSkills,
      jdRequirements,
      matchedRequirements
    ),
    resumeScore: baseAnalysis.score,
    resumeGrade: baseAnalysis.grade,
    matchScore,
    combinedScore,
    jdSkills,
    resumeSkills,
    matchedSkills,
    jdRequirements,
    matchedRequirements,
    missingRequirements,
    highlights,
    keyPoints,
  };
};

export const validateResumeContent = (resumeText: string): string[] => {
  const normalized = normalizeText(resumeText);
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
