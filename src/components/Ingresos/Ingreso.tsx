"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { crearIngresoAction, editarIngresoAction, eliminarIngresoAction } from "@/lib/actions";
import { TrendingDown, Save, Trash2, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";

interface IngresoProps {
  ingresoActual?: any;
  onCompletado?: () => void;
  onCancelar?: () => void;
}

export default function FormularioIngreso({ ingresoActual, onCompletado, onCancelar }: IngresoProps) {
  const user = useUser();

  const [concepto, setConcepto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [fecha,    setFecha]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showCal,  setShowCal]  = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (ingresoActual) {
      setConcepto(ingresoActual.concepto || "");
      setCantidad(ingresoActual.cantidad?.toString() || "");
      setFecha(ingresoActual.fecha || "");
    } else {
      setConcepto(""); setCantidad(""); setFecha("");
    }
  }, [ingresoActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      Swal.fire({ title: "Error", text: "Sesión no válida.", icon: "error" });
      return;
    }
    setLoading(true);
    const datos = {
      concepto,
      cantidad: Number(cantidad),
      fecha: fecha || null,
      usuario_id: user.id,
    };
    try {
      const result = ingresoActual?.id
        ? await editarIngresoAction(ingresoActual.id, datos)
        : await crearIngresoAction(datos);

      if (result.success) {
        Swal.fire({
          toast: true, position: "top-end",
          title: ingresoActual ? "Actualizado" : "Registrado",
          icon: "success", showConfirmButton: false, timer: 2000,
        });
        if (onCompletado) onCompletado();
      } else { throw new Error(result.error); }
    } catch (error: any) {
      Swal.fire({ title: "Error", text: error.message, icon: "error" });
    } finally { setLoading(false); }
  };

  const handleEliminar = async () => {
    if (!ingresoActual?.id) return;
    const conf = await Swal.fire({
      title: "¿Eliminar ingreso?", text: "Acción permanente.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#EF4444", cancelButtonText: "Cancelar",
    });
    if (conf.isConfirmed) {
      setLoading(true);
      const res = await eliminarIngresoAction(ingresoActual.id);
      if (res.success) {
        Swal.fire({ toast: true, position: "top-end", title: "Eliminado", icon: "success", showConfirmButton: false, timer: 2000 });
        if (onCompletado) onCompletado();
      }
      setLoading(false);
    }
  };

  // ── Calendario inline ──
  const selectedDate = fecha ? parseISO(fecha) : null;
  const today = new Date();

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  const field = "w-full h-10 rounded-lg border border-border/50 bg-muted/30 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/40 focus:border-emerald-400/40 transition-all text-foreground";
  const labelStyle = "text-[10px] font-medium uppercase tracking-widest text-muted-foreground block mb-1.5";

  return (
    <div className="w-full bg-background rounded-2xl overflow-hidden border border-border/20 shadow-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <TrendingDown size={15} className="text-emerald-600 dark:text-emerald-400 rotate-180" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{ingresoActual ? "Editar ingreso" : "Nuevo ingreso"}</p>
            <p className="text-[10px] text-muted-foreground">Registro extra o concurrente</p>
          </div>
        </div>
        <button type="button" onClick={onCancelar} className="w-7 h-7 flex items-center justify-center rounded-md border border-border/40 bg-muted/30 hover:bg-muted transition-colors">
          <X size={13} className="text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <label className={labelStyle}>Concepto <span className="text-red-400">*</span></label>
          <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)} className={field} placeholder="Ej. Quincena, Bono..." required />
        </div>

        <div className="p-4 rounded-xl border border-border/20 bg-muted/20">
          <label className={labelStyle}>Cantidad (Q) <span className="text-red-400">*</span></label>
          <input type="number" step="0.01" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={field} placeholder="0.00" required />
        </div>

        {/* ── Fecha con calendario inline ── */}
        <div className="space-y-1.5">
          <label className={labelStyle}>
            <span className="flex items-center gap-1.5"><CalendarIcon size={11} /> Fecha</span>
          </label>

          {/* Trigger */}
          <button
            type="button"
            onClick={() => setShowCal(!showCal)}
            className={`w-full h-10 flex items-center gap-2 rounded-lg border px-3 text-sm transition-all ${
              showCal
                ? "border-emerald-400/50 bg-emerald-500/5 text-foreground"
                : "border-border/50 bg-muted/30 text-muted-foreground/60 hover:border-emerald-400/30 hover:text-foreground"
            }`}
          >
            <CalendarIcon size={14} className={selectedDate ? "text-emerald-500" : "opacity-50"} />
            {selectedDate
              ? <span className="text-foreground font-medium">{format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}</span>
              : <span>Seleccionar fecha</span>
            }
          </button>

          {/* Calendario inline */}
          {showCal && (
            <div className="rounded-xl border border-border/30 bg-background shadow-lg overflow-hidden mt-1">
              {/* Nav */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
                <button
                  type="button"
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft size={14} />
                </button>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {format(viewDate, "MMMM yyyy", { locale: es })}
                </p>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Grid */}
              <div className="p-3">
                {/* Cabecera días */}
                <div className="grid grid-cols-7 mb-1">
                  {weekDays.map((d) => (
                    <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/60 py-1">{d}</div>
                  ))}
                </div>

                {/* Días */}
                <div className="grid grid-cols-7 gap-y-0.5">
                  {days.map((day, idx) => {
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isToday = isSameDay(day, today);
                    const isCurrentMonth = isSameMonth(day, viewDate);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFecha(format(day, "yyyy-MM-dd"));
                          setShowCal(false);
                        }}
                        className={[
                          "relative w-full aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all",
                          !isCurrentMonth ? "text-muted-foreground/25" : "",
                          isSelected
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : isToday && isCurrentMonth
                              ? "bg-muted text-foreground ring-1 ring-emerald-400/40"
                              : isCurrentMonth
                                ? "text-foreground hover:bg-muted/80"
                                : "hover:bg-muted/30",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              {selectedDate && (
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/20 bg-muted/10">
                  <span className="text-xs text-muted-foreground capitalize">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setFecha(""); setShowCal(false); }}
                    className="text-[10px] text-red-400 hover:text-red-500 font-medium transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse md:flex-row gap-2.5 pt-1">
          <button type="button" onClick={onCancelar} className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-muted/40 hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-background bg-foreground hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <><Save size={14} /> Guardar</>}
          </button>
          {ingresoActual && (
            <button type="button" onClick={handleEliminar} disabled={loading} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-500/5 dark:text-red-400 transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
