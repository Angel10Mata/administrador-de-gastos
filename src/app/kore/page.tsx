"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard, TrendingDown, TrendingUp,
  ChevronLeft, ChevronRight as ChevronRightIcon, Bell, AlertTriangle, Calendar
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Dot,
  PieChart, Pie, Cell, Legend
} from "recharts";
import MonthDayPicker from "@/components/ui/month-day-picker";

export default function PanelDeControl() {
  const hoy = new Date();
  const [metricas, setMetricas] = useState({
    totalDeudas: 0, totalAbonado: 0, saldoPendiente: 0, totalGastosMes: 0, totalIngresosMes: 0
  });
  const [deudas, setDeudas] = useState<any[]>([]);
  const [datosGrafica, setDatosGrafica] = useState<any[]>([]);
  const [gastosCategoria, setGastosCategoria] = useState<{ name: string; value: number }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarAlertas, setMostrarAlertas] = useState(false);

  // Selector de mes / día
  const [mesSelec, setMesSelec] = useState(hoy.getMonth());
  const [anioSelec, setAnioSelec] = useState(hoy.getFullYear());
  const [diaSelec, setDiaSelec] = useState<number | null>(null);
  const esMesActual = mesSelec === hoy.getMonth() && anioSelec === hoy.getFullYear();

  const irMesAnterior = () => {
    setDiaSelec(null);
    if (mesSelec === 0) { setMesSelec(11); setAnioSelec((a) => a - 1); }
    else setMesSelec((m) => m - 1);
  };
  const irMesSiguiente = () => {
    if (esMesActual) return;
    setDiaSelec(null);
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

      const [deudasRes, gastosRes, ingresosRes] = await Promise.all([
        supabase.from("deudas").select("*").eq("usuario_id", user.id).order("created_at", { ascending: false }),
        supabase.from("gastos").select("*").eq("usuario_id", user.id).order("fecha", { ascending: true }),
        supabase.from("ingresos").select("*").eq("usuario_id", user.id).order("fecha", { ascending: true }),
      ]);

      const deudasData = deudasRes.data || [];
      const gastosData = gastosRes.data || [];
      const ingresosData = ingresosRes.data || [];

      const totalOriginal = deudasData.reduce((s, d) => s + (Number(d.monto_original) || 0), 0);
      const totalAbonado = deudasData.reduce((s, d) => s + (Number(d.monto_abonado) || 0), 0);

      // Gastos e ingresos del mes seleccionado (o día exacto si diaSelec != null)
      const gastosMes = gastosData.filter((g) => {
        if (!g.fecha) return false;
        const f = new Date(g.fecha.length === 10 ? g.fecha + "T00:00:00" : g.fecha);
        const mismoMes = f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
        if (!mismoMes) return false;
        if (diaSelec !== null) return f.getDate() === diaSelec;
        return true;
      });
      const ingresosMes = ingresosData.filter((i) => {
        if (!i.fecha) return false;
        const f = new Date(i.fecha.length === 10 ? i.fecha + "T00:00:00" : i.fecha);
        const mismoMes = f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
        if (!mismoMes) return false;
        if (diaSelec !== null) return f.getDate() === diaSelec;
        return true;
      });
      
      const totalGastos = gastosMes.reduce((s, g) => s + (Number(g.monto) || 0), 0);
      const totalIngresos = ingresosMes.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);

      // Gráfica de puntos: ingreso vs gasto por dia
      const diasEnMes = new Date(anioSelec, mesSelec + 1, 0).getDate();
      const limDia = diaSelec !== null ? diaSelec : (esMesActual ? hoy.getDate() : diasEnMes);
      const desdeDia = diaSelec !== null ? diaSelec - 1 : 0;

      // Siempre calcular porDia desde todos los datos del mes (sin filtro de día para la gráfica)
      const gastosMesCompleto = gastosData.filter((g) => {
        if (!g.fecha) return false;
        const f = new Date(g.fecha.length === 10 ? g.fecha + "T00:00:00" : g.fecha);
        return f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
      });
      const ingresosMesCompleto = ingresosData.filter((i) => {
        if (!i.fecha) return false;
        const f = new Date(i.fecha.length === 10 ? i.fecha + "T00:00:00" : i.fecha);
        return f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
      });

      const gastosPorDia: Record<string, number> = {};
      gastosMesCompleto.forEach((g) => {
        const dia = new Date(g.fecha.length === 10 ? g.fecha + "T00:00:00" : g.fecha).getDate().toString();
        gastosPorDia[dia] = (gastosPorDia[dia] || 0) + Number(g.monto || 0);
      });

      const ingresosPorDia: Record<string, number> = {};
      ingresosMesCompleto.forEach((i) => {
        const dia = new Date(i.fecha.length === 10 ? i.fecha + "T00:00:00" : i.fecha).getDate().toString();
        ingresosPorDia[dia] = (ingresosPorDia[dia] || 0) + Number(i.cantidad || 0);
      });

      const grafica = Array.from({ length: limDia - desdeDia }, (_, i) => {
        const diaNum = desdeDia + i + 1;
        const dia = diaNum.toString();
        return {
          dia: `${diaNum}`,
          gasto: Math.round((gastosPorDia[dia] || 0) * 100) / 100,
          ingreso: Math.round((ingresosPorDia[dia] || 0) * 100) / 100,
        };
      });

      setMetricas({ totalDeudas: totalOriginal, totalAbonado, saldoPendiente: totalOriginal - totalAbonado, totalGastosMes: totalGastos, totalIngresosMes: totalIngresos });
      setDeudas(deudasData);
      setDatosGrafica(grafica);

      // Calcular gastos por categoría para la dona
      const catMap: Record<string, number> = {};
      gastosMes.forEach((g) => {
        const cat = g.categoria || "Otros";
        catMap[cat] = (catMap[cat] || 0) + Number(g.monto || 0);
      });
      setGastosCategoria(
        Object.entries(catMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      );

      setCargando(false);
    };
    cargarDatos();
  }, [mesSelec, anioSelec, diaSelec]);

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

        <div className="flex items-start justify-between mb-6 relative">
          <h1 className="text-lg font-bold leading-[1.15] text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
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

        {/* ── Selector de fecha ── */}
        <div className="flex items-center gap-3 mb-7">
          <button
            onClick={irMesAnterior}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronLeft size={15} />
          </button>

          <MonthDayPicker
            anio={anioSelec}
            mes={mesSelec}
            dia={diaSelec}
            onChange={(a, m, d) => {
              setAnioSelec(a);
              setMesSelec(m);
              setDiaSelec(d);
            }}
          />

          <button
            onClick={irMesSiguiente}
            disabled={esMesActual}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40 bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRightIcon size={15} />
          </button>
        </div>




        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Panel Ingresos */}
          <Link href="/kore/ingresos" className="flex flex-col h-48 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-6 hover:bg-emerald-500/10 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TrendingUp className="text-emerald-500" size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Ingresos</span>
                {cargando ? (
                  <div className="h-6 w-24 mt-1 bg-muted rounded animate-pulse" />
                ) : (
                  <span className="font-mono text-xl md:text-2xl text-emerald-500 font-bold">{fmtQ(metricas.totalIngresosMes)}</span>
                )}
              </div>
            </div>
            <div className="mt-auto">
              <span className="text-sm font-medium text-emerald-700/80 uppercase tracking-widest flex items-center gap-2">
                Ver detalles &rarr;
              </span>
            </div>
          </Link>

          {/* Panel Egresos */}
          <Link href="/kore/gastos" className="flex flex-col h-48 border border-amber-500/30 bg-amber-500/5 rounded-2xl p-6 hover:bg-amber-500/10 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                <TrendingDown className="text-amber-500" size={20} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Egresos</span>
                {cargando ? (
                  <div className="h-6 w-24 mt-1 bg-muted rounded animate-pulse" />
                ) : (
                  <span className="font-mono text-xl md:text-2xl text-amber-500 font-bold">{fmtQ(metricas.totalGastosMes)}</span>
                )}
              </div>
            </div>
            <div className="mt-auto">
              <span className="text-sm font-medium text-amber-700/80 uppercase tracking-widest flex items-center gap-2">
                Ver detalles &rarr;
              </span>
            </div>
          </Link>
        </div>

        {/* ── Gráfica comparativa ── */}
        <div className="bg-muted/20 border border-border/30 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Comparativo del mes</p>
              <p className="text-xs text-muted-foreground capitalize">{nombreMes}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Ingresos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Egresos
              </span>
            </div>
          </div>

          {cargando ? (
            <div className="h-52 flex items-center justify-center">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          ) : datosGrafica.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
              Sin datos para este mes
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={datosGrafica} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradIngreso" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(datosGrafica.length / 6)}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.45 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `Q${v}`}
                />
                <Tooltip
                  cursor={{ stroke: "currentColor", strokeOpacity: 0.1, strokeWidth: 1 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-background border border-border/50 rounded-xl px-3 py-2.5 text-xs shadow-xl">
                        <p className="text-muted-foreground mb-2 font-medium">Día {label}</p>
                        {payload.map((p: any) => (
                          <p key={p.dataKey} className="font-mono font-semibold" style={{ color: p.color }}>
                            {p.dataKey === "ingreso" ? "Ingreso" : "Egreso"}: Q {Number(p.value).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ingreso"
                  name="Ingreso"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#gradIngreso)"
                  dot={(props: any) => {
                    if (!props.value) return <g key={props.key} />;
                    return <Dot key={props.key} {...props} r={3.5} fill="#10b981" strokeWidth={0} />;
                  }}
                  activeDot={{ r: 5, fill: "#10b981", strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="gasto"
                  name="Egreso"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#gradGasto)"
                  dot={(props: any) => {
                    if (!props.value) return <g key={props.key} />;
                    return <Dot key={props.key} {...props} r={3.5} fill="#f59e0b" strokeWidth={0} />;
                  }}
                  activeDot={{ r: 5, fill: "#f59e0b", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* ── Gráfica Dona: Gastos por categoría ── */}
        {!cargando && gastosCategoria.length > 0 && (() => {
          const COLORS = ["#f59e0b","#10b981","#6366f1","#ef4444","#8b5cf6","#06b6d4","#f97316","#84cc16"];
          const total = gastosCategoria.reduce((s, c) => s + c.value, 0);
          return (
            <div className="bg-muted/20 border border-border/30 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Gastos por categoría</p>
                  <p className="text-xs text-muted-foreground capitalize">{nombreMes}</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* Dona */}
                <div className="w-full md:w-auto shrink-0">
                  <ResponsiveContainer width={220} height={220}>
                    <PieChart>
                      <Pie
                        data={gastosCategoria}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={95}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {gastosCategoria.map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const item = payload[0];
                          return (
                            <div className="bg-background border border-border/50 rounded-xl px-3 py-2 text-xs shadow-xl">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <p className="font-mono text-amber-400">{fmtQ(item.value as number)}</p>
                              <p className="text-muted-foreground">{total ? Math.round((item.value as number / total) * 100) : 0}%</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Leyenda */}
                <div className="flex-1 flex flex-col gap-2 w-full">
                  {gastosCategoria.map((cat, idx) => {
                    const pct = total ? Math.round((cat.value / total) * 100) : 0;
                    return (
                      <div key={cat.name} className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[idx % COLORS.length] }} />
                        <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
                        <span className="font-mono text-xs text-foreground font-medium">{fmtQ(cat.value)}</span>
                        <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </main>
  );
}