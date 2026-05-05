"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  PRICING,
  buildIncluded,
  calcTotals,
  defaultState,
  qtyKey,
  type Mode,
  type QuoteState,
  type Tier,
} from "@/lib/pricing";
import { fmt } from "@/lib/format";
import {
  AddressAutocomplete,
  provinceTaxRate,
  type AddressPick,
} from "./AddressAutocomplete";
import { ClientAutocomplete, type ClientPick } from "./ClientAutocomplete";
import { TemplatesMenu } from "./TemplatesMenu";
import type { Template } from "@/lib/templates";

type SavedRow = {
  id: string;
  data: QuoteState;
  client_name: string | null;
  client_address: string | null;
  total: number | null;
  status: string | null;
  updated_at: string;
};

const LOCAL_DRAFT_KEY = "sd_draft_v2";

function loadLocalDraft(): QuoteState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return mergeState(parsed);
  } catch {
    return null;
  }
}

function mergeState(partial: Partial<QuoteState>): QuoteState {
  const d = defaultState();
  return {
    ...d,
    ...partial,
    client: { ...d.client, ...(partial.client || {}) },
    discount: { ...d.discount, ...(partial.discount || {}) },
    tax: { ...d.tax, ...(partial.tax || {}) },
    deposit: { ...d.deposit, ...(partial.deposit || {}) },
    qty: partial.qty || {},
    custom: partial.custom || [],
  };
}

function saveLocalDraft(state: QuoteState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(state));
  } catch {
    // quota errors etc, ignore
  }
}

