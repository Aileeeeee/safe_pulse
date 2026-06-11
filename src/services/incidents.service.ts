import api from "@/lib/api-client";
import { INCIDENT_ENDPOINTS } from "@/constants";
import type { Incident, CoordinatorDashboard, IncidentFilters } from "@/types";

export const incidentService = {
  async coordinatorDashboard(): Promise<CoordinatorDashboard> {
    const { data } = await api.get<CoordinatorDashboard>(
      INCIDENT_ENDPOINTS.COORDINATOR_DASHBOARD
    );
    return data;
  },

  async list(filters?: IncidentFilters): Promise<Incident[]> {
    const { data } = await api.get<Incident[]>(
      INCIDENT_ENDPOINTS.LIST,
      { params: filters }
    );
    return data;
  },

  async detail(id: number): Promise<Incident> {
    const { data } = await api.get<Incident>(INCIDENT_ENDPOINTS.DETAIL(id));
    return data;
  },

  async acknowledge(id: number): Promise<{ message: string }> {
    const { data } = await api.patch<{ message: string }>(
      INCIDENT_ENDPOINTS.ACKNOWLEDGE(id)
    );
    return data;
  },

  async assign(id: number, assigned_to: number, notes?: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      INCIDENT_ENDPOINTS.ASSIGN(id),
      { assigned_to, notes: notes ?? '' }
    );
    return data;
  },

  async confirmContacts(id: number): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      INCIDENT_ENDPOINTS.CONFIRM_CONTACTS(id)
    );
    return data;
  },

  async close(id: number, payload: { support_provided?: string; notes?: string }): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      INCIDENT_ENDPOINTS.CLOSE(id),
      payload
    );
    return data;
  },

  async fieldStaffDashboard(): Promise<CoordinatorDashboard> {
    const { data } = await api.get<CoordinatorDashboard>(
      INCIDENT_ENDPOINTS.DASHBOARD
    );
    return data;
  },
};


