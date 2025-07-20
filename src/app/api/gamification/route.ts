import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getUserGamificationSummary,
  addExperience,
  checkAchievements,
  awardExperienceForAction
} from '@/lib/gamification-service';
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

    // Get gamification summary
    const summary = await getUserGamificationSummary(profile.id);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error('Error fetching gamification summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gamification summary' },
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
    const { action, amount, source, description, metadata } = body;

    if (action === 'add_experience') {
      // Add experience directly
      if (!amount || !source) {
        return NextResponse.json(
          { success: false, error: 'Amount and source are required' },
          { status: 400 }
        );
      }

      await addExperience(profile.id, amount, source, description, metadata);
      
      // Check for new achievements
      const newAchievements = await checkAchievements(profile.id);

      return NextResponse.json({
        success: true,
        message: 'Experience added successfully',
        newAchievements,
      });
    } else if (action === 'award_action') {
      // Award experience for a specific action
      if (!source) {
        return NextResponse.json(
          { success: false, error: 'Action source is required' },
          { status: 400 }
        );
      }

      await awardExperienceForAction(profile.id, source, metadata);
      
      // Check for new achievements
      const newAchievements = await checkAchievements(profile.id);

      return NextResponse.json({
        success: true,
        message: 'Action rewarded successfully',
        newAchievements,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing gamification action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process gamification action' },
      { status: 500 }
    );
  }
} 