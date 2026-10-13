import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

// useState backed by sessionStorage: survives mobile browser reloading the page
// after returning from the phone dialer.
export function usePersistedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = sessionStorage.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

// Restores window scroll once `ready` flips true; saves it on scroll.
export function usePersistedScroll(key: string, ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const y = Number(sessionStorage.getItem(key));
    if (y) requestAnimationFrame(() => window.scrollTo(0, y));
    const onScroll = () => sessionStorage.setItem(key, String(window.scrollY));
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key, ready]);
}
