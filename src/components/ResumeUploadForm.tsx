"use client";

import { JSX, useState } from "react";

type ResumeUploadFormProps = {
  onResumeExtracted?: (resumeText: string) => void;
};

const ResumeUploadForm = ({ onResumeExtracted }: ResumeUploadFormProps): JSX.Element => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setError(null);
    setUploaded(false);
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const isPdf = selectedFile.type?.includes("pdf") || selectedFile.name.toLowerCase().endsWith(".pdf");
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
    if (!file) {
      setError("Select a PDF resume to upload.");
      return;
    }
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("resume", file);
      const response = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error || "Unable to upload the resume. Please try again.");
        return;
      }
      if (typeof data.content === "string") onResumeExtracted?.(data.content);
      setUploaded(true);
    } catch (requestError) {
      console.error("Resume upload failed", requestError);
      setError("Unable to send the file. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Step 1</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Add your resume</h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">We extract the resume text so it can be compared with the job description.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="resumeUpload" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Select PDF resume</label>
          <input id="resumeUpload" type="file" accept="application/pdf" onChange={handleFileChange} className="block w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          {file ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)</p> : null}
        </div>
        {error ? <div className="rounded-3xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}
        {uploaded ? <div className="rounded-3xl bg-emerald-100 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">Resume ready for comparison.</div> : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button type="submit" disabled={loading} className="inline-flex h-14 items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">{loading ? "Preparing resume..." : "Use this resume"}</button>
          <p className="text-sm text-slate-500 dark:text-slate-400">PDF only, maximum 5 MB.</p>
        </div>
      </form>
    </section>
  );
};

export default ResumeUploadForm;
