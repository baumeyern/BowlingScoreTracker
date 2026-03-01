import { useState, useRef } from 'react';
import { useBowlers, useCreateBowler, useUpdateBowler } from '@/hooks/useBowlers';
import { useUploadProfilePicture, useRemoveProfilePicture } from '@/hooks/useProfilePicture';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BowlerAvatar } from '@/components/common/BowlerAvatar';
import { Edit, Plus, Palette, Camera, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Bowler } from '@/types';

interface BowlerFormData {
  name: string;
  nickname: string;
  pinCode: string;
  avatarColor: string;
}

function BowlerForm({ 
  bowler, 
  onSuccess 
}: { 
  bowler?: Bowler; 
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<BowlerFormData>({
    name: bowler?.name || '',
    nickname: bowler?.nickname || '',
    pinCode: '',
    avatarColor: bowler?.avatarColor || '#3B82F6',
  });

  const createBowler = useCreateBowler();
  const updateBowler = useUpdateBowler();
  const uploadPicture = useUploadProfilePicture();
  const removePicture = useRemoveProfilePicture();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !bowler) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      await uploadPicture.mutateAsync({ bowlerId: bowler.id, file });
      toast.success('Profile picture uploaded!');
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast.error('Failed to upload picture');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePicture = async () => {
    if (!bowler) return;
    try {
      await removePicture.mutateAsync(bowler.id);
      toast.success('Profile picture removed');
    } catch (error) {
      console.error('Error removing picture:', error);
      toast.error('Failed to remove picture');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (bowler) {
        const updates: Partial<Bowler> = {
          name: formData.name,
          nickname: formData.nickname || undefined,
          avatarColor: formData.avatarColor,
        };
        
        if (formData.pinCode.trim()) {
          updates.pinCode = formData.pinCode;
        }
        
        await updateBowler.mutateAsync({
          id: bowler.id,
          updates,
        });
        toast.success('Bowler updated!');
      } else {
        await createBowler.mutateAsync(formData);
        toast.success('Bowler created!');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving bowler:', error);
      toast.error('Failed to save bowler');
    }
  };

  const isUploading = uploadPicture.isPending || removePicture.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter bowler name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input
          id="nickname"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          placeholder="Optional nickname"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pinCode">PIN Code</Label>
        <Input
          id="pinCode"
          type="password"
          maxLength={4}
          value={formData.pinCode}
          onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
          placeholder={bowler ? "Leave blank to keep current PIN" : "4-digit PIN (optional)"}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Avatar
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="avatarColor"
            type="color"
            value={formData.avatarColor}
            onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
            className="h-11 w-16 rounded border cursor-pointer"
          />
          <BowlerAvatar
            bowler={{
              name: formData.name || '?',
              avatarColor: formData.avatarColor,
              profilePictureUrl: bowler?.profilePictureUrl,
            }}
            size="lg"
          />
          {bowler && (
            <div className="flex flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs"
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                {isUploading ? 'Uploading...' : bowler.profilePictureUrl ? 'Change' : 'Upload'}
              </Button>
              {bowler.profilePictureUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isUploading}
                  onClick={handleRemovePicture}
                  className="h-8 text-xs"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  Remove
                </Button>
              )}
            </div>
          )}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground">
          {bowler ? 'Color is used as a border around your photo' : 'Upload a photo after creating the bowler'}
        </p>
      </div>

      <Button
        type="submit"
        disabled={createBowler.isPending || updateBowler.isPending}
        className="w-full"
      >
        {createBowler.isPending || updateBowler.isPending ? 'Saving...' : (bowler ? 'Update Bowler' : 'Create Bowler')}
      </Button>
    </form>
  );
}

export function BowlerManagement() {
  const { data: bowlers, isLoading } = useBowlers();
  const [editingBowler, setEditingBowler] = useState<Bowler | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Manage Bowlers</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Bowler</DialogTitle>
              </DialogHeader>
              <BowlerForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2">
          {bowlers?.map((bowler) => (
            <div
              key={bowler.id}
              className="flex items-center justify-between p-2.5 sm:p-4 border rounded-lg active:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <BowlerAvatar bowler={bowler} size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-lg truncate">{bowler.name}</p>
                  {bowler.nickname && (
                    <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{bowler.nickname}</p>
                  )}
                </div>
              </div>

              <Dialog open={isEditOpen && editingBowler?.id === bowler.id} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) setEditingBowler(null);
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBowler(bowler)}
                    className="flex-shrink-0 ml-2 h-8"
                  >
                    <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Bowler</DialogTitle>
                  </DialogHeader>
                  <BowlerForm
                    bowler={bowler}
                    onSuccess={() => {
                      setIsEditOpen(false);
                      setEditingBowler(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          ))}

          {(!bowlers || bowlers.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No bowlers yet. Tap "Add" to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
