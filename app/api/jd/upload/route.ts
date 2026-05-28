import { NextResponse } from "next/server";
import { connectDB } from "@/src/lib/mongodb";
import JobDescription from "@/src/models/JobDescription";

const MAX_PDF_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let jdText = "";
    let fileName = "job-description.txt";
    let pageCount = 0;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const jdFile = formData.get("jd");
      if (!jdFile || typeof jdFile === "string" || !("arrayBuffer" in jdFile)) {
        return NextResponse.json({ error: "A JD file was not provided or is malformed." }, { status: 400 });
      }

      fileName = (jdFile as any).name || fileName;
      const buffer = Buffer.from(await (jdFile as any).arrayBuffer());

      if (buffer.byteLength === 0) {
        return NextResponse.json({ error: "Uploaded JD appears to be empty." }, { status: 400 });
      }

      if (buffer.byteLength > MAX_PDF_SIZE) {
        return NextResponse.json({ error: "JD files must be 5 MB or smaller." }, { status: 400 });
      }

      // If PDF, attempt to extract text
      if (fileName.toLowerCase().endsWith(".pdf") || ((jdFile as any).type || "").toLowerCase().includes("pdf")) {
        try {
          const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js");
          const pdfParseFn = (pdfParseModule as any).default ?? pdfParseModule;
          const parsed: any = await pdfParseFn(buffer);
          jdText = parsed.text?.trim() ?? "";
          pageCount = parsed.numpages ?? 0;
        } catch (err) {
          console.error("Failed to parse JD PDF", err);
          return NextResponse.json({ error: "Server cannot parse JD PDF." }, { status: 500 });
        }
      } else {
        jdText = buffer.toString("utf-8");
      }
    } else {
      const body = await request.json();
      jdText = (body?.text || "").toString();
      if (!jdText) {
        return NextResponse.json({ error: "JD text is required in JSON body." }, { status: 400 });
      }
    }

    if (!jdText || jdText.trim().length === 0) {
      return NextResponse.json({ error: "Unable to extract text from the JD." }, { status: 400 });
    }

    await connectDB();

    const stored = await JobDescription.create({ fileName, content: jdText, extractedData: { textLength: jdText.length, pageCount } });

    return NextResponse.json({ message: "JD stored", jobDescriptionId: stored._id.toString(), fileName, content: jdText });
  } catch (error) {
    console.error("JD upload error", error);
    return NextResponse.json({ error: "Failed to process JD upload." }, { status: 500 });
  }
}
