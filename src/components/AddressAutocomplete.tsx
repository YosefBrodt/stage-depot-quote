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

type MapboxFeature = {
  place_name: string;
  text: string;
  address?: string;
  context?: Array<{ id: string; text: string; short_code?: string }>;
};

type Suggestion = {
  key: string;
  primary: string;
  secondary: string;
  pick: AddressPick;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function parseFeature(f: MapboxFeature): Suggestion {
  const provinceCtx = f.context?.find((c) => c.id.startsWith("region"));
  const cityCtx = f.context?.find((c) => c.id.startsWith("place"));
  const postalCtx = f.context?.find((c) => c.id.startsWith("postcode"));
  const provinceShort = provinceCtx?.short_code?.replace("CA-", "");
  const houseNumber = f.address ? `${f.address} ` : "";
  const primary = `${houseNumber}${f.text}`.trim();
  const secondaryParts = [
    cityCtx?.text,
    provinceCtx?.text,
    postalCtx?.text,
  ].filter(Boolean) as string[];
  return {
    key: f.place_name,
    primary,
    secondary: secondaryParts.join(", "),
    pick: {
      fullAddress: f.place_name.replace(/, Canada$/, ""),
      province: provinceShort,
      city: cityCtx?.text,
      postalCode: postalCtx?.text,
    },
  };
}

async function searchMapbox(
  query: string,
  signal: AbortSignal
): Promise<Suggestion[]> {
  if (!MAPBOX_TOKEN) return [];
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json`
  );
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("country", "ca");
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("types", "address");
  url.searchParams.set("limit", "5");
  const res = await fetch(url.toString(), { signal });
  if (!res.ok) return [];
  const data: { features: MapboxFeature[] } = await res.json();
  return data.features.map(parseFeature);
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
        if (MAPBOX_TOKEN) {
          const results = await searchMapbox(q, ctrl.signal);
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
          {!MAPBOX_TOKEN && suggestions.length === 0 && !loading ? (
            <div className="px-3 py-2 text-xs text-muted italic">
              No matches in past quotes. Set NEXT_PUBLIC_MAPBOX_TOKEN for full
              address search.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const HAS_MAPBOX = !!MAPBOX_TOKEN;

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
