"use client";
export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, MessageSquare,
  CheckCircle, AlertTriangle, UserPlus,
  Phone, Users, XCircle, HelpCircle, History
} from "lucide-react";
import { toast } from "sonner";
import {
  useIncident, useAcknowledgeIncident,
  useAssignIncident, useConfirmContacts,
  useCloseIncident, useTeam, useDeviceHistory
} from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui";
import { IncidentMap } from "@/components/incidents/IncidentMap";
import { cn } from "@/utils";

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  Critical: { dot: "bg-red-500",    badge: "bg-red-50 text-red-500 border-red-200",          text: "text-red-500"    },
  High:     { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-500 border-orange-200", text: "text-orange-500" },
  Medium:   { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-600 border-yellow-200", text: "text-yellow-600" },
  Low:      { dot: "bg-green-500",  badge: "bg-green-50 text-green-600 border-green-200",    text: "text-green-600"  },
};

const TIMELINE_DOT: Record<string, string> = {
  green:  "bg-emerald-600",
  orange: "bg-orange-400",
  blue:   "bg-blue-400",
  purple: "bg-purple-400",
  red:    "bg-red-500",
  grey:   "bg-gray-200",
};

// ── Time formatter — converts "18:35:45.402876" → "6:35 PM" ─────────────────
function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "—";
  try {
    // Extract HH:MM from "18:35:45.402876"
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString([], {
      hour:   "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id }  = use(params);
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const role    = user?.role ?? "FIELD_STAFF";

  const { data: incident, isLoading } = useIncident(Number(id));
  const { data: team = [] }           = useTeam();
  const { data: historyData, isLoading: isLoadingHistory } = useDeviceHistory(
    incident?.device_hash ?? ""
  );

  const acknowledge     = useAcknowledgeIncident();
  const assign          = useAssignIncident();
  const confirmContacts = useConfirmContacts();
  const closeIncident   = useCloseIncident();

  const [showAssignModal,  setShowAssignModal]  = useState(false);
  const [selectedStaff,    setSelectedStaff]    = useState<number | null>(null);
  const [showCloseModal,   setShowCloseModal]   = useState(false);
  const [supportProvided,  setSupportProvided]  = useState("");
  const [closeNotes,       setCloseNotes]       = useState("");

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          <div className="space-y-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={32} className="text-red-300 mb-3" />
        <p className="text-[15px] font-semibold text-gray-700 mb-1">Incident not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg"
        >
          ← Go back
        </button>
      </div>
    );
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const sev              = SEV[incident.severity_level] ?? SEV.High;
  const isPulse          = incident.reporting_channel === "Mobile App" &&
                           incident.severity_level === "Critical";
  const isAssigned       = !!incident.assignment;
  const assignedToMe     = incident.assignment?.assigned_to?.id === user?.id;
  const isClosed         = incident.follow_up_status === "Closed";
  const trustedContacts  = incident.trusted_contacts ?? [];
  const isUnregistered   = !incident.device_hash ||
                           incident.device_hash === "UNREGISTERED_SOURCE";
  const contactsConfirmed = incident.timeline?.some(
    (t: { title: string }) => t.title === "Trusted contact attempted"
  );

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleAck() {
    acknowledge.mutate(
      { id: incident!.id },
      {
        onSuccess: () => toast.success(`Incident #${incident!.id} acknowledged`),
        onError:   () => toast.error("Failed to acknowledge"),
      }
    );
  }

  function handleAssign() {
    if (!selectedStaff) {
      toast.error("Please select a field staff member");
      return;
    }
    assign.mutate(
      { id: incident!.id, assigned_to: selectedStaff },
      {
        onSuccess: () => {
          toast.success("Incident assigned successfully");
          setShowAssignModal(false);
          setSelectedStaff(null);
        },
        onError: () => toast.error("Failed to assign incident"),
      }
    );
  }

  function handleConfirmContacts() {
    confirmContacts.mutate(
      { id: incident!.id },
      {
        onSuccess: () => toast.success("Trusted contacts confirmed"),
        onError:   () => toast.error("Failed to confirm contacts"),
      }
    );
  }

  function handleClose() {
    closeIncident.mutate(
      {
        id:               incident!.id,
        support_provided: supportProvided,
        notes:            closeNotes,
      },
      {
        onSuccess: () => {
          toast.success("Case closed successfully");
          setShowCloseModal(false);
        },
        onError: () => toast.error("Failed to close case"),
      }
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-[1600px] mx-auto">

      {/* Emergency pulse banner */}
      {isPulse && !incident.is_acknowledged && role === "COORDINATOR" && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold">🚨 EMERGENCY PULSE — Person in danger</p>
            <p className="text-xs text-red-100">Immediate response required</p>
          </div>
          <button
            onClick={handleAck}
            disabled={acknowledge.isPending}
            className="bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {acknowledge.isPending ? "…" : "Acknowledge Now"}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {role === "FIELD_STAFF" ? "Report Details" : "Incident Details"}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">

        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Main info card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {role === "FIELD_STAFF" ? "Report ID" : "Incident ID"}
                </span>
                <p className="text-lg font-bold text-gray-900 font-mono">
                  {role === "FIELD_STAFF"
                    ? `#R-${String(incident.id).padStart(4, "0")}`
                    : `#${String(incident.id).padStart(4, "0")}`}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", sev.dot)} />
                  <h2 className="text-xl font-bold text-gray-900">{incident.incident_type}</h2>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold border",
                  sev.badge
                )}>
                  {incident.severity_level}
                </span>
                {isClosed && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                    ● Resolved
                  </span>
                )}
                {!isClosed && incident.is_acknowledged && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-500">
                    ● Active
                  </span>
                )}
                {!incident.is_acknowledged && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-500">
                    ● New
                  </span>
                )}
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Location</span>
                <span className="text-sm font-semibold text-gray-800">
                  {incident.location}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Time Reported</span>
                <span className="text-sm font-semibold text-gray-800">
                  {/* ✅ Fixed: converts "18:35:45.402876" → "6:35 PM" */}
                  {formatTime(incident.incident_time)}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block mb-0.5">Reported Via</span>
                <span className="text-sm font-semibold text-gray-800">
                  {incident.reporting_channel}
                </span>
              </div>
            </div>

            {/* Assignment info */}
            {isAssigned && incident.assignment && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Assigned to
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  {incident.assignment.assigned_to?.name}
                </p>
                <p className="text-xs text-gray-400">
                  by {incident.assignment.assigned_by?.name}
                </p>
              </div>
            )}

            {/* Notes */}
            {incident.notes && (
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {incident.notes}
                </p>
              </div>
            )}

            {/* ── Action buttons ── */}
            {!isClosed && (
              <div className="flex gap-3 flex-wrap">

                {/* COORDINATOR actions */}
                {role === "COORDINATOR" && (
                  <>
                    {!incident.is_acknowledged && (
                      <button
                        onClick={handleAck}
                        disabled={acknowledge.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
                      >
                        <CheckCircle size={15} />
                        {acknowledge.isPending ? "Acknowledging…" : "Acknowledge"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowAssignModal(true)}
                      disabled={!incident.is_acknowledged}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <UserPlus size={15} />
                      {isAssigned ? "Reassign" : "Assign Case"}
                    </button>
                  </>
                )}

                {/* FIELD STAFF actions */}
                {role === "FIELD_STAFF" && assignedToMe && (
                  <>
                    {!contactsConfirmed &&
                      trustedContacts.length > 0 && (
                      <button
                        onClick={handleConfirmContacts}
                        disabled={confirmContacts.isPending}
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60"
                      >
                        <Phone size={15} />
                        {confirmContacts.isPending
                          ? "Confirming…"
                          : "Confirm contacts notified"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle size={15} />
                      Close case
                    </button>
                  </>
                )}
              </div>
            )}

            {isClosed && (
              <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 mt-4">
                <CheckCircle size={18} className="text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-700">
                  Case closed — no further action required
                </p>
              </div>
            )}
          </div>

          {/* Report Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">
              Report Timeline
            </h3>
            <div className="space-y-0">
              {(incident.timeline ?? []).map((evt: {
                time: string; title: string; description: string;
                color: string; status: string;
              }, idx: number) => (
                <div key={idx} className="flex gap-4 relative pb-5 last:pb-0">
                  {idx < (incident.timeline?.length ?? 0) - 1 && (
                    <div className="absolute left-[7px] top-4 bottom-0 w-px bg-gray-100" />
                  )}
                  <div className={cn(
                    "w-[16px] h-[16px] rounded-full flex-shrink-0 mt-0.5 relative z-10 border-2 border-white shadow-sm",
                    evt.status === "pending"
                      ? "bg-gray-200"
                      : TIMELINE_DOT[evt.color] ?? "bg-emerald-600"
                  )} />
                  <div className="flex-1">
                    {evt.time && (
                      <p className="text-[11px] text-gray-400 mb-0.5">{evt.time}</p>
                    )}
                    <p className={cn(
                      "text-sm font-semibold",
                      evt.status === "pending" ? "text-gray-400" : "text-gray-900"
                    )}>
                      {evt.title}
                    </p>
                    {evt.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{evt.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Contacts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Trusted Contacts Notified
            </h3>

            {isUnregistered ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <HelpCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-amber-800">
                    Anonymous Transmission
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    This incident was received from an unregistered device.
                    No trusted contacts are available.
                    Field staff should attempt direct outreach.
                  </p>
                </div>
              </div>
            ) : trustedContacts.length > 0 ? (
              <>
                <div className="overflow-x-auto border border-gray-100 rounded-xl mb-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {["Name", "Relation", "Phone No", "Notified At"].map((h) => (
                          <th key={h} className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trustedContacts.map((c: {
                        name: string; relation: string;
                        phone: string; notified_at: string;
                      }, i: number) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                            {c.name}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">{c.relation}</td>
                          <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{c.phone}</td>
                          <td className="px-4 py-3.5 text-sm text-gray-500">{c.notified_at}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Field staff confirm button */}
                {role === "FIELD_STAFF" && assignedToMe && !contactsConfirmed && !isClosed && (
                  <button
                    onClick={handleConfirmContacts}
                    disabled={confirmContacts.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60"
                  >
                    <Phone size={15} />
                    {confirmContacts.isPending
                      ? "Confirming…"
                      : "Confirm trusted contacts have been notified"}
                  </button>
                )}

                {contactsConfirmed && (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl p-3 mt-2">
                    <CheckCircle size={15} className="text-purple-500" />
                    <p className="text-sm font-medium text-purple-700">
                      Trusted contacts confirmed notified
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <XCircle size={18} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">
                    No trusted contacts registered
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    This device has no trusted contacts on file.
                    No automated message was sent.
                    Field staff should attempt direct outreach.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Location map */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Location
            </h3>
            {incident.latitude && incident.longitude ? (
              <IncidentMap
                latitude={incident.latitude}
                longitude={incident.longitude}
                location={incident.location}
                severity={incident.severity_level}
                height={260}
              />
            ) : (
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=3.1,6.3,3.6,6.7&layer=mapnik"
                className="w-full rounded-xl border border-gray-100"
                style={{ height: 260 }}
                title="Location map"
              />
            )}
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
              <MapPin size={11} className="text-emerald-600" />
              {incident.location}
              {incident.latitude && incident.longitude && (
                <span className="font-mono text-gray-400 ml-1">
                  ({incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)})
                </span>
              )}
            </p>
          </div>

          {/* Device history */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <History size={15} className="text-gray-400" />
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Device History
              </h3>
            </div>

            {/* Masked device ID */}
            {incident.device_hash && !isUnregistered && (
              <div className="bg-gray-50 rounded-lg px-3 py-2 mb-4">
                <p className="text-[10px] text-gray-400 mb-0.5">Anonymous Device ID</p>
                <p className="text-xs font-mono text-gray-600 break-all">
                  {incident.device_hash.slice(0, 8)}••••{incident.device_hash.slice(-4)}
                </p>
              </div>
            )}

            {isLoadingHistory ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : isUnregistered ? (
              <div className="text-xs text-gray-400 text-center p-4 bg-gray-50 rounded-xl border border-dashed">
                No device profile available
              </div>
            ) : historyData?.incidents && historyData.incidents.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between text-xs">
                  <span className="text-gray-500">Total reports from device</span>
                  <span className="font-bold text-gray-900">{historyData.total_reports}</span>
                </div>

                {/* Pattern warning */}
                {(historyData.total_reports ?? 0) > 1 && (
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <AlertTriangle size={13} className="text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700">
                      This device has reported{" "}
                      <strong>{historyData.total_reports} times</strong>.
                      May indicate a recurring situation.
                    </p>
                  </div>
                )}

                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {historyData.incidents.map((hist: {
                    id: number; incident_type: string; created_at: string;
                  }) => (
                    <button
                      key={hist.id}
                      onClick={() => router.push(`/incidents/${hist.id}`)}
                      className="w-full flex items-center justify-between p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <p className="text-xs font-bold text-gray-800">{hist.incident_type}</p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(hist.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 font-mono">#{hist.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center p-4 bg-gray-50 rounded-xl border border-dashed">
                No previous reports from this device
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Assign Modal ── */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Assign incident</h2>
            <p className="text-sm text-gray-400 mb-5">
              Select a field staff member to handle this case
            </p>

            {team.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No field staff in your organisation yet</p>
              </div>
            ) : (
              <div className="space-y-2 mb-5 max-h-64 overflow-y-auto">
                {team.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedStaff(member.id)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] transition-all text-left",
                      selectedStaff === member.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-emerald-400"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-600/70 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(member.first_name?.[0] ?? member.username?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {member.first_name
                          ? `${member.first_name} ${member.last_name}`
                          : member.username}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {member.role?.replace("_", " ").toLowerCase()}
                      </p>
                    </div>
                    {selectedStaff === member.id && (
                      <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowAssignModal(false); setSelectedStaff(null); }}
                className="flex-1 py-2.5 border-[1.5px] border-gray-200 text-sm font-semibold rounded-xl hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedStaff || assign.isPending}
                className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {assign.isPending ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close Case Modal ── */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Close case</h2>
            <p className="text-sm text-gray-400 mb-5">
              Confirm the support provided before closing
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Support provided
              </label>
              <select
                value={supportProvided}
                onChange={(e) => setSupportProvided(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Select…</option>
                <option value="Counseling">Counseling</option>
                <option value="Medical Care">Medical Care</option>
                <option value="Legal Aid">Legal Aid</option>
                <option value="Shelter">Shelter</option>
                <option value="Safe House">Safe House</option>
                <option value="Police Report">Police Report Filed</option>
                <option value="Referral">Referral to partner NGO</option>
                <option value="Follow-up scheduled">Follow-up scheduled</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                Closing notes
              </label>
              <textarea
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                rows={3}
                placeholder="Summary of actions taken…"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-xl text-sm outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 border-[1.5px] border-gray-200 text-sm font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closeIncident.isPending}
                className="flex-1 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {closeIncident.isPending ? "Closing…" : "Close case"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
