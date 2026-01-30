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
      
      // Map snake_case to camelCase
      return data.map(bowler => ({
        id: bowler.id,
        name: bowler.name,
        nickname: bowler.nickname,
        pinCode: bowler.pin_code,
        avatarColor: bowler.avatar_color,
        createdAt: bowler.created_at,
      })) as Bowler[];
    },
  });
}

export function useCreateBowler() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bowler: Omit<Bowler, 'id' | 'createdAt'>) => {
      // Map camelCase to snake_case for database
      const dbBowler = {
        name: bowler.name,
        nickname: bowler.nickname || null,
        pin_code: bowler.pinCode || null,
        avatar_color: bowler.avatarColor,
      };
      
      const { data, error } = await supabase
        .from('bowlers')
        .insert([dbBowler])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return {
        id: data.id,
        name: data.name,
        nickname: data.nickname,
        pinCode: data.pin_code,
        avatarColor: data.avatar_color,
        createdAt: data.created_at,
      } as Bowler;
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
      // Map camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname || null;
      if (updates.pinCode !== undefined) dbUpdates.pin_code = updates.pinCode || null;
      if (updates.avatarColor !== undefined) dbUpdates.avatar_color = updates.avatarColor;
      
      const { data, error } = await supabase
        .from('bowlers')
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
        name: data.name,
        nickname: data.nickname,
        pinCode: data.pin_code,
        avatarColor: data.avatar_color,
        createdAt: data.created_at,
      } as Bowler;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bowlers'] });
    },
  });
}
