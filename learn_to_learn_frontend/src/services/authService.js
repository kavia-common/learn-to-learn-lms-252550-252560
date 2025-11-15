/* eslint-disable no-console */
import { api, isFeatureEnabled } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * PUBLIC_INTERFACE
 * Authentication service supporting Strapi (remote) and local/mock mode.
 * - login: Strapi /auth/local with { identifier, password } -> { jwt, user }
 * - register: Strapi /auth/local/register with { username, email, password } -> { jwt, user }
 * - logout: Client-side only (Strapi typically stateless JWT)
 */
export const authService = {
  /**
   * PUBLIC_INTERFACE
   * Attempt login and return normalized user for authSlice.
   * When remote disabled, returns a mocked user echoing the provided name/email.
   */
  async login({ email, password, name, role = 'user', signal } = {}) {
    const remote = isFeatureEnabled('remote');
    if (!remote) {
      // Local/mock mode: return fake user
      return {
        id: 'local-user',
        name: name || (email ? email.split('@')[0] : 'User'),
        role,
        // token kept in memory only in mock mode
        token: 'mock-token',
      };
    }

    // Strapi: identifier = email or username
    try {
      const data = await api.jsonPost(endpoints.auth.login, { identifier: email, password }, { signal });
      const jwt = data?.jwt;
      const user = data?.user || {};
      if (!jwt || !user) {
        throw new Error('Invalid login response');
      }
      // Normalize user shape for our store
      return {
        id: String(user.id ?? user._id ?? user.email ?? 'user'),
        name: user.username || user.name || user.email || name || 'User',
        role: user.role?.name || role || 'user',
        token: jwt,
        raw: user,
      };
    } catch (e) {
      // Pass through meaningful error
      const msg = e?.message || 'Login failed';
      throw new Error(msg);
    }
  },

  /**
   * PUBLIC_INTERFACE
   * Register and return normalized user similar to login.
   */
  async register({ name, email, password, role = 'user', signal } = {}) {
    const remote = isFeatureEnabled('remote');
    if (!remote) {
      // Local/mock: emulate successful registration
      return {
        id: 'local-new',
        name: name || (email ? email.split('@')[0] : 'User'),
        role,
        token: 'mock-token',
      };
    }

    try {
      // Strapi requires username + email + password
      const payload = { username: name || (email ? email.split('@')[0] : 'user'), email, password };
      const data = await api.jsonPost(endpoints.auth.register, payload, { signal });
      const jwt = data?.jwt;
      const user = data?.user || {};
      if (!jwt || !user) {
        throw new Error('Invalid register response');
      }
      return {
        id: String(user.id ?? user._id ?? user.email ?? 'user'),
        name: user.username || user.name || user.email || name || 'User',
        role: user.role?.name || role || 'user',
        token: jwt,
        raw: user,
      };
    } catch (e) {
      const msg = e?.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  /**
   * PUBLIC_INTERFACE
   * Stateless logout. For Strapi JWT, nothing to revoke server-side by default.
   * We keep for API symmetry and future expansion.
   */
  async logout() {
    return true;
  },
};
