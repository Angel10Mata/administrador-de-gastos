"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const MESES_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const DIAS_SEMANA = ["Do","Lu","Ma","Mi","Ju","Vi","Sá"];

interface Props {
  /** Año seleccionado actualmente */
  anio: number;
  /** Mes seleccionado actualmente (0-indexed) */
  mes: number;
  /** Día seleccionado actualmente (1-indexed), null = sin día */
  dia: number | null;
  /** Callback al cambiar: si diaSelec es null, es selección de solo mes */
  onChange: (anio: number, mes: number, dia: number | null) => void;
  /** Clases extra para el botón trigger */
  className?: string;
}

export default function MonthDayPicker({ anio, mes, dia, onChange, className = "" }: Props) {
  const hoy = new Date();
  const [abierto, setAbierto] = useState(false);
  /** "meses" | "dias" */
  const [vista, setVista] = useState<"meses" | "dias">("meses");
  const [anioPopover, setAnioPopover] = useState(anio);
  const [mesPopover, setMesPopover] = useState(mes);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al click fuera
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setVista("meses");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [abierto]);

  const abrir = () => {
    setAnioPopover(anio);
    setMesPopover(mes);
    setVista("meses");
    setAbierto((v) => !v);
  };

  // ── Lógica de días ──────────────────────────────────────────────────────────
  const diasEnMes = new Date(anioPopover, mesPopover + 1, 0).getDate();
  const primerDiaSemana = new Date(anioPopover, mesPopover, 1).getDay(); // 0=Dom

  const esFuturo = (d: number) => {
    const fecha = new Date(anioPopover, mesPopover, d);
    const hoyMidnight = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    return fecha > hoyMidnight;
  };

  const mesFuturo = (m: number, a: number) => {
    if (a > hoy.getFullYear()) return true;
    if (a === hoy.getFullYear() && m > hoy.getMonth()) return true;
    return false;
  };

  // ── Label del botón ─────────────────────────────────────────────────────────
  const labelMes = new Date(anio, mes, 1).toLocaleString("es-GT", { month: "long", year: "numeric" });
  const labelBtn = dia
    ? new Date(anio, mes, dia).toLocaleDateString("es-GT", { day: "2-digit", month: "short", year: "numeric" })
    : labelMes;

  const limpiarDia = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(anio, mes, null);
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* ── Trigger ── */}
      <button
        onClick={abrir}
        className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-border/40 bg-muted/30 hover:bg-muted/60 text-sm font-medium text-foreground capitalize transition-all min-w-[160px] justify-center"
      >
        <Calendar size={13} className="text-muted-foreground shrink-0" />
        <span className="truncate">{labelBtn}</span>
        {dia && (
          <span
            role="button"
            onClick={limpiarDia}
            className="ml-1 rounded-full hover:bg-muted/80 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={11} />
          </span>
        )}
      </button>

      {/* ── Popover ── */}
      {abierto && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-background border border-border/50 rounded-2xl shadow-2xl p-4 w-72 animate-in fade-in slide-in-from-top-2">

          {/* ── Vista: MESES ── */}
          {vista === "meses" && (
            <>
              {/* Cabecera año */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setAnioPopover((a) => a - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold text-foreground">{anioPopover}</span>
                <button
                  onClick={() => { if (anioPopover < hoy.getFullYear()) setAnioPopover((a) => a + 1); }}
                  disabled={anioPopover >= hoy.getFullYear()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Grid meses */}
              <div className="grid grid-cols-3 gap-1.5">
                {MESES_ES.map((nombre, idx) => {
                  const futuro = mesFuturo(idx, anioPopover);
                  const seleccionado = idx === mes && anioPopover === anio;
                  const esHoy = idx === hoy.getMonth() && anioPopover === hoy.getFullYear();
                  return (
                    <button
                      key={idx}
                      disabled={futuro}
                      onClick={() => {
                        setMesPopover(idx);
                        setVista("dias");
                      }}
                      className={[
                        "h-9 rounded-lg text-xs font-medium transition-all",
                        futuro
                          ? "text-muted-foreground/30 cursor-not-allowed"
                          : seleccionado
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105"
                          : esHoy
                          ? "bg-muted text-foreground font-semibold ring-1 ring-indigo-500/40 hover:bg-indigo-500/15"
                          : "text-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      {nombre}
                    </button>
                  );
                })}
              </div>

              {/* Botón seleccionar solo mes */}
              <button
                onClick={() => {
                  onChange(anioPopover, mesPopover !== -1 ? mesPopover : mes, null);
                  setAbierto(false);
                  setVista("meses");
                }}
                className="mt-3 w-full h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/30 transition-all"
              >
                Ver mes completo
              </button>
            </>
          )}

          {/* ── Vista: DÍAS ── */}
          {vista === "dias" && (
            <>
              {/* Cabecera: ← Mes Año */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setVista("meses")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {MESES_ES[mesPopover]} {anioPopover}
                </span>
                <div className="w-7" /> {/* spacer */}
              </div>

              {/* Días de la semana */}
              <div className="grid grid-cols-7 mb-1">
                {DIAS_SEMANA.map((d) => (
                  <span key={d} className="text-center text-[10px] text-muted-foreground/60 font-medium py-1">
                    {d}
                  </span>
                ))}
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-0.5">
                {/* Celdas vacías para alinear el primer día */}
                {Array.from({ length: primerDiaSemana }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: diasEnMes }, (_, i) => i + 1).map((d) => {
                  const futuro = esFuturo(d);
                  const seleccionado = d === dia && mesPopover === mes && anioPopover === anio;
                  const esHoyDia = d === hoy.getDate() && mesPopover === hoy.getMonth() && anioPopover === hoy.getFullYear();
                  return (
                    <button
                      key={d}
                      disabled={futuro}
                      onClick={() => {
                        onChange(anioPopover, mesPopover, d);
                        setAbierto(false);
                        setVista("meses");
                      }}
                      className={[
                        "h-8 w-full rounded-lg text-xs font-medium transition-all",
                        futuro
                          ? "text-muted-foreground/25 cursor-not-allowed"
                          : seleccionado
                          ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30 scale-105"
                          : esHoyDia
                          ? "bg-muted text-foreground font-bold ring-1 ring-indigo-500/50 hover:bg-indigo-500/15"
                          : "text-foreground hover:bg-muted/60",
                      ].join(" ")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* Botón seleccionar mes completo */}
              <button
                onClick={() => {
                  onChange(anioPopover, mesPopover, null);
                  setAbierto(false);
                  setVista("meses");
                }}
                className="mt-3 w-full h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-border/30 transition-all"
              >
                Ver mes completo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
