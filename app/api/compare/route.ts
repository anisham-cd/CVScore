import { NextResponse } from "next/server";
import { compareResumeToJD } from "@/src/lib/evidenceResumeAnalysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = (body?.resumeText || "").toString();
    const jdText = (body?.jdText || "").toString();

    if (!resumeText || !jdText) {
      return NextResponse.json({ error: "Both resumeText and jdText are required." }, { status: 400 });
    }

    const result = await compareResumeToJD(resumeText, jdText);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI comparison error", error);
    return NextResponse.json({ error: "AI comparison is unavailable. Configure OPENAI_API_KEY and try again." }, { status: 503 });
  }
}
