import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';

import { ProgressUpdate } from '@/config';

// TypeScript types
export interface ProgressDraft {
  isbn: string;
  progressData: ProgressUpdate;
  timestamp: number;
}

interface ProgressContextType {
  // State
  drafts: Map<string, ProgressDraft>; // Key: isbn
  hasUnsavedChanges: Map<string, boolean>;

  // Methods
  getDraft: (isbn: string) => ProgressDraft | undefined;
  setDraft: (isbn: string, progressData: ProgressUpdate) => void;
  clearDraft: (isbn: string) => void;
  clearAllDrafts: () => void;
  hasChanges: (isbn: string) => boolean;
  markAsSaved: (isbn: string) => void;

  // Computed
  getDraftCount: () => number;
}

export const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);

interface ProgressProviderProps {
  children: ReactNode;
}

export const ProgressProvider: React.FC<ProgressProviderProps> = ({
  children,
}) => {
  const [drafts, setDrafts] = useState<Map<string, ProgressDraft>>(
    new Map(),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<
    Map<string, boolean>
  >(new Map());

  // Get a specific draft
  const getDraft = useCallback(
    (isbn: string): ProgressDraft | undefined => {
      return drafts.get(isbn);
    },
    [drafts],
  );

  // Set/update a draft
  const setDraft = useCallback(
    (isbn: string, progressData: ProgressUpdate) => {
      const timestamp = Date.now();

      setDrafts((prev) => {
        const newDrafts = new Map(prev);
        newDrafts.set(isbn, {
          isbn,
          progressData,
          timestamp,
        });
        return newDrafts;
      });

      setHasUnsavedChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(isbn, true);
        return newChanges;
      });
    },
    [],
  );

  // Clear a specific draft
  const clearDraft = useCallback((isbn: string) => {
    setDrafts((prev) => {
      const newDrafts = new Map(prev);
      newDrafts.delete(isbn);
      return newDrafts;
    });

    setHasUnsavedChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.delete(isbn);
      return newChanges;
    });
  }, []);

  // Clear all drafts
  const clearAllDrafts = useCallback(() => {
    setDrafts(new Map());
    setHasUnsavedChanges(new Map());
  }, []);

  // Check if a specific draft has unsaved changes
  const hasChanges = useCallback(
    (isbn: string): boolean => {
      return hasUnsavedChanges.get(isbn) ?? false;
    },
    [hasUnsavedChanges],
  );

  // Mark a draft as saved
  const markAsSaved = useCallback((isbn: string) => {
    setHasUnsavedChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.set(isbn, false);
      return newChanges;
    });
  }, []);

  // Get total draft count
  const getDraftCount = useCallback((): number => {
    return drafts.size;
  }, [drafts]);

  const value: ProgressContextType = {
    drafts,
    hasUnsavedChanges,
    getDraft,
    setDraft,
    clearDraft,
    clearAllDrafts,
    hasChanges,
    markAsSaved,
    getDraftCount,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
};

// Custom hook to use the ProgressContext
export const useProgressContext = (): ProgressContextType => {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgressContext must be used within a ProgressProvider');
  }
  return context;
};
