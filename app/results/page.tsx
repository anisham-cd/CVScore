"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ComparisonResult = {
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
  source?: "ai";
};

const sections: { key: keyof ComparisonResult; title: string; tone: string }[] = [
  { key: "experienceMatch", title: "Experience match", tone: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30" },
  { key: "relevantSkills", title: "Relevant skills", tone: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30" },
  { key: "technicalSkills", title: "Technical skills", tone: "border-cyan-200 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950/30" },
  { key: "roleDomainExperience", title: "Role and domain experience", tone: "border-indigo-200 bg-indigo-50 dark:border-indigo-900 dark:bg-indigo-950/30" },
  { key: "responsibilitiesMatch", title: "Responsibilities match", tone: "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30" },
  { key: "relevantProjects", title: "Relevant projects", tone: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30" },
  { key: "educationCertifications", title: "Education and certifications", tone: "border-teal-200 bg-teal-50 dark:border-teal-900 dark:bg-teal-950/30" },
  { key: "missingSkills", title: "Missing or required skills", tone: "border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30" },
];

function HighlightList({ items }: { items: string[] }) {
  return items.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700 dark:text-slate-300"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-current" />{item}</li>)}</ul> : <p className="text-sm text-slate-500 dark:text-slate-400">No clear evidence detected.</p>;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result] = useState<ComparisonResult | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = sessionStorage.getItem("compareResult");
    if (!stored) return null;
    try { return JSON.parse(stored) as ComparisonResult; } catch (error) { console.error("Failed to parse comparison result", error); return null; }
  });

  if (!result) return <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 dark:bg-slate-950"><div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900"><h1 className="mb-4 text-2xl font-semibold text-slate-950 dark:text-slate-100">No comparison found</h1><p className="mb-6 text-slate-600 dark:text-slate-300">Add a resume and job description to see the comparison.</p><button onClick={() => router.push("/")} className="rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">Start comparison</button></div></div>;

  return <div className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950"><main className="mx-auto max-w-5xl"><button onClick={() => router.push("/")} className="mb-8 text-sm font-semibold text-sky-600 dark:text-sky-400">← Back to upload</button><header className="mb-10"><div className="mb-4 flex flex-wrap items-center gap-3"><span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">{result.overallSuitability}</span><span className="rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">AI comparison</span></div><h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-100">Resume and JD comparison</h1><p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">{result.summary}</p></header><section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Key strengths</h2><HighlightList items={result.keyStrengths} /></section><div className="grid gap-5 md:grid-cols-2">{sections.map(({ key, title, tone }) => <section key={key} className={`rounded-3xl border p-6 ${tone}`}><h2 className="mb-4 text-lg font-semibold text-slate-950 dark:text-slate-100">{title}</h2><HighlightList items={result[key] as string[]} /></section>)}</div><section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="mb-4 text-xl font-semibold text-slate-950 dark:text-slate-100">Next steps</h2><HighlightList items={result.recommendations} /></section><div className="mt-10 flex gap-4"><button onClick={() => router.push("/")} className="flex-1 rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">New comparison</button><button onClick={() => window.print()} className="flex-1 rounded-3xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-950">Print results</button></div></main></div>;
}
