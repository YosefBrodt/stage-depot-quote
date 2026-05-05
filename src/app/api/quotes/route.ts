import { NextRequest, NextResponse } from "next/server";
import { listQuotes, upsertQuote, nextCounter } from "@/lib/db";
import { calcTotals, defaultState, nextQuoteId, type QuoteState } from "@/lib/pricing";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rows = await listQuotes();
    return NextResponse.json({ quotes: rows });
  } catch (err) {
    return NextResponse.json(
      { error: "list failed", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  let body: { state?: Partial<QuoteState> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (!body.state || typeof body.state !== "object") {
    return NextResponse.json({ error: "missing state" }, { status: 400 });
  }
  const merged: QuoteState = {
    ...defaultState(),
    ...body.state,
    client: { ...defaultState().client, ...(body.state.client || {}) },
    discount: { ...defaultState().discount, ...(body.state.discount || {}) },
    tax: { ...defaultState().tax, ...(body.state.tax || {}) },
    deposit: { ...defaultState().deposit, ...(body.state.deposit || {}) },
    qty: body.state.qty || {},
    custom: body.state.custom || [],
  };

  try {
    if (!merged.quoteId) {
      const year = new Date().getFullYear();
      const n = await nextCounter(year);
      merged.quoteId = nextQuoteId(year, n);
    }
    merged.status = "saved";
    merged.updatedAt = Date.now();
    const totals = calcTotals(merged);
    await upsertQuote(merged.quoteId, merged, totals.total);
    return NextResponse.json({ quote: merged });
  } catch (err) {
    return NextResponse.json(
      { error: "save failed", detail: String(err) },
      { status: 500 }
    );
  }
}
