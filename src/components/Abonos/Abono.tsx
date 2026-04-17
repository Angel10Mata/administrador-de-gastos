"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { registrarAbonoAction } from "@/lib/actions";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { DollarSign, Landmark, Save, X, PiggyBank, Loader2, ChevronDown, Check } from "lucide-react";

interface AbonoProps {
  onCompletado?: () => void;
  onCancelar?: () => void;
}

export default function FormularioAbono({ onCompletado, onCancelar }: AbonoProps) {
  const user = useUser();

  const [deudas, setDeudas] = useState<any[]>([]);
  const [deudaId, setDeudaId] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);
  const [cargandoDeudas, setCargandoDeudas] = useState(true);
  const [abierto, setAbierto] = useState(false);

  const deudaSeleccionada = deudas.find((d) => d.id === deudaId);

  useEffect(() => {
    const cargarDeudas = async () => {
      setCargandoDeudas(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("deudas")
          .select("id, nombre, monto_original, monto_abonado")
          .order("nombre", { ascending: true });
        if (error) throw error;
        setDeudas(data || []);
      } catch (error: any) {
        console.error("Error al cargar deudas:", error.message);
      } finally {
        setCargandoDeudas(false);
      }
    };
    cargarDeudas();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { Swal.fire("Error", "Sesión no válida.", "error"); return; }
    if (!deudaId || Number(monto) <= 0) {
      Swal.fire("Atención", "Selecciona una deuda e ingresa un monto válido.", "warning");
      return;
    }
    setLoading(true);
    const result = await registrarAbonoAction(deudaId, Number(monto), user.id);
    if (result.success) {
      const isDark = document.documentElement.classList.contains("dark");
      await Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: "Abono registrado con éxito", showConfirmButton: false, timer: 2000,
        background: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000",
      });
      setMonto(""); setDeudaId("");
      if (onCompletado) onCompletado();
    } else {
      Swal.fire("Error", result.error || "No se pudo procesar el pago.", "error");
    }
    setLoading(false);
  };

  const fmtQ = (n: number) =>
    `Q ${(n || 0).toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className="w-full bg-[#111] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-500">
              <PiggyBank size={17} className="text-black" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white leading-none">Registrar abono</h2>
              <p className="text-[11px] text-white/40 mt-0.5">Actualiza tus saldos pendientes</p>
            </div>
          </div>
          {onCancelar && (
            <button
              type="button"
              onClick={onCancelar}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Selector de deuda — custom dropdown */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Seleccionar cuenta
          </label>

          {/* Trigger */}
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            disabled={cargandoDeudas}
            className="w-full h-10 rounded-xl bg-white/5 border border-white/10 px-3 flex items-center justify-between text-sm transition-all hover:bg-white/8 hover:border-white/20 disabled:opacity-50"
          >
            <span className="flex items-center gap-2 text-left truncate">
              {cargandoDeudas ? (
                <><Loader2 size={14} className="animate-spin text-emerald-400" /><span className="text-white/30">Buscando deudas...</span></>
              ) : deudaSeleccionada ? (
                <><Landmark size={14} className="text-emerald-400 shrink-0" /><span className="text-white truncate">{deudaSeleccionada.nombre}</span></>
              ) : (
                <><Landmark size={14} className="text-white/20 shrink-0" /><span className="text-white/30">Selecciona una cuenta...</span></>
              )}
            </span>
            <ChevronDown size={14} className={`text-white/30 shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`} />
          </button>

          {/* Lista desplegable */}
          {abierto && !cargandoDeudas && (
            <div className="rounded-xl border border-white/10 bg-[#1a1a1a] overflow-hidden shadow-xl">
              {deudas.length === 0 ? (
                <p className="px-4 py-3 text-xs text-white/40 text-center">No tienes deudas registradas.</p>
              ) : (
                deudas.map((d) => {
                  const saldo = (Number(d.monto_original) || 0) - (Number(d.monto_abonado) || 0);
                  const pct = d.monto_original ? Math.min(100, Math.round((d.monto_abonado / d.monto_original) * 100)) : 0;
                  const seleccionado = deudaId === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => { setDeudaId(d.id); setAbierto(false); }}
                      className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left transition-colors hover:bg-white/5 border-b border-white/5 last:border-0 ${seleccionado ? "bg-emerald-500/10" : ""}`}
                    >
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${seleccionado ? "text-emerald-400" : "text-white"}`}>{d.nombre}</p>
                        <p className="text-[11px] text-white/35 font-mono mt-0.5">Saldo: {fmtQ(saldo)}</p>
                        {/* Mini barra */}
                        <div className="w-24 h-[2px] bg-white/10 rounded-full mt-1.5">
                          <div className="h-[2px] bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {seleccionado && <Check size={14} className="text-emerald-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Saldo restante de la deuda seleccionada */}
        {deudaSeleccionada && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
            <span className="text-[11px] text-emerald-400/70">Saldo pendiente</span>
            <span className="font-mono text-sm text-emerald-400">
              {fmtQ((Number(deudaSeleccionada.monto_original) || 0) - (Number(deudaSeleccionada.monto_abonado) || 0))}
            </span>
          </div>
        )}

        {/* Monto */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Monto a abonar
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">Q</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full pl-8 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading || deudas.length === 0 || !deudaId}
          className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            <><Save size={15} /> Confirmar abono</>
          )}
        </button>
      </form>
    </div>
  );
}