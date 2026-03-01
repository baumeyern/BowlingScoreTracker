import { Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navigation } from './Navigation';
import { MobileNav } from './MobileNav';
import { LeagueSelector } from './LeagueSelector';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Bowling League Tracker</span>
            <span className="sm:hidden">BLT</span>
          </Link>
          <LeagueSelector />
        </div>

        <Navigation className="hidden md:flex" />
        <MobileNav className="md:hidden" />
      </div>
    </header>
  );
}
