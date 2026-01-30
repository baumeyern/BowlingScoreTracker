import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Week } from '@/types';

export function useWeeks() {
  return useQuery({
    queryKey: ['weeks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .order('week_number');
      
      if (error) throw error;
      return data as Week[];
    },
  });
}

export function useWeek(weekNumber: number) {
  return useQuery({
    queryKey: ['weeks', weekNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weeks')
        .select('*')
        .eq('week_number', weekNumber)
        .single();
      
      if (error) throw error;
      return data as Week;
    },
    enabled: weekNumber > 0,
  });
}

export function useCreateWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (week: Omit<Week, 'id' | 'createdAt'>) => {
      const { data, error } = await supabase
        .from('weeks')
        .insert([week])
        .select()
        .single();
      
      if (error) throw error;
      return data as Week;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
}

export function useUpdateWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Week> }) => {
      const { data, error } = await supabase
        .from('weeks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Week;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
}
