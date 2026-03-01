import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { LeagueSelector } from './LeagueSelector';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 md:h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg md:text-xl group">
            <div className="p-1 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Trophy className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">Bowling League Tracker</span>
            <span className="sm:hidden bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">BLT</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <LeagueSelector />
          <Navigation className="hidden md:flex" />
        </div>
      </div>
    </header>
  );
}
