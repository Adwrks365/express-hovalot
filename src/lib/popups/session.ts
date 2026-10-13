const SESSION_AUTO_KEY = "express_popup_auto_shown_session";

function pathKey(path: string) {
  return `express_popup_shown_${path}`;
}

export function wasAutoShownThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_AUTO_KEY) === "1";
  } catch {
    return false;
  }
}

export function markAutoShownThisSession() {
  try {
    sessionStorage.setItem(SESSION_AUTO_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function wasAutoShownOnPath(path: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(pathKey(path)) === "1";
  } catch {
    return false;
  }
}

export function markAutoShownOnPath(path: string) {
  try {
    sessionStorage.setItem(pathKey(path), "1");
  } catch {
    /* ignore */
  }
}

export function clearPopupSessionForTests() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_AUTO_KEY);
  } catch {
    /* ignore */
  }
}
