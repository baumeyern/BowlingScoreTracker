import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Prediction, PredictionResult } from '@/types';

export function usePredictions(weekId?: string, predictorId?: string) {
  return useQuery({
    queryKey: ['predictions', weekId, predictorId],
    queryFn: async () => {
      let query = supabase.from('predictions').select('*');
      
      if (weekId) query = query.eq('week_id', weekId);
      if (predictorId) query = query.eq('predictor_id', predictorId);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Prediction[];
    },
  });
}

export function usePredictionResults(weekId?: string) {
  return useQuery({
    queryKey: ['prediction-accuracy', weekId],
    queryFn: async () => {
      let query = supabase.from('prediction_accuracy').select('*');
      
      if (weekId) query = query.eq('week_id', weekId);
      
      query = query.order('week_number');
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PredictionResult[];
    },
  });
}

export function useUpsertPrediction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prediction: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('predictions')
        .upsert([prediction], {
          onConflict: 'week_id,predictor_id,target_id',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Prediction;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.weekId] });
      queryClient.invalidateQueries({ queryKey: ['predictions', variables.weekId, variables.predictorId] });
      queryClient.invalidateQueries({ queryKey: ['prediction-accuracy'] });
    },
  });
}

export function useBatchUpsertPredictions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (predictions: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>[]) => {
      const { data, error } = await supabase
        .from('predictions')
        .upsert(predictions, {
          onConflict: 'week_id,predictor_id,target_id',
        })
        .select();
      
      if (error) throw error;
      return data as Prediction[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['prediction-accuracy'] });
    },
  });
}
