"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, MessageSquare,
  CheckCircle, AlertTriangle, UserPlus,
  Phone, Users, XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useIncident, useAcknowledgeIncident,
  useAssignIncident, useConfirmContacts,
  useCloseIncident, useTeam, useTrustedContacts, // 🟢 Added our dedicated hook import
} from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui";
import { IncidentMap } from "@/components/incidents/IncidentMap";
import { DeviceHistoryPanel } from "@/components/incidents/DeviceHistoryPanel";
import { cn } from "@/utils";

const SEV = {
  Critical: { dot: "bg-red-500",  badge: "bg-red-50 text-red-500 border-red-200",         text: "text-red-500"    },
  High:     { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-500 border-orange-200", text: "text-orange-500" },
  Medium:   { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-600 border-yellow-200", text: "text-yellow-600" },
  Low:      { dot: "bg-green-500",  badge: "bg-green-50 text-green-600 border-green-200",    text: "text-green-600"  },
};

const TIMELINE_DOT: Record<string, string> = {
  green:  "bg-emerald-mid",
  orange: "bg-orange-400",
  blue:   "bg-blue-400",
  purple: "bg-purple-400",
  red:    "bg-red-500",
  grey:   "bg-gray-200",
};

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

  // 🟢 Query the standalone backend endpoint using the phone_hash from the loaded incident
  const { data: trustedContacts = [], isLoading: isLoadingContacts } = useTrustedContacts(
    incident?.phone_hash ?? ""
  );

  const acknowledge     = useAcknowledgeIncident();
  const assign          = useAssignIncident();
  const confirmContacts = useConfirmContacts();
  const closeIncident   = useCloseIncident();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff,   setSelectedStaff]   = useState<number | null>(null);
  const [showCloseModal,  setShowCloseModal]  = useState(false);
  const [supportProvided, setSupportProvided] = useState("");
  const [closeNotes,      setCloseNotes]      = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
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
        <p className="text-[15px] font-semibold text-gray-700 mb-1">Incident not found</p>
        <button onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-sidebar text-white text-sm rounded-lg">
          ← Go back
        </button>
      </div>
    );
  }

  const sev    = SEV[incident.severity_level] ?? SEV.High;
  const hasGPS = !!(incident.latitude && incident.longitude);
  const isPulse = incident.reporting_channel === "Mobile App" &&
                  incident.severity_level === "Critical";

  const isAssigned     = !!incident.assignment;
  const assignedToMe   = incident.assignment?.assigned_to?.id === user?.id;
  
  // 🟢 Checking absolute structural flags from database state
  const isClosed       = incident.follow_up_status === "Closed";

  const contactsConfirmed = incident.timeline?.some(
    (t) => t.title === "Trusted contact attempted" || t.title === "Trusted contacts confirmed"
  );

  function handleAck() {
    acknowledge.mutate(
      { id: incident!.id },
      {
        onSuccess: () => toast.success("Incident acknowledged"),
        onError:   () => toast.error("Failed to acknowledge"),
      }
    );
  }

  function handleAssign() {
    if (!selectedStaff) { toast.error("Select a field staff member"); return; }
    assign.mutate(
      { id: incident!.id, assigned_to: selectedStaff },
      {
        onSuccess: () => {
          toast.success("Incident assigned successfully");
          setShowAssignModal(false);
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
        onError:   () => toast.error("Failed to confirm"),
      }
    );
  }

  function handleClose() {
    closeIncident.mutate(
      { id: incident!.id, support_provided: supportProvided, notes: closeNotes },
      {
        onSuccess: () => {
          toast.success("Case closed successfully");
          setShowCloseModal(false);
        },
        onError: () => toast.error("Failed to close case"),
      }
    );
  }

  const displayId = `#${String(incident.id).padStart(4, "0")}`;

  return (
    <div>
      {/* Critical pulse banner */}
      {isPulse && !incident.is_acknowledged && role === "COORDINATOR" && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl mb-5">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13.5px] font-bold">🚨 EMERGENCY PULSE — Person in danger</p>
            <p className="text-[12px] text-red-100">Immediate response required</p>
          </div>
          <button onClick={handleAck}
            className="bg-white text-red-600 text-[13px] font-bold px-4 py-2 rounded-lg">
            Acknowledge Now
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[22px] font-semibold text-gray-900">
          {role === "FIELD_STAFF" ? "Report Details" : "Incident Details"}
        </h1>
      </div>
      <p className="text-[13px] text-gray-400 mb-6 ml-7">
        {new Date(incident.created_at).toLocaleDateString("en-NG", {
          month: "long", day: "numeric", year: "numeric",
        })}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Main card */}
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[12px] text-gray-400 font-medium mb-1">
                  {role === "FIELD_STAFF" ? "Report ID" : "Incident ID"}&nbsp;
                  <span className="text-[15px] font-bold text-gray-900">
                    {role === "FIELD_STAFF" ? `#R-${String(incident.id).padStart(4,"0")}` : displayId}
                  </span>
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", sev.dot)} />
                  <p className="text-[18px] font-bold text-gray-900">{incident.incident_type}</p>
                </div>
                <p className="text-[12px] text-gray-400 mt-1">Incident Type</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border",
                  sev.badge
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />
                  {incident.severity_level}
                </span>
                {isClosed && (
                  <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-light text-emerald-mid">
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

            {/* Meta */}
            <div className="space-y-4 mb-6">
              {[
                { icon: <MapPin size={14} className="text-emerald-mid" />,      label: "Location",     value: incident.location },
                { icon: <Clock size={14} className="text-emerald-mid" />,       label: "Time",         value: new Date(incident.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) },
                { icon: <MessageSquare size={14} className="text-emerald-mid" />, label: "Reported Via", value: incident.reporting_channel },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-light flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[11.5px] text-gray-400">{item.label}</p>
                    <p className="text-[14px] font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Assignment info */}
            {isAssigned && incident.assignment && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 mb-5">
                <p className="text-[11.5px] font-semibold text-blue-600 uppercase tracking-wide mb-1">
                  Assigned to
                </p>
                <p className="text-[13.5px] font-semibold text-gray-800">
                  {incident.assignment.assigned_to?.name}
                </p>
                <p className="text-[12px] text-gray-400">
                  by {incident.assignment.assigned_by?.name}
                </p>
              </div>
            )}

            {/* Notes */}
            {incident.notes && (
              <div className="bg-surface-secondary rounded-xl p-4 mb-5">
                <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Notes
                </p>
                <p className="text-[13.5px] text-gray-600 leading-relaxed whitespace-pre-line">
                  {incident.notes}
                </p>
              </div>
            )}

            {/* Actions Panel */}
            {!isClosed && (
              <div className="flex gap-2.5 flex-wrap">
                {role === "COORDINATOR" && (
                  <>
                    {!incident.is_acknowledged && (
                      <button
                        onClick={handleAck}
                        disabled={acknowledge.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-sidebar text-white text-[13.5px] font-semibold rounded-[10px] hover:bg-emerald-sp transition-colors disabled:opacity-60"
                      >
                        <CheckCircle size={15} />
                        {acknowledge.isPending ? "…" : "Acknowledge"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowAssignModal(true)}
                      disabled={!incident.is_acknowledged}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-mid text-white text-[13.5px] font-semibold rounded-[10px] hover:bg-emerald-sp transition-colors disabled:opacity-40"
                    >
                      <UserPlus size={15} />
                      {isAssigned ? "Reassign" : "Assign"}
                    </button>
                  </>
                )}

                {role === "FIELD_STAFF" && assignedToMe && (
                  <>
                    {!contactsConfirmed && trustedContacts.length > 0 && (
                      <button
                        onClick={handleConfirmContacts}
                        disabled={confirmContacts.isPending}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white text-[13.5px] font-semibold rounded-[10px] hover:bg-purple-600 transition-colors disabled:opacity-60"
                      >
                        <Phone size={15} />
                        {confirmContacts.isPending ? "…" : "Confirm contacts notified"}
                      </button>
                    )}
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-mid text-white text-[13.5px] font-semibold rounded-[10px] hover:bg-emerald-sp transition-colors"
                    >
                      <CheckCircle size={15} />
                      Close case
                    </button>
                  </>
                )}
              </div>
            )}

            {isClosed && (
              <div className="flex items-center gap-2.5 bg-emerald-pale border border-emerald-light rounded-xl p-3.5">
                <CheckCircle size={18} className="text-emerald-mid" />
                <p className="text-[13.5px] font-semibold text-emerald-sp">
                  Case closed — no further action required
                </p>
              </div>
            )}
          </div>

          {/* Report Timeline */}
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-5">Report Timeline</h2>
            <div className="space-y-0">
              {(incident.timeline ?? []).map((event, i) => (
                <div key={i} className="flex gap-4 relative pb-5 last:pb-0">
                  {i < (incident.timeline?.length ?? 0) - 1 && (
                    <div className="absolute left-[9px] top-5 bottom-0 w-px bg-gray-100" />
                  )}
                  <div className={cn(
                    "w-[18px] h-[18px] rounded-full flex-shrink-0 mt-0.5 relative z-10",
                    "border-2 border-white shadow-sm",
                    event.status === "pending"
                      ? "bg-gray-200"
                      : TIMELINE_DOT[event.color] ?? "bg-emerald-mid"
                  )} />
                  <div className="flex-1">
                    {event.time && (
                      <p className="text-[12px] text-gray-400 mb-0.5">{event.time}</p>
                    )}
                    <p className={cn(
                      "text-[13.5px] font-semibold",
                      event.status === "pending" ? "text-gray-400" : "text-gray-900"
                    )}>
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-[12px] text-gray-400 mt-0.5">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted contacts Section */}
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">
              Trusted contacts notified
            </h2>

            {isLoadingContacts ? (
              <div className="space-y-2 py-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-14 w-full rounded-lg" />
              </div>
            ) : trustedContacts.length > 0 ? (
              <>
                <div className="overflow-hidden rounded-xl border border-gray-100 mb-4">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-secondary">
                        {["NAME", "RELATION", "PHONE NO", "STATUS"].map((h) => (
                          <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-3">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trustedContacts.map((c: any, i: number) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-4 py-3.5 text-[13.5px] font-medium text-gray-800">{c.name}</td>
                          <td className="px-4 py-3.5 text-[13.5px] text-gray-500">{c.relationship || c.relation}</td>
                          <td className="px-4 py-3.5 text-[13.5px] text-gray-500 font-mono">{c.phone_number || c.phone}</td>
                          <td className="px-4 py-3.5 text-[13.5px]">
                            <span className="text-emerald-mid font-medium text-[12px] bg-emerald-light/20 px-2 py-0.5 rounded-md">
                              ✓ Alerted
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {role === "FIELD_STAFF" && assignedToMe && !contactsConfirmed && !isClosed && (
                  <button
                    onClick={handleConfirmContacts}
                    disabled={confirmContacts.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500 text-white text-[13.5px] font-semibold rounded-[10px] hover:bg-purple-600 transition-colors disabled:opacity-60"
                  >
                    <Phone size={15} />
                    {confirmContacts.isPending ? "Confirming…" : "Confirm trusted contacts have been notified"}
                  </button>
                )}

                {contactsConfirmed && (
                  <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 rounded-xl p-3 mt-2">
                    <CheckCircle size={15} className="text-purple-500" />
                    <p className="text-[13px] font-medium text-purple-700">
                      Trusted contacts have been confirmed notified
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <XCircle size={18} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="text-[13.5px] font-semibold text-orange-700">
                    No trusted contacts registered
                  </p>
                  <p className="text-[12px] text-orange-600 mt-0.5">
                    This device has no emergency contacts listed on file. Field staff should run localized direct client confirmation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column — Location & Device Tracking ── */}
        <div>
          <div className="bg-white rounded-[14px] border border-gray-100 shadow-card p-6 mb-5">
            <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Location</h2>
            {hasGPS && incident.latitude && incident.longitude ? (
              <IncidentMap
                latitude={incident.latitude}
                longitude={incident.longitude}
                location={incident.location}
                severity={incident.severity_level}
                height={320}
              />
            ) : (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=3.1,6.3,3.6,6.7&layer=mapnik`}
                className="w-full rounded-xl border border-gray-100"
                style={{ height: 320 }}
                title="Location map"
              />
            )}
            <p className="text-[12px] text-gray-500 mt-3 flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-mid" />
              {incident.location}
            </p>
          </div>
          
          {/* Device tracking history is now safely injected with the true DB record tracking token */}
          {incident.device_hash && (
            <DeviceHistoryPanel deviceHash={incident.device_hash} />
          )}
        </div>
      </div>

      {/* ── Assign Modal ── */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[16px] p-6 w-full max-w-md shadow-modal">
            <h2 className="text-[17px] font-semibold mb-1">Assign incident</h2>
            <p className="text-[13px] text-gray-400 mb-5">
              Select a field staff member to handle this case
            </p>

            {team.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-[13.5px]">No field staff in your organisation yet</p>
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
                        ? "border-emerald-mid bg-emerald-pale"
                        : "border-gray-200 hover:border-emerald-mid"
                    )}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-mid/70 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {(member.first_name?.[0] ?? member.username?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-semibold text-gray-900">
                        {member.first_name
                          ? `${member.first_name} ${member.last_name}`
                          : member.username}
                      </p>
                      <p className="text-[12px] text-gray-400 capitalize">
                        {member.role?.replace("_", " ").toLowerCase()}
                      </p>
                    </div>
                    {selectedStaff === member.id && (
                      <CheckCircle size={16} className="text-emerald-mid ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 py-2.5 border-[1.5px] border-gray-200 text-sm font-medium rounded-[10px] hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedStaff || assign.isPending}
                className="flex-1 py-2.5 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors disabled:opacity-50"
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
          <div className="bg-white rounded-[16px] p-6 w-full max-w-md shadow-modal">
            <h2 className="text-[17px] font-semibold mb-1">Close case</h2>
            <p className="text-[13px] text-gray-400 mb-5">
              Confirm the support provided before closing
            </p>

            <div className="mb-4">
              <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">
                Support provided
              </label>
              <select
                value={supportProvided}
                onChange={(e) => setSupportProvided(e.target.value)}
                className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[9px] text-sm outline-none focus:border-emerald-mid"
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
              <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">
                Closing notes
              </label>
              <textarea
                value={closeNotes}
                onChange={(e) => setCloseNotes(e.target.value)}
                rows={3}
                placeholder="Summary of actions taken…"
                className="w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[9px] text-sm outline-none focus:border-emerald-mid resize-none"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowCloseModal(false)}
                className="flex-1 py-2.5 border-[1.5px] border-gray-200 text-sm font-medium rounded-[10px]"
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                disabled={closeIncident.isPending}
                className="flex-1 py-2.5 bg-emerald-mid text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors disabled:opacity-50"
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
