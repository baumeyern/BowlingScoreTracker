import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Bowler } from '@/types';

export function useBowlers() {
  return useQuery({
    queryKey: ['bowlers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bowlers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Bowler[];
    },
  });
}

export function useCreateBowler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bowler: Omit<Bowler, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('bowlers')
        .insert([bowler])
        .select()
        .single();
      
      if (error) throw error;
      return data as Bowler;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bowlers'] });
    },
  });
}

export function useUpdateBowler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Bowler> }) => {
      const { data, error } = await supabase
        .from('bowlers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Bowler;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bowlers'] });
    },
  });
}