export function QuoteBuilder() {
  const [state, setState] = useState<QuoteState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [savedQuotes, setSavedQuotes] = useState<SavedRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = loadLocalDraft();
    if (local) setState(local);
    setHydrated(true);
  }, []);

  // Prefetch saved quotes once so client and address autocompletes have data,
  // and the History modal opens instantly on first click.
  const refreshHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSavedQuotes(data.quotes || []);
      setHistoryLoaded(true);
    } catch (err) {
      setHistoryError(String(err));
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const pastClients = useMemo(() => {
    return savedQuotes
      .map((r) => ({
        client: {
          name: r.data?.client?.name || "",
          address: r.data?.client?.address || "",
          email: r.data?.client?.email || "",
          phone: r.data?.client?.phone || "",
        },
        lastUsed: new Date(r.updated_at).getTime(),
      }))
      .filter((r) => r.client.name)
      .sort((a, b) => b.lastUsed - a.lastUsed);
  }, [savedQuotes]);

  const pastAddresses = useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    for (const r of savedQuotes) {
      const a = r.data?.client?.address?.trim();
      if (!a) continue;
      const k = a.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(a);
    }
    return out;
  }, [savedQuotes]);

  useEffect(() => {
    if (hydrated) saveLocalDraft(state);
  }, [state, hydrated]);

  const totals = useMemo(() => calcTotals(state), [state]);
  const included = useMemo(() => buildIncluded(state), [state]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2200);
  }, []);

  function patch(updater: (s: QuoteState) => QuoteState) {
    setState((s) => {
      const next = updater(s);
      return { ...next, updatedAt: Date.now() };
    });
  }

  function setMode(mode: Mode) {
    patch((s) => ({
      ...s,
      mode,
      tier: mode === "full" ? "basic" : "standard",
    }));
  }

  function setTier(tier: Tier) {
    patch((s) => ({ ...s, tier }));
  }

  function setQty(id: string, n: number) {
    patch((s) => {
      const k = qtyKey(s.mode, s.tier, id);
      const qty = { ...s.qty };
      if (n <= 0) delete qty[k];
      else qty[k] = n;
      return { ...s, qty };
    });
  }

  function getQty(id: string): number {
    return state.qty[qtyKey(state.mode, state.tier, id)] || 0;
  }

  function addCustomLine() {
    const label = customLabel.trim();
    const price = parseFloat(customPrice);
    if (!label || !price || price <= 0) return;
    patch((s) => ({
      ...s,
      custom: [...s.custom, { label, price: Math.round(price) }],
    }));
    setCustomLabel("");
    setCustomPrice("");
  }

  function removeCustomLine(i: number) {
    patch((s) => ({
      ...s,
      custom: s.custom.filter((_, idx) => idx !== i),
    }));
  }

  function newQuote() {
    if (
      state.quoteId ||
      state.client.name ||
      state.client.address ||
      Object.keys(state.qty).length > 0 ||
      state.custom.length > 0
    ) {
      const ok = window.confirm(
        "Start a new quote? Current draft will be cleared.\n(Saved quotes remain in history.)"
      );
      if (!ok) return;
    }
    setState(defaultState());
    showToast("New quote started");
  }

  function loadTemplate(t: Template) {
    if (
      state.quoteId ||
      state.client.name ||
      state.client.address ||
      Object.keys(state.qty).length > 0 ||
      state.custom.length > 0
    ) {
      const ok = window.confirm(
        `Start a new quote from "${t.label}"?\nCurrent draft will be cleared.`
      );
      if (!ok) return;
    }
    setState(t.build());
    showToast(`Loaded: ${t.label}`);
  }

  function handleAddressPick(pick: AddressPick) {
    patch((s) => ({
      ...s,
      client: { ...s.client, address: pick.fullAddress },
    }));
    if (pick.province) {
      const tax = provinceTaxRate(pick.province);
      if (tax) {
        patch((s) => ({
          ...s,
          tax: { enabled: true, rate: tax.rate, label: tax.label },
        }));
        showToast(
          `${pick.province} detected, tax set to ${tax.rate}% ${tax.label}`
        );
        return;
      }
    }
    showToast("Address saved");
  }

  function handleClientPick(c: ClientPick) {
    patch((s) => ({
      ...s,
      client: {
        ...s.client,
        name: c.name,
        address: c.address || s.client.address,
        email: c.email || s.client.email,
        phone: c.phone || s.client.phone,
      },
    }));
    showToast(`Client filled from past quote`);
  }

  async function saveQuote() {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const saved: QuoteState = data.quote;
      setState(mergeState(saved));
      showToast(`Saved as ${saved.quoteId}`);
      refreshHistory();
    } catch (err) {
      showToast(`Save failed: ${String(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function fetchPdfBlob(): Promise<Blob> {
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`PDF generation failed (${res.status}). ${txt}`);
    }
    return await res.blob();
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  function pdfFilename(): string {
    const safe = (state.client.name || "quote")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
    return `${state.quoteId || "StagerDepot-Draft"}-${safe}.pdf`;
  }

  async function downloadPDF() {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      const blob = await fetchPdfBlob();
      downloadBlob(blob, pdfFilename());
      showToast("PDF downloaded");
    } catch (err) {
      showToast(String(err));
    } finally {
      setPdfBusy(false);
    }
  }

  async function emailQuote() {
    if (emailBusy) return;
    setEmailBusy(true);
    try {
      const blob = await fetchPdfBlob();
      downloadBlob(blob, pdfFilename());

      const c = state.client;
      const t = totals;
      const inc = included;
      const subject = `Staging quote${state.quoteId ? " " + state.quoteId : ""}${
        c.address ? " for " + c.address : ""
      }`;
      const greeting = c.name ? `Hi ${c.name.split(" ")[0]},` : "Hi,";
      const lines = [
        greeting,
        "",
        `Thanks for considering Stager Depot. Here is your staging quote${
          c.address ? " for " + c.address : ""
        }.`,
        "",
        `Total: ${fmt(t.total)}`,
        state.deposit.percent > 0
          ? `Deposit on signing (${state.deposit.percent}%): ${fmt(t.deposit)}`
          : "",
        state.deposit.percent > 0
          ? `Balance on install: ${fmt(t.balance)}`
          : "",
        "",
        "Included in this package:",
        ...inc.map((i) => "  • " + i),
        "",
        "Payment terms: " + (state.deposit.terms || ""),
        "",
        "The PDF of the full quote was just downloaded to your computer. Please attach it to this email before sending.",
        "",
        "Best,",
        "Stager Depot",
      ];
      const body = lines.filter((l) => l !== null && l !== undefined).join("\n");

      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=${encodeURIComponent(
        c.email || ""
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmail, "_blank");
      showToast("PDF downloaded, Gmail opened");
    } catch (err) {
      showToast(String(err));
    } finally {
      setEmailBusy(false);
    }
  }

  async function copyQuote() {
    const c = state.client;
    const t = totals;
    const inc = included;
    const dateStr = c.date
      ? new Date(c.date + "T00:00").toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "";
    const out: string[] = [];
    out.push(
      `STAGER DEPOT, STAGING QUOTE${state.quoteId ? "  " + state.quoteId : ""}`
    );
    out.push("");
    if (c.name) out.push(`Client: ${c.name}`);
    if (c.address) out.push(`Property: ${c.address}`);
    if (dateStr) out.push(`Date: ${dateStr}`);
    out.push("");
    out.push("LINE ITEMS");
    out.push("-----------------------------------------");
    t.lines.forEach((l) => {
      const left = l.qty > 1 ? `${l.desc} (${l.qty} × ${fmt(l.unit)})` : l.desc;
      out.push(`${left.padEnd(38).slice(0, 38)} ${fmt(l.amt).padStart(10)}`);
    });
    out.push("-----------------------------------------");
    out.push(`${"Subtotal".padEnd(38)} ${fmt(t.subtotal).padStart(10)}`);
    if (t.discount > 0)
      out.push(
        `${"Discount".padEnd(38)} ${("−" + fmt(t.discount)).padStart(10)}`
      );
    if (state.tax.enabled)
      out.push(
        `${("Tax (" + state.tax.rate + "%)").padEnd(38)} ${fmt(t.tax).padStart(10)}`
      );
    out.push(`${"TOTAL".padEnd(38)} ${fmt(t.total).padStart(10)}`);
    if (state.deposit.percent > 0 && t.total > 0) {
      out.push("");
      out.push(
        `Deposit on signing (${state.deposit.percent}%): ${fmt(t.deposit)}`
      );
      out.push(`Balance on install: ${fmt(t.balance)}`);
    }
    out.push("");
    out.push("INCLUDED IN THIS PACKAGE");
    inc.forEach((i) => out.push(`  • ${i}`));
    out.push("");
    out.push("EXTENSIONS");
    out.push("Initial contract is 8 weeks. After that, the first month");
    out.push("extension is 60% off the original contract. Each subsequent");
    out.push("month is 65% off the original contract.");
    try {
      await navigator.clipboard.writeText(out.join("\n"));
      showToast("Copied to clipboard");
    } catch {
      showToast("Copy failed (clipboard unavailable)");
    }
  }

  function openHistory() {
    setHistoryOpen(true);
    if (!historyLoaded) refreshHistory();
  }

  function loadFromHistory(row: SavedRow) {
    setState(mergeState(row.data));
    setHistoryOpen(false);
    showToast(`Loaded ${row.id}`);
  }

  function duplicateFromHistory(row: SavedRow) {
    const merged = mergeState(row.data);
    merged.quoteId = null;
    merged.status = "draft";
    merged.createdAt = Date.now();
    merged.updatedAt = Date.now();
    setState(merged);
    setHistoryOpen(false);
    showToast("Duplicated as new draft");
  }

  async function deleteFromHistory(row: SavedRow) {
    if (!window.confirm(`Delete ${row.id}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/quotes/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSavedQuotes((rows) => rows.filter((r) => r.id !== row.id));
      if (state.quoteId === row.id) {
        patch((s) => ({ ...s, quoteId: null, status: "draft" }));
      }
      showToast(`Deleted ${row.id}`);
    } catch (err) {
      showToast(`Delete failed: ${String(err)}`);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  const quoteDateLabel = state.client.date
    ? new Date(state.client.date + "T00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const tiers: [Tier, string][] =
    state.mode === "full"
      ? [["basic", "Basic"], ["signature", "Signature (+25%)"]]
      : [["standard", "Standard"], ["signature", "Signature (+25%)"]];

  const tierCfg =
    state.mode === "full"
      ? PRICING.full[state.tier === "signature" ? "signature" : "basic"]
      : PRICING.single[state.tier === "signature" ? "signature" : "standard"];

  const headerLine = [state.client.name, state.client.address]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header className="bg-olive text-cream sticky top-0 z-40 shadow-[0_1px_0_0_rgba(0,0,0,0.15)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Image
              src="/sd-logo-filled.svg"
              alt="Stager Depot"
              width={96}
              height={60}
              priority
              className="h-12 w-auto"
            />
            <div className="hidden sm:block h-7 w-px bg-cream/20" />
            <div className="hidden sm:block">
              <div className="text-[11px] uppercase tracking-eyebrow text-cream/60 font-semibold leading-none">
                Quote Builder
              </div>
              <div className="text-sm text-cream mt-1.5 flex items-center gap-2 leading-none">
                <span className="font-medium">
                  {state.quoteId || "New quote"}
                </span>
                <span className={`badge ${state.quoteId ? "saved" : "draft"}`}>
                  {state.quoteId ? "Saved" : "Draft"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <TemplatesMenu onPick={loadTemplate} />
            <button className="btn btn-on-dark" onClick={openHistory}>
              History
            </button>
            <button
              className="btn btn-on-dark"
              onClick={saveQuote}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-on-dark"
              onClick={downloadPDF}
              disabled={pdfBusy}
            >
              {pdfBusy ? "Generating..." : "PDF"}
            </button>
            <button
              className="btn btn-on-dark"
              onClick={emailQuote}
              disabled={emailBusy}
            >
              {emailBusy ? "Preparing..." : "Email"}
            </button>
            <button className="btn btn-on-dark-primary" onClick={copyQuote}>
              Copy
            </button>
            <button
              className="btn btn-on-dark"
              onClick={logout}
              title="Sign out"
            >
              ⎋
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10">
        <section className="space-y-8">
          <div>
            <div className="label-eyebrow mb-2">Client details</div>
            <h2 className="h-display text-3xl mb-1">
              {state.quoteId ? `Quote ${state.quoteId}` : "New Quote"}
            </h2>
            <p className="text-muted text-sm mb-6">
              Build a staging package, send it out.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <div className="label-eyebrow mb-1.5">Client name</div>
                <ClientAutocomplete
                  value={state.client.name}
                  onChange={(v) =>
                    patch((s) => ({ ...s, client: { ...s.client, name: v } }))
                  }
                  onPick={handleClientPick}
                  pastClients={pastClients}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <div className="label-eyebrow mb-1.5">Property address</div>
                <AddressAutocomplete
                  value={state.client.address}
                  onChange={(v) =>
                    patch((s) => ({
                      ...s,
                      client: { ...s.client, address: v },
                    }))
                  }
                  onPick={handleAddressPick}
                  pastAddresses={pastAddresses}
                  placeholder="Start typing... (e.g. 5720)"
                />
              </div>
              <Field
                label="Quote date"
                type="date"
                value={state.client.date}
                onChange={(v) =>
                  patch((s) => ({ ...s, client: { ...s.client, date: v } }))
                }
              />
              <Field
                label="Client email"
                type="email"
                placeholder="jane@email.com"
                value={state.client.email}
                onChange={(v) =>
                  patch((s) => ({ ...s, client: { ...s.client, email: v } }))
                }
              />
              <Field
                label="Client phone"
                placeholder="(514) 555-0100"
                value={state.client.phone}
                onChange={(v) =>
                  patch((s) => ({ ...s, client: { ...s.client, phone: v } }))
                }
              />
              <Field
                label="Install date"
                type="date"
                value={state.client.installDate}
                onChange={(v) =>
                  patch((s) => ({
                    ...s,
                    client: { ...s.client, installDate: v },
                  }))
                }
              />
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex border-b border-line">
              <div
                className={`toggle-tab ${state.mode === "full" ? "active" : ""}`}
                onClick={() => setMode("full")}
              >
                Full Home Package
              </div>
              <div
                className={`toggle-tab ${
                  state.mode === "single" ? "active" : ""
                }`}
                onClick={() => setMode("single")}
              >
                Single Room(s)
              </div>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <div className="label-eyebrow mb-2.5">Tier</div>
                <div className="flex gap-2 flex-wrap">
                  {tiers.map(([id, label]) => (
                    <button
                      key={id}
                      className={`pill ${state.tier === id ? "active" : ""}`}
                      onClick={() => setTier(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="hint mt-2">{tierCfg.sublabel}</div>
              </div>

              {state.mode === "full" ? (
                <FullModeBody
                  tier={state.tier === "signature" ? "signature" : "basic"}
                  qty={(id) => getQty(id)}
                  setQty={setQty}
                />
              ) : (
                <SingleModeBody
                  tier={state.tier === "signature" ? "signature" : "standard"}
                  qty={(id) => getQty(id)}
                  setQty={setQty}
                />
              )}

              <CustomBlock
                items={state.custom}
                label={customLabel}
                price={customPrice}
                onLabelChange={setCustomLabel}
                onPriceChange={setCustomPrice}
                onAdd={addCustomLine}
                onRemove={removeCustomLine}
              />
            </div>
          </div>

          <div className="surface-card p-6 space-y-6">
            <div className="h-section text-xl">Pricing & terms</div>

            <div>
              <div className="label-eyebrow mb-2">Discount</div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_140px_1fr] gap-2">
                <select
                  className="field"
                  value={state.discount.type}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      discount: {
                        ...s.discount,
                        type: e.target.value as
                          | "none"
                          | "amount"
                          | "percent",
                      },
                    }))
                  }
                >
                  <option value="none">No discount</option>
                  <option value="amount">$ off</option>
                  <option value="percent">% off</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="field"
                  value={state.discount.value || ""}
                  placeholder="0"
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      discount: {
                        ...s.discount,
                        value: parseFloat(e.target.value) || 0,
                      },
                    }))
                  }
                />
                <input
                  className="field"
                  placeholder="Reason (optional, shown on quote)"
                  value={state.discount.reason}
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      discount: { ...s.discount, reason: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <div className="label-eyebrow mb-2">Tax</div>
              <div className="flex items-center gap-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-olive"
                    checked={state.tax.enabled}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        tax: { ...s.tax, enabled: e.target.checked },
                      }))
                    }
                  />
                  <span>Apply tax</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    step={0.01}
                    className="field"
                    style={{ width: 90 }}
                    value={state.tax.rate}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        tax: {
                          ...s.tax,
                          rate: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  <span className="text-sm text-muted">
                    % {state.tax.label ? `(${state.tax.label})` : "(HST/GST)"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="label-eyebrow mb-2">Deposit & payment</div>
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="field"
                    style={{ width: 80 }}
                    value={state.deposit.percent}
                    onChange={(e) =>
                      patch((s) => ({
                        ...s,
                        deposit: {
                          ...s.deposit,
                          percent: parseFloat(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  <span className="text-sm text-muted">%</span>
                </div>
                <input
                  className="field"
                  value={state.deposit.terms}
                  placeholder="Payment terms"
                  onChange={(e) =>
                    patch((s) => ({
                      ...s,
                      deposit: { ...s.deposit, terms: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="hint">
                Default: 50% deposit on signing, balance due on install.
              </div>
            </div>
          </div>

          <div className="surface-card p-6">
            <div className="flex items-baseline justify-between mb-2">
              <div className="label-eyebrow">Internal notes</div>
              <div className="text-[11px] text-muted">
                Only your team sees this, never shown on the PDF
              </div>
            </div>
            <textarea
              className="field min-h-[80px] resize-y"
              placeholder="Anything Shauly or Harry should know about this lead. Where they came from, what they're negotiating, follow-up reminders..."
              value={state.notes || ""}
              onChange={(e) =>
                patch((s) => ({ ...s, notes: e.target.value }))
              }
            />
          </div>

          <div className="surface-card p-6">
            <details>
              <summary>
                <span className="h-section text-lg">Extension calculator</span>
              </summary>
              <div className="mt-5 space-y-3">
                <p className="hint">
                  Initial contract runs 8 weeks. After that, the first month
                  extension is 60% off the original. Each subsequent month is
                  65% off.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="label-eyebrow mb-1.5">Months to extend</div>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      className="field"
                      value={state.extMonths || ""}
                      onChange={(e) =>
                        patch((s) => ({
                          ...s,
                          extMonths: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <ExtensionPreview
                  months={state.extMonths}
                  total={totals.total}
                />
              </div>
            </details>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 self-start">
          <div className="surface-card overflow-hidden shadow-sm">
            <div className="bg-olive text-cream px-6 py-5">
              <div className="flex items-baseline justify-between">
                <div className="text-[11px] uppercase tracking-eyebrow text-cream/65 font-semibold">
                  Live preview
                </div>
                <div className="text-xs text-cream/65">{quoteDateLabel}</div>
              </div>
              <div className="text-2xl font-bold mt-2 tracking-tight">
                Quote
              </div>
              <div className="text-sm text-cream/80 mt-0.5">
                {headerLine || "Stager Depot"}
              </div>
            </div>

            <div className="px-6 py-4">
              {totals.lines.length === 0 ? (
                <div className="empty">
                  No items yet. Add a package or rooms to start.
                </div>
              ) : (
                totals.lines.map((l, i) => (
                  <div className="quote-line" key={i}>
                    <div className="desc">
                      <div className="font-medium">
                        {l.desc}
                        {l.custom ? (
                          <span className="text-xs text-muted">
                            {" "}(custom)
                          </span>
                        ) : null}
                      </div>
                      {l.qty > 1 ? (
                        <div className="qty-sub">
                          {l.qty} × {fmt(l.unit)}
                        </div>
                      ) : null}
                    </div>
                    <div className="amt">{fmt(l.amt)}</div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-4 border-t border-line bg-[#FBFAF6] space-y-1.5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="tabular-nums">{fmt(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 ? (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted">
                    Discount
                    {state.discount.type === "percent"
                      ? ` ${state.discount.value}%`
                      : ""}
                    {state.discount.reason
                      ? ` (${state.discount.reason})`
                      : ""}
                  </span>
                  <span className="tabular-nums text-olive font-medium">
                    −{fmt(totals.discount)}
                  </span>
                </div>
              ) : null}
              {state.tax.enabled ? (
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted">
                    {state.tax.label
                      ? `${state.tax.label} (${state.tax.rate}%)`
                      : `Tax (${state.tax.rate}%)`}
                  </span>
                  <span className="tabular-nums">{fmt(totals.tax)}</span>
                </div>
              ) : null}
              <div className="flex items-baseline justify-between pt-3 border-t border-line mt-2">
                <div className="label-eyebrow">Total</div>
                <div className="total-row text-olive">
                  {fmt(totals.total)}
                </div>
              </div>
              {state.deposit.percent > 0 && totals.total > 0 ? (
                <div className="text-xs text-muted pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span>Deposit due on signing</span>
                    <span className="tabular-nums font-medium text-ink">
                      {fmt(totals.deposit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance due on install</span>
                    <span className="tabular-nums font-medium text-ink">
                      {fmt(totals.balance)}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-5 border-t border-line">
              <div className="label-eyebrow mb-2.5">What&apos;s included</div>
              <ul className="text-sm space-y-2">
                {included.length === 0 ? (
                  <li className="text-muted italic text-xs">
                    No rooms selected yet
                  </li>
                ) : (
                  included.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="check-dot">✓</span>
                      <span>{s}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="px-6 py-4 border-t border-line">
              <div className="label-eyebrow mb-1.5">Extensions</div>
              <p className="hint">
                After 8 weeks, the first additional month is 60% of original
                contract. Subsequent months are 65% of original.
              </p>
            </div>
          </div>
        </aside>
      </main>

      {historyOpen ? (
        <div
          className="modal-overlay open"
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryOpen(false);
          }}
        >
          <div className="modal">
            <div className="bg-olive text-cream px-6 py-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-eyebrow text-cream/65 font-semibold">
                  Saved quotes
                </div>
                <div className="text-xl font-bold mt-0.5 tracking-tight">
                  Quote History
                </div>
              </div>
              <button
                className="btn btn-on-dark"
                onClick={() => setHistoryOpen(false)}
              >
                Close
              </button>
            </div>
            <div className="overflow-auto">
              {historyLoading ? (
                <div className="p-12 text-center text-muted">Loading...</div>
              ) : historyError ? (
                <div className="p-8 text-sm text-red-700 bg-red-50">
                  {historyError}
                </div>
              ) : savedQuotes.length === 0 ? (
                <div className="p-12 text-center text-muted">
                  No saved quotes yet.
                </div>
              ) : (
                savedQuotes.map((row) => {
                  const total = Number(row.total || 0);
                  const date = new Date(row.updated_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric", year: "numeric" }
                  );
                  return (
                    <div
                      key={row.id}
                      className="px-6 py-4 border-b border-line hover:bg-[#FBFAF6] flex items-center gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ink">
                            {row.client_name || "Untitled client"}
                          </span>
                          <span className="text-xs text-muted">{row.id}</span>
                        </div>
                        <div className="text-xs text-muted mt-0.5">
                          {row.client_address || "—"} · updated {date}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-olive tabular-nums">
                        {fmt(total)}
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="btn"
                          onClick={() => loadFromHistory(row)}
                        >
                          Open
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => duplicateFromHistory(row)}
                          title="Duplicate"
                        >
                          ⎘
                        </button>
                        <button
                          className="btn btn-ghost"
                          onClick={() => deleteFromHistory(row)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className={`toast ${toastVisible ? "show" : ""}`}>{toastMsg}</div>
    </>
  );
}

function Field(props: {
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="label-eyebrow mb-1.5">{props.label}</div>
      <input
        className="field"
        type={props.type || "text"}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </div>
  );
}

function FullModeBody(props: {
  tier: "basic" | "signature";
  qty: (id: string) => number;
  setQty: (id: string, n: number) => void;
}) {
  const cfg = PRICING.full[props.tier];
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-olive text-cream p-6">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-cream/65 font-semibold mb-1">
              {props.tier === "signature" ? "Signature" : "Basic"} Tier
            </div>
            <div className="text-xl font-bold tracking-tight">{cfg.label}</div>
            <div className="text-xs text-cream/70 mt-1">{cfg.sublabel}</div>
          </div>
          <div className="text-3xl font-bold tracking-tight tabular-nums">
            {fmt(cfg.base)}
          </div>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 pt-5 border-t border-cream/15">
          {cfg.includes.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-cream/90">
              <span className="text-cream">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="h-section text-base">Add-ons</div>
          <div className="hint">All prices per item</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cfg.addons.map((a) => {
            const q = props.qty(a.id);
            const max = a.multi ? a.max || 9 : 1;
            return (
              <div
                key={a.id}
                className={`room-card ${q > 0 ? "has" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm">{a.label}</div>
                    <div className="text-xs text-muted mt-0.5">
                      {fmt(a.price)} {a.multi ? "each" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="stepper-btn"
                      disabled={q <= 0}
                      onClick={() => props.setQty(a.id, q - 1)}
                    >
                      −
                    </button>
                    <div className="w-6 text-center text-sm font-bold tabular-nums">
                      {q}
                    </div>
                    <button
                      className="stepper-btn"
                      disabled={q >= max}
                      onClick={() => props.setQty(a.id, q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SingleModeBody(props: {
  tier: "standard" | "signature";
  qty: (id: string) => number;
  setQty: (id: string, n: number) => void;
}) {
  const cfg = PRICING.single[props.tier];
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-olive text-cream p-6">
        <div className="text-[11px] uppercase tracking-eyebrow text-cream/65 font-semibold mb-1">
          {props.tier === "signature" ? "Signature" : "Standard"} Tier
        </div>
        <div className="text-xl font-bold tracking-tight">{cfg.label}</div>
        <div className="text-xs text-cream/70 mt-1">{cfg.sublabel}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cfg.rooms.map((r) => {
          const q = props.qty(r.id);
          const max = r.max || 6;
          return (
            <div key={r.id} className={`room-card ${q > 0 ? "has" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{r.label}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {fmt(r.price)} each, delivery included
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="stepper-btn"
                    disabled={q <= 0}
                    onClick={() => props.setQty(r.id, q - 1)}
                  >
                    −
                  </button>
                  <div className="w-6 text-center text-sm font-bold tabular-nums">
                    {q}
                  </div>
                  <button
                    className="stepper-btn"
                    disabled={q >= max}
                    onClick={() => props.setQty(r.id, q + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CustomBlock(props: {
  items: { label: string; price: number }[];
  label: string;
  price: string;
  onLabelChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
}) {
  return (
    <details className="mt-6">
      <summary>
        <span className="h-section text-base">Custom line item</span>
      </summary>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">
        <input
          className="field"
          placeholder="Description (e.g. Outdoor patio)"
          value={props.label}
          onChange={(e) => props.onLabelChange(e.target.value)}
        />
        <input
          type="number"
          className="field"
          placeholder="Price"
          value={props.price}
          onChange={(e) => props.onPriceChange(e.target.value)}
        />
        <button className="btn btn-primary" onClick={props.onAdd}>
          Add
        </button>
      </div>
      {props.items.length > 0 ? (
        <div className="mt-3 border border-line rounded-md px-3">
          {props.items.map((c, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 py-2 border-b border-line last:border-0"
            >
              <div className="text-sm">{c.label}</div>
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold tabular-nums">
                  {fmt(c.price)}
                </div>
                <button
                  className="text-muted hover:text-ink text-lg leading-none"
                  onClick={() => props.onRemove(i)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function ExtensionPreview(props: { months: number; total: number }) {
  if (!props.months || props.months <= 0 || props.total <= 0) return null;
  const months = props.months;
  const total = props.total;
  const m1 = total * 0.6;
  const more = months >= 2 ? (months - 1) * (total * 0.65) : 0;
  const ext = (months >= 1 ? m1 : 0) + more;
  const grand = total + ext;
  return (
    <div className="border border-line rounded-lg bg-cream-soft p-4 mt-2 space-y-1.5 text-sm">
      <div className="flex justify-between">
        <span>Original contract (8 weeks)</span>
        <span className="tabular-nums font-medium">{fmt(total)}</span>
      </div>
      {months >= 1 ? (
        <div className="flex justify-between text-muted">
          <span>+ Month 1 extension (60% off)</span>
          <span className="tabular-nums">{fmt(m1)}</span>
        </div>
      ) : null}
      {months >= 2 ? (
        <div className="flex justify-between text-muted">
          <span>
            + Months 2–{months} (65% off, {months - 1} mo)
          </span>
          <span className="tabular-nums">{fmt(more)}</span>
        </div>
      ) : null}
      <div className="flex justify-between font-bold pt-2 border-t border-olive/20">
        <span>Total with extensions</span>
        <span className="tabular-nums text-olive">{fmt(grand)}</span>
      </div>
    </div>
  );
}
