import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST() {
  // Fetch today's transactions
  const { data: transactions, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const stripeTx = transactions.filter(t => t.source === 'stripe');
  const manualTx = transactions.filter(t => t.source === 'manual');

  const matched = [];
  const mismatches = [];

  stripeTx.forEach(st => {
    // Basic match: Look for a manual transaction with a reference to this stripe ID
    const match = manualTx.find(mt => mt.metadata?.link === st.external_id || mt.amount === st.amount);
    if (match) {
      matched.push({ stripe: st, erp: match });
    } else {
      mismatches.push(st);
    }
  });

  const report = {
    total_transactions: stripeTx.length,
    mismatches: mismatches.length,
    summary: {
      matched_count: matched.length,
      mismatched_ids: mismatches.map(m => m.external_id),
      mismatched_details: mismatches.map(m => `Missing record locally for Stripe transaction ${m.external_id} (${m.amount} ${m.currency})`)
    }
  };

  const { data: savedReport, error: reportError } = await supabaseAdmin
    .from('reconciliation_reports')
    .insert(report)
    .select()
    .single();

  if (reportError) return NextResponse.json({ error: reportError.message }, { status: 500 });

  return NextResponse.json({ report: savedReport });
}
