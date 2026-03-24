"use client";

const AUTH_STORAGE_KEY = "booking_auth";

export type StoredAuthUser = {
  id: string;
  email: string;
  name: string;
};

export type StoredAuthState = {
  user: StoredAuthUser | null;
  accessToken: string | null;
};

export function getStoredAuthState(): StoredAuthState {
  if (typeof window === "undefined") {
    return { user: null, accessToken: null };
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return { user: null, accessToken: null };
  }

  try {
    return JSON.parse(raw) as StoredAuthState;
  } catch {
    return { user: null, accessToken: null };
  }
}

export function setStoredAuthState(nextState: StoredAuthState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextState));
}

export function clearStoredAuthState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
