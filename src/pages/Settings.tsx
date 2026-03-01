import { BowlerManagement } from '@/components/settings/BowlerManagement';
import { WeekManagement } from '@/components/settings/WeekManagement';
import { LeagueManagement } from '@/components/settings/LeagueManagement';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, Users, Calendar, Info, Trophy } from 'lucide-react';

export function Settings() {
  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your league configuration</p>
      </div>

      <Tabs defaultValue="leagues" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leagues" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Leagues</span>
          </TabsTrigger>
          <TabsTrigger value="bowlers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Bowlers</span>
          </TabsTrigger>
          <TabsTrigger value="weeks" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Weeks</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leagues" className="mt-6">
          <LeagueManagement />
        </TabsContent>

        <TabsContent value="bowlers" className="mt-6">
          <BowlerManagement />
        </TabsContent>

        <TabsContent value="weeks" className="mt-6">
          <WeekManagement />
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About Bowling League Tracker</CardTitle>
              <CardDescription>Version 1.0.0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Handicap Formula</h3>
                <p className="text-sm text-muted-foreground">
                  Handicap = 90% of (215 - average)
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Example: If your average is 180, your handicap is (215 - 180) × 0.9 = 31.5 = 32
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Prediction Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Your prediction score is the total pin difference between your predicted scores and actual scores.
                  Lower is better! The predictor with the lowest total pins off wins.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                    React 18
                  </span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded text-xs font-medium">
                    TypeScript
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded text-xs font-medium">
                    Supabase
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 rounded text-xs font-medium">
                    TailwindCSS
                  </span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 rounded text-xs font-medium">
                    Recharts
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Built with ❤️ for bowling leagues
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
