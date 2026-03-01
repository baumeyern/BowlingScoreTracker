import { useState } from 'react';
import { useWeeks, useCreateWeek, useUpdateWeek } from '@/hooks/useWeeks';
import { useSelectedLeague } from '@/contexts/LeagueContext';
import { useLeagues } from '@/hooks/useLeagues';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Calendar, Plus, Lock, Unlock, CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { Week } from '@/types';

function CreateWeekForm({ leagueId, onSuccess }: { leagueId: string; onSuccess: () => void }) {
  const { data: weeks } = useWeeks(leagueId);
  const createWeek = useCreateWeek();

  const nextWeekNumber = weeks && weeks.length > 0
    ? Math.max(...weeks.map(w => w.weekNumber)) + 1
    : 1;

  const [weekNumber, setWeekNumber] = useState(nextWeekNumber);
  const [bowlingDate, setBowlingDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createWeek.mutateAsync({
        leagueId,
        weekNumber,
        bowlingDate: bowlingDate || undefined,
        isComplete: false,
        predictionsLocked: false,
      });
      toast.success(`Week ${weekNumber} created!`);
      onSuccess();
      setWeekNumber(weekNumber + 1);
      setBowlingDate('');
    } catch (error) {
      console.error('Error creating week:', error);
      toast.error('Failed to create week');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="weekNumber">Week # *</Label>
          <Input
            id="weekNumber"
            type="number"
            inputMode="numeric"
            min="1"
            value={weekNumber}
            onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bowlingDate">Date</Label>
          <Input
            id="bowlingDate"
            type="date"
            value={bowlingDate}
            onChange={(e) => setBowlingDate(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={createWeek.isPending} className="w-full">
        {createWeek.isPending ? 'Creating...' : 'Create Week'}
      </Button>
    </form>
  );
}

export function WeekManagement() {
  const { selectedLeagueId } = useSelectedLeague();
  const { data: leagues } = useLeagues();
  const { data: leagueWeeks, isLoading } = useWeeks(selectedLeagueId || undefined);
  const { data: allWeeks } = useWeeks();
  const updateWeek = useUpdateWeek();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const selectedLeague = leagues?.find(l => l.id === selectedLeagueId);
  const unassignedWeeks = allWeeks?.filter(w => !w.leagueId) || [];

  const handleToggleLock = async (week: Week) => {
    try {
      await updateWeek.mutateAsync({
        id: week.id,
        updates: { predictionsLocked: !week.predictionsLocked },
      });
      toast.success(`Week ${week.weekNumber} predictions ${!week.predictionsLocked ? 'locked' : 'unlocked'}`);
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Failed to update week');
    }
  };

  const handleToggleComplete = async (week: Week) => {
    try {
      await updateWeek.mutateAsync({
        id: week.id,
        updates: { isComplete: !week.isComplete },
      });
      toast.success(`Week ${week.weekNumber} marked as ${!week.isComplete ? 'complete' : 'incomplete'}`);
    } catch (error) {
      console.error('Error updating week:', error);
      toast.error('Failed to update week');
    }
  };

  const handleAssignToLeague = async (week: Week) => {
    if (!selectedLeagueId) return;
    try {
      await updateWeek.mutateAsync({
        id: week.id,
        updates: { leagueId: selectedLeagueId },
      });
      toast.success(`Week ${week.weekNumber} assigned to ${selectedLeague?.name || 'league'}`);
    } catch (error) {
      console.error('Error assigning week:', error);
      toast.error('Failed to assign week');
    }
  };

  const handleAssignAllToLeague = async () => {
    if (!selectedLeagueId || unassignedWeeks.length === 0) return;
    try {
      for (const week of unassignedWeeks) {
        await updateWeek.mutateAsync({
          id: week.id,
          updates: { leagueId: selectedLeagueId },
        });
      }
      toast.success(`All ${unassignedWeeks.length} weeks assigned to ${selectedLeague?.name || 'league'}`);
    } catch (error) {
      console.error('Error assigning weeks:', error);
      toast.error('Failed to assign weeks');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!selectedLeagueId) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <p className="text-center text-sm text-muted-foreground">
            Create a league first in the Leagues tab, then manage weeks here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg">Manage Weeks</CardTitle>
              {selectedLeague && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{selectedLeague.name}</p>
              )}
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Week</DialogTitle>
                </DialogHeader>
                <CreateWeekForm leagueId={selectedLeagueId} onSuccess={() => setIsCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
          <div className="space-y-2">
            {leagueWeeks?.map((week) => (
              <div
                key={week.id}
                className="flex items-center justify-between p-2.5 sm:p-4 border rounded-lg gap-2"
              >
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">Wk {week.weekNumber}</p>
                    {week.bowlingDate && (
                      <p className="text-[10px] sm:text-sm text-muted-foreground">{formatDate(week.bowlingDate)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 sm:gap-2">
                    {week.isComplete ? (
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <Switch
                      checked={week.isComplete}
                      onCheckedChange={() => handleToggleComplete(week)}
                    />
                    <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Done</span>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2">
                    {week.predictionsLocked ? (
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <Switch
                      checked={week.predictionsLocked}
                      onCheckedChange={() => handleToggleLock(week)}
                    />
                    <span className="text-[10px] sm:text-sm text-muted-foreground hidden sm:inline">Lock</span>
                  </div>
                </div>
              </div>
            ))}

            {(!leagueWeeks || leagueWeeks.length === 0) && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No weeks yet. Create a new week or assign existing ones below.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {unassignedWeeks.length > 0 && (
        <Card className="border-amber-500/30">
          <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base sm:text-lg">Unassigned Weeks</CardTitle>
                <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">
                  Not attached to any league
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAssignAllToLeague}>
                <ArrowRight className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Assign All</span>
                <span className="sm:hidden">All</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-2">
              {unassignedWeeks.map((week) => (
                <div
                  key={week.id}
                  className="flex items-center justify-between p-2.5 sm:p-4 border border-dashed rounded-lg gap-2"
                >
                  <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <Calendar className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">Wk {week.weekNumber}</p>
                      {week.bowlingDate && (
                        <p className="text-[10px] sm:text-sm text-muted-foreground">{formatDate(week.bowlingDate)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAssignToLeague(week)}
                    className="flex-shrink-0 h-8"
                  >
                    <ArrowRight className="h-3.5 w-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">Assign</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
