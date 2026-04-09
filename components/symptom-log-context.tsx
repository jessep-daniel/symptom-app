import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';

export type SymptomEntry = {
  id: string;
  title: string;
  notes: string;
  severity: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
};

type SymptomLogContextValue = {
  entries: SymptomEntry[];
  addEntry: (entry: { title: string; notes: string; severity: 1 | 2 | 3 | 4 | 5 }) => void;
  updateEntry: (
    id: string,
    entry: { title: string; notes: string; severity: 1 | 2 | 3 | 4 | 5 }
  ) => void;
  deleteEntry: (id: string) => void;
};

const SymptomLogContext = createContext<SymptomLogContextValue | undefined>(undefined);
const STORAGE_KEY = 'symptom-log-entries';

export function SymptomLogProvider({ children }: PropsWithChildren) {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [hasLoadedEntries, setHasLoadedEntries] = useState(false);

  const normalizeEntries = (storedEntries: unknown): SymptomEntry[] => {
    if (!Array.isArray(storedEntries)) {
      return [];
    }

    return storedEntries.flatMap((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        return [];
      }

      const rawEntry = entry as Record<string, unknown>;

      if (typeof rawEntry.title === 'string') {
        return [
          {
            id: typeof rawEntry.id === 'string' ? rawEntry.id : `${Date.now()}-${index}`,
            title: rawEntry.title.trim() || 'Untitled symptom',
            notes: typeof rawEntry.notes === 'string' ? rawEntry.notes : '',
            severity:
              typeof rawEntry.severity === 'number' &&
              rawEntry.severity >= 1 &&
              rawEntry.severity <= 5
                ? (rawEntry.severity as 1 | 2 | 3 | 4 | 5)
                : 3,
            createdAt:
              typeof rawEntry.createdAt === 'string'
                ? rawEntry.createdAt
                : new Date().toISOString(),
          },
        ];
      }

      if (typeof rawEntry.text === 'string') {
        const trimmedText = rawEntry.text.trim();

        if (!trimmedText) {
          return [];
        }

        return [
          {
            id: typeof rawEntry.id === 'string' ? rawEntry.id : `${Date.now()}-${index}`,
            title: trimmedText,
            notes: '',
            severity: 3,
            createdAt:
              typeof rawEntry.createdAt === 'string'
                ? rawEntry.createdAt
                : new Date().toISOString(),
          },
        ];
      }

      return [];
    });
  };

  useEffect(() => {
    async function loadEntries() {
      try {
        const storedEntries = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedEntries) {
          setEntries(normalizeEntries(JSON.parse(storedEntries)));
        }
      } catch (error) {
        console.warn('Failed to load symptom entries', error);
      } finally {
        setHasLoadedEntries(true);
      }
    }

    loadEntries();
  }, []);

  useEffect(() => {
    if (!hasLoadedEntries) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch((error) => {
      console.warn('Failed to save symptom entries', error);
    });
  }, [entries, hasLoadedEntries]);

  const addEntry = (entry: { title: string; notes: string; severity: 1 | 2 | 3 | 4 | 5 }) => {
    const trimmedTitle = entry.title.trim();
    const trimmedNotes = entry.notes.trim();

    if (!trimmedTitle) {
      return;
    }

    setEntries((currentEntries) => [
      {
        id: `${Date.now()}-${currentEntries.length}`,
        title: trimmedTitle,
        notes: trimmedNotes,
        severity: entry.severity,
        createdAt: new Date().toISOString(),
      },
      ...currentEntries,
    ]);
  };

  const updateEntry = (
    id: string,
    entry: { title: string; notes: string; severity: 1 | 2 | 3 | 4 | 5 }
  ) => {
    const trimmedTitle = entry.title.trim();
    const trimmedNotes = entry.notes.trim();

    if (!trimmedTitle) {
      return;
    }

    setEntries((currentEntries) =>
      currentEntries.map((currentEntry) =>
        currentEntry.id === id
          ? {
              ...currentEntry,
              title: trimmedTitle,
              notes: trimmedNotes,
              severity: entry.severity,
            }
          : currentEntry
      )
    );
  };

  const deleteEntry = (id: string) => {
    setEntries((currentEntries) => currentEntries.filter((entry) => entry.id !== id));
  };

  return (
    <SymptomLogContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
      {children}
    </SymptomLogContext.Provider>
  );
}

export function useSymptomLog() {
  const context = useContext(SymptomLogContext);

  if (!context) {
    throw new Error('useSymptomLog must be used within a SymptomLogProvider');
  }

  return context;
}
