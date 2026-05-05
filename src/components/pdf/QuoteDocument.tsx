import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  calcTotals,
  buildIncluded,
  buildIncludedDetailed,
  PRICING,
  type QuoteState,
} from "@/lib/pricing";
import { fmt } from "@/lib/format";
import { SDLogo } from "./SDLogo";

const COLORS = {
  olive: "#393D32",
  oliveLine: "#2C302A",
  cream: "#F1E3C8",
  creamSoft: "#F7EFDC",
  ink: "#1A1A17",
  line: "#E7E3D8",
  muted: "#6B6B66",
  body: "#FAFAF8",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.ink,
    backgroundColor: "white",
  },
  headerBand: {
    backgroundColor: COLORS.olive,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "column",
  },
  brandKicker: {
    fontSize: 8,
    color: "rgba(241,227,200,0.65)",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  metaRight: {
    textAlign: "right",
  },
  metaIdLabel: {
    fontSize: 8,
    color: "rgba(241,227,200,0.65)",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  metaId: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: COLORS.cream,
    letterSpacing: -0.3,
  },
  metaDate: {
    color: "rgba(241,227,200,0.7)",
    marginTop: 6,
    fontSize: 9,
  },
  body: {
    paddingTop: 26,
    paddingHorizontal: 44,
    paddingBottom: 0,
  },
  twoCol: {
    flexDirection: "row",
    gap: 28,
    marginBottom: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    borderBottomStyle: "solid",
  },
  col: { flex: 1 },
  eyebrow: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 7,
    fontFamily: "Helvetica-Bold",
  },
  preparedName: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  preparedSub: {
    fontSize: 10,
    color: "#57534e",
    marginTop: 3,
  },
  sectionHeader: {
    fontSize: 9,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.olive,
    borderBottomStyle: "solid",
    marginBottom: 4,
  },
  thDesc: {
    flex: 1,
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
  },
  thAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    borderBottomStyle: "solid",
  },
  rowDesc: { flex: 1 },
  rowDescText: {
    fontSize: 11,
    color: COLORS.ink,
    fontFamily: "Helvetica-Bold",
  },
  rowDescPlain: {
    fontSize: 11,
    color: COLORS.ink,
  },
  rowDescQty: { fontSize: 9, color: COLORS.muted, marginTop: 3 },
  rowAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  totalsBlock: { marginTop: 14 },
  totalsRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  totalsLabel: { flex: 1, fontSize: 10, color: COLORS.ink },
  totalsAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
    color: COLORS.ink,
  },
  totalsMutedLabel: { flex: 1, fontSize: 10, color: COLORS.muted },
  grandCard: {
    marginTop: 16,
    backgroundColor: COLORS.olive,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
  },
  grandLabelEyebrow: {
    fontSize: 8,
    color: "rgba(241,227,200,0.7)",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    fontFamily: "Helvetica-Bold",
  },
  grandLabel: {
    fontSize: 17,
    color: COLORS.cream,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
    letterSpacing: -0.2,
  },
  grandAmt: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 26,
    color: COLORS.cream,
    letterSpacing: -0.5,
  },
  depositCard: {
    marginTop: 14,
    padding: 14,
    backgroundColor: COLORS.creamSoft,
    borderRadius: 4,
  },
  depositRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    fontSize: 10,
  },
  depositRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
  },
  depositAmt: { fontFamily: "Helvetica-Bold", color: COLORS.olive },
  section: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    borderTopStyle: "solid",
  },
  includedInline: {
    fontSize: 10,
    color: COLORS.ink,
    lineHeight: 1.55,
  },
  roomBlock: {
    marginTop: 8,
    paddingTop: 8,
  },
  roomBlockFirst: {
    marginTop: 4,
  },
  roomLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.olive,
    marginBottom: 3,
  },
  roomItems: {
    fontSize: 9.5,
    color: "#57534e",
    lineHeight: 1.5,
  },
  termsText: {
    fontSize: 9.5,
    color: "#57534e",
    lineHeight: 1.45,
  },
  footerBand: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.olive,
    paddingVertical: 14,
    paddingHorizontal: 44,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLeft: {
    fontSize: 9,
    color: "rgba(241,227,200,0.85)",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  footerCenter: {
    fontSize: 9,
    color: "rgba(241,227,200,0.7)",
  },
  footerRight: {
    fontSize: 9,
    color: "rgba(241,227,200,0.7)",
    textAlign: "right",
  },
});

function formatLongDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function packageSubLine(state: QuoteState): string | null {
  if (state.mode === "full") {
    const tier = state.tier === "signature" ? "signature" : "basic";
    const cfg = PRICING.full[tier];
    return `${cfg.sublabel} · 8-week initial contract`;
  }
  return null;
}

function isDecodenMode(state: QuoteState): boolean {
  return state.mode === "decoden";
}

export function QuoteDocument({ state }: { state: QuoteState }) {
  const t = calcTotals(state);
  const inc = buildIncluded(state);
  const incDetailed = buildIncludedDetailed(state);
  const c = state.client;
  const dateStr = formatLongDate(c.date);
  const installStr = formatLongDate(c.installDate);
  const subLine = packageSubLine(state);
  const decoden = isDecodenMode(state);
  const headerKicker = decoden ? "DecoDen Rental Quote" : "Home Staging Quote";
  const docTitle = decoden
    ? `Stager Depot DecoDen Quote ${state.quoteId || ""}`.trim()
    : `Stager Depot Quote ${state.quoteId || ""}`.trim();

  // Smarter "Prepared for" eyebrow + content:
  // - Has name: classic "Prepared for" with full client block
  // - No name but has address: "Property" eyebrow with just address
  // - Neither: omit the section entirely
  const hasName = !!c.name;
  const hasAddress = !!c.address;
  const showPrepared = hasName || hasAddress;
  const preparedEyebrow = hasName ? "Prepared for" : "Property";

  return (
    <Document title={docTitle}>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.headerBand}>
          <View style={styles.headerLeft}>
            <Text style={styles.brandKicker}>{headerKicker}</Text>
            <SDLogo width={130} />
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaIdLabel}>Quote No.</Text>
            <Text style={styles.metaId}>{state.quoteId || "DRAFT"}</Text>
            {dateStr ? <Text style={styles.metaDate}>{dateStr}</Text> : null}
          </View>
        </View>

        <View style={styles.body}>
          {showPrepared ? (
            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.eyebrow}>{preparedEyebrow}</Text>
                {hasName ? (
                  <>
                    <Text style={styles.preparedName}>{c.name}</Text>
                    {hasAddress ? (
                      <Text style={styles.preparedSub}>{c.address}</Text>
                    ) : null}
                    {c.email ? (
                      <Text style={styles.preparedSub}>{c.email}</Text>
                    ) : null}
                    {c.phone ? (
                      <Text style={styles.preparedSub}>{c.phone}</Text>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.preparedName}>{c.address}</Text>
                )}
              </View>
              <View style={styles.col}>
                <Text style={styles.eyebrow}>
                  {decoden ? "Term" : "Project"}
                </Text>
                <Text style={styles.preparedSub}>
                  {decoden
                    ? "Long-term monthly rental"
                    : "Initial contract: 8 weeks"}
                </Text>
                {installStr ? (
                  <Text style={styles.preparedSub}>
                    {decoden ? "Move-in: " : "Install: "}
                    {installStr}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          <Text style={styles.sectionHeader}>Line Items</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Description</Text>
            <Text style={styles.thAmt}>Amount</Text>
          </View>

          {t.lines.length === 0 ? (
            <View style={styles.row}>
              <Text style={[styles.rowDescPlain, { color: COLORS.muted }]}>
                No items selected.
              </Text>
            </View>
          ) : (
            t.lines.map((l, i) => {
              const isFirstPackageLine = i === 0 && state.mode === "full";
              return (
                <View key={i} style={styles.row}>
                  <View style={styles.rowDesc}>
                    <Text
                      style={
                        l.qty > 1 || l.custom
                          ? styles.rowDescPlain
                          : isFirstPackageLine
                          ? styles.rowDescText
                          : styles.rowDescPlain
                      }
                    >
                      {l.desc}
                      {l.custom ? "  (custom)" : ""}
                    </Text>
                    {isFirstPackageLine && subLine ? (
                      <Text style={styles.rowDescQty}>{subLine}</Text>
                    ) : null}
                    {l.qty > 1 ? (
                      <Text style={styles.rowDescQty}>
                        {l.qty} × {fmt(l.unit)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.rowAmt}>{fmt(l.amt)}</Text>
                </View>
              );
            })
          )}

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsAmt}>{fmt(t.subtotal)}</Text>
            </View>
            {t.discount > 0 ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsMutedLabel}>
                  Discount
                  {state.discount.type === "percent"
                    ? ` ${state.discount.value}%`
                    : ""}
                  {state.discount.reason ? ` (${state.discount.reason})` : ""}
                </Text>
                <Text style={[styles.totalsAmt, { color: COLORS.olive }]}>
                  −{fmt(t.discount)}
                </Text>
              </View>
            ) : null}
            {state.tax.enabled ? (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsMutedLabel}>
                  {state.tax.label
                    ? `${state.tax.label} (${state.tax.rate}%)`
                    : `Tax (${state.tax.rate}%)`}
                </Text>
                <Text style={styles.totalsAmt}>{fmt(t.tax)}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.grandCard}>
            <View>
              <Text style={styles.grandLabelEyebrow}>
                {decoden ? "Per Unit" : "Total Due"}
              </Text>
              <Text style={styles.grandLabel}>
                {decoden ? "Monthly Rate" : "Quote Total"}
              </Text>
            </View>
            <Text style={styles.grandAmt}>
              {fmt(t.total)}
              {decoden ? (
                <Text style={{ fontSize: 12, color: "rgba(241,227,200,0.7)" }}>
                  {" "}/mo
                </Text>
              ) : null}
            </Text>
          </View>

          {!decoden && state.deposit.percent > 0 && t.total > 0 ? (
            <View style={styles.depositCard}>
              <View style={styles.depositRow}>
                <Text>Deposit due on signing ({state.deposit.percent}%)</Text>
                <Text style={styles.depositAmt}>{fmt(t.deposit)}</Text>
              </View>
              <View style={styles.depositRowLast}>
                <Text>Balance due on install</Text>
                <Text style={styles.depositAmt}>{fmt(t.balance)}</Text>
              </View>
            </View>
          ) : null}

          {incDetailed.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>What&apos;s included</Text>
              {incDetailed.map((room, i) => (
                <View
                  key={i}
                  style={i === 0 ? styles.roomBlockFirst : styles.roomBlock}
                >
                  <Text style={styles.roomLabel}>{room.label}</Text>
                  <Text style={styles.roomItems}>
                    {room.contents.join(" · ")}
                  </Text>
                </View>
              ))}
            </View>
          ) : inc.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>What&apos;s included</Text>
              <Text style={styles.includedInline}>{inc.join("  ·  ")}</Text>
            </View>
          ) : null}

          <View style={[styles.section, { marginTop: 18, paddingTop: 14 }]}>
            <Text style={styles.eyebrow}>
              {decoden ? "Billing terms" : "Payment terms"}
            </Text>
            <Text style={styles.termsText}>
              {decoden
                ? "Monthly rental, billed each month. Renews automatically. Cancel with 30 days' notice. Damage deposit and delivery quoted separately based on unit and address."
                : state.deposit.terms || ""}
            </Text>
          </View>

          {!decoden ? (
            <View style={[styles.section, { marginTop: 12, paddingTop: 10 }]}>
              <Text style={styles.eyebrow}>Extension policy</Text>
              <Text style={styles.termsText}>
                Initial contract is 8 weeks. After that, every additional
                4-week extension is 60% of the original contract.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footerBand} fixed>
          <Text style={styles.footerLeft}>Stager Depot</Text>
          <Text style={styles.footerCenter}>
            Questions? Visit stagerdepot.com
          </Text>
          <Text style={styles.footerRight}>
            {state.quoteId || "Draft quote"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
