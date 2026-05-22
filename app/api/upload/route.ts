import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
import { calculateScore, validateResumeContent } from "@/src/lib/resumeAnalysis";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume");

    if (!resumeFile || typeof resumeFile === "string" || !("arrayBuffer" in resumeFile)) {
      return NextResponse.json({ error: "A PDF resume file is required." }, { status: 400 });
    }

    const fileName = (resumeFile as any).name || "resume.pdf";
    const fileType = (resumeFile as any).type || "";
    const fileBuffer = Buffer.from(await (resumeFile as any).arrayBuffer());

    if (!(fileType && fileType.toLowerCase().includes("pdf")) && !fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Uploaded file appears to be empty." }, { status: 400 });
    }

    if (fileBuffer.byteLength > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "Resume files must be 5 MB or smaller." }, { status: 400 });
    }

    // Dynamically import pdf-parse and resolve a callable parser function
    let pdfParseFn: any = null;
    try {
      const mod = await import("pdf-parse");

    if (typeof mod === "function") {
  pdfParseFn = mod;

} else if (typeof (mod as any)?.default === "function") {
  pdfParseFn = (mod as any).default;

} else if (typeof (mod as any)?.pdfParse === "function") {
  pdfParseFn = (mod as any).pdfParse;

} else if (
  typeof (mod as any)?.default?.pdfParse === "function"
) {
  pdfParseFn = (mod as any).default.pdfParse;
}
      if (!pdfParseFn) {
        console.error("pdf-parse import did not expose a callable function", Object.keys(mod || {}));
        return NextResponse.json({ error: "Server cannot process PDFs (pdf-parse shape unexpected)." }, { status: 500 });
      }
    } catch (impErr) {
      console.error("Failed to import pdf-parse", impErr);
      return NextResponse.json({ error: "Server cannot process PDFs (pdf-parse import failed)." }, { status: 500 });
    }

    const parsed = await pdfParseFn(fileBuffer as Buffer);
    const resumeText = parsed.text?.trim() ?? "";

    if (!resumeText) {
      return NextResponse.json({ error: "Unable to extract readable text from the PDF file." }, { status: 400 });
    }

    const validationIssues = validateResumeContent(resumeText);

    const analysis = calculateScore(resumeText);

    await connectDB();

    const storedResume = await Resume.create({
      fileName,
      content: resumeText,
      extractedData: {
        textLength: resumeText.length,
        pageCount: parsed.numpages,
      },
      atsScore: analysis.score,
      missingSkills: [],
      suggestions: analysis.recommendations,
      interviewQuestions: [],
    });

    return NextResponse.json({
      message: "Resume uploaded and analyzed successfully.",
      resumeId: storedResume._id,
      fileName,
      validationIssues,
      ...analysis,
    });
  } catch (error) {
    console.error("Resume upload error", error);
    return NextResponse.json(
      { error: "Failed to process the resume upload. Verify the file and try again." },
      { status: 500 }
    );
  }
}
    

