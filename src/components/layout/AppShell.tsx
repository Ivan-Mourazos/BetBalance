import type { ReactNode } from 'react';
import Header from './Header';

interface AppShellProps {
  children: ReactNode;
  // availableMonths prop eliminada
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* availableMonths ya no se pasa */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-muted-foreground text-sm">
        BetBalance &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
