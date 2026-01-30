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
      
      // Map snake_case to camelCase
      return data.map(week => ({
        id: week.id,
        weekNumber: week.week_number,
        bowlingDate: week.bowling_date,
        isComplete: week.is_complete,
        predictionsLocked: week.predictions_locked,
        createdAt: week.created_at,
      })) as Week[];
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
      
      // Map snake_case to camelCase
      return {
        id: data.id,
        weekNumber: data.week_number,
        bowlingDate: data.bowling_date,
        isComplete: data.is_complete,
        predictionsLocked: data.predictions_locked,
        createdAt: data.created_at,
      } as Week;
    },
    enabled: weekNumber > 0,
  });
}

export function useCreateWeek() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (week: Omit<Week, 'id' | 'createdAt'>) => {
      // Map camelCase to snake_case for database
      const dbWeek = {
        week_number: week.weekNumber,
        bowling_date: week.bowlingDate || null,
        is_complete: week.isComplete,
        predictions_locked: week.predictionsLocked,
      };
      
      const { data, error } = await supabase
        .from('weeks')
        .insert([dbWeek])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return {
        id: data.id,
        weekNumber: data.week_number,
        bowlingDate: data.bowling_date,
        isComplete: data.is_complete,
        predictionsLocked: data.predictions_locked,
        createdAt: data.created_at,
      } as Week;
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
      // Map camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.weekNumber !== undefined) dbUpdates.week_number = updates.weekNumber;
      if (updates.bowlingDate !== undefined) dbUpdates.bowling_date = updates.bowlingDate || null;
      if (updates.isComplete !== undefined) dbUpdates.is_complete = updates.isComplete;
      if (updates.predictionsLocked !== undefined) dbUpdates.predictions_locked = updates.predictionsLocked;
      
      const { data, error } = await supabase
        .from('weeks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return {
        id: data.id,
        weekNumber: data.week_number,
        bowlingDate: data.bowling_date,
        isComplete: data.is_complete,
        predictionsLocked: data.predictions_locked,
        createdAt: data.created_at,
      } as Week;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeks'] });
    },
  });
}
