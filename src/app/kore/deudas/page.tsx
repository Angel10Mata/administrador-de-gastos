"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import FormularioDeuda from "@/components/Deudas/Deudass";
import { Edit, Plus, Home, ChevronRight, CreditCard, FileText, FileSpreadsheet, Bell } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Swal from "sweetalert2";

export default function DeudasPage() {
  const [deudas, setDeudas]                 = useState<any[]>([]);
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<any>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando]             = useState(true);
  const [busqueda, setBusqueda]             = useState("");

  const cargarDeudas = async () => {
    setCargando(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("deudas").select("*").order("created_at", { ascending: false });
      if (!error && data) setDeudas(data);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarDeudas(); }, []);

  // Alerta automática al cargar deudas con fecha próxima
  useEffect(() => {
    if (deudas.length === 0) return;
    const hoy = new Date();
    const proximas = deudas.filter((d) => {
      if (!d.fecha_pago || d.estado === "Pagada") return false;
      const dias = Math.ceil((new Date(d.fecha_pago).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return dias <= 7;
    });
    if (proximas.length === 0) return;
    const isDark = document.documentElement.classList.contains("dark");
    proximas.forEach((d) => {
      const dias = Math.ceil((new Date(d.fecha_pago).getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      const vencida = dias < 0;
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: vencida ? "error" : "warning",
        title: vencida
          ? `⚠️ "${d.nombre}" venció hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? "s" : ""}`
          : `🔔 "${d.nombre}" vence en ${dias} día${dias !== 1 ? "s" : ""}`,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        background: isDark ? "#1a1a1a" : "#fff",
        color: isDark ? "#fff" : "#000",
      });
    });
  }, [deudas]);

  const handleCompletado = () => {
    setMostrarFormulario(false);
    setDeudaSeleccionada(null);
    cargarDeudas();
  };

  const deudasFiltradas = deudas.filter((d) =>
    d.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.categoria?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalOriginal = deudas.reduce((s, d) => s + (Number(d.monto_original) || 0), 0);
  const totalAbonado  = deudas.reduce((s, d) => s + (Number(d.monto_abonado)  || 0), 0);
  const totalSaldo    = totalOriginal - totalAbonado;
  const pctAbonado    = totalOriginal ? Math.round((totalAbonado / totalOriginal) * 100) : 0;

  const fmtQ = (n: number) =>
    `Q ${(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const progreso = (d: any) => {
    if (!d.monto_original) return 0;
    return Math.min(100, Math.round((d.monto_abonado / d.monto_original) * 100));
  };

  const barColor = (pct: number) => {
    if (pct >= 100) return "bg-emerald-500";
    if (pct >= 50)  return "bg-indigo-500";
    return "bg-red-500";
  };

  const badgeStyle = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "pagada":  return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
      case "vencida": return "bg-red-500/10 text-red-800 dark:text-red-300";
      default:        return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
    }
  };

  // ── Exportar PDF ──
  const exportarPDF = () => {
    const doc  = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-GT");
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text("Reporte de Deudas", 14, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.setTextColor(100); doc.text(`Generado: ${fecha}`, 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Deuda", "Categoría", "Original", "Abonado", "Saldo", "Estado"]],
      body: deudasFiltradas.map(d => [
        d.nombre, d.categoria || "—",
        fmtQ(d.monto_original), fmtQ(d.monto_abonado),
        fmtQ((d.monto_original || 0) - (d.monto_abonado || 0)),
        d.estado || "Pendiente",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`Deudas_${fecha.replace(/\//g, "-")}.pdf`);
  };

  // ── Exportar Excel ──
  const exportarExcel = () => {
    const fecha = new Date().toLocaleDateString("es-GT");
    const ws = XLSX.utils.json_to_sheet(deudasFiltradas.map(d => ({
      "Deuda": d.nombre, "Categoría": d.categoria || "",
      "Monto Original": d.monto_original, "Monto Abonado": d.monto_abonado,
      "Saldo": (d.monto_original || 0) - (d.monto_abonado || 0),
      "Estado": d.estado || "Pendiente",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deudas");
    XLSX.writeFile(wb, `Deudas_${fecha.replace(/\//g, "-")}.xlsx`);
  };

  return (
    <main
      className="p-6 md:p-8 w-full max-w-6xl mx-auto"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/kore" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home size={13} /> Inicio
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-indigo-500 font-medium flex items-center gap-1">
          <CreditCard size={13} /> Deudas
        </span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-7">
        <div className="min-w-0">
          <h1
            className="text-2xl sm:text-3xl leading-[1.1] text-foreground mb-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Mis deudas
          </h1>
          <p className="text-xs text-muted-foreground">Administración de saldos y pagos</p>
        </div>
        <button
          onClick={() => { setDeudaSeleccionada(null); setMostrarFormulario(true); }}
          className="flex-shrink-0 flex items-center gap-1.5 bg-foreground text-background rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Nueva
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
        {[
          { label: "Total",   val: totalOriginal, sub: `${deudas.length} deudas`, accent: "bg-red-500",     color: "text-red-600 dark:text-red-400"     },
          { label: "Abonado", val: totalAbonado,  sub: `${pctAbonado}%`,          accent: "bg-emerald-500", color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Saldo",   val: totalSaldo,    sub: "Pendiente",               accent: "bg-amber-500",   color: "text-amber-600 dark:text-amber-400"  },
        ].map((m) => (
          <div key={m.label} className="relative bg-muted/40 rounded-xl px-3 sm:px-5 py-3 sm:py-4 overflow-hidden">
            <div className={`absolute top-0 left-0 w-[3px] h-full rounded-l-xl ${m.accent}`} />
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 sm:mb-2 pl-1">{m.label}</p>
            <p className={`font-mono text-sm sm:text-xl font-medium pl-1 ${m.color}`}
               style={{ fontFamily: "'DM Mono', monospace" }}>
              {fmtQ(m.val)}
            </p>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 sm:mt-1 pl-1">{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10 10l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar deuda o categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-lg border border-border/50 bg-muted/30 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-border transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportarPDF}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors"
          >
            <FileText size={13} /> PDF
          </button>
          <button
            onClick={exportarExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/10 transition-colors"
          >
            <FileSpreadsheet size={13} /> Excel
          </button>
        </div>
      </div>

      {/* Tabla — Desktop */}
      <div className="hidden sm:block border border-border/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/20">
                {["Deuda", "Original", "Abonado", "Saldo", "Progreso", "Estado", "Vence", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground animate-pulse">
                    Cargando deudas...
                  </td>
                </tr>
              ) : deudasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {busqueda ? `Sin resultados para "${busqueda}"` : "No tienes deudas registradas."}
                  </td>
                </tr>
              ) : (
                deudasFiltradas.map((d, i) => {
                  const pct   = progreso(d);
                  const saldo = (d.monto_original || 0) - (d.monto_abonado || 0);
                  return (
                    <tr
                      key={d.id}
                      className={`hover:bg-muted/20 transition-colors ${
                        i < deudasFiltradas.length - 1 ? "border-b border-border/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{d.nombre}</p>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                          {d.categoria || "General"}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-foreground"
                          style={{ fontFamily: "'DM Mono', monospace" }}>
                        {fmtQ(d.monto_original)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-emerald-600 dark:text-emerald-400"
                          style={{ fontFamily: "'DM Mono', monospace" }}>
                        {fmtQ(d.monto_abonado)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-red-500"
                          style={{ fontFamily: "'DM Mono', monospace" }}>
                        {fmtQ(saldo)}
                      </td>
                      <td className="px-4 py-3 min-w-[90px]">
                        <p className="text-[10px] text-muted-foreground mb-1">{pct}%</p>
                        <div className="w-full h-[3px] bg-border/30 rounded-full">
                          <div className={`h-[3px] rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium capitalize ${badgeStyle(d.estado)}`}>
                          {d.estado || "Pendiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.fecha_pago ? (() => {
                          const dias = Math.ceil((new Date(d.fecha_pago).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          if (dias < 0) return (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
                              <Bell size={9} /> Vencida
                            </span>
                          );
                          if (dias <= 7) return (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
                              <Bell size={9} /> {dias}d
                            </span>
                          );
                          return (
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(d.fecha_pago).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}
                            </span>
                          );
                        })() : (
                          <span className="text-[10px] text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => { setDeudaSeleccionada(d); setMostrarFormulario(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-border/40 bg-muted/30 hover:bg-muted transition-colors"
                        >
                          <Edit size={13} className="text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas — Mobile */}
      <div className="sm:hidden space-y-3">
        {cargando ? (
          [1,2,3].map(i => <div key={i} className="h-24 bg-muted/40 rounded-xl animate-pulse" />)
        ) : deudasFiltradas.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            {busqueda ? `Sin resultados para "${busqueda}"` : "No tienes deudas registradas."}
          </p>
        ) : deudasFiltradas.map((d) => {
          const pct   = progreso(d);
          const saldo = (d.monto_original || 0) - (d.monto_abonado || 0);
          return (
            <div key={d.id} className="border border-border/20 rounded-xl p-4 bg-muted/10">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm font-medium">{d.nombre}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{d.categoria || "General"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium capitalize ${badgeStyle(d.estado)}`}>
                    {d.estado || "Pendiente"}
                  </span>
                  <button
                    onClick={() => { setDeudaSeleccionada(d); setMostrarFormulario(true); }}
                    className="w-7 h-7 flex items-center justify-center rounded-md border border-border/40 bg-muted/30"
                  >
                    <Edit size={13} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Original</p>
                  <p className="font-mono text-xs font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>{fmtQ(d.monto_original)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Abonado</p>
                  <p className="font-mono text-xs text-emerald-500" style={{ fontFamily: "'DM Mono', monospace" }}>{fmtQ(d.monto_abonado)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Saldo</p>
                  <p className="font-mono text-xs text-red-400" style={{ fontFamily: "'DM Mono', monospace" }}>{fmtQ(saldo)}</p>
                </div>
              </div>
              <div className="w-full h-[3px] bg-border/30 rounded-full mb-1">
                <div className={`h-[3px] rounded-full ${barColor(pct)}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground">{pct}% pagado</p>
                {d.fecha_pago ? (() => {
                  const dias = Math.ceil((new Date(d.fecha_pago).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  if (dias < 0) return <span className="inline-flex items-center gap-1 text-[10px] text-red-400"><Bell size={9} /> Vencida</span>;
                  if (dias <= 7) return <span className="inline-flex items-center gap-1 text-[10px] text-amber-400"><Bell size={9} /> Vence en {dias}d</span>;
                  return <span className="text-[10px] text-muted-foreground">Vence {new Date(d.fecha_pago).toLocaleDateString("es-GT", { day: "2-digit", month: "short" })}</span>;
                })() : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-hide">
            <FormularioDeuda
              productoActual={deudaSeleccionada}
              onCompletado={handleCompletado}
              onCancelar={() => { setMostrarFormulario(false); setDeudaSeleccionada(null); }}
            />
          </div>
        </div>
      )}
    </main>
  );
}