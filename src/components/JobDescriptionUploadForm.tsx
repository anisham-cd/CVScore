"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { resumeText?: string };

export default function JobDescriptionUploadForm({ resumeText }: Props) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) return setFile(null);
    const name = selectedFile.name.toLowerCase();
    const supported = [".pdf", ".txt", ".md", ".docx", ".csv"].some((extension) => name.endsWith(extension));
    if (!supported || selectedFile.size > 5 * 1024 * 1024) {
      setError(supported ? "File size must be 5 MB or smaller." : "Use a PDF, TXT, MD, DOCX, or CSV file.");
      return setFile(null);
    }
    setFile(selectedFile);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!resumeText) return setError("Add your resume first.");
    if (!file && !text.trim()) return setError("Upload a JD file or paste the job description text.");
    setLoading(true);
    try {
      const payload = file ? (() => { const form = new FormData(); form.append("jd", file); return { body: form }; })() : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.trim() }) };
      const uploadResponse = await fetch("/api/jd/upload", { method: "POST", ...payload });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) return setError(uploadData?.error || "Unable to process the JD.");
      const compareResponse = await fetch("/api/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText, jdText: uploadData.content || text.trim() }) });
      const compareData = await compareResponse.json();
      if (!compareResponse.ok) return setError(compareData?.error || "Unable to compare the resume and JD.");
      sessionStorage.setItem("compareResult", JSON.stringify(compareData));
      router.push("/results");
    } catch (requestError) {
      console.error("JD comparison failed", requestError);
      setError("Unable to send the JD. Check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/20 dark:border-slate-800 dark:bg-slate-950 dark:shadow-none">
      <div className="mb-8 flex flex-col gap-3">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Step 2</p>
        <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Add the job description</h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">Upload a JD file or paste its text. We will compare it with the resume and highlight the important matches and gaps.</p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="jdUpload" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Select JD file</label>
          <input id="jdUpload" type="file" accept=".pdf,.txt,.md,.csv,.docx" onChange={handleFileChange} className="block w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          {file ? <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Selected: <strong>{file.name}</strong></p> : null}
        </div>
        <div>
          <label htmlFor="jdText" className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">Or paste job description text</label>
          <textarea id="jdText" rows={7} value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste the job description here..." className="block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
        </div>
        {error ? <div className="rounded-3xl bg-red-100 px-4 py-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">{error}</div> : null}
        <button type="submit" disabled={loading} className="inline-flex h-14 w-full items-center justify-center rounded-3xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200">{loading ? "Comparing resume and JD..." : "Compare resume with JD"}</button>
      </form>
    </section>
  );
}
