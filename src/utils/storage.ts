// Safe, resilient local storage utility for Hishab Khata
export const STORAGE_KEYS = {
  EXPENSES: 'hishab_expenses_v3',
  CATEGORIES: 'hishab_categories_v3',
  SOURCES: 'hishab_sources_v3',
  LOANS: 'hishab_loans_v3',
  PROFILE: 'hishab_profile_v3',
  INITIALIZED: 'hishab_initialized_v3',
};

// Check if localStorage is usable
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function setStoredItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
    return false;
  }
}

export function removeStoredItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing ${key}:`, err);
  }
}
