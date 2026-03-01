import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BowlerStats, LeagueBowlerStats } from '@/types';

export function useBowlerStats(bowlerId?: string) {
  return useQuery({
    queryKey: ['bowler-stats', bowlerId],
    queryFn: async () => {
      let query = supabase.from('bowler_averages').select('*');
      
      if (bowlerId) query = query.eq('bowler_id', bowlerId);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map snake_case to camelCase
      return data.map(stat => ({
        bowlerId: stat.bowler_id,
        totalGames: stat.total_games,
        average: stat.average,
        handicap: stat.handicap,
        highGame: stat.high_game,
        lowGame: stat.low_game,
        totalPins: stat.total_pins,
      })) as BowlerStats[];
    },
  });
}

export function useAllBowlerStats() {
  return useQuery({
    queryKey: ['bowler-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bowler_averages')
        .select('*');
      
      if (error) throw error;
      
      return data.map(stat => ({
        bowlerId: stat.bowler_id,
        totalGames: stat.total_games,
        average: stat.average,
        handicap: stat.handicap,
        highGame: stat.high_game,
        lowGame: stat.low_game,
        totalPins: stat.total_pins,
      })) as BowlerStats[];
    },
  });
}

export function useLeagueBowlerStats(leagueId?: string) {
  return useQuery({
    queryKey: ['league-bowler-stats', leagueId],
    queryFn: async () => {
      let query = supabase.from('league_bowler_averages').select('*');

      if (leagueId) query = query.eq('league_id', leagueId);

      const { data, error } = await query;

      if (error) throw error;

      return data.map(stat => ({
        leagueId: stat.league_id,
        bowlerId: stat.bowler_id,
        totalGames: stat.total_games,
        average: stat.average,
        handicap: stat.handicap,
        highGame: stat.high_game,
        lowGame: stat.low_game,
        totalPins: stat.total_pins,
      })) as LeagueBowlerStats[];
    },
    enabled: !!leagueId,
  });
}
