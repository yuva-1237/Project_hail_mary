import type { SpacecraftState } from "../data/spacecraft";

/**
 * A mock observability client that mimics OpenTelemetry/Sentry structured logging.
 * In a real environment, this would ship logs via OTLP or HTTP to an APM tool.
 */
export const telemetryLogger = {
  info: (event: string, data?: Record<string, any>) => {
    console.log(`[TELEMETRY][INFO] ${event}`, data || '');
  },
  
  warn: (event: string, data?: Record<string, any>) => {
    console.warn(`[TELEMETRY][WARN] ${event}`, data || '');
  },

  error: (event: string, error: Error, context?: Record<string, any>) => {
    console.error(`[TELEMETRY][ERROR] ${event}`, { error: error.message, stack: error.stack, ...context });
  },

  logStateTransition: (oldState: SpacecraftState, newState: SpacecraftState, reason: string) => {
    console.groupCollapsed(`[TELEMETRY][STATE_TRANSITION] ${reason}`);
    console.log("Previous State:", oldState);
    console.log("New State:", newState);
    console.groupEnd();
  },
  
  trackMetric: (name: string, value: number, tags?: Record<string, string>) => {
    // Mimics statsd / datadog metric tracking
    console.log(`[METRIC] ${name}: ${value}`, tags || '');
  }
};
