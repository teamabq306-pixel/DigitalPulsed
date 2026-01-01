import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { reportId, lang = 'es' } = await req.json();

  const { data: report, error } = await supabaseAdmin
    .from('reconciliation_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error || !report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  // Simulated AI Reasoning Logic
  let explanation = '';
  const { total_transactions, mismatches, summary } = report;

  if (lang === 'en') {
    if (mismatches === 0) {
      explanation = `Today the system processed ${total_transactions} transactions with 100% precision. All records in Stripe match our local system perfectly. No manual action is required.`;
    } else {
      explanation = `${mismatches} discrepancies were detected in today's processing out of a total of ${total_transactions} transactions. 
      
Possible causes identified:
1. Refunds in process: Some transactions may be marked as "succeeded" in Stripe but pending registration in the ERP.
2. Timing issues: Transactions made near midnight might fall into different reporting periods.
3. Webhook Latency: A delay in receiving the Stripe event prevented time-bound local registration.

Suggested actions:
- Manually review IDs: ${summary.mismatched_ids?.slice(0, 3).join(', ')}.
- Manually sync the last 5 minutes of Stripe transactions.`;
    }
  } else {
    if (mismatches === 0) {
      explanation = `Hoy el sistema procesó ${total_transactions} transacciones con una precisión del 100%. Todos los registros en Stripe coinciden perfectamente con nuestro sistema local. No se requiere ninguna acción manual.`;
    } else {
      explanation = `Se detectaron ${mismatches} discrepancias en el procesamiento de hoy de un total de ${total_transactions} transacciones. 
      
Posibles causas identificadas:
1. Reembolsos en proceso: Algunas transacciones pueden estar marcadas como "succeeded" en Stripe pero pendientes de registro en el ERP.
2. Timing issues: Transacciones realizadas cerca de la medianoche pueden caer en diferentes periodos de reporte.
3. Webhook Latency: Un retraso en la recepción del evento de Stripe impidió el registro local a tiempo.

Acciones sugeridas:
- Revisar manualmente los IDs: ${summary.mismatched_ids?.slice(0, 3).join(', ')}.
- Sincronizar manualmente los últimos 5 minutos de transacciones de Stripe.`;
    }
  }

  const { error: updateError } = await supabaseAdmin
    .from('reconciliation_reports')
    .update({ ai_explanation: explanation })
    .eq('id', reportId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ explanation });
}
