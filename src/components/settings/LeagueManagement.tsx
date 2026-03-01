import { useState, useEffect } from 'react';
import { useLeagues, useCreateLeague, useUpdateLeague } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Plus, Trophy, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { League } from '@/types';

function LeagueForm({
  league,
  onSuccess,
}: {
  league?: League;
  onSuccess: () => void;
}) {
  const createLeague = useCreateLeague();
  const updateLeague = useUpdateLeague();
  const isEditing = !!league;

  const [name, setName] = useState(league?.name || '');
  const [startDate, setStartDate] = useState(league?.startDate || '');
  const [endDate, setEndDate] = useState(league?.endDate || '');

  useEffect(() => {
    if (league) {
      setName(league.name);
      setStartDate(league.startDate || '');
      setEndDate(league.endDate || '');
    }
  }, [league]);

  const isPending = createLeague.isPending || updateLeague.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('League name is required');
      return;
    }

    try {
      if (isEditing) {
        await updateLeague.mutateAsync({
          id: league.id,
          updates: {
            name: name.trim(),
            startDate: startDate || undefined,
            endDate: endDate || undefined,
          },
        });
        toast.success(`League "${name}" updated!`);
      } else {
        await createLeague.mutateAsync({
          name: name.trim(),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          isActive: true,
        });
        toast.success(`League "${name}" created!`);
        setName('');
        setStartDate('');
        setEndDate('');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving league:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} league`);
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

      <div className="grid grid-cols-2 gap-3">
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
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create League'}
      </Button>
    </form>
  );
}

export function LeagueManagement() {
  const { data: leagues, isLoading } = useLeagues();
  const updateLeague = useUpdateLeague();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);

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
      <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">Manage Leagues</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New League</DialogTitle>
              </DialogHeader>
              <LeagueForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2">
          {leagues?.map((league) => (
            <div
              key={league.id}
              className="flex items-center justify-between p-2.5 sm:p-4 border rounded-lg gap-2"
            >
              <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">{league.name}</p>
                  <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
                    {league.startDate && formatDate(league.startDate)}
                    {league.startDate && league.endDate && ' — '}
                    {league.endDate && formatDate(league.endDate)}
                    {!league.startDate && !league.endDate && 'No dates set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingLeague(league)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>

                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={league.isActive}
                    onCheckedChange={() => handleToggleActive(league)}
                  />
                  <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Active</span>
                </div>
              </div>
            </div>
          ))}

          {(!leagues || leagues.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No leagues created yet. Tap "Create" to get started!</p>
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={!!editingLeague} onOpenChange={(open) => !open && setEditingLeague(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit League</DialogTitle>
          </DialogHeader>
          {editingLeague && (
            <LeagueForm
              league={editingLeague}
              onSuccess={() => setEditingLeague(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
