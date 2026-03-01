import { useState } from 'react';
import { useLeagues, useCreateLeague, useUpdateLeague } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Plus, Trophy, Circle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { League } from '@/types';

function CreateLeagueForm({ onSuccess }: { onSuccess: () => void }) {
  const createLeague = useCreateLeague();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('League name is required');
      return;
    }

    try {
      await createLeague.mutateAsync({
        name: name.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        isActive: true,
      });
      toast.success(`League "${name}" created!`);
      onSuccess();
      setName('');
      setStartDate('');
      setEndDate('');
    } catch (error) {
      console.error('Error creating league:', error);
      toast.error('Failed to create league');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="leagueName">League Name *</Label>
        <Input
          id="leagueName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Spring 2026 League"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End Date</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={createLeague.isPending} className="w-full">
        {createLeague.isPending ? 'Creating...' : 'Create League'}
      </Button>
    </form>
  );
}

export function LeagueManagement() {
  const { data: leagues, isLoading } = useLeagues();
  const updateLeague = useUpdateLeague();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleToggleActive = async (league: League) => {
    try {
      await updateLeague.mutateAsync({
        id: league.id,
        updates: { isActive: !league.isActive },
      });
      toast.success(`"${league.name}" marked as ${!league.isActive ? 'active' : 'inactive'}`);
    } catch (error) {
      console.error('Error updating league:', error);
      toast.error('Failed to update league');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Leagues</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create League
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New League</DialogTitle>
              </DialogHeader>
              <CreateLeagueForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leagues?.map((league) => (
            <div
              key={league.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Trophy className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{league.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {league.startDate && formatDate(league.startDate)}
                    {league.startDate && league.endDate && ' — '}
                    {league.endDate && formatDate(league.endDate)}
                    {!league.startDate && !league.endDate && 'No dates set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {league.isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={league.isActive}
                  onCheckedChange={() => handleToggleActive(league)}
                />
                <span className="text-sm text-muted-foreground">Active</span>
              </div>
            </div>
          ))}

          {(!leagues || leagues.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No leagues created yet. Click "Create League" to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
