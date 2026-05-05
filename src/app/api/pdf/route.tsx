import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuoteDocument } from "@/components/pdf/QuoteDocument";
import { defaultState, type QuoteState } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const state: QuoteState = {
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
    const buffer = await renderToBuffer(<QuoteDocument state={state} />);
    const safeName = (state.client.name || "quote")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    const fname = `${state.quoteId || "StagerDepot-Draft"}-${safeName}.pdf`;
    const body = new Uint8Array(buffer);
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fname}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "pdf failed", detail: String(err) },
      { status: 500 }
    );
  }
}
