
import type { Bet } from '@/lib/types';
import BetCard from './BetCard';

interface BetListProps {
  bets: Bet[];
  title?: string; // Title is now optional
}

export default function BetList({ bets, title }: BetListProps) {
  if (bets.length === 0) {
    return (
      <div className="my-8 text-center">
        {title && <h2 className="text-2xl font-headline text-primary mb-4">{title}</h2>}
        <p className="text-muted-foreground">
          {title ? `Aún no hay apuestas para mostrar en "${title}".` : 'Aún no hay apuestas para mostrar en esta sección.'}
        </p>
      </div>
    );
  }

  return (
    <section className="my-4"> {/* Reduced margin from my-8 to my-4 for tabs content */}
      {title && <h2 className="text-2xl font-headline text-primary mb-6">{title}</h2>}
      <div className="space-y-4">
        {bets.map(bet => (
          <BetCard key={bet.id} bet={bet} />
        ))}
      </div>
    </section>
  );
}

