import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  const mockStripeId = `pi_${Math.random().toString(36).substring(7)}`;
  
  // 1. Simulate Stripe successful payment
  const { error: stripeError } = await supabaseAdmin.from('transactions').insert({
    amount: 1000000,
    currency: 'VND',
    status: 'succeeded',
    source: 'stripe',
    external_id: mockStripeId,
    metadata: { demo: true }
  });

  if (stripeError) return NextResponse.json({ error: stripeError.message }, { status: 500 });

  // 2. Simulate ERP/Spreadsheet registration (90% success to create discrepancies)
  if (Math.random() > 0.1) {
    const { error: erpError } = await supabaseAdmin.from('transactions').insert({
      amount: 1000000,
      currency: 'VND',
      status: 'succeeded',
      source: 'manual', // Manual/ERP source
      external_id: `erp_${mockStripeId}`,
      metadata: { demo: true, link: mockStripeId }
    });
    if (erpError) return NextResponse.json({ error: erpError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, stripeId: mockStripeId });
}
