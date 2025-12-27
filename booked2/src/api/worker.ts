/**
 * API Client for Cloudflare Worker Backend
 *
 * This module provides a TypeScript client for communicating with the
 * Cloudflare Worker backend API endpoints.
 */

// Types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Book {
  isbn: string;
  title: string;
  author: string;
  acquisition_date: string;
  condition: string;
  personal_comments: string;
  media_hash: string | null;
  reading_status: 'ToRead' | 'Reading' | 'Completed' | 'OnHold' | 'Abandoned';
  current_chapter: number;
  total_chapters: number;
  chapters_read: number[];
  last_read_position: string;
  last_read_date: string | null;
  chapter_notes: Record<number, string>;
  added_at?: string;
}

export interface ProgressUpdate {
  current_chapter: number | null;
  chapters_completed: number[];
  last_read_position: string | null;
  last_read_date: string | null;
  reading_status:
    | 'ToRead'
    | 'Reading'
    | 'Completed'
    | 'OnHold'
    | 'Abandoned'
    | null;
}

export interface ChapterNote {
  isbn: string;
  chapter: number;
  note: string;
  added_at: string;
}

export interface ReadingStats {
  account_id: string;
  total_books: number;
  books_read: number;
  books_reading: number;
  books_to_read: number;
  total_chapters_completed: number;
  reading_streak: number;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
  network?: string;
}

export interface NearViewParams {
  contractId: string;
  methodName: string;
  args?: Record<string, unknown>;
}

export interface NearCallParams {
  signedTransaction: string;
}

// API Configuration
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:8787'
  : window.location.origin;

// Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client Class
class WorkerApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a fetch request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Handle non-JSON responses
      if (!response.headers.get('content-type')?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError(
            `HTTP error! status: ${response.status}`,
            response.status,
          );
        }
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP error! status: ${response.status}`,
          response.status,
          data,
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError(
          'Network error - unable to connect to the server',
          0,
          error,
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        0,
        error,
      );
    }
  }

  // Health Endpoints

  /**
   * Check API health
   */
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/api/health');
  }

  /**
   * Check worker health
   */
  async checkWorkerHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  // Book Endpoints

  /**
   * Get all books for an account
   */
  async getBooks(
    accountId: string,
  ): Promise<{ books: Book[]; account_id: string; total: number }> {
    return this.request(
      `/api/books?account_id=${encodeURIComponent(accountId)}`,
    );
  }

  /**
   * Add a new book
   */
  async addBook(
    book: Omit<Book, 'added_at' | 'chapters_read' | 'chapter_notes'>,
  ): Promise<ApiResponse<{ success: boolean; message: string; book: Book }>> {
    return this.request('/api/books', {
      method: 'POST',
      body: JSON.stringify(book),
    });
  }

  // Progress Endpoints

  /**
   * Update reading progress for a book
   */
  async updateProgress(
    isbn: string,
    progress: ProgressUpdate,
  ): Promise<
    ApiResponse<{
      success: boolean;
      message: string;
      isbn: string;
      progress: ProgressUpdate;
    }>
  > {
    return this.request('/api/books/progress', {
      method: 'PUT',
      body: JSON.stringify({ isbn, progress }),
    });
  }

  // Notes Endpoints

  /**
   * Add a chapter note
   */
  async addNote(
    isbn: string,
    chapter: number,
    note: string,
  ): Promise<
    ApiResponse<{
      success: boolean;
      message: string;
      isbn: string;
      chapter: number;
      note: string;
      added_at: string;
    }>
  > {
    return this.request('/api/books/notes', {
      method: 'POST',
      body: JSON.stringify({ isbn, chapter, note }),
    });
  }

  // Statistics Endpoints

  /**
   * Get reading statistics for an account
   */
  async getStats(accountId: string): Promise<ReadingStats> {
    return this.request(
      `/api/stats?account_id=${encodeURIComponent(accountId)}`,
    );
  }

  // NEAR Proxy Endpoints

  /**
   * Proxy a NEAR view call
   */
  async nearView(params: NearViewParams): Promise<unknown> {
    return this.request('/api/near/view', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Proxy a NEAR call (transaction)
   */
  async nearCall(
    params: NearCallParams,
  ): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return this.request('/api/near/call', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Helper Methods

  /**
   * Update the base URL (useful for testing or dynamic environments)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Create and export singleton instance
export const apiClient = new WorkerApiClient();

// Export types
export type {
  Book,
  ProgressUpdate,
  ChapterNote,
  ReadingStats,
  HealthResponse,
  NearViewParams,
  NearCallParams,
};

// Export hooks for React integration
export const useApi = () => {
  return {
    api: apiClient,
    // Convenience methods
    checkHealth: () => apiClient.checkHealth(),
    getBooks: (accountId: string) => apiClient.getBooks(accountId),
    addBook: (
      book: Omit<Book, 'added_at' | 'chapters_read' | 'chapter_notes'>,
    ) => apiClient.addBook(book),
    updateProgress: (isbn: string, progress: ProgressUpdate) =>
      apiClient.updateProgress(isbn, progress),
    addNote: (isbn: string, chapter: number, note: string) =>
      apiClient.addNote(isbn, chapter, note),
    getStats: (accountId: string) => apiClient.getStats(accountId),
    nearView: (params: NearViewParams) => apiClient.nearView(params),
    nearCall: (params: NearCallParams) => apiClient.nearCall(params),
  };
};

export default apiClient;
