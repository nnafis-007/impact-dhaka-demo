const USERNAME_KEY = "dmp_username";
export const AUTH_CHANGED_EVENT = "dmp-auth-changed";

let memoryUsername = "";

function readStoredUsername() {
  try {
    return String(sessionStorage.getItem(USERNAME_KEY) || "").trim();
  } catch {
    return memoryUsername;
  }
}

export function setCurrentUsername(username) {
  const value = String(username || "").trim();
  if (!value) {
    return;
  }

  memoryUsername = value;
  try {
    sessionStorage.setItem(USERNAME_KEY, value);
  } catch {
    // Keep in-memory fallback for restricted browser storage environments.
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getCurrentUsername() {
  return readStoredUsername();
}

export function clearCurrentUsername() {
  memoryUsername = "";
  try {
    sessionStorage.removeItem(USERNAME_KEY);
  } catch {
    // Ignore storage errors in restricted environments.
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function isPrivilegedUsername(username) {
  const value = String(username || "").trim().toLowerCase();
  return value === "admin" || value === "police";
}
