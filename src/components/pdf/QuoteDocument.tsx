import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { calcTotals, buildIncluded, type QuoteState } from "@/lib/pricing";
import { fmt } from "@/lib/format";

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
  // Header band: full-width olive banner
  headerBand: {
    backgroundColor: COLORS.olive,
    color: COLORS.cream,
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  brandLeft: {},
  brandKicker: {
    fontSize: 8,
    color: "rgba(241,227,200,0.65)",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    marginBottom: 8,
    fontFamily: "Helvetica-Bold",
  },
  brandWordmark: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: COLORS.cream,
    letterSpacing: -0.4,
  },
  brandSub: {
    fontSize: 9,
    color: "rgba(241,227,200,0.7)",
    marginTop: 5,
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
    marginBottom: 5,
  },
  metaId: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: COLORS.cream,
    letterSpacing: -0.2,
  },
  metaDate: {
    color: "rgba(241,227,200,0.7)",
    marginTop: 5,
    fontSize: 9,
  },
  // Body container
  body: {
    paddingTop: 32,
    paddingHorizontal: 48,
    paddingBottom: 48,
  },
  twoCol: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 28,
    paddingBottom: 24,
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
    marginBottom: 6,
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
  rowDescText: { fontSize: 11, color: COLORS.ink },
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
    paddingVertical: 3,
  },
  totalsLabel: { flex: 1, fontSize: 10, color: COLORS.ink },
  totalsAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 10,
    color: COLORS.ink,
  },
  totalsMutedLabel: { flex: 1, fontSize: 10, color: COLORS.muted },
  // Grand total card: olive band
  grandCard: {
    marginTop: 16,
    backgroundColor: COLORS.olive,
    paddingVertical: 16,
    paddingHorizontal: 20,
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
    fontSize: 16,
    color: COLORS.cream,
    fontFamily: "Helvetica-Bold",
    marginTop: 3,
    letterSpacing: -0.2,
  },
  grandAmt: {
    flex: 1,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: COLORS.cream,
    letterSpacing: -0.4,
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
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    borderTopStyle: "solid",
  },
  includedGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  includedItem: {
    width: "50%",
    fontSize: 10,
    paddingVertical: 3,
    paddingRight: 8,
    color: COLORS.ink,
  },
  termsText: {
    fontSize: 10,
    color: "#57534e",
    lineHeight: 1.55,
  },
  // Footer band: thin olive line
  footerBand: {
    backgroundColor: COLORS.olive,
    paddingVertical: 14,
    paddingHorizontal: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 32,
  },
  footerLeft: {
    fontSize: 9,
    color: "rgba(241,227,200,0.7)",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  footerRight: {
    fontSize: 9,
    color: "rgba(241,227,200,0.7)",
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

export function QuoteDocument({ state }: { state: QuoteState }) {
  const t = calcTotals(state);
  const inc = buildIncluded(state);
  const c = state.client;
  const dateStr = formatLongDate(c.date);
  const installStr = formatLongDate(c.installDate);

  return (
    <Document title={`Stager Depot Quote ${state.quoteId || ""}`.trim()}>
      <Page size="LETTER" style={styles.page} wrap>
        <View style={styles.headerBand} fixed>
          <View style={styles.brandLeft}>
            <Text style={styles.brandKicker}>Home Staging</Text>
            <Text style={styles.brandWordmark}>Stager Depot</Text>
            <Text style={styles.brandSub}>Quote</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaIdLabel}>Quote No.</Text>
            <Text style={styles.metaId}>{state.quoteId || "DRAFT"}</Text>
            {dateStr ? <Text style={styles.metaDate}>{dateStr}</Text> : null}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>Prepared for</Text>
              <Text style={styles.preparedName}>{c.name || "—"}</Text>
              {c.address ? <Text style={styles.preparedSub}>{c.address}</Text> : null}
              {c.email ? <Text style={styles.preparedSub}>{c.email}</Text> : null}
              {c.phone ? <Text style={styles.preparedSub}>{c.phone}</Text> : null}
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>Project</Text>
              <Text style={styles.preparedSub}>Initial contract: 8 weeks</Text>
              {installStr ? (
                <Text style={styles.preparedSub}>Install: {installStr}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.sectionHeader}>Line Items</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.thDesc}>Description</Text>
            <Text style={styles.thAmt}>Amount</Text>
          </View>

          {t.lines.length === 0 ? (
            <View style={styles.row}>
              <Text style={[styles.rowDescText, { color: COLORS.muted }]}>
                No items selected.
              </Text>
            </View>
          ) : (
            t.lines.map((l, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.rowDesc}>
                  <Text style={styles.rowDescText}>
                    {l.desc}
                    {l.custom ? "  (custom)" : ""}
                  </Text>
                  {l.qty > 1 ? (
                    <Text style={styles.rowDescQty}>
                      {l.qty} × {fmt(l.unit)}
                    </Text>
                  ) : null}
                </View>
                <Text style={styles.rowAmt}>{fmt(l.amt)}</Text>
              </View>
            ))
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
                  Tax ({state.tax.rate}%)
                </Text>
                <Text style={styles.totalsAmt}>{fmt(t.tax)}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.grandCard}>
            <View>
              <Text style={styles.grandLabelEyebrow}>Total Due</Text>
              <Text style={styles.grandLabel}>Quote Total</Text>
            </View>
            <Text style={styles.grandAmt}>{fmt(t.total)}</Text>
          </View>

          {state.deposit.percent > 0 && t.total > 0 ? (
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

          {inc.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.eyebrow}>What&apos;s included</Text>
              <View style={styles.includedGrid}>
                {inc.map((item, i) => (
                  <Text key={i} style={styles.includedItem}>
                    •  {item}
                  </Text>
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.eyebrow}>Payment terms</Text>
            <Text style={styles.termsText}>{state.deposit.terms || ""}</Text>
          </View>

          <View style={[styles.section, { marginTop: 16, paddingTop: 14 }]}>
            <Text style={styles.eyebrow}>Extension policy</Text>
            <Text style={styles.termsText}>
              Initial contract is 8 weeks. After that, the first month
              extension is 60% off the original contract. Each subsequent month
              is 65% off the original contract.
            </Text>
          </View>
        </View>

        <View style={styles.footerBand} fixed>
          <Text style={styles.footerLeft}>Stager Depot</Text>
          <Text style={styles.footerRight}>
            {state.quoteId || "Draft quote"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
