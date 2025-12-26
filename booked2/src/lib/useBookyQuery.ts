import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useBookyContract } from '@/lib/bookyContract';
import { BookEntry, ProgressUpdate } from '@/config';

// ========================================
// QUERY KEYS - Centralized cache key management
// ========================================
export const queryKeys = {
  library: (accountId: string) => ['library', accountId] as const,
  book: (accountId: string, isbn: string) => ['book', accountId, isbn] as const,
  totalBooks: () => ['totalBooks'] as const,
  chapterNote: (accountId: string, isbn: string, chapter: number) =>
    ['chapterNote', accountId, isbn, chapter] as const,
  allChapterNotes: (accountId: string, isbn: string) =>
    ['allChapterNotes', accountId, isbn] as const,
  readingStats: (accountId: string) => ['readingStats', accountId] as const,
  currentlyReading: (accountId: string) =>
    ['currentlyReading', accountId] as const,
  followedAccounts: (accountId: string) =>
    ['followedAccounts', accountId] as const,
  userLibrary: (accountId: string) => ['userLibrary', accountId] as const,
  userStats: (accountId: string) => ['userStats', accountId] as const,
} as const;

// ========================================
// QUERY HOOKS - Cached blockchain read operations
// ========================================
export const useLibrary = (accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore - Type compatibility issue between contract types
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.library(accountId || contract.accountId || 'unknown'),
    // @ts-ignore
    queryFn: () => contract.getLibrary(accountId),
    enabled: !!(accountId || contract.accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes - books don't change often
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

export const useBook = (isbn: string, accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.book(
      accountId || contract.accountId || 'unknown',
      isbn,
    ),
    // @ts-ignore
    queryFn: () => contract.getBook(isbn, accountId),
    enabled: !!isbn && !!(accountId || contract.accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
};

export const useTotalBooks = () => {
  const contract = useBookyContract();

  return useQuery({
    queryKey: queryKeys.totalBooks(),
    queryFn: () => contract.getTotalBooks(),
    staleTime: 2 * 60 * 1000, // 2 minutes - global stats
    gcTime: 5 * 60 * 1000,
  });
};

export const useChapterNote = (
  isbn: string,
  chapter: number,
  accountId?: string | null,
) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.chapterNote(
      accountId || contract.accountId || 'unknown',
      isbn,
      chapter,
    ),
    // @ts-ignore
    queryFn: () => contract.getChapterNote(isbn, chapter, accountId),
    enabled: !!isbn && !!(accountId || contract.accountId),
    staleTime: 10 * 60 * 1000, // 10 minutes - notes are relatively stable
    gcTime: 30 * 60 * 1000,
  });
};

export const useAllChapterNotes = (isbn: string, accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.allChapterNotes(
      accountId || contract.accountId || 'unknown',
      isbn,
    ),
    // @ts-ignore
    queryFn: () => contract.getAllChapterNotes(isbn, accountId),
    enabled: !!isbn && !!(accountId || contract.accountId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
  });
};

export const useReadingStats = (accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.readingStats(
      accountId || contract.accountId || 'unknown',
    ),
    // @ts-ignore
    queryFn: () => contract.getReadingStats(accountId),
    enabled: !!(accountId || contract.accountId),
    staleTime: 60 * 1000, // 1 minute - stats update periodically
    gcTime: 5 * 60 * 1000,
  });
};

export const useCurrentlyReading = (accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.currentlyReading(
      accountId || contract.accountId || 'unknown',
    ),
    // @ts-ignore
    queryFn: () => contract.getCurrentlyReading(accountId),
    enabled: !!(accountId || contract.accountId),
    staleTime: 60 * 1000, // 1 minute - changes when books are started/completed
    gcTime: 5 * 60 * 1000,
  });
};

// ========================================
// COMPOSITE HOOKS - Combine multiple queries
// ========================================
export const useDashboard = (accountId?: string | null) => {
  const contract = useBookyContract();
  const effectiveAccountId = accountId || contract.accountId;

  const library = useLibrary(effectiveAccountId);
  const currentlyReading = useCurrentlyReading(effectiveAccountId);
  const stats = useReadingStats(effectiveAccountId);

  // Derive recent books from library
  // @ts-ignore
  const recentBooks = library.data
    ? // @ts-ignore
      library.data.slice(-3).reverse()
    : [];

  return {
    library: library.data,
    currentlyReading: currentlyReading.data,
    stats: stats.data,
    recentBooks,
    loading: library.isLoading || currentlyReading.isLoading || stats.isLoading,
    error: library.error || currentlyReading.error || stats.error,
    refetch: () => {
      library.refetch();
      currentlyReading.refetch();
      stats.refetch();
    },
  };
};

