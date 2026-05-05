import { NextRequest, NextResponse } from "next/server";
import { deleteQuote, getQuote } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const row = await getQuote(params.id);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ quote: row });
  } catch (err) {
    return NextResponse.json(
      { error: "fetch failed", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteQuote(params.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "delete failed", detail: String(err) },
      { status: 500 }
    );
  }
}
