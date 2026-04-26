"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import FormularioIngreso from "@/components/Ingresos/Ingreso";
import { PiggyBank, Home, ChevronRight, TrendingDown, Plus, Edit } from "lucide-react";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { Skeleton } from "@/components/ui/skeleton";

export default function IngresosPage() {
  const user = useUser();
  const [ingresos, setIngresos] = useState<any[]>([]);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState<any>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(true);

  const fmtQ = (n: number) =>
    `Q ${(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cargarIngresos = async () => {
    setCargando(true);
    const supabase = createClient();
    try {
      if (!user?.id) return;
      
      const { data, error } = await supabase
        .from("ingresos")
        .select("*")
        .eq("usuario_id", user.id)
        .order("fecha", { ascending: false });
      if (!error && data) setIngresos(data);
    } catch (err) { console.error(err); }
    finally { setCargando(false); }
  };

  useEffect(() => { if (user?.id) cargarIngresos(); }, [user]);

  const totalGeneral = ingresos.reduce((s, i) => s + (Number(i.cantidad) || 0), 0);

  return (
    <main className="p-6 md:p-8 w-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
        <Link href="/kore" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home size={13} /> Inicio
        </Link>
        <ChevronRight size={12} className="opacity-40" />
        <span className="text-emerald-500 font-medium flex items-center gap-1">
          <TrendingDown className="rotate-180" size={13} /> Ingresos
        </span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-lg font-bold leading-[1.1] text-foreground mb-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Registro de<br /><em className="italic text-muted-foreground">ingresos</em>
          </h1>
          <p className="text-xs text-muted-foreground">Administración de ingresos extra y concurrentes.</p>
        </div>
        <button
          onClick={() => { setIngresoSeleccionado(null); setMostrarForm(true); }}
          className="flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} /> Nuevo ingreso
        </button>
      </div>

      {/* Métrica Global */}
      <div className="relative bg-muted/40 rounded-xl px-5 py-4 overflow-hidden mb-6 max-w-xs border border-emerald-500/10">
        <div className="absolute top-0 left-0 w-[3px] h-full rounded-l-xl bg-emerald-500" />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 pl-1 capitalize">
          Total General de Ingresos
        </p>
        <p className="font-mono text-2xl font-medium pl-1 text-emerald-600 dark:text-emerald-400"
           style={{ fontFamily: "'DM Mono', monospace" }}>
          {fmtQ(totalGeneral)}
        </p>
      </div>

      {/* Tabla */}
      <div className="border border-border/20 rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b border-border/20">
                {["Fecha", "Concepto", "Cantidad", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center animate-pulse"><Skeleton className="h-4 w-32 mx-auto" /></td>
                </tr>
              ) : ingresos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No hay ingresos registrados actualmente.
                  </td>
                </tr>
              ) : (
                ingresos.map((i, idx) => (
                  <tr key={i.id} className={`hover:bg-muted/20 transition-colors ${idx < ingresos.length - 1 ? "border-b border-border/10" : ""}`}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {i.fecha ? new Date(i.fecha).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {i.concepto}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-emerald-500 font-medium" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {fmtQ(i.cantidad)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setIngresoSeleccionado(i); setMostrarForm(true); }}
                        className="w-7 h-7 inline-flex items-center justify-center rounded-md border border-border/40 bg-muted/30 hover:bg-muted transition-colors"
                      >
                        <Edit size={13} className="text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {mostrarForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <FormularioIngreso
              ingresoActual={ingresoSeleccionado}
              onCancelar={() => { setMostrarForm(false); setIngresoSeleccionado(null); }}
              onCompletado={() => { setMostrarForm(false); cargarIngresos(); setIngresoSeleccionado(null); }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
