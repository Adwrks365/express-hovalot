const DISMISS_KEY = "express_popup_dismissed_until";
const SUBMIT_KEY = "express_popup_submitted_until";

const DISMISS_MS = 3 * 24 * 60 * 60 * 1000;
const SUBMIT_MS = 30 * 24 * 60 * 60 * 1000;

function readUntil(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function writeUntil(key: string, until: number) {
  try {
    localStorage.setItem(key, String(until));
  } catch {
    /* private mode */
  }
}

export function isDismissCooldownActive(now = Date.now()): boolean {
  return readUntil(DISMISS_KEY) > now;
}

export function isSubmitCooldownActive(now = Date.now()): boolean {
  return readUntil(SUBMIT_KEY) > now;
}

export function recordPopupDismiss(now = Date.now()) {
  writeUntil(DISMISS_KEY, now + DISMISS_MS);
}

export function recordPopupSubmit(now = Date.now()) {
  writeUntil(SUBMIT_KEY, now + SUBMIT_MS);
}

export function clearPopupPersistenceForTests() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DISMISS_KEY);
  localStorage.removeItem(SUBMIT_KEY);
}
