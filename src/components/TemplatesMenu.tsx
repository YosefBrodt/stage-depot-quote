"use client";

import { useEffect, useRef, useState } from "react";
import { TEMPLATES, type Template } from "@/lib/templates";

export function TemplatesMenu(props: { onPick: (t: Template) => void }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      <button
        className="btn btn-on-dark rounded-r-none border-r-0 pr-2.5"
        onClick={() => props.onPick(TEMPLATES[0])}
        title="Start a blank quote"
      >
        + New
      </button>
      <button
        className="btn btn-on-dark rounded-l-none px-2"
        onClick={() => setOpen((o) => !o)}
        title="Start from a template"
        aria-label="Templates"
      >
        ▾
      </button>
      {open ? (
        <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white border border-line rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.16)] overflow-hidden">
          <div className="px-3 py-2 border-b border-line bg-[#FBFAF6]">
            <div className="text-[10px] uppercase tracking-eyebrow text-muted font-semibold">
              Quick start
            </div>
          </div>
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                props.onPick(t);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 border-b border-line last:border-0 hover:bg-cream-soft transition-colors"
            >
              <div className="text-sm font-semibold text-ink leading-tight">
                {t.label}
              </div>
              <div className="text-xs text-muted mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
