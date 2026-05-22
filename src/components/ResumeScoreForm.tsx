"use client";

import { useState } from "react";

type ScoreResponse = {
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

const initialResult: ScoreResponse | null = null;

export default function ResumeScoreForm() {
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScoreResponse | null>(initialResult);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!resumeText.trim()) {
      setError("Please paste your resume text so the API can score it.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Unable to score the resume. Please try again.");
      } else {
        setResult(data);
      }
    } catch (fetchError) {
      setError("Unable to reach the scoring API. Check your network or try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Resume audit
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          Test your resume score
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Paste resume text below and click "Score resume". The API will return a test score, grade, and recommendations for a stronger resume.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resumeText" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Resume text
          </label>
          <textarea
            id="resumeText"
            value={resumeText}
            onChange={(event) => setResumeText(event.target.value)}
            rows={12}
            className="min-h-[240px] w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
            placeholder="Paste a resume or work experience summary here..."
          />
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200"
          >
            {loading ? "Scoring resume..." : "Score resume"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This is a sample analyzer for quick testing.
          </p>
        </div>
      </form>

      {result ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
              Score: {result.score}%
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Grade: {result.grade}
            </span>
          </div>
          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{result.summary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-slate-950 dark:shadow-none">
              <p className="text-sm text-slate-500 dark:text-slate-400">Length score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">{result.details.lengthScore}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-slate-950 dark:shadow-none">
              <p className="text-sm text-slate-500 dark:text-slate-400">Keyword score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">{result.details.keywordScore}</p>
            </div>
            <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-slate-950 dark:shadow-none">
              <p className="text-sm text-slate-500 dark:text-slate-400">Structure score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">{result.details.structureScore}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recommendations</h3>
            <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
              {result.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
