export type AccessibilityPrefs = {
  fontScale: number;
  grayscale: boolean;
  highContrast: boolean;
  negativeContrast: boolean;
  lightBackground: boolean;
  underlineLinks: boolean;
  readableFont: boolean;
};

export const A11Y_STORAGE_KEY = "express-hovalot-a11y";

export const defaultA11yPrefs: AccessibilityPrefs = {
  fontScale: 1,
  grayscale: false,
  highContrast: false,
  negativeContrast: false,
  lightBackground: false,
  underlineLinks: false,
  readableFont: false,
};

function normalizePrefs(raw: Partial<AccessibilityPrefs>): AccessibilityPrefs {
  return {
    fontScale:
      typeof raw.fontScale === "number" && raw.fontScale >= 0.9 && raw.fontScale <= 1.3
        ? raw.fontScale
        : defaultA11yPrefs.fontScale,
    grayscale: Boolean(raw.grayscale),
    highContrast: Boolean(raw.highContrast),
    negativeContrast: Boolean(raw.negativeContrast),
    lightBackground: Boolean(raw.lightBackground),
    underlineLinks: Boolean(raw.underlineLinks),
    readableFont: Boolean(raw.readableFont),
  };
}

export function loadA11yPrefs(): AccessibilityPrefs {
  if (typeof window === "undefined") return defaultA11yPrefs;
  try {
    const raw = localStorage.getItem(A11Y_STORAGE_KEY);
    if (!raw) return defaultA11yPrefs;
    return normalizePrefs(JSON.parse(raw) as Partial<AccessibilityPrefs>);
  } catch {
    return defaultA11yPrefs;
  }
}

export function saveA11yPrefs(prefs: AccessibilityPrefs) {
  localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
}

export function applyA11yPrefs(prefs: AccessibilityPrefs) {
  const root = document.documentElement;
  root.style.setProperty("--font-scale", String(prefs.fontScale));
  root.classList.toggle("a11y-grayscale", prefs.grayscale);
  root.classList.toggle("a11y-high-contrast", prefs.highContrast);
  root.classList.toggle("a11y-negative-contrast", prefs.negativeContrast);
  root.classList.toggle("a11y-light-background", prefs.lightBackground);
  root.classList.toggle("a11y-underline-links", prefs.underlineLinks);
  root.classList.toggle("a11y-readable-font", prefs.readableFont);
}
