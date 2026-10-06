/**
 * Authentication and password configuration for single-user access.
 * Default password can be customized here or changed in the app settings.
 */

export const DEFAULT_APP_PASSWORD = '123456';

const PASSWORD_KEY = 'app_user_password';
const AUTH_SESSION_KEY = 'app_auth_session';
const AUTH_PERSIST_KEY = 'app_auth_remembered';

/**
 * Returns the currently active password (either custom or default)
 */
export function getStoredPassword(): string {
  try {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_APP_PASSWORD;
  } catch {
    return DEFAULT_APP_PASSWORD;
  }
}

/**
 * Updates the user password in localStorage
 */
export function setStoredPassword(newPassword: string): boolean {
  try {
    if (!newPassword || newPassword.trim().length === 0) return false;
    localStorage.setItem(PASSWORD_KEY, newPassword.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if the user is currently authenticated
 */
export function isUserAuthenticated(): boolean {
  try {
    const sessionAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    const rememberAuth = localStorage.getItem(AUTH_PERSIST_KEY) === 'true';
    return sessionAuth || rememberAuth;
  } catch {
    return false;
  }
}

/**
 * Sets authentication status upon successful password entry
 */
export function setAuthenticated(rememberMe: boolean = true): void {
  try {
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    if (rememberMe) {
      localStorage.setItem(AUTH_PERSIST_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_PERSIST_KEY);
    }
  } catch {
    // Ignore storage issues
  }
}

/**
 * Logs the user out by clearing session and remembered auth
 */
export function logoutUser(): void {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.removeItem(AUTH_PERSIST_KEY);
  } catch {
    // Ignore storage issues
  }
}
