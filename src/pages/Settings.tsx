import { BowlerManagement } from '@/components/settings/BowlerManagement';
import { WeekManagement } from '@/components/settings/WeekManagement';
import { LeagueManagement } from '@/components/settings/LeagueManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Users, Calendar, Info, Trophy } from 'lucide-react';

export function Settings() {
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 space-y-4 sm:space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
          Settings
        </h1>
        <p className="text-xs sm:text-base text-muted-foreground">Manage your league configuration</p>
      </div>

      <Tabs defaultValue="leagues" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-10 sm:h-auto">
          <TabsTrigger value="leagues" className="flex items-center gap-1.5 text-xs sm:text-sm px-1 sm:px-3">
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Leagues</span>
          </TabsTrigger>
          <TabsTrigger value="bowlers" className="flex items-center gap-1.5 text-xs sm:text-sm px-1 sm:px-3">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Bowlers</span>
          </TabsTrigger>
          <TabsTrigger value="weeks" className="flex items-center gap-1.5 text-xs sm:text-sm px-1 sm:px-3">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Weeks</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-1.5 text-xs sm:text-sm px-1 sm:px-3">
            <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="mt-4 sm:mt-6">
          <LeagueManagement />
        </TabsContent>

        <TabsContent value="bowlers" className="mt-4 sm:mt-6">
          <BowlerManagement />
        </TabsContent>

        <TabsContent value="weeks" className="mt-4 sm:mt-6">
          <WeekManagement />
        </TabsContent>

        <TabsContent value="about" className="mt-4 sm:mt-6">
          <Card>
            <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6 pb-3">
              <CardTitle className="text-base sm:text-lg">About Bowling League Tracker</CardTitle>
              <CardDescription>Version 1.0.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-3 sm:px-6 pb-4 sm:pb-6">
              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Handicap Formula</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Handicap = 90% of (215 - average)
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Prediction Scoring</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Your prediction score is the total pin difference between predicted and actual scores. Lower is better!
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-sm sm:text-base">Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['React 18', 'TypeScript', 'Supabase', 'TailwindCSS', 'Recharts'].map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] sm:text-xs font-medium">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
