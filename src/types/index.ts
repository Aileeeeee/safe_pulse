// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = "COORDINATOR" | "FIELD_STAFF" | "ADMIN";

export interface Organisation {
  id:        number;
  name:      string;
  city:      string;
  state:     string;
  phone:     string;
  email:     string;
  is_active: boolean;
}

export interface User {
  id:                number;
  username:          string;
  first_name:        string;
  last_name:         string;
  email:             string;
  role:              UserRole;
  organisation:      Organisation | null;
  organisation_name: string;
  coverage_area:     string;
  created_at:        string;
}

export interface AuthTokens {
  access:  string;
  refresh: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SignupPayload {
  first_name:      string;
  last_name:       string;
  username:        string;   
  email:           string;
  password:        string;
  organisation_id: number;
  role:            UserRole;
}

export interface AuthResponse {
  user:     User;
  tokens:   AuthTokens;
  message?: string;
}

// ─── Incidents ────────────────────────────────────────────────────────────────

export type IncidentSeverity = "Critical" | "High" | "Medium" | "Low";
export type IncidentStatus = "New" | "Ongoing" | "Active" | "Closed" | "Resolved";

export interface TimelineEvent {
  time:        string;
  title:       string;
  description: string;
  status:      "done" | "pending";
  color:       "green" | "orange" | "blue" | "purple" | "grey";
}

export interface TrustedContact {
  name:        string;
  relation:    string;
  phone:       string;
  notified_at: string;
}

export interface Incident {
  id:                       number;
  incident_date:            string;
  incident_time:            string;
  reporting_channel:        string;
  follow_up_status:         string;
  is_anonymous:             boolean;
  created_at:               string;
  updated_at:               string;
  location:                 string;
  latitude:                 number | null;
  longitude:                number | null;
  location_accuracy:        number | null;
  location_confidence:      string;
  location_source:          string;
  incident_type:            string;
  severity_level:           IncidentSeverity;
  victim_age:               number | null;
  victim_gender:            string;
  perpetrator_relationship: string;
  support_provided:         string;
  reporter_type:            string;
  notes:                    string;
  is_acknowledged:          boolean;
  acknowledged_at:          string | null;
  device_hash:              string;
  last_verified_location:   string;
  timeline:                 TimelineEvent[];
  trusted_contacts:         TrustedContact[];
}

export interface CityCount {
  location: string;
  count:    number;
}

export interface CoordinatorDashboard {
  state:                   string;
  organisation:            string;
  role:                    string;
  total_incidents:         number;
  new_reports:             number;
  new_reports_delta:       number;
  critical_ongoing:        number;
  pending_acknowledgement: number;
  by_city:                 CityCount[];
  incidents:               Incident[];
}

export interface IncidentFilters {
  incident_type?:    string;
  severity_level?:   string;
  follow_up_status?: string;
  search?:           string;
  page?:             number;
  page_size?:        number;
}

export interface ApiError {
  message:  string;
  code?:    string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count:    number;
  next:     string | null;
  previous: string | null;
  results:  T[];
}

export interface ApiError {
  message:  string;
  code?:    string;
  details?: Record<string, string[]>;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
export interface ActiveAlert {
  id: number | string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  area: string;
  count: number;
}

export interface TopArea {
  name: string;
  percentage: number;
  count: number;
}
