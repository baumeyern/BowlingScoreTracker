import { useState } from 'react';
import { useBowlers, useCreateBowler, useUpdateBowler } from '@/hooks/useBowlers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Edit, Plus, Palette } from 'lucide-react';
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
    pinCode: bowler?.pinCode || '',
    avatarColor: bowler?.avatarColor || '#3B82F6',
  });

  const createBowler = useCreateBowler();
  const updateBowler = useUpdateBowler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      if (bowler) {
        await updateBowler.mutateAsync({
          id: bowler.id,
          updates: formData,
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
          type="text"
          maxLength={4}
          value={formData.pinCode}
          onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
          placeholder="4-digit PIN (optional)"
        />
        <p className="text-xs text-muted-foreground">Optional 4-digit code for quick login</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarColor" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Avatar Color
        </Label>
        <div className="flex items-center gap-3">
          <input
            id="avatarColor"
            type="color"
            value={formData.avatarColor}
            onChange={(e) => setFormData({ ...formData, avatarColor: e.target.value })}
            className="h-12 w-20 rounded border cursor-pointer"
          />
          <div className="flex items-center gap-2 flex-1">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
              style={{ backgroundColor: formData.avatarColor }}
            >
              {formData.name.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="text-sm">
              <p className="font-medium">{formData.avatarColor}</p>
              <p className="text-muted-foreground">Preview</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Click to choose any color you like</p>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          type="submit"
          disabled={createBowler.isPending || updateBowler.isPending}
          className="flex-1"
        >
          {createBowler.isPending || updateBowler.isPending ? 'Saving...' : (bowler ? 'Update Bowler' : 'Create Bowler')}
        </Button>
      </div>
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Bowlers</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Bowler
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Bowler</DialogTitle>
              </DialogHeader>
              <BowlerForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bowlers?.map((bowler) => (
            <div
              key={bowler.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: bowler.avatarColor }}
                >
                  {bowler.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{bowler.name}</p>
                  {bowler.nickname && (
                    <p className="text-sm text-muted-foreground">{bowler.nickname}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Palette className="h-3 w-3" />
                      <span className="text-muted-foreground">{bowler.avatarColor}</span>
                    </div>
                    {bowler.pinCode && (
                      <span className="text-xs text-muted-foreground">• PIN: {bowler.pinCode}</span>
                    )}
                  </div>
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
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
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
              <p>No bowlers yet. Click "Add Bowler" to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
