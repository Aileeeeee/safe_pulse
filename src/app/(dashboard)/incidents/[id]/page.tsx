"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock,
  MessageSquare, CheckCircle, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useIncident, useAcknowledgeIncident } from "@/hooks";
import { Skeleton } from "@/components/ui";
import { cn } from "@/utils";
import { IncidentMap } from "@/components/incidents/IncidentMap";

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  Critical: { dot: "bg-red-500",    badge: "bg-red-50 text-red-500 border-red-200",       text: "text-red-500"    },
  High:     { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-500 border-orange-200", text: "text-orange-500" },
  Medium:   { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-600 border-yellow-200", text: "text-yellow-600" },
  Low:      { dot: "bg-green-500",  badge: "bg-green-50 text-green-600 border-green-200",    text: "text-green-600"  },
};

const TIMELINE_DOT: Record<string, string> = {
  green:  "bg-emerald-mid",
  orange: "bg-orange-400",
  blue:   "bg-blue-400",
  purple: "bg-purple-400",
  grey:   "bg-gray-200",
};

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const router  = useRouter();
  const { data: incident, isLoading } = useIncident(Number(id));
  const acknowledge = useAcknowledgeIncident();

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-[1fr_400px] gap-4">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-[14px]" />
            <Skeleton className="h-48 rounded-[14px]" />
          </div>
          <Skeleton className="h-80 rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={32} className="text-red-300 mb-3" />
        <p className="text-[15px] font-semibold text-gray-700 mb-1">
          Incident not found
        </p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-sidebar text-white text-sm rounded-lg"
        >
          ← Go back
        </button>
      </div>
    );
  }

  const sev     = SEV[incident.severity_level] ?? SEV.High;
  const hasGPS  = !!(incident.latitude && incident.longitude);
  const isPulse = incident.reporting_channel === "Mobile App" &&
                  incident.severity_level === "Critical";

  function handleAck() {
    acknowledge.mutate(
      { id: incident!.id },
      {
        onSuccess: () => toast.success(`Incident #${incident!.id} acknowledged`),
        onError:   () => toast.error("Failed to acknowledge"),
      }
    );
  }

  // Format display ID like #1001
  const displayId = `#${String(incident.id).padStart(4, "0")}`;

  return (
    <div>
      {/* ── Critical pulse banner ── */}
      {isPulse && !incident.is_acknowledged && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13.5px] font-bold">
              🚨 EMERGENCY PULSE — Person in danger
            </p>
            <p className="text-[12px] text-red-100">
              Anonymous device · Immediate response required
            </p>
          </div>
          <button
            onClick={handleAck}
            className="bg-white text-red-600 text-[13px] font-bold px-4 py-2 rounded-lg"
          >
            Acknowledge Now
          </button>
        </div>
      )}

      {/* ── Page header ── */}
      <div className="flex items-center gap-2 mb-1">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[22px] font-semibold text-gray-900">
          Incident Details
        </h1>
      </div>
      <p className="text-[13px] text-gray-400 mb-6 ml-7">
        {new Date(incident.created_at).toLocaleDateString("en-NG", {
          month: "long", day: "numeric", year: "numeric",
        })}
      </p>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">

        {/* ── Left ── */}
        <div className="space-y-5">

          {/* Main incident card */}
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-1">
                  Incident ID &nbsp;
                  <span className="text-[15px] font-bold text-gray-900">
                    {displayId}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    sev.dot
                  )} />
                  <p className="text-[18px] font-bold text-gray-900">
                    {incident.incident_type}
                  </p>
                </div>
                <p className="text-[12px] text-gray-400 font-medium mt-1">
                  Incident Type
                </p>
              </div>
              <span className={cn(
                "flex items-center gap-1.5 text-[12px] font-medium",
                "px-3 py-1.5 rounded-full border",
                sev.badge
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />
                {incident.severity_level}
              </span>
            </div>

            {/* Meta fields */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center flex-shrink-0">
                  <MapPin size={14} className="text-emerald-mid" />
                </div>
                <div>
                  <p className="text-[11.5px] text-gray-400">Location</p>
                  <p className="text-[14px] font-semibold text-gray-900">
                    {incident.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center flex-shrink-0">
                  <Clock size={14} className="text-emerald-mid" />
                </div>
                <div>
                  <p className="text-[11.5px] text-gray-400">Time</p>
                  <p className="text-[14px] font-semibold text-gray-900">
                    {new Date(incident.created_at).toLocaleTimeString("en-NG", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={14} className="text-emerald-mid" />
                </div>
                <div>
                  <p className="text-[11.5px] text-gray-400">Reported Via</p>
                  <p className="text-[14px] font-semibold text-gray-900">
                    {incident.reporting_channel}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {incident.notes && (
              <div className="mt-5 pt-4 border-t border-gray-50">
                <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-[13.5px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {incident.notes}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-50">
              <button
                onClick={handleAck}
                disabled={incident.is_acknowledged || acknowledge.isPending}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "py-2.5 rounded-[10px] text-[13.5px] font-semibold transition-colors",
                  incident.is_acknowledged
                    ? "bg-emerald-light text-emerald-mid cursor-default"
                    : "bg-sidebar text-white hover:bg-emerald-sp"
                )}
              >
                <CheckCircle size={15} />
                {acknowledge.isPending
                  ? "Acknowledging…"
                  : incident.is_acknowledged
                  ? "Acknowledged"
                  : "Acknowledge"}
              </button>
              <button
                onClick={() => toast.info("Assign — coming soon")}
                className="flex-1 py-2.5 rounded-[10px] text-[13.5px] font-semibold bg-emerald-mid text-white hover:bg-emerald-sp transition-colors"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Report Timeline */}
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-5">
              Report Timeline
            </h2>
            <div className="space-y-0">
              {(incident.timeline ?? []).map((event, i) => (
                <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
                  {/* Connector line */}
                  {i < (incident.timeline?.length ?? 0) - 1 && (
                    <div className="absolute left-[10px] top-5 bottom-0 w-px bg-gray-100" />
                  )}
                  {/* Dot */}
                  <div className={cn(
                    "w-5 h-5 rounded-full flex-shrink-0 mt-0.5 relative z-10",
                    "border-2 border-white shadow-sm",
                    event.status === "pending"
                      ? "bg-gray-200"
                      : TIMELINE_DOT[event.color] ?? "bg-emerald-mid"
                  )} />
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {event.time && (
                      <p className="text-[12px] text-gray-400 mb-0.5">
                        {event.time}
                      </p>
                    )}
                    <p className={cn(
                      "text-[13.5px] font-semibold",
                      event.status === "pending"
                        ? "text-gray-400"
                        : "text-gray-900"
                    )}>
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-[12px] text-gray-400 mt-0.5">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted contacts */}
          {incident.trusted_contacts && incident.trusted_contacts.length > 0 && (
            <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
              <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
                Trusted contacts notified
              </h2>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full">
                  <thead>
                    <tr className="bg-surface-secondary">
                      {["NAME", "RELATION", "PHONE NO", "NOTIFIED AT"].map((h) => (
                        <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {incident.trusted_contacts.map((contact, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-4 py-3.5 text-[13.5px] font-medium text-gray-800">
                          {contact.name}
                        </td>
                        <td className="px-4 py-3.5 text-[13.5px] text-gray-500">
                          {contact.relation}
                        </td>
                        <td className="px-4 py-3.5 text-[13.5px] text-gray-500 font-mono">
                          {contact.phone}
                        </td>
                        <td className="px-4 py-3.5 text-[13.5px] text-gray-500">
                          {contact.notified_at}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Location ── */}
        <div>
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
              Location
            </h2>
            {hasGPS && incident.latitude && incident.longitude ? (
              <IncidentMap
                latitude={incident.latitude}
                longitude={incident.longitude}
                location={incident.location}
                severity={incident.severity_level}
              />
            ) : (
              /* Static map image fallback for Lagos */
              <div className="rounded-xl overflow-hidden border border-gray-100 h-[320px] relative">
                <img
                  src={`https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:3.3792,6.5244&zoom=12&apiKey=YOUR_KEY`}
                  alt="Lagos map"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if API key not set
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {/* OpenStreetMap embed fallback */}
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=3.1,6.3,3.6,6.7&layer=mapnik&marker=6.5244,3.3792`}
                  className="w-full h-full border-0"
                  title="Incident location map"
                />
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-[12px] font-semibold text-gray-800 flex items-center gap-1.5">
                    <MapPin size={12} className="text-emerald-mid" />
                    {incident.location}
                  </p>
                  <p className="text-[10.5px] text-gray-400 mt-0.5">
                    Approximate location
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}