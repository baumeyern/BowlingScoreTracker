import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/pages/Dashboard';
import { EnterScores } from '@/pages/EnterScores';
import { Predictions } from '@/pages/Predictions';
import { Stats } from '@/pages/Stats';
import { History } from '@/pages/History';
import { Leaderboard } from '@/pages/Leaderboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pb-16 md:pb-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/scores" element={<EnterScores />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/history" element={<History />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </main>
          </div>
          <Toaster position="top-center" richColors />
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
