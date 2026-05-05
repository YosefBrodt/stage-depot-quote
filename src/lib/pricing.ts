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
  contents?: string[];
};

export type Room = {
  id: string;
  label: string;
  price: number;
  max?: number;
  contents?: string[];
};

export type IncludedRoom = {
  label: string;
  contents: string[];
};

export type FullTier = {
  label: string;
  base: number;
  sublabel: string;
  includes: string[];
  includedRooms: IncludedRoom[];
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
      includedRooms: [
        {
          label: "Dining Room",
          contents: [
            "6-seater dining table",
            "6 dining chairs",
            "Painting or mirror",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          label: "Living Room",
          contents: [
            "2 or 3 seater sofa",
            "1 or 2 accent chairs",
            "Coffee table",
            "End table",
            "Floor lamp or floor plant",
            "Media table",
            "6x9 rug",
            "50\" TV",
            "Mirror or painting",
            "Small decor",
          ],
        },
        {
          label: "Kitchen",
          contents: [
            "4-seater dining table",
            "4 island stools",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          label: "Entrance & Hallway",
          contents: [
            "Console table or bench",
            "Mirror or painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          label: "Master Bedroom",
          contents: [
            "Queen bed + mattress + linen",
            "2 nightstands",
            "Bench",
            "6x9 rug",
            "2 table lamps",
            "Floor plant",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          label: "Powder + Master Bathroom",
          contents: [
            "Bath towels",
            "Hand towels",
            "Painting or mirror",
            "Small decor",
          ],
        },
      ],
      addons: [
        {
          id: "bedroom",
          label: "Additional bedroom",
          price: 899,
          multi: true,
          max: 6,
          contents: [
            "Queen bed + mattress + linen",
            "2 nightstands",
            "2 table lamps",
            "6x9 rug",
            "Bench",
            "Floor plant",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          id: "livingroom",
          label: "Additional living room",
          price: 1099,
          multi: true,
          max: 3,
          contents: [
            "Sofa or sectional",
            "Accent chair(s)",
            "Coffee table",
            "End tables",
            "Media table",
            "Floor lamp",
            "Floor plant",
            "Rug",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          id: "office",
          label: "Office",
          price: 599,
          multi: true,
          max: 3,
          contents: [
            "Desk",
            "Office chair",
            "1 or 2 accent chairs",
            "End table",
            "Rug 6x9 or smaller",
            "Floor plant or floor lamp",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          id: "gym",
          label: "Gym",
          price: 999,
          multi: false,
          contents: [
            "Gym mat or rug",
            "Decor + mirror styling",
            "Plant + accents",
            "(Equipment by client)",
          ],
        },
        {
          id: "bathroom",
          label: "Additional bathroom",
          price: 199,
          multi: true,
          max: 6,
          contents: [
            "Bath towels",
            "Hand towels",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          id: "kitchen-upgrade",
          label: "Upgraded kitchen",
          price: 299,
          multi: false,
          contents: [
            "Premium counter accessories",
            "Tablescape upgrade (vases, stems, bowl)",
            "Display-grade cookware styling",
          ],
        },
        {
          id: "playroom",
          label: "Basement playroom",
          price: 1099,
          multi: false,
          contents: [
            "Loveseat or accent seating",
            "Coffee or activity table",
            "Media table",
            "Rug",
            "Floor lamp",
            "Wall art + decor",
            "Plant",
          ],
        },
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
      includedRooms: [
        {
          label: "Dining Room",
          contents: [
            "8 to 12 seater dining table",
            "8 to 12 dining chairs",
            "Buffet",
            "Mirror",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          label: "Living Room",
          contents: [
            "3-seater sofa",
            "2 accent chairs",
            "Coffee table",
            "2 end tables",
            "Media table",
            "Floor lamp",
            "Floor plant",
            "7x11 rug",
            "Mirror + painting",
            "Small decor",
          ],
        },
        {
          label: "Kitchen",
          contents: [
            "4 to 6 seater dining table",
            "4 to 6 dining chairs",
            "8 to 10 island stools",
            "Mirror",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          label: "Entrance & Hallway",
          contents: [
            "Console or round table",
            "2 ottomans or bench",
            "End table",
            "Mirror",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          label: "Master Bedroom",
          contents: [
            "King bed + mattress + premium linen",
            "2 nightstands",
            "2 table lamps",
            "7x11+ rug",
            "Painting",
            "Mirror",
            "Floor plant",
            "Accent chair or loveseat",
            "End table",
            "Small decor",
          ],
        },
        {
          label: "Powder + Master Bathroom",
          contents: [
            "Bath towels",
            "Hand towels",
            "Makeup station",
            "Ottoman or chair",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
      ],
      addons: [
        {
          id: "bedroom",
          label: "Additional bedroom",
          price: 1129,
          multi: true,
          max: 6,
          contents: [
            "Queen bed + mattress + linen",
            "2 nightstands",
            "2 table lamps",
            "6x9 rug",
            "Bench",
            "Dresser or chest",
            "Mirror",
            "Floor plant",
            "Painting",
            "Small decor",
          ],
        },
        {
          id: "livingroom",
          label: "Additional living room",
          price: 1379,
          multi: true,
          max: 3,
          contents: [
            "5 to 7 piece sectional",
            "1 or 2 accent chairs",
            "Coffee table",
            "2 end tables",
            "Media table",
            '50"+ TV',
            "Floor plant",
            "Painting",
            "7x11 rug",
          ],
        },
        {
          id: "office",
          label: "Office",
          price: 749,
          multi: true,
          max: 3,
          contents: [
            "Desk",
            "Office chair",
            "1 or 2 accent chairs",
            "End table",
            "Loveseat (optional)",
            "Console or sideboard",
            "Floor lamp",
            "Mirror + painting",
            "Plant",
            "Rug",
            "Small decor",
          ],
        },
        {
          id: "gym",
          label: "Gym",
          price: 1249,
          multi: false,
          contents: [
            "Premium gym mat or rug",
            "Statement mirror",
            "Plant + decor styling",
            "(Equipment by client)",
          ],
        },
        {
          id: "bathroom",
          label: "Additional bathroom",
          price: 249,
          multi: true,
          max: 6,
          contents: [
            "Bath towels",
            "Hand towels",
            "Makeup station",
            "Ottoman or chair",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          id: "playroom",
          label: "Basement playroom",
          price: 1379,
          multi: false,
          contents: [
            "Sectional or loveseat",
            "Activity / coffee table",
            "Media table + TV",
            "Rug",
            "Floor lamp",
            "Wall art + decor",
            "Plant",
          ],
        },
      ],
    },
  },
  single: {
    standard: {
      label: "Standard rooms",
      sublabel: "Individual room staging, delivery included",
      rooms: [
        {
          id: "bedroom",
          label: "Bedroom",
          price: 1299,
          max: 6,
          contents: [
            "Queen bed + mattress + linen",
            "2 nightstands",
            "2 table lamps",
            "6x9 rug",
            "Bench",
            "Floor plant",
            "Painting or mirror",
            "Small decor",
          ],
        },
        {
          id: "livingroom",
          label: "Living Room",
          price: 1599,
          max: 3,
          contents: [
            "2 or 3 seater sofa",
            "1 or 2 accent chairs",
            "Coffee table",
            "End table",
            "Floor lamp or floor plant",
            "Media table",
            "6x9 rug",
            "50\" TV",
            "Mirror or painting",
            "Small decor",
          ],
        },
        {
          id: "diningroom",
          label: "Dining Room",
          price: 1599,
          max: 2,
          contents: [
            "6-seater dining table",
            "6 dining chairs",
            "Painting or mirror",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          id: "kitchen",
          label: "Kitchen",
          price: 1299,
          max: 2,
          contents: [
            "4-seater dining table",
            "4 island stools",
            "Painting or mirror",
            "Small decor",
          ],
        },
      ],
    },
    signature: {
      label: "Signature rooms",
      sublabel: "For larger homes, includes 25% premium",
      rooms: [
        {
          id: "bedroom",
          label: "Bedroom",
          price: 1629,
          max: 6,
          contents: [
            "Queen bed + mattress + premium linen",
            "2 nightstands",
            "2 table lamps",
            "6x9 rug",
            "Bench",
            "Dresser or chest",
            "Mirror",
            "Floor plant",
            "Painting",
            "Small decor",
          ],
        },
        {
          id: "livingroom",
          label: "Living Room",
          price: 1999,
          max: 3,
          contents: [
            "5 to 7 piece sectional",
            "1 or 2 accent chairs",
            "Coffee table",
            "2 end tables",
            "Media table",
            '50"+ TV',
            "Floor plant",
            "Painting",
            "7x11 rug",
          ],
        },
        {
          id: "diningroom",
          label: "Dining Room",
          price: 1629,
          max: 2,
          contents: [
            "8 to 12 seater dining table",
            "8 to 12 dining chairs",
            "Buffet",
            "Mirror",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
        {
          id: "kitchen",
          label: "Kitchen",
          price: 1629,
          max: 2,
          contents: [
            "4 to 6 seater dining table",
            "4 to 6 dining chairs",
            "8 to 10 island stools",
            "Mirror",
            "Painting",
            "Floor plant",
            "Small decor",
          ],
        },
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
            "Queen/King bed + mattress",
            "Nightstand + table lamp",
            "Full set of linen",
            "2-seater sofa or loveseat",
            "Accent chair",
            "Coffee table",
            "End table",
            "Floor lamp or 2 table lamps",
            "Rug",
            "Dining table + 2 chairs",
            "Basic kitchenware (pans, dishes, cutlery)",
            "Branded coffee machine + mugs",
            "Hand + bath towels",
            "1 bathrobe",
          ],
        },
        {
          id: "1br",
          label: "1 Bedroom",
          price: 499,
          contents: [
            "Queen/King bed + mattress",
            "2 nightstands",
            "2 table lamps",
            "2 full sets of linen",
            "2-seater sofa",
            "Accent chair",
            "Coffee table",
            "2 end tables",
            "Floor lamp or 2 table lamps",
            "Rug",
            "Dining table + 4 chairs",
            "Basic kitchenware (pans, dishes, cutlery)",
            "Branded coffee machine + mugs",
            "Hand + bath towels",
            "2 bathrobes",
          ],
        },
        {
          id: "2br",
          label: "2 Bedroom",
          price: 699,
          contents: [
            "2 Queen/King beds + mattresses",
            "Nightstands + table lamps for each room",
            "Full sets of linen for each bed",
            "2-seater sofa",
            "Accent chair",
            "Coffee table",
            "2 end tables",
            "Floor lamp or 2 table lamps",
            "Rug",
            "Dining table + 4 chairs",
            "Basic kitchenware (pans, dishes, cutlery)",
            "Branded coffee machine + mugs",
            "Hand + bath towels",
            "2 bathrobes",
          ],
        },
        {
          id: "3br",
          label: "3 Bedroom",
          price: 899,
          contents: [
            "3 Queen/King beds + mattresses",
            "Nightstands + table lamps for each room",
            "Full sets of linen for each bed",
            "3-seater sofa",
            "Accent chair",
            "Coffee table",
            "2 end tables",
            "Floor lamp or 2 table lamps",
            "Rug",
            "Dining table + 6 chairs",
            "Basic kitchenware (pans, dishes, cutlery)",
            "Branded coffee machine + mugs",
            "Hand + bath towels",
            "2 bathrobes",
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

export type IncludedDetail = {
  label: string;
  qty?: number;
  contents: string[];
};

// Same idea as buildIncluded() but returns structured per-room detail with the
// piece-level contents, used by the PDF's "What's included" section so the
// client sees what they're actually getting in each room.
export function buildIncludedDetailed(state: QuoteState): IncludedDetail[] {
  const out: IncludedDetail[] = [];

  if (state.mode === "full") {
    const tier = state.tier === "signature" ? "signature" : "basic";
    const cfg = PRICING.full[tier];
    cfg.includedRooms.forEach((r) => {
      out.push({ label: r.label, contents: r.contents });
    });
    cfg.addons.forEach((a) => {
      const q = state.qty[qtyKey("full", tier, a.id)] || 0;
      if (q > 0 && a.contents) {
        out.push({
          label: q > 1 ? `${a.label} × ${q}` : a.label,
          qty: q,
          contents: a.contents,
        });
      }
    });
    return out;
  }

  if (state.mode === "single") {
    const tier = state.tier === "signature" ? "signature" : "standard";
    const cfg = PRICING.single[tier];
    cfg.rooms.forEach((r) => {
      const q = state.qty[qtyKey("single", tier, r.id)] || 0;
      if (q > 0 && r.contents) {
        out.push({
          label: q > 1 ? `${r.label} × ${q}` : r.label,
          qty: q,
          contents: r.contents,
        });
      }
    });
    return out;
  }

  // decoden
  const cfg = PRICING.decoden.monthly;
  cfg.units.forEach((u) => {
    const q = state.qty[qtyKey("decoden", "monthly", u.id)] || 0;
    if (q > 0) {
      out.push({
        label: q > 1 ? `${u.label} × ${q}` : u.label,
        qty: q,
        contents: u.contents,
      });
    }
  });
  return out;
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
