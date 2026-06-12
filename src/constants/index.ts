export const API_BASE_URL = "https://safepulse-production-4e0d.up.railway.app";

export const INCIDENT_ENDPOINTS = {
  LIST:             "/api/incidents/incidents/",
  SUBMIT:           "/api/incidents/incidents/submit/",
  STATS:            "/api/incidents/incidents/stats/",
  DETAIL:           (id: number) => `/api/incidents/incidents/${id}/`,
  ACKNOWLEDGE:      (id: number) => `/api/incidents/incidents/${id}/acknowledge/`,
  ASSIGN:           (id: number) => `/api/incidents/incidents/${id}/assign/`,
  CONFIRM_CONTACTS: (id: number) => `/api/incidents/incidents/${id}/confirm-contacts/`,
  CLOSE:            (id: number) => `/api/incidents/incidents/${id}/close/`,
  DEVICE_HISTORY: (hash: string) => `/api/incidents/device/${hash}/`,
  DASHBOARD:             "/api/incidents/dashboard/",
  FIELD_DASHBOARD:       "/api/incidents/field-dashboard/",
  COORDINATOR_DASHBOARD: "/api/incidents/coordinator-dashboard/",
} as const;

export const AUTH_ENDPOINTS = {
  SIGNUP:               "/api/auth/signup/",
  LOGIN:                "/api/auth/login/",
  LOGOUT:               "/api/auth/logout/",
  PROFILE:              "/api/auth/profile/",
  REFRESH:              "/api/auth/refresh/",
  ORG_SEARCH:           "/api/auth/organisations/search/",
  USERNAME_SUGGESTIONS: "/api/auth/username-suggestions/",
  TEAM:                 "/api/auth/team/",
} as const;

export const TOKEN_KEY   = "sp_access";
export const REFRESH_KEY = "sp_refresh";

export const QUERY_KEYS = {
  ME:        ["me"],
  DASHBOARD: ["dashboard"],
  INCIDENTS: ["incidents"],
  INCIDENT:  (id: number) => ["incidents", id],
  STATS:     ["incidents", "stats"],
  ALERTS:    ["alerts"],
  TEAM:      ["team"],
  ACTIVITY:  ["activity"],
  ANALYTICS: ["analytics"],
} as const;
