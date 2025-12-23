import { BookEntry, ProgressUpdate, ReadingStats, BookyContract } from '@/config';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

interface WalletSelectorHook {
  signedAccountId: string | null;
  viewFunction: (params: { contractId: string; method: string; args?: Record<string, unknown> }) => Promise<any>;
  callFunction: (params: { contractId: string; method: string; args?: Record<string, unknown> }) => Promise<any>;
}

const CONTRACT = BookyContract as string;

// View Functions (read-only, no gas)
export const getLibrary = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string
): Promise<BookEntry[]> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_library',
    args: { account_id: accountId },
  });
};

export const getBook = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string,
  isbn: string
): Promise<BookEntry | null> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_book',
    args: { account_id: accountId, isbn },
  });
};

export const getTotalBooks = async (
  viewFunction: WalletSelectorHook['viewFunction']
): Promise<number> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_total_books',
  });
};

export const getChapterNote = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string,
  isbn: string,
  chapter: number
): Promise<string | null> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_chapter_note',
    args: { account_id: accountId, isbn, chapter },
  });
};

export const getAllChapterNotes = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string,
  isbn: string
): Promise<Record<number, string>> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_all_chapter_notes',
    args: { account_id: accountId, isbn },
  });
};

export const getReadingStats = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string
): Promise<ReadingStats> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_reading_stats',
    args: { account_id: accountId },
  });
};

export const getCurrentlyReading = async (
  viewFunction: WalletSelectorHook['viewFunction'],
  accountId: string
): Promise<BookEntry[]> => {
  return await viewFunction({
    contractId: CONTRACT,
    method: 'get_currently_reading',
    args: { account_id: accountId },
  });
};

// Call Functions (write, require gas and wallet signature)
export const addBook = async (
  callFunction: WalletSelectorHook['callFunction'],
  book: BookEntry
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'add_book',
    args: { book },
  });
};

export const updateBook = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string,
  updatedBook: BookEntry
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'update_book',
    args: { isbn, updated_book: updatedBook },
  });
};

export const deleteBook = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'delete_book',
    args: { isbn },
  });
};

export const updateReadingProgress = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string,
  progress: ProgressUpdate
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'update_reading_progress',
    args: { isbn, progress },
  });
};

export const addChapterNote = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string,
  chapter: number,
  note: string
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'add_chapter_note',
    args: { isbn, chapter, note },
  });
};

export const deleteChapterNote = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string,
  chapter: number
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'delete_chapter_note',
    args: { isbn, chapter },
  });
};

export const markCompleted = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'mark_completed',
    args: { isbn },
  });
};

export const startReading = async (
  callFunction: WalletSelectorHook['callFunction'],
  isbn: string,
  startingChapter: number | null = 1
): Promise<void> => {
  await callFunction({
    contractId: CONTRACT,
    method: 'start_reading',
    args: { isbn, starting_chapter: startingChapter },
  });
};

// Custom hook for convenient contract interaction
export const useBookyContract = () => {
  const { signedAccountId, viewFunction, callFunction } = useWalletSelector() as WalletSelectorHook;

  return {
    accountId: signedAccountId,
    // View functions
    getLibrary: (accountId?: string) => getLibrary(viewFunction, accountId || signedAccountId || ''),
    getBook: (isbn: string, accountId?: string) => getBook(viewFunction, accountId || signedAccountId || '', isbn),
    getTotalBooks: () => getTotalBooks(viewFunction),
    getChapterNote: (isbn: string, chapter: number, accountId?: string) =>
      getChapterNote(viewFunction, accountId || signedAccountId || '', isbn, chapter),
    getAllChapterNotes: (isbn: string, accountId?: string) =>
      getAllChapterNotes(viewFunction, accountId || signedAccountId || '', isbn),
    getReadingStats: (accountId?: string) =>
      getReadingStats(viewFunction, accountId || signedAccountId || ''),
    getCurrentlyReading: (accountId?: string) =>
      getCurrentlyReading(viewFunction, accountId || signedAccountId || ''),

    // Call functions (require wallet connection)
    addBook: (book: BookEntry) => addBook(callFunction, book),
    updateBook: (isbn: string, updatedBook: BookEntry) => updateBook(callFunction, isbn, updatedBook),
    deleteBook: (isbn: string) => deleteBook(callFunction, isbn),
    updateReadingProgress: (isbn: string, progress: ProgressUpdate) =>
      updateReadingProgress(callFunction, isbn, progress),
    addChapterNote: (isbn: string, chapter: number, note: string) =>
      addChapterNote(callFunction, isbn, chapter, note),
    deleteChapterNote: (isbn: string, chapter: number) =>
      deleteChapterNote(callFunction, isbn, chapter),
    markCompleted: (isbn: string) => markCompleted(callFunction, isbn),
    startReading: (isbn: string, startingChapter?: number | null) =>
      startReading(callFunction, isbn, startingChapter),
  };
};
