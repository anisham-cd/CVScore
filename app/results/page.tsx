"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CompareResult = {
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

const ResultsPage = () => {
  const router = useRouter();
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Retrieve the result from sessionStorage
    const storedResult = sessionStorage.getItem("compareResult");
    
    if (storedResult) {
      try {
        const result = JSON.parse(storedResult);
        setCompareResult(result);
      } catch (error) {
        console.error("Failed to parse stored result:", error);
      }
    }
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="text-slate-700 dark:text-slate-300">Loading results...</p>
      </div>
    );
  }

  if (!compareResult) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-4 text-2xl font-semibold text-slate-950 dark:text-slate-100">No results found</h1>
          <p className="mb-6 text-slate-600 dark:text-slate-300">Upload a job description to see comparison results.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Go back to upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6">
          <button
            onClick={() => router.push("/")}
            className="flex w-fit items-center gap-2 text-sm font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            ← Back to upload
          </button>
          
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Match Results</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Your resume compared with the job description</p>
          </div>
        </div>

        {/* Score Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Resume Score</p>
            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">{compareResult.resumeScore}%</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Grade: {compareResult.resumeGrade}</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Match Score</p>
            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">{compareResult.matchScore}%</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Combined Score</p>
            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-100">{compareResult.combinedScore}%</p>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Summary</h2>
          <p className="leading-7 text-slate-700 dark:text-slate-300">{compareResult.summary}</p>
        </div>

        {/* Matched Skills */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Matched Skills</h3>
            {compareResult.matchedSkills.length ? (
              <ul className="space-y-2">
                {compareResult.matchedSkills.map((skill, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-500/20 dark:text-green-200">✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{skill}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">No matched skills detected</p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Missing Requirements</h3>
            {compareResult.missingRequirements.length ? (
              <ul className="space-y-2">
                {compareResult.missingRequirements.map((requirement, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-500/20 dark:text-red-200">✕</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{requirement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-400">All JD requirements are covered!</p>
            )}
          </div>
        </div>

        {/* Highlights */}
        {compareResult.highlights.length ? (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Highlights from Your Resume</h3>
            <ul className="space-y-3">
              {compareResult.highlights.map((highlight, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">★</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Key Points */}
        {compareResult.keyPoints.length ? (
          <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Key Points</h3>
            <ul className="space-y-3">
              {compareResult.keyPoints.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">•</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Recommendations */}
        {compareResult.recommendations.length ? (
          <div className="mb-12 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">Recommendations</h3>
            <ul className="space-y-3">
              {compareResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dark:bg-orange-500/20 dark:text-orange-200">→</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex-1 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Upload New Resume & JD
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
