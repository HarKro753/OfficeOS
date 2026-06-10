export {
  getCurrentUser,
  loginWithPassword,
  registerWithPassword,
} from "./api/auth-api";
export type {
  AuthCredentials,
  AuthResponse,
  AuthUser,
} from "./api/auth-api";
export { AuthGate } from "./components/auth-gate";
export { SignOutButton } from "./components/sign-out-button";
export { useAuthSession } from "./hooks/use-auth-session";
export {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "./stores/auth-session-storage";
export type { StoredAuthSession } from "./stores/auth-session-storage";
