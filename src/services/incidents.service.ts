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

  /**
   * POST /api/incidents/:id/assign/
   */
  async assign(id: number, assigned_to: number, notes?: string): Promise<any> {
    const { data } = await api.post(
      INCIDENT_ENDPOINTS.ASSIGN(id), // Ensure this endpoint exists in your constants
      { assigned_to, notes }
    );
    return data;
  },

  /**
   * POST /api/incidents/:id/confirm-contacts/
   */
  async confirmContacts(id: number): Promise<any> {
    const { data } = await api.post(
      INCIDENT_ENDPOINTS.CONFIRM_CONTACTS(id) // Or your specific endpoint constant
    );
    return data;
  },

  /**
   * POST or PATCH /api/incidents/:id/close/
   */
  async close(
    id: number, 
    payload: { support_provided?: string; notes?: string }
  ): Promise<any> {
    const { data } = await api.post(
      INCIDENT_ENDPOINTS.CLOSE(id), // Make sure this exists in constants
      payload
    );
    return data;
  },

  /**
   * Fetches the location and connection tracking log for an active device.
   * GET /api/incidents/device-history/{device_hash}/
   */
  async getDeviceHistory(deviceHash: string): Promise<any> {
    const { data } = await api.get(`/api/incidents/device-history/${deviceHash}/`);
    return data;
  },
  
  /**
   * Fetches the emergency trusted contacts tied to a victim's phone number.
   * GET /api/incidents/trusted-contacts/?phone_hash={phone_hash}
   */
  async getTrustedContacts(phoneHash: string): Promise<any> {
    const { data } = await api.get(`/api/incidents/trusted-contacts/`, {
      params: { phone_hash: phoneHash },
    });
    return data;
  }
};


