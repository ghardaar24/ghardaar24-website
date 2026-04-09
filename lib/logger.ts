/**
 * Development-only logger utility
 * Prevents console output from leaking to production browser consoles
 * Use this instead of raw console.log/console.error in client components
 */

export const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(...args);
  }
};

export const devError = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.error(...args);
  }
};

export const devWarn = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") {
    console.warn(...args);
  }
};
