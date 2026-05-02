"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { crearGastoAction, actualizarGastoAction } from "@/lib/actions";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { DollarSign, FileText, Save, X, Utensils, Car, Lightbulb, ShoppingBag, Tag, Pencil } from "lucide-react";

const categorias = [
  { name: "Alimentación", icon: Utensils,   color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30",  activeBg: "bg-orange-500 border-orange-500"  },
  { name: "Transporte",   icon: Car,         color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",    activeBg: "bg-blue-500 border-blue-500"    },
  { name: "Servicios",    icon: Lightbulb,   color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30", activeBg: "bg-yellow-500 border-yellow-500" },
  { name: "Compras",      icon: ShoppingBag, color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/30", activeBg: "bg-purple-500 border-purple-500" },
  { name: "Otros",        icon: Tag,         color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/30",  activeBg: "bg-slate-500 border-slate-500"  },
];

interface GastosProps {
  onCompletado?: () => void;
  onCancelar?:   () => void;
  /** Si se pasa, el formulario estará en modo edición */
  gastoEditar?: {
    id: string;
    descripcion: string;
    monto: number;
    categoria: string;
  } | null;
}

export default function Gastosm({ onCompletado, onCancelar, gastoEditar }: GastosProps) {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    descripcion: gastoEditar?.descripcion ?? "",
    monto:       gastoEditar?.monto       ? String(gastoEditar.monto) : "",
    categoria:   gastoEditar?.categoria   ?? "Alimentación",
  });

  // Si cambia gastoEditar (e.g. abrir modal diferente), sincronizar
  useEffect(() => {
    setForm({
      descripcion: gastoEditar?.descripcion ?? "",
      monto:       gastoEditar?.monto       ? String(gastoEditar.monto) : "",
      categoria:   gastoEditar?.categoria   ?? "Alimentación",
    });
  }, [gastoEditar?.id]);

  const modoEdicion = !!gastoEditar;
  const catActiva = categorias.find((c) => c.name === form.categoria) ?? categorias[0];
  const IconoActivo = catActiva.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descripcion || !form.monto) return;

    setLoading(true);
    let result;

    if (modoEdicion && gastoEditar) {
      result = await actualizarGastoAction(gastoEditar.id, {
        descripcion: form.descripcion,
        monto: Number(form.monto),
        categoria: form.categoria,
      });
    } else {
      if (!user?.id) return;
      result = await crearGastoAction({
        descripcion: form.descripcion,
        monto: Number(form.monto),
        categoria: form.categoria,
        usuario_id: user.id,
      });
    }

    if (result.success) {
      const isDark = document.documentElement.classList.contains("dark");
      Swal.fire({
        toast: true, position: "top-end", icon: "success",
        title: modoEdicion ? "Gasto actualizado" : "Gasto guardado correctamente",
        showConfirmButton: false, timer: 2000,
        background: isDark ? "#1a1a1a" : "#fff", color: isDark ? "#fff" : "#000",
      });
      if (onCompletado) onCompletado();
    } else {
      Swal.fire("Error", result.error || "No se pudo guardar el gasto", "error");
    }
    setLoading(false);
  };

  return (
    <div className="w-full bg-[#111] rounded-2xl overflow-hidden shadow-2xl border border-white/10">

      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 border-b border-white/8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${catActiva.activeBg} transition-colors duration-300`}>
              <IconoActivo size={17} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white leading-none flex items-center gap-2">
                {modoEdicion ? (
                  <><Pencil size={13} className="opacity-60" /> Editar gasto</>
                ) : "Nuevo gasto"}
              </h2>
              <p className="text-[11px] text-white/40 mt-0.5">{catActiva.name}</p>
            </div>
          </div>
          {onCancelar && (
            <button
              onClick={onCancelar}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Descripción */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Descripción
          </label>
          <div className="relative">
            <FileText size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="w-full pl-9 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
              placeholder="Ej. Supermercado, gasolina..."
              required
            />
          </div>
        </div>

        {/* Monto */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Monto
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm font-mono">Q</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.monto}
              onChange={(e) => setForm({ ...form, monto: e.target.value })}
              className="w-full pl-8 pr-4 h-10 rounded-xl bg-white/5 border border-white/10 text-sm font-mono text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Categoría — selector visual */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Categoría
          </label>
          <div className="grid grid-cols-5 gap-2">
            {categorias.map((cat) => {
              const Icono = cat.icon;
              const isActive = form.categoria === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setForm({ ...form, categoria: cat.name })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-center transition-all duration-200 ${
                    isActive
                      ? `${cat.activeBg} text-white scale-105 shadow-lg shadow-black/30`
                      : `${cat.bg} ${cat.color} hover:scale-102 hover:brightness-110`
                  }`}
                  title={cat.name}
                >
                  <Icono size={16} />
                  <span className="text-[9px] font-medium leading-none opacity-90 hidden sm:block">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-white/35 text-center">
            {form.categoria}
          </p>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {modoEdicion ? "Actualizando..." : "Guardando..."}
            </span>
          ) : (
            <>
              <Save size={15} />
              {modoEdicion ? "Guardar cambios" : "Guardar gasto"}
            </>
          )}
        </button>
      </form>
    </div>
  );
}