import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { BowlerStats } from '@/types';

export function useBowlerStats(bowlerId?: string) {
  return useQuery({
    queryKey: ['bowler-stats', bowlerId],
    queryFn: async () => {
      let query = supabase.from('bowler_averages').select('*');
      
      if (bowlerId) query = query.eq('bowler_id', bowlerId);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BowlerStats[];
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
      return data as BowlerStats[];
    },
  });
}
