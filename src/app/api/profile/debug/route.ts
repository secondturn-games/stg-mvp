import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getCurrentUserProfile, updateUserProfile } from '@/lib/user-service'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from Clerk
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const email = clerkUser.emailAddresses[0]?.emailAddress

    // Get current profile
    const currentProfile = await getCurrentUserProfile()

    return NextResponse.json({
      clerkUserId: userId,
      clerkEmail: email,
      currentProfile,
      hasProfile: !!currentProfile
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { testUpdate } = body

    // Try a simple update
    const updatedProfile = await updateUserProfile({
      username: testUpdate || 'test-update'
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Update test error:', error)
    return NextResponse.json(
      { error: 'Update test failed', details: error },
      { status: 500 }
    )
  }
} 