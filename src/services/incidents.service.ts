import api from "@/lib/api-client";
import { INCIDENT_ENDPOINTS } from "@/constants";
import type {
  Incident,
  CoordinatorDashboard,
  IncidentFilters,
  FieldStaffDashboard,
} from "@/types";

export const incidentService = {
  async coordinatorDashboard(): Promise<CoordinatorDashboard> {
    const { data } = await api.get<CoordinatorDashboard>(
      INCIDENT_ENDPOINTS.COORDINATOR_DASHBOARD
    );
    return data;
  },

  /**
   * GET /api/incidents/incidents/
   */
  async list(filters?: IncidentFilters): Promise<Incident[]> {
    const { data } = await api.get<Incident[]>(
      INCIDENT_ENDPOINTS.LIST,
      { params: filters }
    );
    return data;
  },

  async detail(id: number): Promise<Incident> {
    const { data } = await api.get<Incident>(
      INCIDENT_ENDPOINTS.DETAIL(id)
    );
    return data;
  },

  /**
   * POST /api/incidents/incidents/:id/acknowledge/
   */
 async acknowledge(id: number): Promise<{ message: string; acknowledged_at: string }> {
    const { data } = await api.patch<{ message: string; acknowledged_at: string }>(
      INCIDENT_ENDPOINTS.ACKNOWLEDGE(id)  // ← patch not post
    );
    return data;
  },

  async fieldStaffDashboard(): Promise<FieldStaffDashboard> {
    const { data } = await api.get<FieldStaffDashboard>(
      INCIDENT_ENDPOINTS.FIELD_DASHBOARD
    );
    return data;
  },
};


