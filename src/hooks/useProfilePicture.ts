import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bowlerId, file }: { bowlerId: string; file: File }) => {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${bowlerId}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from('bowlers')
        .update({ profile_picture_url: publicUrl })
        .eq('id', bowlerId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bowlers'] });
    },
  });
}

export function useRemoveProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bowlerId: string) => {
      const { data: files } = await supabase.storage
        .from('profile-pictures')
        .list('', { search: bowlerId });

      if (files && files.length > 0) {
        await supabase.storage
          .from('profile-pictures')
          .remove(files.map((f: { name: string }) => f.name));
      }

      const { error } = await supabase
        .from('bowlers')
        .update({ profile_picture_url: null })
        .eq('id', bowlerId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bowlers'] });
    },
  });
}
