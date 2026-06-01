"use client";

import { JSX, useState } from "react";

type UploadResult = {
  score: number;
  grade: string;
  summary: string;
  recommendations: string[];
  validationIssues: string[];
  fileName: string;
  content?: string;
  dbWarning?: string;
  source: "ai" | "manual";
  sourceReason?: string;
  details: {
    lengthScore: number;
    keywordScore: number;
    structureScore: number;
  };
};

type ResumeUploadFormProps = {
  onResumeExtracted?: (resumeText: string) => void;
};

const ResumeUploadForm = ({ onResumeExtracted }: ResumeUploadFormProps): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    setResult(null);

    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const lowerName = selectedFile.name.toLowerCase();
    const isPdf = selectedFile.type?.includes("pdf") || lowerName.endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed. Please upload a .pdf resume.");
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
    setResult(null);

    if (!file) {
      setError("Select a PDF resume to upload.");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("resume", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      let data: any = null;
      try {
        data = await response.clone().json();
      } catch (e) {
        const text = await response.clone().text();
        console.error("Non-JSON response from /api/upload", { status: response.status, text, error: e });
        setError(`Server returned non-JSON response (status ${response.status}): ${text || "Empty response"}`);
        return;
      }

      if (!response.ok) {
        console.error("Upload failed", { status: response.status, data });
        setError(data?.error || `[${response.status}] ${JSON.stringify(data)}` || "Unable to upload the resume. Please try again.");
      } else {
        setResult(data);
        if (onResumeExtracted && typeof data.content === "string") {
          onResumeExtracted(data.content);
        }
      }
    } catch (err) {
      console.error("Upload request failed", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to send the file. Check your network and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Resume uploading application
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">
          Upload a PDF resume for analysis
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Upload a PDF resume and validate file type, size, and content before storing it in the database and sending it through analysis.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resumeUpload" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Select PDF resume
          </label>
          <input
            id="resumeUpload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/20"
          />
          {file ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Selected file: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
            </p>
          ) : null}
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
            {loading ? "Uploading resume..." : "Upload and analyze"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            PDF only, maximum 5 MB.
          </p>
        </div>
      </form>

      {result ? (
        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
              File: {result.fileName}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Score: {result.score}%
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              Grade: {result.grade}
            </span>
            <span className={`rounded-full px-4 py-1.5 text-sm font-semibold ${result.source === "ai" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-100"}`}>
              Scored by {result.source === "ai" ? "AI" : "manual algorithm"}
            </span>
          </div>
          {result.sourceReason ? (
            <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <strong>Source note:</strong> {result.sourceReason}
            </div>
          ) : null}

          {result.dbWarning ? (
            <div className="mb-4 rounded-3xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
              {result.dbWarning}
            </div>
          ) : null}

          <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{result.summary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm shadow-slate-200/60 dark:bg-slate-950 dark:shadow-none">
              <p className="text-sm text-slate-500 dark:text-slate-400">Length score</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">{result.details?.lengthScore}</p>
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

          {result.validationIssues.length ? (
            <div className="mt-6 rounded-3xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
              <h3 className="mb-2 font-semibold">Content validation issues</h3>
              <ul className="list-disc space-y-2 pl-5">
                {result.validationIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          ) : null}

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
};

export default ResumeUploadForm;
