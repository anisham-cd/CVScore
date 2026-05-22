import { NextResponse } from "next/server";
import { calculateScore } from "@/src/lib/resumeAnalysis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const resumeText = body?.resumeText;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
    }

    const result = calculateScore(resumeText);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to score resume. Make sure the request body is JSON." },
      { status: 500 }
    );
  }
}
