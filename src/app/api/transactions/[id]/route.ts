import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transactionId = params.id;

    // Get transaction with related data
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        listings (
          id,
          games (
            title
          )
        ),
        users!transactions_seller_id_fkey (
          username
        )
      `)
      .eq('id', transactionId)
      .eq('buyer_id', userId)
      .single();

    if (error || !transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Format the response
    const formattedTransaction = {
      id: transaction.id,
      amount: transaction.amount,
      listingTitle: transaction.listings?.games?.title?.en || 'Game',
      sellerName: transaction.users?.username || 'Unknown Seller',
      completedAt: transaction.completed_at,
    };

    return NextResponse.json({
      success: true,
      transaction: formattedTransaction,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
} 