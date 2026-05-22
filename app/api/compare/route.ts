import { NextResponse } from "next/server";
import { compareResumeToJD } from "@/src/lib/resumeAnalysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = (body?.resumeText || "").toString();
    const jdText = (body?.jdText || "").toString();

    if (!resumeText || !jdText) {
      return NextResponse.json({ error: "Both resumeText and jdText are required." }, { status: 400 });
    }

    const result = compareResumeToJD(resumeText, jdText);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Compare error", err);
    return NextResponse.json({ error: "Unable to compare resume and JD." }, { status: 500 });
  }
}
