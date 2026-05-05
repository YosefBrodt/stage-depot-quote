// Pricing constants + calculation functions ported 1:1 from legacy-index.html.
// Do not change values here without sign-off; clients are quoted from this.

// Returns YYYY-MM-DD in the local timezone, never in UTC.
// new Date().toISOString() returns UTC, so at 10:56pm May 4 EDT, it ticks
// forward to May 5; this helper stays anchored to the user's wall clock.
export function localDateStr(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type Mode = "full" | "single" | "decoden";
export type Tier = "basic" | "signature" | "standard" | "monthly";

export type Addon = {
  id: string;
  label: string;
  price: number;
  multi?: boolean;
  max?: number;
};

export type Room = {
  id: string;
  label: string;
  price: number;
  max?: number;
};

export type FullTier = {
  label: string;
  base: number;
  sublabel: string;
  includes: string[];
  addons: Addon[];
};

export type SingleTier = {
  label: string;
  sublabel: string;
  rooms: Room[];
};

export type DecoDenUnit = {
  id: string;
  label: string;
  price: number;
  contents: string[];
};

export type DecoDenTier = {
  label: string;
  sublabel: string;
  units: DecoDenUnit[];
};

export const PRICING: {
  full: { basic: FullTier; signature: FullTier };
  single: { standard: SingleTier; signature: SingleTier };
  decoden: { monthly: DecoDenTier };
} = {
  full: {
    basic: {
      label: "Basic Package",
      base: 4599,
      sublabel: "Standard condo / smaller home",
      includes: [
        "Dining Room",
        "Living Room",
        "Kitchen, 4-seater table + 4 island stools",
        "Entrance & Hallway",
        "Master Bedroom",
        "2 Bathrooms (powder + master)",
      ],
      addons: [
        { id: "bedroom", label: "Additional bedroom", price: 899, multi: true, max: 6 },
        { id: "livingroom", label: "Additional living room", price: 1099, multi: true, max: 3 },
        { id: "office", label: "Office", price: 599, multi: true, max: 3 },
        { id: "gym", label: "Gym", price: 999, multi: false },
        { id: "bathroom", label: "Additional bathroom", price: 199, multi: true, max: 6 },
        { id: "kitchen-upgrade", label: "Upgraded kitchen", price: 299, multi: false },
        { id: "playroom", label: "Basement playroom", price: 1099, multi: false },
      ],
    },
    signature: {
      label: "Signature Package",
      base: 5749,
      sublabel: "Larger home, includes 25% premium for upgraded furniture",
      includes: [
        "Dining Room",
        "Living Room",
        "Kitchen, 4-seater table + 4 island stools",
        "Entrance & Hallway",
        "Master Bedroom",
        "2 Bathrooms (powder + master)",
      ],
      addons: [
        { id: "bedroom", label: "Additional bedroom", price: 1129, multi: true, max: 6 },
        { id: "livingroom", label: "Additional living room", price: 1379, multi: true, max: 3 },
        { id: "office", label: "Office", price: 749, multi: true, max: 3 },
        { id: "gym", label: "Gym", price: 1249, multi: false },
        { id: "bathroom", label: "Additional bathroom", price: 249, multi: true, max: 6 },
        { id: "playroom", label: "Basement playroom", price: 1379, multi: false },
      ],
    },
  },
  single: {
    standard: {
      label: "Standard rooms",
      sublabel: "Individual room staging, delivery included",
      rooms: [
        { id: "bedroom", label: "Bedroom", price: 1299, max: 6 },
        { id: "livingroom", label: "Living Room", price: 1599, max: 3 },
        { id: "diningroom", label: "Dining Room", price: 1599, max: 2 },
        { id: "kitchen", label: "Kitchen", price: 1299, max: 2 },
      ],
    },
    signature: {
      label: "Signature rooms",
      sublabel: "For larger homes, includes 25% premium",
      rooms: [
        { id: "bedroom", label: "Bedroom", price: 1629, max: 6 },
        { id: "livingroom", label: "Living Room", price: 1999, max: 3 },
        { id: "diningroom", label: "Dining Room", price: 1629, max: 2 },
        { id: "kitchen", label: "Kitchen", price: 1629, max: 2 },
      ],
    },
  },
  decoden: {
    monthly: {
      label: "DecoDen monthly rental",
      sublabel:
        "Long-term furnished apartment package, billed monthly. No 8-week limit.",
      units: [
        {
          id: "studio",
          label: "Studio",
          price: 399,
          contents: [
            "Queen platform bed + mattress + linen set",
            "Nightstand + table lamp",
            "2-seater sofa or loveseat",
            "Coffee table",
            "Floor lamp",
            "Rug",
            "Dining table + 2 chairs",
            "Basic kitchenware",
            "Branded coffee machine",
            "Bath towels + hand towels",
            "1 bathrobe",
          ],
        },
        {
          id: "1br",
          label: "1 Bedroom",
          price: 499,
          contents: [
            "Queen or King bed + mattress + linen set",
            "2 nightstands + 2 table lamps",
            "2-seater sofa, accent chair",
            "Coffee table + 2 end tables",
            "Floor lamp + table lamps",
            "Rug",
            "Dining table + 4 chairs",
            "Basic kitchenware",
            "Branded coffee machine",
            "Hand + bath towels",
            "2 bathrobes",
          ],
        },
        {
          id: "2br",
          label: "2 Bedroom",
          price: 699,
          contents: [
            "2 Queen beds + mattresses + linen sets",
            "4 nightstands + 4 table lamps",
            "3-seater sofa, accent chair",
            "Coffee table + 2 end tables",
            "Media table",
            "Floor lamp + table lamps",
            "Rugs (living + bedrooms)",
            "Dining table + 4 to 6 chairs",
            "Basic kitchenware",
            "Branded coffee machine",
            "Hand + bath towels",
            "2 bathrobes",
          ],
        },
        {
          id: "3br",
          label: "3 Bedroom",
          price: 899,
          contents: [
            "3 beds (mix of Queen + King) + mattresses + linen sets",
            "6 nightstands + 6 table lamps",
            "3-seater sofa, 2 accent chairs",
            "Coffee table + 2 end tables",
            "Media table",
            "Floor lamp + table lamps",
            "Rugs (living + bedrooms)",
            "Dining table + 6 chairs",
            "Basic kitchenware",
            "Branded coffee machine",
            "Hand + bath towels",
            "Bathrobes",
          ],
        },
      ],
    },
  },
};

export type Client = {
  name: string;
  address: string;
  email: string;
  phone: string;
  date: string;
  installDate: string;
};

export type Discount = {
  type: "none" | "amount" | "percent";
  value: number;
  reason: string;
};

export type Tax = { enabled: boolean; rate: number; label?: string };

export type Deposit = { percent: number; terms: string };

export type CustomLine = { label: string; price: number };

export type QuoteState = {
  quoteId: string | null;
  status: "draft" | "saved";
  mode: Mode;
  tier: Tier;
  qty: Record<string, number>;
  custom: CustomLine[];
  client: Client;
  discount: Discount;
  tax: Tax;
  deposit: Deposit;
  extMonths: number;
  notes: string;
  createdAt: number;
  updatedAt: number;
};

export const defaultState = (): QuoteState => ({
  quoteId: null,
  status: "draft",
  mode: "full",
  tier: "basic",
  qty: {},
  custom: [],
  client: {
    name: "",
    address: "",
    email: "",
    phone: "",
    date: localDateStr(),
    installDate: "",
  },
  discount: { type: "none", value: 0, reason: "" },
  tax: { enabled: false, rate: 13, label: "HST/GST" },
  deposit: {
    percent: 50,
    terms: "50% deposit on signing. Balance due on install day.",
  },
  extMonths: 0,
  notes: "",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export function qtyKey(mode: Mode, tier: Tier, id: string): string {
  return `${mode}.${tier}.${id}`;
}

export type QuoteLine = {
  desc: string;
  qty: number;
  unit: number;
  amt: number;
  custom?: boolean;
};

export type Totals = {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  net: number;
  tax: number;
  total: number;
  deposit: number;
  balance: number;
};

export function buildLines(state: QuoteState): QuoteLine[] {
  const lines: QuoteLine[] = [];
  if (state.mode === "full") {
    const tier = state.tier === "signature" ? "signature" : "basic";
    const cfg = PRICING.full[tier];
    lines.push({ desc: cfg.label, qty: 1, unit: cfg.base, amt: cfg.base });
    cfg.addons.forEach((a) => {
      const q = state.qty[qtyKey("full", tier, a.id)] || 0;
      if (q > 0) lines.push({ desc: a.label, qty: q, unit: a.price, amt: q * a.price });
    });
  } else if (state.mode === "single") {
    const tier = state.tier === "signature" ? "signature" : "standard";
    const cfg = PRICING.single[tier];
    cfg.rooms.forEach((r) => {
      const q = state.qty[qtyKey("single", tier, r.id)] || 0;
      if (q > 0) lines.push({ desc: r.label, qty: q, unit: r.price, amt: q * r.price });
    });
  } else if (state.mode === "decoden") {
    const cfg = PRICING.decoden.monthly;
    cfg.units.forEach((u) => {
      const q = state.qty[qtyKey("decoden", "monthly", u.id)] || 0;
      if (q > 0)
        lines.push({
          desc: `${u.label} (DecoDen monthly)`,
          qty: q,
          unit: u.price,
          amt: q * u.price,
        });
    });
  }
  state.custom.forEach((c) =>
    lines.push({ desc: c.label, qty: 1, unit: c.price, amt: c.price, custom: true })
  );
  return lines;
}

export function buildIncluded(state: QuoteState): string[] {
  if (state.mode === "full") {
    const tier = state.tier === "signature" ? "signature" : "basic";
    const cfg = PRICING.full[tier];
    const items = [...cfg.includes];
    cfg.addons.forEach((a) => {
      const q = state.qty[qtyKey("full", tier, a.id)] || 0;
      if (q > 0) items.push(`${a.label}${q > 1 ? ` × ${q}` : ""}`);
    });
    return items;
  }
  if (state.mode === "single") {
    const tier = state.tier === "signature" ? "signature" : "standard";
    const cfg = PRICING.single[tier];
    const items: string[] = [];
    cfg.rooms.forEach((r) => {
      const q = state.qty[qtyKey("single", tier, r.id)] || 0;
      if (q > 0) items.push(`${r.label}${q > 1 ? ` × ${q}` : ""}`);
    });
    return items;
  }
  // decoden: surface the contents of whichever unit was picked
  const cfg = PRICING.decoden.monthly;
  const items: string[] = [];
  cfg.units.forEach((u) => {
    const q = state.qty[qtyKey("decoden", "monthly", u.id)] || 0;
    if (q > 0) items.push(...u.contents);
  });
  return items;
}

export function isDecoden(state: QuoteState): boolean {
  return state.mode === "decoden";
}

export function calcTotals(state: QuoteState): Totals {
  const lines = buildLines(state);
  const subtotal = lines.reduce((s, l) => s + l.amt, 0);
  let discount = 0;
  if (state.discount.type === "amount")
    discount = Math.min(state.discount.value || 0, subtotal);
  else if (state.discount.type === "percent")
    discount = subtotal * ((state.discount.value || 0) / 100);
  const net = subtotal - discount;
  const tax = state.tax.enabled ? net * ((state.tax.rate || 0) / 100) : 0;
  const total = net + tax;
  const deposit = total * ((state.deposit.percent || 0) / 100);
  const balance = total - deposit;
  return { lines, subtotal, discount, net, tax, total, deposit, balance };
}

export function nextQuoteId(year: number, counter: number): string {
  return `SD-${year}-${String(counter).padStart(4, "0")}`;
}
