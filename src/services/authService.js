const USERNAME_KEY = "dmp_username";

export function setCurrentUsername(username) {
  const value = String(username || "").trim();
  if (!value) {
    return;
  }
  sessionStorage.setItem(USERNAME_KEY, value);
}

export function getCurrentUsername() {
  return String(sessionStorage.getItem(USERNAME_KEY) || "").trim();
}

export function clearCurrentUsername() {
  sessionStorage.removeItem(USERNAME_KEY);
}

export function isPrivilegedUsername(username) {
  const value = String(username || "").trim().toLowerCase();
  return value === "admin" || value === "police";
}
