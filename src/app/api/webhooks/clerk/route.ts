import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Get the headers
  const headerPayload = headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    // Create user profile in Supabase
    const { id: clerkId, email_addresses, username } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (email) {
      try {
        await supabase.from('users').insert({
          clerk_id: clerkId,
          username: username || email.split('@')[0],
          email: email,
          location_country: 'EE', // Default to Estonia
          location_city: '',
        });
      } catch (error) {
        console.error('Error creating user in Supabase:', error);
      }
    }
  }

  if (eventType === 'user.updated') {
    // Update user profile in Supabase
    const { id: clerkId, email_addresses, username } = evt.data;
    const email = email_addresses?.[0]?.email_address;

    if (email) {
      try {
        await supabase
          .from('users')
          .update({
            username: username || email.split('@')[0],
            email: email,
          })
          .eq('clerk_id', clerkId);
      } catch (error) {
        console.error('Error updating user in Supabase:', error);
      }
    }
  }

  if (eventType === 'user.deleted') {
    // Delete user profile from Supabase
    const { id: clerkId } = evt.data;

    try {
      await supabase.from('users').delete().eq('clerk_id', clerkId);
    } catch (error) {
      console.error('Error deleting user from Supabase:', error);
    }
  }

  return NextResponse.json({ message: 'Success' });
}