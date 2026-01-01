"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Zap, 
  Terminal as TerminalIcon, 
  Layers, 
  BrainCircuit,
  RefreshCcw,
  Clock,
  ExternalLink,
  Loader2,
  Sparkles,
  Database
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import { toast, Toaster } from 'sonner';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  const t = {
    es: {
      nav: { solution: "Solución", automation: "Automatización", ai: "IA Predictiva", demo: "Fase Demo" },
      hero: { 
        badge: "La Conciliación Financiera es ahora Automática",
        title: "¿DÓNDE ESTÁN {0} TRANSACCIONES?",
        italic: "ESAS 3",
        stripe: "Stripe Hoy",
        erp: "ERP/Local Hoy",
        discrepancy: "Discrepancia",
        success: "Éxitos",
        records: "Registros",
        difference: "Diferencia"
      },
      buttons: { simulate: "Simular Pago (Stripe)", reconcile: "Ejecutar Conciliación", simulating: "Simulando evento de pago...", errorDemo: "Error al disparar demo" },
      monitor: { title: "Monitor de Eventos", empty: "No se han detectado eventos aún...", toastNew: "Nueva transacción detectada en tiempo real", success: "Conciliación completada", error: "Error en la conciliación" },
      ai: { 
        title: "Análisis Predictivo IA", 
        processing: "Procesando reconciliación...", 
        patterns: "Analizando patrones de discrepancia...",
        placeholder: "Ejecuta la conciliación para recibir una explicación detallada de la IA sobre tus finanzas hoy.",
        ready: "Fase 1 Ready",
        report: "Reporte Generado"
      },
      cta: { title: "¿LISTO PARA ELIMINAR LAS HORAS ABURRIDAS?", button: "Prueba Gratis 14 Días", setup: "Configuración en 15 mins" },
      footer: { copyright: "© 2025 Concily.AI — Automatización Financiera Predictiva" }
    },
    en: {
      nav: { solution: "Solution", automation: "Automation", ai: "Predictive AI", demo: "Demo Phase" },
      hero: { 
        badge: "Financial Reconciliation is now Automatic",
        title: "WHERE ARE {0} TRANSACTIONS?",
        italic: "THOSE 3",
        stripe: "Stripe Today",
        erp: "ERP/Local Today",
        discrepancy: "Discrepancy",
        success: "Successes",
        records: "Records",
        difference: "Difference"
      },
      buttons: { simulate: "Simulate Payment (Stripe)", reconcile: "Run Reconciliation", simulating: "Simulating payment event...", errorDemo: "Error triggering demo" },
      monitor: { title: "Event Monitor", empty: "No events detected yet...", toastNew: "New transaction detected in real-time", success: "Reconciliation completed", error: "Reconciliation error" },
      ai: { 
        title: "AI Predictive Analysis", 
        processing: "Processing reconciliation...", 
        patterns: "Analyzing discrepancy patterns...",
        placeholder: "Run reconciliation to receive a detailed AI explanation of your finances today.",
        ready: "Phase 1 Ready",
        report: "Report Generated"
      },
      cta: { title: "READY TO ELIMINATE THE BORING HOURS?", button: "Start 14-Day Free Trial", setup: "15 min setup" },
      footer: { copyright: "© 2025 Concily.AI — Predictive Financial Automation" }
    }
  }[lang];

  useEffect(() => {
    fetchTransactions();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          setTransactions(prev => [payload.new, ...prev].slice(0, 10));
          toast.success(t.monitor.toastNew);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setTransactions(data);
  };

  const triggerDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.info(t.buttons.simulating);
      }
    } catch (e) {
      toast.error(t.buttons.errorDemo);
    } finally {
      setLoading(false);
    }
  };

  const runReconciliation = async () => {
    setReconciling(true);
    setAiExplanation(null);
    try {
      const res = await fetch('/api/reconcile', { method: 'POST' });
      const data = await res.json();
      if (data.report) {
        setReport(data.report);
        toast.success(t.monitor.success);
        
        // Get AI Explanation
        const aiRes = await fetch('/api/ai-explain', {
          method: 'POST',
          body: JSON.stringify({ reportId: data.report.id, lang })
        });
        const aiData = await aiRes.json();
        setAiExplanation(aiData.explanation);
      }
    } catch (e) {
      toast.error(t.monitor.error);
    } finally {
      setReconciling(false);
    }
  };

  const stripeCount = transactions.filter(t => t.source === 'stripe').length;
  const manualCount = transactions.filter(t => t.source === 'manual').length;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      <Toaster position="top-center" richColors theme="dark" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-amber-900/10 blur-[100px] rounded-full" />
      </div>

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.4)] group-hover:scale-110 transition-transform duration-300">
              <RefreshCcw className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Concily.AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#solucion" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px] font-bold">{t.nav.solution}</a>
            <a href="#automatizacion" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px] font-bold">{t.nav.automation}</a>
            <a href="#ia" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px] font-bold">{t.nav.ai}</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
              className="text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg bg-white/5"
            >
              {lang === 'es' ? 'EN' : 'ES'}
            </button>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 hover:text-white rounded-full px-6" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
              {t.nav.demo}
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative pt-32 pb-20">
        <section className="max-w-7xl mx-auto px-6 text-center mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-6 border-emerald-500/30 text-emerald-400 bg-emerald-500/5 px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase">
              {t.hero.badge}
            </Badge>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[0.9] max-w-5xl mx-auto">
              {t.hero.title.split('{0}')[0]}<span className="text-emerald-500 italic block sm:inline">{t.hero.italic}</span>{t.hero.title.split('{0}')[1]}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <p className="text-xs uppercase text-white/40 mb-1 font-bold">{t.hero.stripe}</p>
              <p className="text-2xl font-mono font-bold text-white tracking-widest leading-none">{stripeCount}</p>
              <p className="text-[10px] text-white/20 mt-1">{t.hero.success}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative">
              <p className="text-xs uppercase text-white/40 mb-1 font-bold">{t.hero.erp}</p>
              <p className="text-2xl font-mono font-bold text-amber-500 tracking-widest leading-none">{manualCount}</p>
              <p className="text-[10px] text-white/20 mt-1">{t.hero.records}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative">
              <p className="text-xs uppercase text-white/40 mb-1 font-bold">{t.hero.discrepancy}</p>
              <p className="text-2xl font-mono font-bold text-red-500 tracking-widest leading-none">{Math.abs(stripeCount - manualCount)}</p>
              <p className="text-[10px] text-white/20 mt-1">{t.hero.difference}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={triggerDemo} 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8 h-14 text-md font-bold transition-all shadow-lg shadow-emerald-600/20 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
              {t.buttons.simulate}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={runReconciliation}
              disabled={reconciling}
              className="border-white/10 hover:bg-white/5 text-white rounded-full px-8 h-14 font-bold"
            >
              {reconciling ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
              {t.buttons.reconcile}
            </Button>
          </div>
        </section>

        {/* Real-time Dashboard Section */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Feed */}
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <h3 className="font-bold text-xl">{t.monitor.title}</h3>
                </div>
                <Badge variant="outline" className="border-white/10">Live</Badge>
              </div>
              
              <div className="space-y-3 font-mono text-sm max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                  {transactions.length === 0 ? (
                    <p className="text-white/20 italic text-center py-10">{t.monitor.empty}</p>
                  ) : (
                    transactions.map((tx) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${tx.source === 'stripe' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {tx.source === 'stripe' ? <ExternalLink className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-white/80 font-bold">{tx.amount.toLocaleString()} {tx.currency}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-tighter">{tx.external_id}</p>
                          </div>
                        </div>
                        <Badge className={`${tx.source === 'stripe' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'} border-none text-[10px]`}>
                          {tx.source === 'stripe' ? 'STRIPE' : 'LOCAL/ERP'}
                        </Badge>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI Result */}
            <div className="p-8 rounded-[2.5rem] bg-indigo-900/10 border border-indigo-500/20 backdrop-blur-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-32 h-32 text-indigo-400" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                  <h3 className="font-bold text-xl">{t.ai.title}</h3>
                </div>

                {reconciling ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mb-4" />
                    <p className="text-indigo-300 font-bold">{t.ai.processing}</p>
                    <p className="text-indigo-300/40 text-sm mt-1 italic">{t.ai.patterns}</p>
                  </div>
                ) : aiExplanation ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1"
                  >
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-6 font-mono text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap">
                      {aiExplanation}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/40 uppercase font-bold tracking-widest">{t.ai.report}</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-none">
                        {t.ai.ready}
                      </Badge>
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-indigo-500/10 rounded-2xl">
                    <p className="text-white/20 text-sm px-10">
                      {t.ai.placeholder}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="solucion" className="max-w-7xl mx-auto px-6 mb-40">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-8 p-10 rounded-[3rem] bg-zinc-900/50 border border-white/10 relative overflow-hidden group"
            >
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none mb-4">{lang === 'es' ? 'Tiempo Real' : 'Real-time'}</Badge>
                  <h3 className="text-4xl font-bold mb-4 tracking-tight">{lang === 'es' ? 'Automatización de Eventos de Pago' : 'Payment Event Automation'}</h3>
                  <ul className="space-y-4 text-white/60">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>{lang === 'es' ? 'Verifica firmas de webhooks instantáneamente' : 'Instantly verify webhook signatures'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>{lang === 'es' ? 'Registra monto, moneda, hora y customer_id' : 'Log amount, currency, time, and customer_id'}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1 shrink-0" />
                      <span>{lang === 'es' ? 'Sincronización con Google Sheets & Slack' : 'Sync with Google Sheets & Slack'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-4 p-8 rounded-[3rem] bg-zinc-900 border border-white/10 flex flex-col justify-between"
            >
              <div>
                <Badge className="bg-amber-500/20 text-amber-300 border-none mb-4">{lang === 'es' ? 'Daily Sync' : 'Daily Sync'}</Badge>
                <h3 className="text-2xl font-bold mb-4">{lang === 'es' ? 'Conciliación (24/7)' : 'Reconciliation (24/7)'}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  {lang === 'es' ? 'Extrae, coincide por monto y tiempo (±5 min), y detecta transacciones faltantes o extra automáticamente.' : 'Extract, match by amount and time (±5 min), and automatically detect missing or extra transactions.'}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="automatizacion" className="max-w-7xl mx-auto px-6 mb-40 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 tracking-tight text-center">{lang === 'es' ? 'Arquitectura del' : 'Architecture of the'} <span className="text-emerald-500">{lang === 'es' ? 'Flujo de Eventos' : 'Event Flow'}</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative">
            {[
              { title: lang === 'es' ? 'Proveedor' : 'Provider', icon: <ExternalLink className="w-6 h-6" />, color: 'text-blue-400' },
              { title: lang === 'es' ? 'API Ingesta' : 'Ingest API', icon: <TerminalIcon className="w-6 h-6" />, color: 'text-emerald-400' },
              { title: lang === 'es' ? 'Normalizer' : 'Normalizer', icon: <BrainCircuit className="w-6 h-6" />, color: 'text-indigo-400' },
              { title: lang === 'es' ? 'Base Datos' : 'Database', icon: <Layers className="w-6 h-6" />, color: 'text-zinc-400' },
              { title: lang === 'es' ? 'Acciones' : 'Actions', icon: <Zap className="w-6 h-6" />, color: 'text-amber-400' },
            ].map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center gap-4 relative"
              >
                <div className={`w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center ${step.color}`}>
                  {step.icon}
                </div>
                <h4 className="font-bold text-sm tracking-wide uppercase">{step.title}</h4>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6">
          <div className="p-16 rounded-[4rem] bg-emerald-600 text-center relative overflow-hidden group">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight relative z-10">{t.cta.title}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-full px-10 h-16 text-lg font-black shadow-2xl">{t.cta.button}</Button>
              <div className="flex items-center gap-2 text-white/80 font-bold tracking-tighter">
                <Clock className="w-5 h-5" />
                <span>{t.cta.setup}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-emerald-500" />
            <span className="font-bold text-lg">Concily.AI</span>
          </div>
          <p className="text-white/20 text-xs tracking-widest font-medium uppercase text-center">{t.footer.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
