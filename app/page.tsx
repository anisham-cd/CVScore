"use client";

import { useState } from "react";
import ResumeUploadForm from "@/src/components/ResumeUploadForm";
import JobDescriptionUploadForm from "@/src/components/JobDescriptionUploadForm";

const Home = () => {
  const [currentResumeText, setCurrentResumeText] = useState("");

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <main className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className=" bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-slate-900/10 dark:bg-slate-900">
          <div className="max-w-3xl space-y-5">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Resume + JD matching</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Upload a resume and a job description to calculate JD fit.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-300">
              Upload a resume and a JD file or paste JD text to compute match score, shared skills, highlights, and fit recommendations.
            </p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <ResumeUploadForm onResumeExtracted={setCurrentResumeText} />
          <JobDescriptionUploadForm resumeText={currentResumeText} />
        </div>
      </main>
    </div>
  );
};

export default Home;
