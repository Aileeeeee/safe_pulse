"use client";
export const dynamic = "force-dynamic";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Clock, MessageSquare,
  CheckCircle, AlertTriangle, UserPlus,
  Phone, Users, XCircle, HelpCircle, History
} from "lucide-react";
import {
  useIncident, useAcknowledgeIncident,
  useAssignIncident, useConfirmContacts,
  useCloseIncident, useTeam, useDeviceHistory
} from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Skeleton } from "@/components/ui";
import { IncidentMap } from "@/components/incidents/IncidentMap";
import { cn } from "@/utils";

const SEV = {
  Critical: { dot: "bg-red-500",    badge: "bg-red-50 text-red-500 border-red-200",         text: "text-red-500"    },
  High:      { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-500 border-orange-200", text: "text-orange-500" },
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

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "FIELD_STAFF";

  const { data: incident, isLoading } = useIncident(Number(id));
  const { data: team = [] } = useTeam();
  
  // Fetch device tracking history from endpoint
  const { data: historyData, isLoading: isLoadingHistory } = useDeviceHistory(incident?.device_hash ?? "");

  const acknowledge = useAcknowledgeIncident();
  const assign = useAssignIncident();
  const confirmContacts = useConfirmContacts();
  const closeIncident = useCloseIncident();

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [supportProvided, setSupportProvided] = useState("");
  const [closeNotes, setCloseNotes] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
          <div className="space-y-4"><Skeleton className="h-64 rounded-xl" /></div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle size={32} className="text-red-300 mb-3" />
        <p className="text-[15px] font-semibold text-gray-700">Incident not found</p>
      </div>
    );
  }

  // Extract variables safely mapped to your Django view attributes
  const sev = SEV[incident.severity_level] ?? SEV.High;
  const isPulse = incident.reporting_channel === "Mobile App" && incident.severity_level === "Critical";
  const isAssigned = !!incident.assignment;
  const assignedToMe = incident.assignment?.assigned_to?.id === user?.id;
  const isClosed = incident.follow_up_status === "Closed";
  
  // Extract trusted contacts populated directly by IncidentDetailView
  const trustedContacts = incident.trusted_contacts ?? [];
  const isUnregistered = !incident.registered_user || !incident.device_hash || incident.device_hash.toUpperCase().includes("UNREGIST");

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Critical Banner */}
      {isPulse && !incident.is_acknowledged && role === "COORDINATOR" && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-xl mb-5 animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <div className="flex-1">
            <p className="text-sm font-bold">🚨 EMERGENCY PULSE — High-priority case alert</p>
          </div>
          <button 
            onClick={() => acknowledge.mutate({ id: incident.id })} 
            className="bg-white text-red-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Incident Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">Incident ID</span>
                <span className="text-lg font-bold text-gray-900">#{incident.id}</span>
                <h2 className="text-xl font-bold text-gray-900 mt-2">{incident.incident_type}</h2>
              </div>
              <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", sev.badge)}>
                {incident.severity_level}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-xl">
              <div>
                <span className="text-xs text-gray-400 block">Location</span>
                <span className="text-sm font-semibold text-gray-800">{incident.location}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Time Reported</span>
                <span className="text-sm font-semibold text-gray-800">
                  {/* 🔧 FIXED: Strict formatting structure to force 12-Hour layout stream */}
                  {incident.incident_time || new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Reported Via</span>
                <span className="text-sm font-semibold text-gray-800">{incident.reporting_channel || "App"}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!incident.is_acknowledged && role === "COORDINATOR" && (
                <button onClick={() => acknowledge.mutate({ id: incident.id })} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800">
                  Acknowledge
                </button>
              )}
              {role === "COORDINATOR" && (
                <button onClick={() => setShowAssignModal(true)} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">
                  Assign Case
                </button>
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Report Timeline</h3>
            <div className="space-y-4">
              {incident.timeline?.map((evt: any, idx: number) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className={cn("w-2 h-2 rounded-full mt-1.5", TIMELINE_DOT[evt.color] || "bg-gray-300")} />
                  <div>
                    <span className="text-xs text-gray-400 block">{evt.time}</span>
                    <p className="text-sm font-semibold text-gray-800">{evt.title}</p>
                    {evt.description && <p className="text-xs text-gray-500">{evt.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Contacts Table Box */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Trusted Contacts Notified</h3>
            
            {isUnregistered ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <HelpCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">Anonymous Transmission Source</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    This incident was received anonymously without a registered client system hash profile. No emergency dispatch profiles are available.
                  </p>
                </div>
              </div>
            ) : trustedContacts.length > 0 ? (
              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-3 text-xs font-bold text-gray-400 uppercase">Name</th>
                      <th className="p-3 text-xs font-bold text-gray-400 uppercase">Relation</th>
                      <th className="p-3 text-xs font-bold text-gray-400 uppercase">Phone No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trustedContacts.map((contact: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50 last:border-0">
                        <td className="p-3 text-sm font-semibold text-gray-800">{contact.name}</td>
                        <td className="p-3 text-sm text-gray-500">{contact.relation}</td>
                        <td className="p-3 text-sm font-mono text-gray-600">{contact.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No emergency contacts registered to this account profile.</p>
            )}
          </div>
        </div>

        {/* Right Column (Map & Device History) */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Location Map</h3>
            
            {incident && incident.latitude !== null && incident.longitude !== null ? (
              <IncidentMap 
                latitude={incident.latitude} 
                longitude={incident.longitude} 
                location={incident.location} 
                severity={incident.severity_level} 
                height={260} 
              />
            ) : (
              <div className="h-[260px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                No active GPS stream
              </div>
            )}
          </div>

          {/* Device History Tracking Panel */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <History size={16} className="text-gray-400" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Device History</h3>
            </div>

            {isLoadingHistory ? (
              <Skeleton className="h-16 w-full rounded-xl" />
            ) : historyData?.incidents && historyData.incidents.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg flex justify-between text-xs">
                  <span className="text-gray-500">Total Incidents from Device:</span>
                  <span className="font-bold text-gray-900">{historyData.total_reports}</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {historyData.incidents.map((hist: any) => (
                    <div key={hist.id} className="p-2.5 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">{hist.incident_type}</p>
                        <p className="text-gray-400 text-[10px]">{new Date(hist.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-gray-500 font-medium">#{hist.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 text-gray-400 text-xs p-4 rounded-xl text-center border border-dashed">
                No past submission vectors detected for this profile.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
