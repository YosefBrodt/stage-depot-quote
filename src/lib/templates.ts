import { defaultState, qtyKey, type QuoteState } from "./pricing";

export type Template = {
  id: string;
  label: string;
  description: string;
  build: () => QuoteState;
};

function withQty(
  base: QuoteState,
  mode: "full" | "single",
  tier: "basic" | "signature" | "standard",
  qtyMap: Record<string, number>
): QuoteState {
  const next: QuoteState = {
    ...base,
    mode,
    tier,
    qty: {},
  };
  for (const [id, n] of Object.entries(qtyMap)) {
    if (n > 0) next.qty[qtyKey(mode, tier, id)] = n;
  }
  return next;
}

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    label: "Blank quote",
    description: "Start from scratch",
    build: () => defaultState(),
  },
  {
    id: "studio-basic",
    label: "Studio / 1BR condo",
    description: "Single-room staging, kitchen + living",
    build: () => {
      const s = defaultState();
      return withQty(s, "single", "standard", {
        livingroom: 1,
        kitchen: 1,
      });
    },
  },
  {
    id: "2br-basic",
    label: "2BR condo (Basic)",
    description: "Full home package, +1 bedroom",
    build: () => {
      const s = defaultState();
      return withQty(s, "full", "basic", {
        bedroom: 1,
      });
    },
  },
  {
    id: "3br-basic",
    label: "3BR condo (Basic)",
    description: "Full home package, +2 bedrooms",
    build: () => {
      const s = defaultState();
      return withQty(s, "full", "basic", {
        bedroom: 2,
      });
    },
  },
  {
    id: "3br-signature",
    label: "3BR home (Signature)",
    description: "Signature tier with upgraded furniture",
    build: () => {
      const s = defaultState();
      return withQty(s, "full", "signature", {
        bedroom: 2,
      });
    },
  },
  {
    id: "4br-signature",
    label: "4BR house (Signature)",
    description: "Signature, +3 bedrooms, +1 living room",
    build: () => {
      const s = defaultState();
      return withQty(s, "full", "signature", {
        bedroom: 3,
        livingroom: 1,
      });
    },
  },
];
