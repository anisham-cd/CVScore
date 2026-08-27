import { compareResumeToJD_Ai } from "@/src/lib/aiScoring";

export type ComparisonResult = {
  summary: string;
  experienceMatch: string[];
  relevantSkills: string[];
  technicalSkills: string[];
  roleDomainExperience: string[];
  responsibilitiesMatch: string[];
  relevantProjects: string[];
  educationCertifications: string[];
  missingSkills: string[];
  keyStrengths: string[];
  overallSuitability: string;
  recommendations: string[];
  source: "ai";
};

const comparisonArrays = [
  "experienceMatch",
  "relevantSkills",
  "technicalSkills",
  "roleDomainExperience",
  "responsibilitiesMatch",
  "relevantProjects",
  "educationCertifications",
  "missingSkills",
  "keyStrengths",
  "recommendations",
] as const;

type AiComparison = Partial<Omit<ComparisonResult, "source">> & {
  summary?: unknown;
  overallSuitability?: unknown;
};

export async function compareResumeToJD(resumeText: string, jdText: string): Promise<ComparisonResult> {
  const result = await compareResumeToJD_Ai(resumeText, jdText) as AiComparison;

  if (typeof result.summary !== "string" || typeof result.overallSuitability !== "string") {
    throw new Error("AI comparison returned an incomplete result");
  }

  const comparison = Object.fromEntries(
    comparisonArrays.map((key) => [key, Array.isArray(result[key]) ? result[key] : []]),
  ) as Pick<ComparisonResult, typeof comparisonArrays[number]>;

  return {
    ...comparison,
    summary: result.summary,
    overallSuitability: result.overallSuitability,
    source: "ai",
  };
}
