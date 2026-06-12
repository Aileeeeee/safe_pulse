"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/utils";
import api from "@/lib/api-client";
import { AUTH_ENDPOINTS } from "@/constants";

interface Suggestion {
  username:  string;
  available: boolean;
}

interface UsernameInputProps {
  firstName:   string;
  lastName:    string;
  value:       string;
  onChange:    (val: string) => void;
  error?:      string;
}

export function UsernameInput({
  firstName,
  lastName,
  value,
  onChange,
  error,
}: UsernameInputProps) {
  const [suggestions,  setSuggestions]  = useState<Suggestion[]>([]);
  const [availability, setAvailability] = useState<"available" | "taken" | "checking" | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSugg,  setLoadingSugg]  = useState(false);
  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load suggestions when first + last name are available
  useEffect(() => {
    if (firstName.length < 2 || lastName.length < 2) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoadingSugg(true);
      try {
        const { data } = await api.get(AUTH_ENDPOINTS.USERNAME_SUGGESTIONS, {
          params: { first_name: firstName, last_name: lastName },
        });
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSugg(false);
      }
    }, 600);
  }, [firstName, lastName]);

  // Check availability as user types
  useEffect(() => {
    if (!value || value.length < 3) {
      setAvailability(null);
      return;
    }

    setAvailability("checking");
    if (checkRef.current) clearTimeout(checkRef.current);
    checkRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(AUTH_ENDPOINTS.USERNAME_SUGGESTIONS, {
          params: { username: value },
        });
        setAvailability(data.available ? "available" : "taken");
      } catch {
        setAvailability(null);
      }
    }, 500);
  }, [value]);

  function selectSuggestion(username: string) {
    onChange(username);
    setShowDropdown(false);
    setAvailability("available");
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s/g, ""))}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder="e.g. adaeze.okafor"
          autoComplete="username"
          className={cn(
            "w-full px-3.5 py-2.5 pr-10 border-[1.5px] rounded-[9px]",
            "text-sm outline-none transition-all font-mono",
            availability === "available"
              ? "border-emerald-mid bg-emerald-pale focus:ring-2 focus:ring-emerald-mid/10"
              : availability === "taken"
              ? "border-red-400 bg-red-50"
              : "border-gray-200 focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10",
            error && "border-red-400"
          )}
        />

        {/* Right icon — status indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {availability === "checking" && (
            <Loader2 size={15} className="text-gray-400 animate-spin" />
          )}
          {availability === "available" && (
            <CheckCircle size={15} className="text-emerald-mid" />
          )}
          {availability === "taken" && (
            <XCircle size={15} className="text-red-500" />
          )}
        </div>
      </div>

      {/* Availability message */}
      {availability === "available" && value && (
        <p className="text-[12px] text-emerald-mid mt-1 flex items-center gap-1">
          <CheckCircle size={11} /> @{value} is available
        </p>
      )}
      {availability === "taken" && value && (
        <p className="text-[12px] text-red-500 mt-1 flex items-center gap-1">
          <XCircle size={11} /> @{value} is already taken
        </p>
      )}
      {error && (
        <p className="text-[12px] text-red-500 mt-1">{error}</p>
      )}

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="mt-1.5">
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            className="flex items-center gap-1.5 text-[12px] text-emerald-mid font-medium hover:underline"
          >
            {loadingSugg ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <ChevronDown
                size={12}
                className={cn(
                  "transition-transform",
                  showDropdown && "rotate-180"
                )}
              />
            )}
            {loadingSugg
              ? "Finding available usernames…"
              : `${suggestions.length} username suggestions`}
          </button>

          {showDropdown && !loadingSugg && (
            <div className="mt-1.5 bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden z-50">
              <div className="px-4 py-2.5 bg-surface-secondary border-b border-gray-100">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                  Available usernames
                </p>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.username}
                  type="button"
                  onClick={() => selectSuggestion(s.username)}
                  className={cn(
                    "w-full flex items-center justify-between",
                    "px-4 py-2.5 hover:bg-emerald-pale transition-colors",
                    "border-b border-gray-50 last:border-0 text-left",
                    value === s.username && "bg-emerald-pale"
                  )}
                >
                  <span className="text-[13.5px] font-mono font-medium text-gray-800">
                    @{s.username}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-mid font-medium">
                    <CheckCircle size={11} /> Available
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
