// Minimal logger utility to gate development logs and provide levels.
export const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev && typeof console !== 'undefined' && console.debug) {
      console.debug(...args);
    }
  },
  info: (...args: unknown[]) => {
    if (isDev && typeof console !== 'undefined' && console.info) {
      console.info(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (typeof console !== 'undefined' && console.warn) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    if (typeof console !== 'undefined' && console.error) {
      console.error(...args);
    }
  },
};