// ========================================
// MUTATION HOOKS - Cached blockchain write operations
// ========================================
export const useAddBook = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId;

  return useMutation({
    // @ts-ignore
    mutationFn: (book: BookEntry) => contract.addBook(book),
    onSuccess: (_data: unknown, book: BookEntry) => {
      // Invalidate library cache
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.library(accountId),
        });
      }
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId;

  return useMutation({
    // @ts-ignore
    mutationFn: ({
      isbn,
      updatedBook,
    }: {
      isbn: string;
      updatedBook: BookEntry;
    }) => contract.updateBook(isbn, updatedBook),
    onSuccess: (_data: unknown, { isbn, updatedBook }) => {
      // Invalidate library cache
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.library(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.book(accountId, isbn),
        });
      }
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId;

  return useMutation({
    // @ts-ignore
    mutationFn: ({
      isbn,
      accountId: deleteAccountId,
    }: {
      isbn: string;
      accountId: string;
    }) => contract.deleteBook(isbn),
    onSuccess: (_data: unknown, { isbn, accountId: deleteAccountId }) => {
      // Invalidate library and specific book cache
      // @ts-ignore
      queryClient.invalidateQueries({
        queryKey: queryKeys.library(deleteAccountId),
      });
      // @ts-ignore
      queryClient.invalidateQueries({
        queryKey: queryKeys.book(deleteAccountId, isbn),
      });
    },
  });
};

export const useUpdateReadingProgress = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: ({
      isbn,
      progress,
    }: {
      isbn: string;
      progress: ProgressUpdate;
    }) => contract.updateReadingProgress(isbn, progress),
    onSuccess: (_data: unknown, { isbn }) => {
      // Invalidate reading-related queries
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.library(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.currentlyReading(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.readingStats(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.book(accountId, isbn),
        });
      }
    },
  });
};

export const useAddChapterNote = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: ({
      isbn,
      chapter,
      note,
    }: {
      isbn: string;
      chapter: number;
      note: string;
    }) => contract.addChapterNote(isbn, chapter, note),
    onSuccess: (_data: unknown, { isbn, chapter }) => {
      // Invalidate chapter note queries
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.chapterNote(accountId, isbn, chapter),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.allChapterNotes(accountId, isbn),
        });
      }
    },
  });
};

export const useDeleteChapterNote = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: ({ isbn, chapter }: { isbn: string; chapter: number }) =>
      contract.deleteChapterNote(isbn, chapter),
    onSuccess: (_data: unknown, { isbn, chapter }) => {
      // Invalidate chapter note queries
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.chapterNote(accountId, isbn, chapter),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.allChapterNotes(accountId, isbn),
        });
      }
    },
  });
};

export const useMarkCompleted = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: (isbn: string) => contract.markCompleted(isbn),
    onSuccess: (_data: unknown, isbn: string) => {
      // Invalidate reading-related queries
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.library(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.currentlyReading(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.readingStats(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.book(accountId, isbn),
        });
      }
    },
  });
};

export const useStartReading = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: ({
      isbn,
      startingChapter,
    }: {
      isbn: string;
      startingChapter?: number | null;
    }) => contract.startReading(isbn, startingChapter),
    onSuccess: (_data: unknown, isbn: string) => {
      // Invalidate reading-related queries
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.library(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.currentlyReading(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.readingStats(accountId),
        });
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.book(accountId, isbn),
        });
      }
    },
  });
};

// ========================================
// FOLLOWING FEATURE - Track other users' libraries
// ========================================
export const useFollowedAccounts = (accountId?: string | null) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.followedAccounts(
      accountId || contract.accountId || 'unknown',
    ),
    // @ts-ignore
    queryFn: () => contract.getFollowedAccounts(accountId),
    enabled: !!(accountId || contract.accountId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserLibrary = (accountId: string) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.userLibrary(accountId),
    // @ts-ignore
    queryFn: () => contract.getUserLibrary(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes - libraries don't change often
  });
};

export const useUserStats = (accountId: string) => {
  const contract = useBookyContract();

  // @ts-ignore
  return useQuery({
    // @ts-ignore
    queryKey: queryKeys.userStats(accountId),
    // @ts-ignore
    queryFn: () => contract.getUserStats(accountId),
    enabled: !!accountId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFollowAccount = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: (accountIdToFollow: string) =>
      contract.followAccount(accountIdToFollow),
    onSuccess: () => {
      // Invalidate followed accounts list
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.followedAccounts(accountId),
        });
      }
    },
  });
};

export const useUnfollowAccount = () => {
  const queryClient = useQueryClient();
  const contract = useBookyContract();
  const accountId = contract.accountId || '';

  return useMutation({
    // @ts-ignore
    mutationFn: (accountIdToUnfollow: string) =>
      contract.unfollowAccount(accountIdToUnfollow),
    onSuccess: () => {
      // Invalidate followed accounts list
      // @ts-ignore
      if (accountId) {
        // @ts-ignore
        queryClient.invalidateQueries({
          queryKey: queryKeys.followedAccounts(accountId),
        });
      }
    },
  });
};
