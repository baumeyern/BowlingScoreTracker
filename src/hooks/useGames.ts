import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Game, WeeklySeries } from '@/types';

export function useGames(weekId?: string, bowlerId?: string) {
  return useQuery({
    queryKey: ['games', weekId, bowlerId],
    queryFn: async () => {
      let query = supabase.from('games').select('*');
      
      if (weekId) query = query.eq('week_id', weekId);
      if (bowlerId) query = query.eq('bowler_id', bowlerId);
      
      query = query.order('game_number');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map snake_case to camelCase
      return data.map(game => ({
        id: game.id,
        weekId: game.week_id,
        bowlerId: game.bowler_id,
        gameNumber: game.game_number,
        score: game.score,
        createdAt: game.created_at,
        updatedAt: game.updated_at,
      })) as Game[];
    },
    enabled: !!(weekId || bowlerId || true), // Always enabled
  });
}

export function useWeeklySeries(weekId?: string) {
  return useQuery({
    queryKey: ['weekly-series', weekId],
    queryFn: async () => {
      let query = supabase.from('bowler_weekly_series').select('*');
      
      if (weekId) query = query.eq('week_id', weekId);
      
      query = query.order('week_number');
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map snake_case to camelCase
      return data.map(series => ({
        weekId: series.week_id,
        bowlerId: series.bowler_id,
        weekNumber: series.week_number,
        seriesTotal: series.series_total,
        gameScores: series.game_scores,
        gamesEntered: series.games_entered,
      })) as WeeklySeries[];
    },
  });
}

export function useBowlerGames(bowlerId: string) {
  return useQuery({
    queryKey: ['bowler-games', bowlerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select('*, weeks(week_number)')
        .eq('bowler_id', bowlerId)
        .order('created_at');
      
      if (error) throw error;
      return data;
    },
    enabled: !!bowlerId,
  });
}

export function useUpsertGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (game: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Map camelCase to snake_case for database
      const dbGame = {
        week_id: game.weekId,
        bowler_id: game.bowlerId,
        game_number: game.gameNumber,
        score: game.score,
      };
      
      const { data, error } = await supabase
        .from('games')
        .upsert([dbGame], {
          onConflict: 'week_id,bowler_id,game_number',
        })
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return {
        id: data.id,
        weekId: data.week_id,
        bowlerId: data.bowler_id,
        gameNumber: data.game_number,
        score: data.score,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Game;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', variables.weekId] });
      queryClient.invalidateQueries({ queryKey: ['games', variables.weekId, variables.bowlerId] });
      queryClient.invalidateQueries({ queryKey: ['bowler-games', variables.bowlerId] });
      queryClient.invalidateQueries({ queryKey: ['weekly-series'] });
      queryClient.invalidateQueries({ queryKey: ['bowler-stats'] });
    },
  });
}

export function useBatchUpsertGames() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (games: Omit<Game, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      // Map camelCase to snake_case for database
      const dbGames = games.map(game => ({
        week_id: game.weekId,
        bowler_id: game.bowlerId,
        game_number: game.gameNumber,
        score: game.score,
      }));
      
      const { data, error } = await supabase
        .from('games')
        .upsert(dbGames, {
          onConflict: 'week_id,bowler_id,game_number',
        })
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return data.map(game => ({
        id: game.id,
        weekId: game.week_id,
        bowlerId: game.bowler_id,
        gameNumber: game.game_number,
        score: game.score,
        createdAt: game.created_at,
        updatedAt: game.updated_at,
      })) as Game[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['bowler-games'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-series'] });
      queryClient.invalidateQueries({ queryKey: ['bowler-stats'] });
    },
  });
}
