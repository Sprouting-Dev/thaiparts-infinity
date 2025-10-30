/**
 * Central logger with minimal production-safe defaults.
 *
 * Behavior (conservative):
 * - debug/info: only output in development
 * - warn/error: forwarded to telemetry in production (if adapter registered);
 *   on server there is a console fallback so infra sees warnings/errors.
 *
 * Configuration:
 * - LOG_LEVEL env var can override default level (debug|info|warn|error|off)
 * - To wire telemetry: call `setTelemetryAdapter(fn)` at app startup where `fn` is
 *   a function receiving { level, payload } and forwarding to your telemetry SDK.
 */

const isDev = process.env.NODE_ENV === 'development';
const isServer = typeof window === 'undefined';

type Level = 'debug' | 'info' | 'warn' | 'error' | 'off';

const levelPriority: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  off: 100,
};

// Determine configured level. Priority:
// - explicit LOG_LEVEL env var
// - dev => debug
// - prod => warn
const envLevel = (process.env.LOG_LEVEL || '').toLowerCase() as Level | '';
const defaultLevel: Level = isDev ? 'debug' : 'warn';
const CONFIG_LEVEL: Level = (envLevel && (envLevel as Level)) || defaultLevel;

const shouldEmit = (level: Level) =>
  levelPriority[level] >= levelPriority[CONFIG_LEVEL];

// Telemetry adapter hook: if host app defines globalThis.__LOGGER_TELEMETRY,
// this function will be called with ({level, message, meta}). Use this to
// forward events to Sentry/other backends without adding an SDK here.
async function sendTelemetry(level: Level, payload: unknown[]) {
  try {
    const maybeGlobal = globalThis as unknown as {
      __LOGGER_TELEMETRY?: unknown;
    };
    const hook = maybeGlobal.__LOGGER_TELEMETRY;
    if (typeof hook === 'function') {
      // call synchronously or asynchronously depending on host implementation
      try {
        hook({ level, payload });
      } catch (e) {
        // swallow — telemetry failures should not crash app
        if (isServer && console && console.error) {
          console.error('[logger] telemetry hook failed', e);
        }
      }
    } else {
      // no telemetry configured: on server, preserve warn/error to console so infra sees them
      if (isServer && (level === 'warn' || level === 'error')) {
        if (console && console[level]) console[level](...payload);
      }
      // on client and no telemetry: avoid spamming console in production
    }
  } catch (err) {
    if (isServer && console && console.error)
      console.error('[logger] sendTelemetry error', err);
  }
}

/**
 * Register a telemetry adapter function for production log forwarding.
 * Example:
 *   import { setTelemetryAdapter } from '@/lib/logger';
 *   setTelemetryAdapter(({ level, payload }) => {
 *     // forward to Sentry, Logflare, etc.
 *   });
 */
export function setTelemetryAdapter(
  fn: (ev: { level: Level; payload: unknown[] }) => void
) {
  const maybeGlobal = globalThis as unknown as { __LOGGER_TELEMETRY?: unknown };
  maybeGlobal.__LOGGER_TELEMETRY = fn;
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (!isDev) return;
    if (!shouldEmit('debug')) return;
    if (typeof console !== 'undefined' && console.debug) console.debug(...args);
  },

  info: (...args: unknown[]) => {
    if (!isDev) return;
    if (!shouldEmit('info')) return;
    if (typeof console !== 'undefined' && console.info) console.info(...args);
  },

  warn: (...args: unknown[]) => {
    if (!shouldEmit('warn')) return;
    // In development, just console.warn
    if (isDev) {
      if (typeof console !== 'undefined' && console.warn) console.warn(...args);
      return;
    }
    // Production: forward to telemetry (and server console as a fallback)
    void sendTelemetry('warn', args);
  },

  error: (...args: unknown[]) => {
    if (!shouldEmit('error')) return;
    if (isDev) {
      if (typeof console !== 'undefined' && console.error)
        console.error(...args);
      return;
    }
    // Production: forward to telemetry (and server console as a fallback)
    void sendTelemetry('error', args);
  },
};

export { isDev };
