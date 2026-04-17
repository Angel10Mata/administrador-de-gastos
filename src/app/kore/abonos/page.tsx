"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import FormularioAbono from "@/components/Abonos/Abono";
import { PiggyBank, Home, ChevronRight, ChevronLeft, Clock, Plus } from "lucide-react";
import { useUser } from "@/components/(base)/providers/UserProvider";

export default function AbonosPage() {
  const hoy = new Date();
  const user = useUser();
  const [abonos, setAbonos] = useState<any[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);

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

  const fmtQ = (n: number) =>
    `Q ${(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cargarAbonos = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("abonos")
      .select("*, deudas(nombre)")
      .eq("usuario_id", user?.id)
      .order("fecha", { ascending: false });
    if (data) setAbonos(data);
  };

  useEffect(() => { if (user?.id) cargarAbonos(); }, [user]);

  // Pills desde abril 2026
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

  // Filtrar por mes
  const abonosMes = useMemo(() =>
    abonos.filter((a) => {
      if (!a.fecha) return false;
      const f = new Date(a.fecha);
      return f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
    }),
    [abonos, mesSelec, anioSelec]
  );

  const totalMes = abonosMes.reduce((s, a) => s + (Number(a.monto) || 0), 0);

  return (
    <main className="p-6 md:p-8 w-full max-w-5xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/kore" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home size={13} /> Inicio
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-emerald-500 font-medium flex items-center gap-1">
          <Clock size={13} /> Abonos
        </span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1
            className="text-3xl leading-[1.1] text-foreground mb-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Historial<br />
            <em className="italic text-muted-foreground">de abonos</em>
          </h1>
          <p className="text-xs text-muted-foreground">Registro detallado de tus pagos realizados.</p>
        </div>
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Nuevo abono
        </button>
      </div>

      {/* ── Selector de mes ── */}
      <div className="flex items-center gap-3 mb-6">
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
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Métrica */}
      <div className="relative bg-muted/40 rounded-xl px-5 py-4 overflow-hidden mb-6 max-w-xs">
        <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl bg-emerald-500" />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 pl-1 capitalize">
          Abonado en {nombreMes}
        </p>
        <p className="font-mono text-xl font-medium pl-1 text-emerald-600 dark:text-emerald-400"
           style={{ fontFamily: "'DM Mono', monospace" }}>
          {fmtQ(totalMes)}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 pl-1">{abonosMes.length} registros</p>
      </div>

      {/* Tabla */}
      <div className="border border-border/20 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/40 border-b border-border/20">
              {["Fecha", "Deuda", "Monto"].map((h) => (
                <th key={h} className="px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {abonosMes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No hay abonos registrados en {nombreMes}.
                </td>
              </tr>
            ) : (
              abonosMes.map((a, i) => (
                <tr key={a.id} className={`hover:bg-muted/20 transition-colors ${i < abonosMes.length - 1 ? "border-b border-border/10" : ""}`}>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(a.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {a.deudas?.nombre || "Deuda eliminada"}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-emerald-500" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {fmtQ(a.monto)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <FormularioAbono
              onCancelar={() => setMostrarForm(false)}
              onCompletado={() => { setMostrarForm(false); cargarAbonos(); }}
            />
          </div>
        </div>
      )}
    </main>
  );
}