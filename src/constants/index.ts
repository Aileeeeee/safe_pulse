export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://safepulse-production-4e0d.up.railway.app";

export const AUTH_ENDPOINTS = {
  SIGNUP:     "/api/auth/signup/",
  LOGIN:      "/api/auth/login/",
  LOGOUT:     "/api/auth/logout/",
  PROFILE:    "/api/auth/profile/",
  REFRESH:    "/api/auth/refresh/",
  ORG_SEARCH: "/api/auth/organisations/search/",
} as const;

export const INCIDENT_ENDPOINTS = {
  LIST:                  "/api/incidents/incidents/",
  SUBMIT:                "/api/incidents/incidents/submit/",
  STATS:                 "/api/incidents/incidents/stats/",
  ACKNOWLEDGE:           (id: number) => `/api/incidents/incidents/${id}/acknowledge/`,
  DETAIL:                (id: number) => `/api/incidents/incidents/${id}/`,
  DASHBOARD:             "/api/incidents/dashboard/",
  COORDINATOR_DASHBOARD: "/api/incidents/coordinator-dashboard/",
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