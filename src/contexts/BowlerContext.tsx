import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBowlers } from '@/hooks/useBowlers';

interface BowlerContextType {
  selectedBowlerId: string;
  setSelectedBowlerId: (id: string) => void;
}

const BowlerContext = createContext<BowlerContextType | undefined>(undefined);

export function BowlerProvider({ children }: { children: ReactNode }) {
  const { data: bowlers } = useBowlers();
  const [selectedBowlerId, setSelectedBowlerIdState] = useState<string>(() => {
    // Initialize from localStorage
    const stored = localStorage.getItem('selectedBowlerId');
    return stored || '';
  });

  // Set default to first bowler if none selected
  useEffect(() => {
    if (bowlers && bowlers.length > 0 && !selectedBowlerId) {
      const firstBowlerId = bowlers[0].id;
      setSelectedBowlerIdState(firstBowlerId);
      localStorage.setItem('selectedBowlerId', firstBowlerId);
    }
  }, [bowlers, selectedBowlerId]);

  // Validate that selected bowler still exists
  useEffect(() => {
    if (selectedBowlerId && bowlers && bowlers.length > 0) {
      const exists = bowlers.some(b => b.id === selectedBowlerId);
      if (!exists) {
        const firstBowlerId = bowlers[0].id;
        setSelectedBowlerIdState(firstBowlerId);
        localStorage.setItem('selectedBowlerId', firstBowlerId);
      }
    }
  }, [selectedBowlerId, bowlers]);

  const setSelectedBowlerId = (id: string) => {
    setSelectedBowlerIdState(id);
    localStorage.setItem('selectedBowlerId', id);
  };

  return (
    <BowlerContext.Provider value={{ selectedBowlerId, setSelectedBowlerId }}>
      {children}
    </BowlerContext.Provider>
  );
}

export function useSelectedBowler() {
  const context = useContext(BowlerContext);
  if (context === undefined) {
    throw new Error('useSelectedBowler must be used within a BowlerProvider');
  }
  return context;
}
