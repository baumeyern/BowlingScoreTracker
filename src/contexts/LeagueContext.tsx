import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLeagues } from '@/hooks/useLeagues';

interface LeagueContextType {
  selectedLeagueId: string;
  setSelectedLeagueId: (id: string) => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export function LeagueProvider({ children }: { children: ReactNode }) {
  const { data: leagues } = useLeagues();
  const [selectedLeagueId, setSelectedLeagueIdState] = useState<string>(() => {
    const stored = localStorage.getItem('selectedLeagueId');
    return stored || '';
  });

  useEffect(() => {
    if (leagues && leagues.length > 0 && !selectedLeagueId) {
      const activeLeague = leagues.find(l => l.isActive) || leagues[0];
      setSelectedLeagueIdState(activeLeague.id);
      localStorage.setItem('selectedLeagueId', activeLeague.id);
    }
  }, [leagues, selectedLeagueId]);

  useEffect(() => {
    if (selectedLeagueId && leagues && leagues.length > 0) {
      const exists = leagues.some(l => l.id === selectedLeagueId);
      if (!exists) {
        const activeLeague = leagues.find(l => l.isActive) || leagues[0];
        setSelectedLeagueIdState(activeLeague.id);
        localStorage.setItem('selectedLeagueId', activeLeague.id);
      }
    }
  }, [selectedLeagueId, leagues]);

  const setSelectedLeagueId = (id: string) => {
    setSelectedLeagueIdState(id);
    localStorage.setItem('selectedLeagueId', id);
  };

  return (
    <LeagueContext.Provider value={{ selectedLeagueId, setSelectedLeagueId }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useSelectedLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useSelectedLeague must be used within a LeagueProvider');
  }
  return context;
}
