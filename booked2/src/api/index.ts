/**
 * API Module Exports
 *
 * Central exports for the Cloudflare Worker API client
 */

export {
  apiClient,
  useApi,
  // Classes
  ApiError,
  // Types
  type ApiResponse,
  type Book,
  type ProgressUpdate,
  type ChapterNote,
  type ReadingStats,
  type HealthResponse,
  type NearViewParams,
  type NearCallParams,
} from './worker';

// Re-export the default
export { default } from './worker';
