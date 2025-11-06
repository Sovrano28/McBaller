import { NextResponse } from 'next/server';
import { getPlayerByUsername } from '@/lib/actions/players';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const player = await getPlayerByUsername(username);
    
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    // Format player data to match expected structure
    const formattedPlayer = {
      ...player,
      currentClub: player.team?.name || 'Free Agent',
      joinedAt: player.joinedAt?.toISOString() || new Date().toISOString(),
      leagueStats: player.leagueStats || [],
    };

    return NextResponse.json(formattedPlayer);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

