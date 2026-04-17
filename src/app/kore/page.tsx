"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard, CreditCard, Clock, Receipt, TrendingDown,
  ChevronLeft, ChevronRight as ChevronRightIcon, Bell, AlertTriangle, Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PanelDeControl() {
  const hoy = new Date();
  const [metricas, setMetricas] = useState({
    totalDeudas: 0, totalAbonado: 0, saldoPendiente: 0, totalGastosMes: 0,
  });
  const [deudas, setDeudas] = useState<any[]>([]);
  const [datosGrafica, setDatosGrafica] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);

  // Selector de mes
  const [mesSelec, setMesSelec] = useState(hoy.getMonth());
  const [anioSelec, setAnioSelec] = useState(hoy.getFullYear());
  const esMesActual = mesSelec === hoy.getMonth() && anioSelec === hoy.getFullYear();

  const irMesAnterior = () => {
    if (mesSelec === 0) { setMesSelec(11); setAnioSelec((a) => a - 1); }
    else setMesSelec((m) => m - 1);
  };
  const irMesSiguiente = () => {
    if (esMesActual) return;
    if (mesSelec === 11) { setMesSelec(0); setAnioSelec((a) => a + 1); }
    else setMesSelec((m) => m + 1);
  };

  const nombreMes = new Date(anioSelec, mesSelec, 1)
    .toLocaleString("es-GT", { month: "long", year: "numeric" });

  const fmtQ = (n: number | string | undefined | null) => {
    const valor = Number(n) || 0;
    return `Q ${valor.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setCargando(false); return; }

      const [deudasRes, gastosRes] = await Promise.all([
        supabase.from("deudas").select("*").eq("usuario_id", user.id).order("created_at", { ascending: false }),
        supabase.from("gastos").select("*").eq("usuario_id", user.id).order("fecha", { ascending: true }),
      ]);

      const deudasData = deudasRes.data || [];
      const gastosData = gastosRes.data || [];

      const totalOriginal = deudasData.reduce((s, d) => s + (Number(d.monto_original) || 0), 0);
      const totalAbonado = deudasData.reduce((s, d) => s + (Number(d.monto_abonado) || 0), 0);

      // Gastos del mes seleccionado
      const gastosMes = gastosData.filter((g) => {
        const f = new Date(g.fecha);
        return f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
      });
      const totalGastos = gastosMes.reduce((s, g) => s + (Number(g.monto) || 0), 0);

      // Gráfica acumulada del mes
      const porDia: Record<string, number> = {};
      gastosMes.forEach((g) => {
        const dia = new Date(g.fecha).getDate().toString();
        porDia[dia] = (porDia[dia] || 0) + Number(g.monto || 0);
      });
      const diasEnMes = new Date(anioSelec, mesSelec + 1, 0).getDate();
      const limDia = esMesActual ? hoy.getDate() : diasEnMes;
      let acum = 0;
      const grafica = Array.from({ length: diasEnMes }, (_, i) => {
        const dia = (i + 1).toString();
        acum += porDia[dia] || 0;
        return { dia: `${i + 1}`, gasto: Math.round(acum * 100) / 100 };
      }).filter((_, i) => i < limDia);

      setMetricas({ totalDeudas: totalOriginal, totalAbonado, saldoPendiente: totalOriginal - totalAbonado, totalGastosMes: totalGastos });
      setDeudas(deudasData);
      setDatosGrafica(grafica);
      setCargando(false);
    };
    cargarDatos();
  }, [mesSelec, anioSelec]);

  const pctAbonado = metricas.totalDeudas ? Math.round((metricas.totalAbonado / metricas.totalDeudas) * 100) : 0;
  const barColor = (pct: number) => {
    if (pct >= 100) return "bg-emerald-500";
    if (pct >= 50) return "bg-indigo-500";
    return "bg-red-500";
  };



  // Pills desde abril 2026 hasta el mes actual
  const pills = useMemo(() => {
    const inicio = new Date(2026, 3, 1);
    const lista: Date[] = [];
    const cursor = new Date(inicio);
    while (cursor <= new Date(hoy.getFullYear(), hoy.getMonth(), 1)) {
      lista.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return lista;
  }, []);

  return (
    <main className="flex w-full min-h-screen bg-background text-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>



      {/* ── Main Content ── */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1">
            <LayoutDashboard size={13} /> Panel
          </span>
          <ChevronRightIcon size={12} className="opacity-40" />
          <span className="text-emerald-500 font-medium">Resumen</span>
        </nav>

        {/* Header con botón de notificaciones */}
        <div className="flex items-start justify-between mb-6 relative">
          <h1 className="text-3xl leading-[1.15] text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Resumen<br />
            <em className="italic text-muted-foreground">financiero</em>
          </h1>

          {!cargando && (() => {
            const hoy = new Date();
            const pendientes = deudas
              .filter((d) => d.fecha_pago && d.estado !== "Pagada")
              .sort((a, b) => new Date(a.fecha_pago).getTime() - new Date(b.fecha_pago).getTime());
              
            const countVencidas = pendientes.filter(d => Math.ceil((new Date(d.fecha_pago).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)) < 0).length;
            const countProximas = pendientes.filter(d => {
              const dias = Math.ceil((new Date(d.fecha_pago).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
              return dias >= 0 && dias <= 7;
            }).length;

            const totalAlertas = countVencidas + countProximas;

            return (
              <div className="relative">
                <button
                  onClick={() => setMostrarAlertas(!mostrarAlertas)}
                  className="relative p-2.5 rounded-full bg-muted/40 hover:bg-muted border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                >
                  <Bell size={18} />
                  {totalAlertas > 0 && (
                    <span className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-4 h-4 bg-red-500 rounded-full border-2 border-background text-[10px] font-bold text-white flex items-center justify-center">
                      {totalAlertas}
                    </span>
                  )}
                </button>

                {mostrarAlertas && (
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-3 border-b border-border/20 pb-2">
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <Bell size={14} className="text-amber-500" />
                        Próximos Pagos
                      </h3>
                      <button onClick={() => setMostrarAlertas(false)} className="text-muted-foreground hover:text-foreground">
                        &times;
                      </button>
                    </div>

                    {pendientes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No hay deudas pendientes con fecha.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {pendientes.map((d) => {
                          const dias = Math.ceil((new Date(d.fecha_pago).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                          const vencida = dias < 0;
                          const proxima = dias >= 0 && dias <= 7;
                          
                          let bgBorder = "opacity-75 hover:opacity-100 bg-muted/30";
                          let iconColor = "text-muted-foreground/50";
                          let iconBg = "bg-muted";
                          
                          if (vencida) {
                            bgBorder = "bg-red-500/8 border border-red-500/25";
                            iconColor = "text-red-400";
                            iconBg = "bg-red-500/15";
                          } else if (proxima) {
                            bgBorder = "bg-amber-500/8 border border-amber-500/25";
                            iconColor = "text-amber-500";
                            iconBg = "bg-amber-500/15";
                          } else {
                            bgBorder = "bg-background border border-border/30 hover:bg-muted/40";
                          }

                          return (
                            <Link
                              key={d.id}
                              href="/kore/deudas"
                              onClick={() => setMostrarAlertas(false)}
                              className={`flex items-start gap-3 p-3 rounded-xl transition-all ${bgBorder}`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${iconBg} ${iconColor}`}>
                                {vencida ? <AlertTriangle size={13} /> : <Calendar size={13} />}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{d.nombre}</p>
                                <p className="text-[10px] sm:text-xs opacity-70 mt-0.5">
                                  {vencida && <strong className="text-red-400 font-semibold mr-1">¡Vencida!</strong>}
                                  {proxima && <strong className="text-amber-500 font-semibold mr-1">¡Pronto!</strong>}
                                  {vencida ? `Pasó hace ${Math.abs(dias)}d` : `Faltan ${dias}d`}
                                  <span className="mx-1.5 opacity-40">•</span> 
                                  {new Date(d.fecha_pago).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Selector de mes ── */}
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={irMesAnterior}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="text-sm font-medium text-foreground capitalize min-w-[140px] text-center">
            {nombreMes}
          </span>

          <button
            onClick={irMesSiguiente}
            disabled={esMesActual}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon size={15} />
          </button>
        </div>




        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link href="/kore/deudas" className="border border-border/20 rounded-2xl p-6 hover:bg-muted/30 transition-colors group">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Saldo pendiente total</p>
            {cargando ? <Skeleton className="h-10 w-48 mb-2" /> : (
              <p className="font-mono text-4xl text-red-500 leading-none mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                {fmtQ(metricas.saldoPendiente)}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              De {fmtQ(metricas.totalDeudas)} originales — {pctAbonado}% abonado
            </p>
          </Link>

          <Link href="/kore/gastos" className="border border-border/20 rounded-2xl p-6 hover:bg-muted/30 transition-colors">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4 capitalize">
              Gastos — {nombreMes}
            </p>
            {cargando ? <Skeleton className="h-10 w-48 mb-2" /> : (
              <p className="font-mono text-4xl text-amber-500 leading-none mb-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                {fmtQ(metricas.totalGastosMes)}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <TrendingDown size={12} /> Tendencia de consumo actual
            </p>
          </Link>
        </div>

        {/* Deudas recientes */}
        <div className="w-full">
          <div className="border border-border/20 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
               <span className="text-sm font-medium">Deudas recientes</span>
               <Link href="/kore/deudas" className="text-[10px] text-muted-foreground hover:text-foreground">Ver todas →</Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
               {cargando ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />) : deudas.slice(0, 4).map((d) => (
                 <div key={d.id} className="flex flex-col gap-2">
                   <div className="flex justify-between text-sm">
                     <span className="font-medium">{d.nombre}</span>
                     <span className="font-mono text-xs">{fmtQ(d.monto_original - d.monto_abonado)}</span>
                   </div>
                   <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                     <div
                       className={`h-full ${barColor(Math.round((d.monto_abonado / d.monto_original) * 100))}`}
                       style={{ width: `${(d.monto_abonado / d.monto_original) * 100}%` }}
                     />
                   </div>
                 </div>
               ))}
             </div>
           </div>
         </div>

      </div>
    </main>
  );
}