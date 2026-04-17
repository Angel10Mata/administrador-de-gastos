"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Gastosm from "@/components/Gastos/Gastosm";
import {
  Home, ChevronRight, ChevronLeft, Receipt, Plus, FileText, FileSpreadsheet,
  Utensils, Car, Lightbulb, ShoppingBag, Tag,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const categoriaIcono: Record<string, React.ElementType> = {
  Alimentación: Utensils,
  Transporte: Car,
  Servicios: Lightbulb,
  Compras: ShoppingBag,
  Otros: Tag,
};

export default function GastosPage() {
  const hoy = new Date();
  const [gastos, setGastos] = useState<any[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Navegación de mes: año y mes seleccionado (0-indexed)
  const [mesSelec, setMesSelec] = useState(hoy.getMonth());
  const [anioSelec, setAnioSelec] = useState(hoy.getFullYear());

  const fmtQ = (n: number) =>
    `Q ${(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const nombreMes = new Date(anioSelec, mesSelec, 1).toLocaleString("es-GT", {
    month: "long",
    year: "numeric",
  });

  // ¿Se puede ir al mes siguiente? (no más allá del mes actual)
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

  const cargarGastos = async () => {
    setCargando(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .order("fecha", { ascending: false });
      if (!error && data) setGastos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarGastos(); }, []);

  const handleCompletado = () => {
    setMostrarFormulario(false);
    cargarGastos();
  };

  // Filtrar por mes seleccionado
  const gastosMes = useMemo(() =>
    gastos.filter((g) => {
      if (!g.fecha) return false;
      const f = new Date(g.fecha);
      return f.getMonth() === mesSelec && f.getFullYear() === anioSelec;
    }),
    [gastos, mesSelec, anioSelec]
  );

  // Filtrar además por búsqueda
  const gastosFiltrados = useMemo(() =>
    gastosMes.filter((g) =>
      g.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.categoria?.toLowerCase().includes(busqueda.toLowerCase())
    ),
    [gastosMes, busqueda]
  );

  // Métricas
  const totalMes = gastosMes.reduce((s, g) => s + (Number(g.monto) || 0), 0);
  const totalGeneral = gastos.reduce((s, g) => s + (Number(g.monto) || 0), 0);
  const porCategoria = gastosMes.reduce<Record<string, number>>((acc, g) => {
    const cat = g.categoria || "Otros";
    acc[cat] = (acc[cat] || 0) + Number(g.monto || 0);
    return acc;
  }, {});
  const categoriaMayor = Object.entries(porCategoria).sort((a, b) => b[1] - a[1])[0];

  // ── Exportar PDF ──
  const exportarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-GT");
    doc.setFontSize(14); doc.setFont("helvetica", "bold");
    doc.text(`Gastos — ${nombreMes}`, 14, 18);
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.setTextColor(100); doc.text(`Generado: ${fecha}`, 14, 25);
    autoTable(doc, {
      startY: 30,
      head: [["Descripción", "Categoría", "Monto", "Fecha"]],
      body: gastosFiltrados.map((g) => [
        g.descripcion, g.categoria || "—", fmtQ(g.monto),
        g.fecha ? new Date(g.fecha).toLocaleDateString("es-GT") : "—",
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    doc.save(`Gastos_${nombreMes.replace(/ /g, "_")}.pdf`);
  };

  // ── Exportar Excel ──
  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      gastosFiltrados.map((g) => ({
        Descripción: g.descripcion,
        Categoría: g.categoria || "",
        Monto: g.monto,
        Fecha: g.fecha ? new Date(g.fecha).toLocaleDateString("es-GT") : "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gastos");
    XLSX.writeFile(wb, `Gastos_${nombreMes.replace(/ /g, "_")}.xlsx`);
  };

  return (
    <main className="p-6 md:p-8 w-full max-w-6xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/kore" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home size={13} /> Inicio
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-amber-500 font-medium flex items-center gap-1">
          <Receipt size={13} /> Gastos
        </span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-7">
        <div className="min-w-0">
          <h1
            className="text-2xl sm:text-3xl leading-[1.1] text-foreground mb-1"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Mis gastos del mes
          </h1>
        </div>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="flex-shrink-0 flex items-center gap-1.5 bg-foreground text-background rounded-lg px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Nuevo
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

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
        {[
          {
            label: "Gastos",
            val: totalMes,
            sub: `${gastosMes.length} reg.`,
            accent: "bg-amber-500",
            color: "text-amber-600 dark:text-amber-400",
          },
          {
            label: "Mayor cat.",
            val: categoriaMayor ? categoriaMayor[1] : 0,
            sub: categoriaMayor ? categoriaMayor[0] : "N/A",
            accent: "bg-emerald-500",
            color: "text-emerald-600 dark:text-emerald-400",
          },
        ].map((m) => (
          <div key={m.label} className="relative bg-muted/40 rounded-xl px-3 sm:px-5 py-3 sm:py-4 overflow-hidden">
            <div className={`absolute top-0 left-0 w-[3px] h-full rounded-l-xl ${m.accent}`} />
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground mb-1 sm:mb-2 pl-1 capitalize">{m.label}</p>
            <p className={`font-mono text-sm sm:text-xl font-medium pl-1 ${m.color}`} style={{ fontFamily: "'DM Mono', monospace" }}>
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
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 10l2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Buscar gasto o categoría..."
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
                {["Descripción", "Categoría", "Monto", "Fecha"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground animate-pulse">
                    Cargando gastos...
                  </td>
                </tr>
              ) : gastosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {busqueda
                      ? `Sin resultados para "${busqueda}"`
                      : `No hay gastos registrados en ${nombreMes}.`}
                  </td>
                </tr>
              ) : (
                gastosFiltrados.map((g, i) => {
                  const Icono = categoriaIcono[g.categoria] || Tag;
                  return (
                    <tr
                      key={g.id}
                      className={`hover:bg-muted/20 transition-colors ${i < gastosFiltrados.length - 1 ? "border-b border-border/10" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground">{g.descripcion}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-full px-2.5 py-1">
                          <Icono size={11} />
                          {g.categoria || "Otros"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-amber-500" style={{ fontFamily: "'DM Mono', monospace" }}>
                        {fmtQ(g.monto)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {g.fecha
                          ? new Date(g.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })
                          : "—"}
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
          [1,2,3].map(i => <div key={i} className="h-20 bg-muted/40 rounded-xl animate-pulse" />)
        ) : gastosFiltrados.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            {busqueda
              ? `Sin resultados para "${busqueda}"`
              : `No hay gastos registrados en ${nombreMes}.`}
          </p>
        ) : (
          gastosFiltrados.map((g) => {
            const Icono = categoriaIcono[g.categoria] || Tag;
            return (
              <div key={g.id} className="border border-border/20 rounded-xl p-4 bg-muted/10">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium">{g.descripcion}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5 whitespace-nowrap">
                      <Icono size={10} />
                      {g.categoria || "Otros"}
                    </span>
                  </div>
                  <p className="font-mono text-sm text-amber-500 font-medium whitespace-nowrap ml-2" style={{ fontFamily: "'DM Mono', monospace" }}>
                    {fmtQ(g.monto)}
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-3 pt-2 border-t border-border/10">
                  <span>Fecha de registro</span>
                  <span>{g.fecha ? new Date(g.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <Gastosm
              onCompletado={handleCompletado}
              onCancelar={() => setMostrarFormulario(false)}
            />
          </div>
        </div>
      )}
    </main>
  );
}