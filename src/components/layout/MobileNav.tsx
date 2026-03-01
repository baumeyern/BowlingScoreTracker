import { NavLink } from 'react-router-dom';
import { Home, Edit, TrendingUp, BarChart3, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/scores', label: 'Scores', icon: Edit },
  { to: '/predictions', label: 'Predict', icon: TrendingUp },
  { to: '/leaderboard', label: 'Leaders', icon: Trophy },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl safe-area-bottom',
        className,
      )}
    >
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-all active:scale-90',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1 rounded-lg transition-colors',
                  isActive && 'bg-primary/15'
                )}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
