"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type AddressPick = {
  fullAddress: string;
  province?: string;
  city?: string;
  postalCode?: string;
};

type GeoapifyFeature = {
  properties: {
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    street?: string;
    city?: string;
    state?: string;
    state_code?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
    place_id?: string;
  };
};

type Suggestion = {
  key: string;
  primary: string;
  secondary: string;
  pick: AddressPick;
};

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

function parseFeature(f: GeoapifyFeature, idx: number): Suggestion {
  const p = f.properties || {};
  const province = (p.state_code || "").toUpperCase();
  const primary =
    p.address_line1 ||
    [p.housenumber, p.street].filter(Boolean).join(" ") ||
    p.formatted ||
    "Unknown";
  const secondary =
    p.address_line2 ||
    [p.city, p.state, p.postcode].filter(Boolean).join(", ");
  const fullAddress = (p.formatted || `${primary}${secondary ? ", " + secondary : ""}`)
    .replace(/, Canada$/, "")
    .trim();
  return {
    key: p.place_id || `${idx}-${fullAddress}`,
    primary,
    secondary,
    pick: {
      fullAddress,
      province: province || undefined,
      city: p.city,
      postalCode: p.postcode,
    },
  };
}

// Bias autocomplete toward downtown Montreal so QC results surface first
// while still allowing the rest of Canada (e.g. Toronto, Vancouver) to come
// through if the user types something specific to those regions.
const MONTREAL_LAT = 45.5019;
const MONTREAL_LON = -73.5674;

async function searchGeoapify(
  query: string,
  signal: AbortSignal
): Promise<Suggestion[]> {
  if (!GEOAPIFY_KEY) return [];
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", query);
  url.searchParams.set("filter", "countrycode:ca");
  url.searchParams.set(
    "bias",
    `proximity:${MONTREAL_LON},${MONTREAL_LAT}`
  );
  url.searchParams.set("limit", "5");
  url.searchParams.set("format", "geojson");
  url.searchParams.set("apiKey", GEOAPIFY_KEY);
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return [];
  const data: { features: GeoapifyFeature[] } = await res.json();
  return (data.features || []).map((f, i) => parseFeature(f, i));
}

function fallbackSearch(
  query: string,
  pastAddresses: string[]
): Suggestion[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const addr of pastAddresses) {
    if (!addr) continue;
    const key = addr.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (key.includes(q)) {
      out.push({
        key: addr,
        primary: addr,
        secondary: "From past quote",
        pick: { fullAddress: addr },
      });
    }
    if (out.length >= 5) break;
  }
  return out;
}

export function AddressAutocomplete(props: {
  value: string;
  onChange: (v: string) => void;
  onPick: (pick: AddressPick) => void;
  pastAddresses?: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const past = useMemo(() => props.pastAddresses || [], [props.pastAddresses]);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setLoading(true);
      try {
        if (GEOAPIFY_KEY) {
          const results = await searchGeoapify(q, ctrl.signal);
          if (!ctrl.signal.aborted) setSuggestions(results);
        } else {
          setSuggestions(fallbackSearch(q, past));
        }
      } catch {
        if (!ctrl.signal.aborted) setSuggestions(fallbackSearch(q, past));
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    },
    [past]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!props.value || props.value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(props.value), 220);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [props.value, runSearch]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pick(s: Suggestion) {
    props.onPick(s.pick);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        ref={inputRef}
        className="field"
        type="text"
        placeholder={props.placeholder || "Start typing an address..."}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        onFocus={() => {
          setOpen(true);
          if (props.value.trim().length >= 2) runSearch(props.value);
        }}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && (suggestions.length > 0 || loading) ? (
        <div className="absolute left-0 right-0 mt-1 z-30 bg-white border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-auto">
          {loading && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted">Searching...</div>
          ) : null}
          {suggestions.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              className={`w-full text-left px-3 py-2.5 border-b border-line last:border-0 transition-colors ${
                i === activeIdx ? "bg-cream-soft" : "hover:bg-[#FBFAF6]"
              }`}
            >
              <div className="text-sm font-medium text-ink leading-tight">
                {s.primary}
              </div>
              {s.secondary ? (
                <div className="text-xs text-muted mt-0.5">{s.secondary}</div>
              ) : null}
            </button>
          ))}
          {!GEOAPIFY_KEY && suggestions.length === 0 && !loading ? (
            <div className="px-3 py-2 text-xs text-muted italic">
              No matches in past quotes. Set NEXT_PUBLIC_GEOAPIFY_KEY for full
              address search.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const HAS_GEOAPIFY = !!GEOAPIFY_KEY;

export function provinceTaxRate(
  province: string | undefined
): { rate: number; label: string } | null {
  if (!province) return null;
  const p = province.toUpperCase();
  switch (p) {
    case "QC":
      return { rate: 14.975, label: "GST + QST" };
    case "ON":
      return { rate: 13, label: "HST" };
    case "NB":
    case "NL":
    case "NS":
    case "PE":
      return { rate: 15, label: "HST" };
    case "BC":
      return { rate: 12, label: "GST + PST" };
    case "MB":
      return { rate: 12, label: "GST + PST" };
    case "SK":
      return { rate: 11, label: "GST + PST" };
    case "AB":
    case "NT":
    case "NU":
    case "YT":
      return { rate: 5, label: "GST" };
    default:
      return null;
  }
}
