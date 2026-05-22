import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, message: "ping", time: new Date().toISOString() });
}
