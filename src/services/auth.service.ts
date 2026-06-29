import api, { saveTokens, clearTokens } from "@/lib/api-client";
import { AUTH_ENDPOINTS } from "@/constants";
import type {
  AuthResponse,
  LoginPayload,
  SignupPayload,
  User,
  Organisation,
} from "@/types";

export const authService = {
  /**
   * POST /api/auth/login/
   * Django LoginView expects: { username, password }
   * Returns: { user, access, refresh }
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      payload
    );
    
    // FIXED: Pass the root data object because 'access' and 'refresh' are root level keys
    saveTokens(data); 
    return data;
  },

  /**
   * POST /api/auth/signup/
   * Django SignupView expects: { username, email, password, organisation_id, role }
   * Returns: { user, access, refresh, message }
   */
  async signup(payload: SignupPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.SIGNUP,
      payload
    );
    
    // FIXED: Save tokens on successful registration so they are immediately authenticated
    if (data.access) {
      saveTokens(data);
    }
    return data;
  },

  /**
   * POST /api/auth/logout/
   * Django LogoutView expects: { refresh }
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await api.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshToken });
    } finally {
      clearTokens();
    }
  },

  /**
   * GET /api/auth/profile/
   */
  async getProfile(): Promise<User> {
    const { data } = await api.get<User>(AUTH_ENDPOINTS.PROFILE);
    return data;
  },

  /**
   * GET /api/auth/organisations/search/?q=query
   */
  async searchOrganisations(q: string): Promise<Organisation[]> {
    const { data } = await api.get<Organisation[]>(
      AUTH_ENDPOINTS.ORG_SEARCH,
      { params: { q } }
    );
    return data;
  },

  async getTeam(): Promise<User[]> {
    const { data } = await api.get<User[]>(AUTH_ENDPOINTS.TEAM);
    return data;
  },
};
