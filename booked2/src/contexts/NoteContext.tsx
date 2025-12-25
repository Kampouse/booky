import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';

// TypeScript types
export interface NoteDraft {
  isbn: string;
  chapter: number;
  content: string;
  timestamp: number;
}

export interface NoteDraftState {
  drafts: Map<string, NoteDraft>; // Key: `${isbn}-${chapter}`
  hasUnsavedChanges: Map<string, boolean>;
}

interface NoteContextType {
  // State
  drafts: Map<string, NoteDraft>;
  hasUnsavedChanges: Map<string, boolean>;

  // Methods
  getDraft: (isbn: string, chapter: number) => NoteDraft | undefined;
  setDraft: (isbn: string, chapter: number, content: string) => void;
  clearDraft: (isbn: string, chapter: number) => void;
  clearAllDrafts: () => void;
  hasChanges: (isbn: string, chapter: number) => boolean;
  markAsSaved: (isbn: string, chapter: number) => void;

  // Computed
  getDraftCount: () => number;
}

export const NoteContext = createContext<NoteContextType | undefined>(
  undefined,
);

const STORAGE_KEY = 'booky-note-drafts';

// Helper to generate draft key
const generateDraftKey = (isbn: string, chapter: number): string =>
  `${isbn}-${chapter}`;

// Helper to load drafts from localStorage
const loadDraftsFromStorage = (): Map<string, NoteDraft> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();

    const parsed = JSON.parse(stored);
    const drafts = new Map<string, NoteDraft>();

    Object.entries(parsed).forEach(([key, value]) => {
      drafts.set(key, value as NoteDraft);
    });

    return drafts;
  } catch (error) {
    console.error('Error loading drafts from storage:', error);
    return new Map();
  }
};

// Helper to save drafts to localStorage
const saveDraftsToStorage = (drafts: Map<string, NoteDraft>): void => {
  try {
    const obj = Object.fromEntries(drafts.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (error) {
    console.error('Error saving drafts to storage:', error);
  }
};

interface NoteProviderProps {
  children: ReactNode;
}

export const NoteProvider: React.FC<NoteProviderProps> = ({ children }) => {
  const [drafts, setDrafts] = useState<Map<string, NoteDraft>>(new Map());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<
    Map<string, boolean>
  >(new Map());

  // Load drafts from localStorage on mount
  useEffect(() => {
    const loadedDrafts = loadDraftsFromStorage();
    setDrafts(loadedDrafts);
  }, []);

  // Get a specific draft
  const getDraft = useCallback(
    (isbn: string, chapter: number): NoteDraft | undefined => {
      const key = generateDraftKey(isbn, chapter);
      return drafts.get(key);
    },
    [drafts],
  );

  // Set/update a draft
  const setDraft = useCallback(
    (isbn: string, chapter: number, content: string) => {
      const key = generateDraftKey(isbn, chapter);
      const timestamp = Date.now();

      setDrafts((prev) => {
        const newDrafts = new Map(prev);
        newDrafts.set(key, {
          isbn,
          chapter,
          content,
          timestamp,
        });
        // Persist to localStorage
        saveDraftsToStorage(newDrafts);
        return newDrafts;
      });

      setHasUnsavedChanges((prev) => {
        const newChanges = new Map(prev);
        newChanges.set(key, true);
        return newChanges;
      });
    },
    [],
  );

  // Clear a specific draft
  const clearDraft = useCallback((isbn: string, chapter: number) => {
    const key = generateDraftKey(isbn, chapter);

    setDrafts((prev) => {
      const newDrafts = new Map(prev);
      newDrafts.delete(key);
      saveDraftsToStorage(newDrafts);
      return newDrafts;
    });

    setHasUnsavedChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.delete(key);
      return newChanges;
    });
  }, []);

  // Clear all drafts
  const clearAllDrafts = useCallback(() => {
    setDrafts(new Map());
    setHasUnsavedChanges(new Map());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if a specific draft has unsaved changes
  const hasChanges = useCallback(
    (isbn: string, chapter: number): boolean => {
      const key = generateDraftKey(isbn, chapter);
      return hasUnsavedChanges.get(key) ?? false;
    },
    [hasUnsavedChanges],
  );

  // Mark a draft as saved
  const markAsSaved = useCallback((isbn: string, chapter: number) => {
    const key = generateDraftKey(isbn, chapter);
    setHasUnsavedChanges((prev) => {
      const newChanges = new Map(prev);
      newChanges.set(key, false);
      return newChanges;
    });
  }, []);

  // Get total draft count
  const getDraftCount = useCallback((): number => {
    return drafts.size;
  }, [drafts]);

  const value: NoteContextType = {
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

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};

// Custom hook to use the NoteContext
export const useNoteContext = (): NoteContextType => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
};

// HOC for easier integration with existing components
export const withNoteContext = <P extends object>(
  Component: React.ComponentType<P>,
): React.FC<P & { noteContext?: NoteContextType }> => {
  return (props) => {
    const noteContext = useNoteContext();
    return <Component {...props} />;
  };
};
