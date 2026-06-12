"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { incidentService } from "@/services/incidents.service";
import { useAuthStore } from "@/store/auth.store";
import { QUERY_KEYS, REFRESH_KEY } from "@/constants";
import type { IncidentFilters, LoginPayload, SignupPayload } from "@/types";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useMe() {
  return useQuery({
    queryKey: QUERY_KEYS.ME,
    queryFn:  authService.getProfile,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const router  = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setUser(data.user);
      router.push("/dashboard");
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    // Don't redirect — SignupForm handles the OTP step after this
  });
}

export function useLogout() {
  const router    = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);
  const qc        = useQueryClient();

  return useMutation({
    mutationFn: () => {
      const refresh = Cookies.get(REFRESH_KEY) ?? "";
      return authService.logout(refresh);
    },
    onSettled: () => {
      clearUser();
      qc.clear();
      router.push("/login");
    },
  });
}

// Replace useDashboard and useCoordinatorDashboard with these:

export function useCoordinatorDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn:  incidentService.coordinatorDashboard,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useFieldStaffDashboard() {
  return useQuery({
    queryKey: [...QUERY_KEYS.DASHBOARD, "field"],
    queryFn:  incidentService.fieldStaffDashboard,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useIncidents(filters?: IncidentFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.INCIDENTS, filters],
    queryFn: async () => {
      const data = await incidentService.list(filters);
      return data; // 
    },
    staleTime: 10_000,
    refetchInterval: 20_000,
  });
}

export function useIncident(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.INCIDENT(id),
    queryFn:  () => incidentService.detail(id),
    enabled:  !!id,
  });
}

export function useAcknowledgeIncident() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      incidentService.acknowledge(id),

    // Optimistic update — flip is_acknowledged immediately in UI
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
      const prev = qc.getQueryData(QUERY_KEYS.INCIDENT(id));
      qc.setQueryData(QUERY_KEYS.INCIDENT(id), (old: unknown) =>
        old
          ? {
              ...(old as object),
              is_acknowledged:  true,
              acknowledged_at:  new Date().toISOString(),
            }
          : old
      );
      return { prev };
    },

    onError: (_err, { id }, ctx) => {
      // Roll back if API call fails
      qc.setQueryData(QUERY_KEYS.INCIDENT(id), ctx?.prev);
    },

    onSettled: () => {
      // Refetch everything to sync with server
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}
  
