"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { incidentService } from "@/services/incidents.service"; 
import { useAuthStore } from "@/store/auth.store";
import { QUERY_KEYS, REFRESH_KEY } from "@/constants";
import type { IncidentFilters, LoginPayload, SignupPayload } from "@/types";


// ─── Auth Hooks ───────────────────────────────────────────────────────────────

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


// ─── Dashboards & Lists Hooks ─────────────────────────────────────────────────

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
      return data;
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


// ─── Case Mutation Action Hooks ───────────────────────────────────────────────

export function useAcknowledgeIncident() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      incidentService.acknowledge(id),

    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
      const prev = qc.getQueryData(QUERY_KEYS.INCIDENT(id));
      
      qc.setQueryData(QUERY_KEYS.INCIDENT(id), (old: any) => {
        if (!old) return old;

        const now = new Date();
        const formattedTime = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const updatedTimeline = old.timeline ? [...old.timeline] : [];
        
        updatedTimeline.unshift({
          time: formattedTime,
          title: "Triage completed",
          description: "Assigned priority",
          color: "orange",
          status: "done"
        });

        return {
          ...old,
          is_acknowledged: true,
          acknowledged_at: now.toISOString(),
          timeline: updatedTimeline
        };
      });
      return { prev };
    },

    onError: (_err, { id }, ctx) => {
      qc.setQueryData(QUERY_KEYS.INCIDENT(id), ctx?.prev);
    },

    onSettled: (_, __, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}

export function useAssignIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assigned_to, notes }: {
      id: number; assigned_to: number; notes?: string
    }) => incidentService.assign(id, assigned_to, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS });
    },
  });
}

export function useConfirmContacts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      incidentService.confirmContacts(id),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
    },
  });
}

export function useCloseIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: {
      id: number; support_provided?: string; notes?: string
    }) => incidentService.close(id, payload),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENT(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.INCIDENTS });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}

export function useTeam() {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM,
    queryFn:  authService.getTeam,
    staleTime: 60_000,
  });
}


// ─── Device & Tracking Resolvers ──────────────────────────────────────────────

export function useDeviceHistory(deviceHash: string) {
  // Guard clause against empty, "Unknown", or default unassigned hashes
  const isValidHash = !!deviceHash && 
    !deviceHash.toUpperCase().includes("UNREGIST") && 
    deviceHash !== "Unknown";

  return useQuery({
    queryKey: ["deviceHistory", deviceHash],
    queryFn: () => incidentService.getDeviceHistory(deviceHash),
    enabled: isValidHash,
    retry: false,
  });
}

export function useTrustedContacts(phoneHash: string) {
  // Guard clause matching the query string filter requirements
  const isValidHash = !!phoneHash && 
    !phoneHash.toUpperCase().includes("UNREGIST") && 
    phoneHash !== "Unknown";

  return useQuery({
    queryKey: ["trustedContacts", phoneHash],
    queryFn: () => incidentService.getTrustedContacts(phoneHash),
    enabled: isValidHash,
    retry: false,
  });
}
