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
  ink: "#1c1917",
  paper: "#ffffff",
  accent: "#8a5a2b",
  line: "#e7e1d6",
  muted: "#78716c",
  softBg: "#faf7f1",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.ink,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 18,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    borderBottomStyle: "solid",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.accent,
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  logoLetter: {
    color: "#fff",
    fontFamily: "Times-Bold",
    fontSize: 20,
  },
  brandName: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    lineHeight: 1,
  },
  brandKicker: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  metaRight: {
    textAlign: "right",
    fontSize: 10,
  },
  metaId: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },
  metaDate: {
    color: COLORS.muted,
    marginTop: 4,
    fontSize: 10,
  },
  twoCol: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 26,
  },
  col: { flex: 1 },
  eyebrow: {
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 4,
    fontFamily: "Helvetica",
  },
  preparedName: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  preparedSub: { fontSize: 10, color: "#57534e", marginTop: 2 },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.ink,
    borderBottomStyle: "solid",
    marginBottom: 4,
  },
  thDesc: {
    flex: 1,
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  thAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 8,
    color: COLORS.muted,
    textTransform: "uppercase",
    letterSpacing: 1.4,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
    borderBottomStyle: "solid",
  },
  rowDesc: { flex: 1 },
  rowDescText: { fontSize: 11 },
  rowDescQty: { fontSize: 9, color: COLORS.muted, marginTop: 2 },
  rowAmt: {
    width: 80,
    textAlign: "right",
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  totalsBlock: { marginTop: 12 },
  totalsRow: {
    flexDirection: "row",
    paddingVertical: 3,
  },
  totalsLabel: { flex: 1, fontSize: 10 },
  totalsAmt: { width: 80, textAlign: "right", fontSize: 10 },
  totalsMutedLabel: { flex: 1, fontSize: 10, color: COLORS.muted },
  totalsAccent: { color: COLORS.accent },
  grandRow: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: COLORS.ink,
    borderTopStyle: "solid",
  },
  grandLabel: {
    flex: 1,
    fontFamily: "Times-Bold",
    fontSize: 18,
  },
  grandAmt: {
    width: 100,
    textAlign: "right",
    fontFamily: "Times-Bold",
    fontSize: 20,
    color: COLORS.accent,
  },
  depositCard: {
    marginTop: 14,
    padding: 12,
    backgroundColor: COLORS.softBg,
    borderRadius: 4,
  },
  depositRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 10,
  },
  depositRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
  },
  depositAmt: { fontFamily: "Helvetica-Bold" },
  section: {
    marginTop: 24,
    paddingTop: 16,
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
    paddingVertical: 2,
    paddingRight: 8,
  },
  termsText: {
    fontSize: 10,
    color: "#57534e",
    lineHeight: 1.5,
  },
  footer: {
    marginTop: 28,
    textAlign: "center",
    fontSize: 8,
    color: "#a8a29e",
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
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>S</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Stager Depot</Text>
              <Text style={styles.brandKicker}>Home Staging Quote</Text>
            </View>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaId}>{state.quoteId || "DRAFT"}</Text>
            {dateStr ? <Text style={styles.metaDate}>{dateStr}</Text> : null}
          </View>
        </View>

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
              <Text style={[styles.totalsAmt, styles.totalsAccent]}>
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
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>Total</Text>
            <Text style={styles.grandAmt}>{fmt(t.total)}</Text>
          </View>
        </View>

        {state.deposit.percent > 0 && t.total > 0 ? (
          <View style={styles.depositCard}>
            <View style={styles.depositRow}>
              <Text>
                Deposit due on signing ({state.deposit.percent}%)
              </Text>
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

        <View style={[styles.section, { marginTop: 16, paddingTop: 12 }]}>
          <Text style={styles.eyebrow}>Extension policy</Text>
          <Text style={styles.termsText}>
            Initial contract is 8 weeks. After that, the first month extension is
            60% off the original contract. Each subsequent month is 65% off the
            original contract.
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          Stager Depot · {state.quoteId || "Draft quote"}
        </Text>
      </Page>
    </Document>
  );
}
