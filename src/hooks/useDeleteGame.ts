import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useDeleteGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ weekId, bowlerId, gameNumber }: { 
      weekId: string; 
      bowlerId: string; 
      gameNumber: 1 | 2 | 3;
    }) => {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('week_id', weekId)
        .eq('bowler_id', bowlerId)
        .eq('game_number', gameNumber);
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      return { weekId, bowlerId, gameNumber };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', result.weekId] });
      queryClient.invalidateQueries({ queryKey: ['games', result.weekId, result.bowlerId] });
      queryClient.invalidateQueries({ queryKey: ['bowler-games', result.bowlerId] });
      queryClient.invalidateQueries({ queryKey: ['weekly-series'] });
      queryClient.invalidateQueries({ queryKey: ['bowler-stats'] });
    },
  });
}
