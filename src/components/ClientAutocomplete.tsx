"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Client } from "@/lib/pricing";

export type ClientPick = Pick<
  Client,
  "name" | "address" | "email" | "phone"
>;

type Row = {
  client: ClientPick;
  lastUsed: number;
};

export function ClientAutocomplete(props: {
  value: string;
  onChange: (v: string) => void;
  onPick: (c: ClientPick) => void;
  pastClients: Row[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = props.value.trim().toLowerCase();
    if (q.length < 1) return [];
    const seen = new Set<string>();
    const out: Row[] = [];
    for (const r of props.pastClients) {
      const c = r.client;
      const key = (c.name || "").toLowerCase().trim();
      if (!key || seen.has(key)) continue;
      const haystack = [c.name, c.email, c.phone, c.address]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (haystack.includes(q)) {
        seen.add(key);
        out.push(r);
      }
      if (out.length >= 6) break;
    }
    return out;
  }, [props.value, props.pastClients]);

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

  function pick(r: Row) {
    props.onPick(r.client);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(matches[activeIdx]);
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
        placeholder={props.placeholder || "Jane Doe"}
        value={props.value}
        onChange={(e) => {
          props.onChange(e.target.value);
          setOpen(true);
          setActiveIdx(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        autoComplete="off"
      />
      {open && matches.length > 0 ? (
        <div className="absolute left-0 right-0 mt-1 z-30 bg-white border border-line rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-h-72 overflow-auto">
          {matches.map((r, i) => {
            const c = r.client;
            const sub = [c.address, c.email].filter(Boolean).join(" · ");
            return (
              <button
                key={i + (c.name || "")}
                type="button"
                onMouseEnter={() => setActiveIdx(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(r);
                }}
                className={`w-full text-left px-3 py-2.5 border-b border-line last:border-0 transition-colors ${
                  i === activeIdx ? "bg-cream-soft" : "hover:bg-[#FBFAF6]"
                }`}
              >
                <div className="text-sm font-medium text-ink leading-tight">
                  {c.name || "Unnamed"}
                </div>
                {sub ? (
                  <div className="text-xs text-muted mt-0.5 truncate">
                    {sub}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
