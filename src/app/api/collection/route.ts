import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  addGameToCollection, 
  getGameCollection, 
  updateGameInCollection, 
  removeGameFromCollection,
  getCollectionOverview 
} from '@/lib/game-collection-service';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const overview = searchParams.get('overview') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (overview) {
      // Get collection overview
      const overviewData = await getCollectionOverview(profile.id);
      return NextResponse.json({
        success: true,
        overview: overviewData,
      });
    } else {
      // Get game collection
      const games = await getGameCollection(profile.id, limit, offset);
      return NextResponse.json({
        success: true,
        games,
      });
    }
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { game_title, game_category, game_condition, acquisition_date, acquisition_price, current_value, notes, is_for_sale, is_for_trade, is_public } = body;

    // Validate required fields
    if (!game_title || !game_condition) {
      return NextResponse.json(
        { success: false, error: 'Game title and condition are required' },
        { status: 400 }
      );
    }

    // Validate game condition
    const validConditions = ['new', 'like_new', 'good', 'fair', 'poor'];
    if (!validConditions.includes(game_condition)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game condition' },
        { status: 400 }
      );
    }

    // Add game to collection
    const gameId = await addGameToCollection(profile.id, {
      game_title,
      game_category,
      game_condition,
      acquisition_date,
      acquisition_price,
      current_value,
      notes,
      is_for_sale: is_for_sale || false,
      is_for_trade: is_for_trade || false,
      is_public: is_public !== false, // Default to true
    });

    return NextResponse.json({
      success: true,
      gameId,
      message: 'Game added to collection successfully',
    });
  } catch (error) {
    console.error('Error adding game to collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add game to collection' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { gameId, updates } = body;

    if (!gameId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Game ID and updates are required' },
        { status: 400 }
      );
    }

    // Validate game condition if provided
    if (updates.game_condition) {
      const validConditions = ['new', 'like_new', 'good', 'fair', 'poor'];
      if (!validConditions.includes(updates.game_condition)) {
        return NextResponse.json(
          { success: false, error: 'Invalid game condition' },
          { status: 400 }
        );
      }
    }

    // Update game in collection
    await updateGameInCollection(gameId, updates);

    return NextResponse.json({
      success: true,
      message: 'Game updated successfully',
    });
  } catch (error) {
    console.error('Error updating game in collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update game in collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      );
    }

    // Remove game from collection
    await removeGameFromCollection(gameId, profile.id);

    return NextResponse.json({
      success: true,
      message: 'Game removed from collection successfully',
    });
  } catch (error) {
    console.error('Error removing game from collection:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove game from collection' },
      { status: 500 }
    );
  }
} 