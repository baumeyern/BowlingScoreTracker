import { useState } from 'react';
import { useWeeks, useCreateWeek, useUpdateWeek } from '@/hooks/useWeeks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Calendar, Plus, Lock, Unlock, CheckCircle, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { Week } from '@/types';

function CreateWeekForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: weeks } = useWeeks();
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
      <div className="space-y-2">
        <Label htmlFor="weekNumber">Week Number *</Label>
        <Input
          id="weekNumber"
          type="number"
          min="1"
          value={weekNumber}
          onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bowlingDate">Bowling Date</Label>
        <Input
          id="bowlingDate"
          type="date"
          value={bowlingDate}
          onChange={(e) => setBowlingDate(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={createWeek.isPending} className="w-full">
        {createWeek.isPending ? 'Creating...' : 'Create Week'}
      </Button>
    </form>
  );
}

export function WeekManagement() {
  const { data: weeks, isLoading } = useWeeks();
  const updateWeek = useUpdateWeek();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Manage Weeks</CardTitle>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Week
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Week</DialogTitle>
              </DialogHeader>
              <CreateWeekForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {weeks?.map((week) => (
            <div
              key={week.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Week {week.weekNumber}</p>
                  {week.bowlingDate && (
                    <p className="text-sm text-muted-foreground">{formatDate(week.bowlingDate)}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {week.isComplete ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={week.isComplete}
                    onCheckedChange={() => handleToggleComplete(week)}
                  />
                  <span className="text-sm text-muted-foreground">Complete</span>
                </div>

                <div className="flex items-center gap-2">
                  {week.predictionsLocked ? (
                    <Lock className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Unlock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Switch
                    checked={week.predictionsLocked}
                    onCheckedChange={() => handleToggleLock(week)}
                  />
                  <span className="text-sm text-muted-foreground">Lock Predictions</span>
                </div>
              </div>
            </div>
          ))}

          {(!weeks || weeks.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No weeks created yet. Click "Create Week" to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
