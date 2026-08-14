"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UploadResult = {
  jdId?: string;
  fileName?: string;
  contentSnippet?: string;
  dbWarning?: string;
};

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
  source: "ai" | "manual";
  sourceReason?: string;
};

type JobDescriptionUploadFormProps = {
  resumeText?: string;
};

export default function JobDescriptionUploadForm({
  resumeText,
}: JobDescriptionUploadFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [compareResult, setCompareResult] = useState<CompareResult | null>(null);
  const [loading, setLoading] = useState(false);

  const cleanText = (content: string): string => {
    if (!content) return "";

    // Remove binary/invalid characters
    return content
      .replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    setUploadResult(null);

    const selectedFile = event.target.files?.[0] ?? null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const lowerName = selectedFile.name.toLowerCase();

    const isSupported =
      selectedFile.type?.includes("pdf") ||
      lowerName.endsWith(".pdf") ||
      lowerName.endsWith(".txt") ||
      lowerName.endsWith(".md") ||
      lowerName.endsWith(".docx") ||
      lowerName.endsWith(".csv");

    if (!isSupported) {
      setError(
        "Only PDF, TXT, MD, DOCX or CSV files are allowed for JD uploads."
      );
      setFile(null);
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or smaller.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    setError(null);
    setUploadResult(null);

    if (!file && !text.trim()) {
      setError("Provide a JD file or paste the job description text.");
      return;
    }

    setLoading(true);

    try {
      let jdText = text.trim();
      let uploaded: UploadResult | null = null;

      if (file) {
        const payload = new FormData();
        payload.append("jd", file);

        const response = await fetch("/api/jd/upload", {
          method: "POST",
          body: payload,
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error || "Failed to upload JD.");
          return;
        }

        const cleanedContent = cleanText(data.content || "");

        jdText = cleanedContent || jdText;

        uploaded = {
          jdId: data.jobDescriptionId,
          fileName: data.fileName,
          contentSnippet: cleanedContent.slice(0, 400),
        };
      } else {
        const response = await fetch("/api/jd/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: jdText }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error || "Failed to upload JD text.");
          return;
        }

        const cleanedContent = cleanText(data.content || "");

        jdText = cleanedContent || jdText;

        uploaded = {
          jdId: data.jobDescriptionId,
          contentSnippet: cleanedContent.slice(0, 400),
        };
      }

      setUploadResult(uploaded);

      console.log("uploadResult.contentSnippet", uploaded);

      if (resumeText && jdText) {
        const compareResponse = await fetch("/api/compare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeText,
            jdText,
          }),
        });

        const compareData = await compareResponse.json(); 

        if (!compareResponse.ok) {
          setError(compareData?.error || "Failed to compare JD to resume.");
          return;
        }

        // Store result in sessionStorage and navigate to results page
        sessionStorage.setItem("compareResult", JSON.stringify(compareData));
        router.push("/results");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send JD to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Job description upload</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Upload or paste a Job Description</h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Upload a JD file or paste the job description text to compare against the current resume and receive matching feedback.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="jdUpload" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Select JD file (optional)</label>
          <input
            id="jdUpload"
            type="file"
            accept=".pdf,.txt,.md,.csv,text/plain,application/pdf"
            onChange={handleFileChange}
            className="block w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
          />
          {file ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Selected file: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="jdText" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Or paste job description text</label>
          <textarea
            id="jdText"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the job description here..."
            className="block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {error ? (
          <div className="rounded-3xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</div>
        ) : null}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={loading} className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">{loading ? "Processing JD..." : "Upload JD and compare"}</button>
          <p className="text-sm text-slate-500 dark:text-slate-400">PDF, TXT, MD, or CSV formats are supported. Maximum 5 MB.</p>
        </div>
      </form>

      {!resumeText ? (
        <div className="mt-6 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
          Upload a resume first to compare it with the uploaded JD.
        </div>
      ) : null}

      {uploadResult ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            {uploadResult.fileName ? (
              <span className="rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">File: {uploadResult.fileName}</span>
            ) : null}
         {uploadResult.jdId ? (
  <ol className="list-decimal pl-5 space-y-2">
    <li>
      <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
        JD ID: {uploadResult.jdId}
      </span>
    </li>
  </ol>
) : null}
          </div>

          {uploadResult.contentSnippet ? (
            <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{uploadResult.contentSnippet}...</p>
          ) : null}
        </div>
      ) : null}

      {compareResult ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">Resume score: {compareResult.resumeScore}%</span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">Match score: {compareResult.matchScore}%</span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">Combined score: {compareResult.combinedScore}%</span>
            <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${compareResult.source === "ai" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100"}`}>
              Compared by {compareResult.source === "ai" ? "AI" : "manual algorithm"}
            </span>
          </div>

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{compareResult.summary}</p>
          {compareResult.sourceReason ? (
            <div className="mt-4 rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <strong>Source note:</strong> {compareResult.sourceReason}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Matched skills</h3>
              <p className="mt-3 min-h-8 text-sm text-slate-700 dark:text-slate-300">{compareResult.matchedSkills.length ? compareResult.matchedSkills.join(", ") : "None detected"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Missing JD requirements</h3>
              <p className="mt-3 min-h-8 text-sm text-slate-700 dark:text-slate-300">{compareResult.missingRequirements.length ? compareResult.missingRequirements.join("; ") : "No critical JD requirements detected as missing."}</p>
            </div>
          </div>

          {compareResult.highlights.length ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Highlights from resume</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {compareResult.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {compareResult.keyPoints.length ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Key points</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {compareResult.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {compareResult.recommendations.length ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recommendations</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {compareResult.recommendations.map((recommendation, index) => (
                  <li key={index}>{recommendation}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
