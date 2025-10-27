import { PlayerCard } from '@/components/player-card';
import { players } from '@/lib/mock-data';

export default function DiscoverPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold">Discover Talent</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Find the next generation of soccer superstars.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
}
