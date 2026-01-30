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
      
      // Map snake_case to camelCase
      return data.map(pred => ({
        id: pred.id,
        weekId: pred.week_id,
        predictorId: pred.predictor_id,
        targetId: pred.target_id,
        predictedSeries: pred.predicted_series,
        createdAt: pred.created_at,
        updatedAt: pred.updated_at,
      })) as Prediction[];
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
      
      // Map snake_case to camelCase
      return data.map(result => ({
        predictorId: result.predictor_id,
        weekId: result.week_id,
        weekNumber: result.week_number,
        targetId: result.target_id,
        predictedSeries: result.predicted_series,
        actualSeries: result.actual_series,
        difference: result.difference,
        points: result.points,
      })) as PredictionResult[];
    },
  });
}

export function useUpsertPrediction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (prediction: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>) => {
      // Map camelCase to snake_case for database
      const dbPrediction = {
        week_id: prediction.weekId,
        predictor_id: prediction.predictorId,
        target_id: prediction.targetId,
        predicted_series: prediction.predictedSeries,
      };
      
      const { data, error } = await supabase
        .from('predictions')
        .upsert([dbPrediction], {
          onConflict: 'week_id,predictor_id,target_id',
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
        predictorId: data.predictor_id,
        targetId: data.target_id,
        predictedSeries: data.predicted_series,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      } as Prediction;
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
      // Map camelCase to snake_case for database
      const dbPredictions = predictions.map(pred => ({
        week_id: pred.weekId,
        predictor_id: pred.predictorId,
        target_id: pred.targetId,
        predicted_series: pred.predictedSeries,
      }));
      
      const { data, error } = await supabase
        .from('predictions')
        .upsert(dbPredictions, {
          onConflict: 'week_id,predictor_id,target_id',
        })
        .select();
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Map snake_case back to camelCase
      return data.map(pred => ({
        id: pred.id,
        weekId: pred.week_id,
        predictorId: pred.predictor_id,
        targetId: pred.target_id,
        predictedSeries: pred.predicted_series,
        createdAt: pred.created_at,
        updatedAt: pred.updated_at,
      })) as Prediction[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['prediction-accuracy'] });
    },
  });
}
