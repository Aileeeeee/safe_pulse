"use client";
import { useState, useRef, useEffect } from "react";
import { Search, Building2, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/utils";
import api from "@/lib/api-client";
import { AUTH_ENDPOINTS } from "@/constants";
import type { Organisation } from "@/types";

interface OrgSearchInputProps {
  onSelect: (org: Organisation) => void;
  error?:   string;
}

export function OrgSearchInput({ onSelect, error }: OrgSearchInputProps) {
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Organisation[]>([]);
  const [selected, setSelected] = useState<Organisation | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [open,     setOpen]     = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef     = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSearch(val: string) {
    setQuery(val);
    setSelected(null);

    if (val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Debounce — wait 300ms after user stops typing
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get<Organisation[]>(
          AUTH_ENDPOINTS.ORG_SEARCH,
          { params: { q: val } }
        );
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(org: Organisation) {
    setSelected(org);
    setQuery(org.name);
    setOpen(false);
    setResults([]);
    onSelect(org);
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Input */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Type your organisation name…"
          className={cn(
            "w-full pl-9 pr-10 py-2.5 border-[1.5px] rounded-[9px] text-sm outline-none transition-all",
            selected
              ? "border-emerald-mid bg-emerald-pale"
              : "border-gray-200 focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10",
            error && !selected && "border-red-400"
          )}
        />
        {/* Right icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading  && <Loader2 size={15} className="text-gray-400 animate-spin" />}
          {selected && <CheckCircle size={15} className="text-emerald-mid" />}
        </div>
      </div>

      {/* Selected confirmation */}
      {selected && (
        <div className="flex items-center justify-between mt-2 px-3 py-2 bg-emerald-light rounded-lg">
          <div className="flex items-center gap-2">
            <Building2 size={13} className="text-emerald-mid flex-shrink-0" />
            <div>
              <p className="text-[12.5px] font-medium text-emerald-sp">{selected.name}</p>
              <p className="text-[11px] text-gray-400">
                {selected.city}{selected.state ? `, ${selected.state}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
            }}
            className="text-[11px] text-gray-400 hover:text-danger transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-modal z-50 overflow-hidden">
          {results.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => handleSelect(org)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-pale transition-colors text-left border-b border-gray-50 last:border-0"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center flex-shrink-0">
                <Building2 size={15} className="text-emerald-mid" />
              </div>
              <div>
                <p className="text-[13.5px] font-medium text-gray-900">{org.name}</p>
                <p className="text-[12px] text-gray-400">
                  {org.city}{org.state ? `, ${org.state}` : ""}
                  {org.email ? ` · ${org.email}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-modal z-50 p-4 text-center">
          <p className="text-[13px] text-gray-500">No organisation found for <strong>{query}</strong></p>
          <p className="text-[12px] text-gray-400 mt-1">
            Contact SAFEPULSE to register your organisation first.
          </p>
        </div>
      )}

      {error && !selected && (
        <p className="text-[12px] text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}