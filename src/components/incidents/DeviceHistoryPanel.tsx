"use client";
import { useState } from "react";
import { History, AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/utils";
import api from "@/lib/api-client";
import { INCIDENT_ENDPOINTS } from "@/constants";
import type { Incident } from "@/types";

interface DeviceHistoryProps {
  deviceHash: string;
}

interface DeviceHistory {
  device_hash:   string;
  total_reports: number;
  first_seen:    string | null;
  last_seen:     string | null;
  incidents:     Incident[];
}

export function DeviceHistoryPanel({ deviceHash }: DeviceHistoryProps) {
  const [history,  setHistory]  = useState<DeviceHistory | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function loadHistory() {
    if (history) {
      setExpanded((v) => !v);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get<DeviceHistory>(
        INCIDENT_ENDPOINTS.DEVICE_HISTORY(deviceHash)
      );
      setHistory(data);
      setExpanded(true);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History size={15} className="text-emerald-mid" />
          <p className="text-[13.5px] font-semibold text-gray-800">Device History</p>
        </div>
        <button
          onClick={loadHistory}
          className="text-[12px] text-emerald-mid font-medium hover:underline flex items-center gap-1"
        >
          {loading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <ChevronDown
              size={12}
              className={cn("transition-transform", expanded && "rotate-180")}
            />
          )}
          {loading ? "Loading…" : expanded ? "Hide" : "View history"}
        </button>
      </div>

      {/* Masked device hash */}
      <div className="bg-surface-secondary rounded-lg px-3 py-2 mb-3">
        <p className="text-[10.5px] text-gray-400 mb-0.5">Anonymous Device ID</p>
        <p className="text-[12px] font-mono text-gray-600 break-all">
          {deviceHash.slice(0, 8)}••••••••{deviceHash.slice(-4)}
        </p>
      </div>

      {expanded && history && (
        <div className="space-y-3 animate-fade-up">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-surface-secondary rounded-lg p-2.5 text-center">
              <p className="text-[20px] font-bold text-gray-900">
                {history.total_reports}
              </p>
              <p className="text-[11px] text-gray-400">Total reports</p>
            </div>
            <div className="bg-surface-secondary rounded-lg p-2.5 text-center">
              <p className="text-[11px] text-gray-400 mb-0.5">First seen</p>
              <p className="text-[12px] font-medium text-gray-700">
                {history.first_seen
                  ? new Date(history.first_seen).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {/* Pattern warning */}
          {history.total_reports > 1 && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <AlertTriangle size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-orange-700">
                This device has reported{" "}
                <strong>{history.total_reports} times</strong>. May indicate
                a recurring situation requiring follow-up.
              </p>
            </div>
          )}

          {/* Previous incidents */}
          {history.incidents.length > 0 && (
            <div>
              <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Previous reports
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {history.incidents.slice(0, 5).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => (window.location.href = `/incidents/${inc.id}`)}
                    className="w-full flex items-center justify-between py-2 px-3 bg-surface-secondary rounded-lg text-[12px] hover:bg-emerald-pale transition-colors"
                  >
                    <span className="font-medium text-gray-700">
                      {inc.incident_type}
                    </span>
                    <span className="text-gray-400">{inc.incident_date}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
