import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import Resume from "@/src/models/Resume";
const MAX_PDF_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const resumeFile = formData.get("resume");

    if (!(resumeFile instanceof File)) {
      return NextResponse.json({ error: "A PDF resume file is required." }, { status: 400 });
    }

    const fileName = resumeFile.name || "resume.pdf";
    const fileType = resumeFile.type || "";
    const fileBuffer = Buffer.from(await resumeFile.arrayBuffer());

    if (!(fileType && fileType.toLowerCase().includes("pdf")) && !fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (fileBuffer.byteLength === 0) {
      return NextResponse.json({ error: "Uploaded file appears to be empty." }, { status: 400 });
    }

    if (fileBuffer.byteLength > MAX_PDF_SIZE) {
      return NextResponse.json({ error: "Resume files must be 5 MB or smaller." }, { status: 400 });
    }

    // Dynamically import pdf-parse directly from its implementation file to avoid the debug wrapper.
    type ParsedPdf = { text?: string; numpages?: number };
    let pdfParseFn: ((buffer: Buffer) => Promise<ParsedPdf>) | undefined;
    try {
      const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
      const candidate = (pdfParseModule as { default?: unknown }).default ?? pdfParseModule;
      if (typeof candidate !== "function") {
        console.error("pdf-parse import did not resolve to a function", pdfParseModule);
        return NextResponse.json({ error: "Server cannot process PDFs (pdf-parse shape unexpected)." }, { status: 500 });
      }
      pdfParseFn = candidate as (buffer: Buffer) => Promise<ParsedPdf>;
    } catch (impErr) {
      console.error("Failed to import pdf-parse", impErr);
      return NextResponse.json({ error: "Server cannot process PDFs (pdf-parse import failed)." }, { status: 500 });
    }

    const parsed = await pdfParseFn(fileBuffer);
    const resumeText = parsed.text?.trim() ?? "";

    if (!resumeText) {
      return NextResponse.json({ error: "Unable to extract readable text from the PDF file." }, { status: 400 });
    }

    await connectDB();

    const storedResume = await Resume.create({
      fileName,
      content: resumeText,
      extractedData: {
        textLength: resumeText.length,
        pageCount: parsed.numpages,
      },
    });

    return NextResponse.json({
      message: "Resume uploaded and text extracted successfully.",
      resumeId: storedResume._id.toString(),
      fileName,
      content: resumeText,
    });
  } catch (error: unknown) {
    console.error("Resume upload error", error);

    const isDev = process.env.NODE_ENV !== "production";
    const errMsg = error instanceof Error ? error.message : String(error);

    const payload: { error: string; details?: string; stack?: string } = {
      error: "Failed to process the resume upload. Verify the file and try again.",
    };

    if (isDev) {
      payload.details = errMsg;
      if (error instanceof Error && error.stack) payload.stack = error.stack;
    }

    return NextResponse.json(payload, { status: 500 });
  }
}
    

