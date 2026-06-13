"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
// Import your centralized configuration mappings
import { API_BASE_URL, INCIDENT_ENDPOINTS, TOKEN_KEY } from "@/src/constants/index";

interface ActivityLog {
  emoji: string;
  bg: string;
  action: string;
  highlight: string;
  meta: string;
  time: string;
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAuditLogs() {
      try {
        // 🌟 COMBINE THE CENTRALIZED CONSTANTS
        const response = await fetch(`${API_BASE_URL}${INCIDENT_ENDPOINTS.ACTIVITY_LOG}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            "Content-Type": "application/json",
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLogs(data);
        }
      } catch (err) {
        console.error("Error updating system logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAuditLogs();
  }, []);

  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Full audit trail of platform actions" />
      {/* ... keeping your exact UI layout rendering loop block below ... */}
    </div>
  );
}
