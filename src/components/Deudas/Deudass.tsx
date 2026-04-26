"use client";

import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { crearDeudaAction, editarDeudaAction, eliminarDeudaAction } from "@/lib/actions";
import { CreditCard, Save, Trash2, X, Calendar as CalendarIcon, Info } from "lucide-react";
import { useUser } from "@/components/(base)/providers/UserProvider";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO } from "date-fns";

interface DeudaProps {
  productoActual?: any;
  onCompletado?: () => void;
  onCancelar?: () => void;
}

export default function FormularioDeuda({ productoActual, onCompletado, onCancelar }: DeudaProps) {
  const user = useUser();

  const [nombre,       setNombre]       = useState("");
  const [categoria,    setCategoria]    = useState("");
  const [montoOriginal, setMontoOriginal] = useState("");
  const [montoAbonado,  setMontoAbonado]  = useState("0");
  const [estado,       setEstado]       = useState("Pendiente");
  const [descripcion,  setDescripcion]  = useState("");
  const [fechaPago,    setFechaPago]    = useState("");
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    if (productoActual) {
      setNombre(productoActual.nombre || "");
      setCategoria(productoActual.categoria || "");
      setMontoOriginal(productoActual.monto_original?.toString() || "");
      setMontoAbonado(productoActual.monto_abonado?.toString() || "0");
      setEstado(productoActual.estado || "Pendiente");
      setDescripcion(productoActual.descripcion || "");
      setFechaPago(productoActual.fecha_pago || "");
    } else {
      setNombre(""); setCategoria(""); setMontoOriginal("");
      setMontoAbonado("0"); setEstado("Pendiente"); setDescripcion(""); setFechaPago("");
    }
  }, [productoActual]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      Swal.fire({ title: "Error de sesión", text: "No se pudo obtener tu ID.", icon: "error" });
      return;
    }
    setLoading(true);
    const datosDeuda = {
      nombre, categoria,
      monto_original: Number(montoOriginal),
      monto_abonado:  Number(montoAbonado),
      estado, descripcion,
      fecha_pago: fechaPago || null,
      usuario_id: user.id,
    };
    try {
      const result = productoActual?.id
        ? await editarDeudaAction(productoActual.id, datosDeuda)
        : await crearDeudaAction(datosDeuda);

      if (result.success) {
        const isDark = document.documentElement.classList.contains("dark");
        Swal.fire({
          toast: true, position: "top-end",
          title: productoActual ? "Actualizado correctamente" : "Registrado con éxito",
          icon: "success", showConfirmButton: false, timer: 2000,
          background: isDark ? "#1E1E1E" : "#ffffff",
          color:      isDark ? "#ffffff" : "#000000",
        });
        if (onCompletado) onCompletado();
      } else { throw new Error(result.error); }
    } catch (error: any) {
      Swal.fire({ title: "Error", text: error.message, icon: "error" });
    } finally { setLoading(false); }
  };

  const handleEliminar = async () => {
    if (!productoActual?.id) return;
    const isDark = document.documentElement.classList.contains("dark");
    const conf = await Swal.fire({
      title: "¿Eliminar registro?", text: "Esta acción es permanente.", icon: "warning",
      showCancelButton: true, confirmButtonColor: "#EF4444", cancelButtonText: "Cancelar",
      background: isDark ? "#1E1E1E" : "#ffffff", color: isDark ? "#ffffff" : "#000000",
    });
    if (conf.isConfirmed) {
      setLoading(true);
      const res = await eliminarDeudaAction(productoActual.id);
      if (res.success) {
        Swal.fire({ toast: true, position: "top-end", title: "Eliminado", icon: "success", showConfirmButton: false, timer: 2000 });
        if (onCompletado) onCompletado();
      }
      setLoading(false);
    }
  };

  const field = "w-full h-10 rounded-lg border border-border/50 bg-muted/30 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-indigo-400/40 focus:border-indigo-400/40 transition-all text-foreground";
  const label = "text-[10px] font-medium uppercase tracking-widest text-muted-foreground block mb-1.5";

  return (
    <div
      className="w-full bg-background rounded-2xl overflow-hidden border border-border/20 shadow-2xl"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <CreditCard size={15} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {productoActual ? "Editar deuda" : "Nueva deuda"}
            </p>
            <p className="text-[10px] text-muted-foreground">Gestión de finanzas personales</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancelar}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-border/40 bg-muted/30 hover:bg-muted transition-colors"
        >
          <X size={13} className="text-muted-foreground" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5">

        {/* Descripción + Categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={label}>
              Descripción <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={field}
              placeholder="Ej. Crédito hipotecario"
              required
            />
          </div>
          <div>
            <label className={label}>Categoría</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={field}
              placeholder="Ej. Bancos, Amigos..."
            />
          </div>
        </div>

        {/* Monto */}
        <div className="p-4 rounded-xl border border-border/20 bg-muted/20">
          <label className={label}>
            Monto original (Q) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={montoOriginal}
            onChange={(e) => setMontoOriginal(e.target.value)}
            className={field}
            placeholder="0.00"
            required
          />
        </div>

        {/* Estado */}
        <div>
          <label className={label}>Estado</label>
          <div className="flex gap-2">
            {[
              { val: "Pendiente", color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/30",   active: "bg-amber-500 border-amber-500 text-black" },
              { val: "Atrasada",  color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",       active: "bg-red-500 border-red-500 text-white"   },
              { val: "Pagada",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", active: "bg-emerald-500 border-emerald-500 text-black" },
            ].map((op) => (
              <button
                key={op.val}
                type="button"
                onClick={() => setEstado(op.val)}
                className={`flex-1 h-9 rounded-lg border text-xs font-medium transition-all duration-200 ${
                  estado === op.val ? op.active : `${op.bg} ${op.color} hover:brightness-110`
                }`}
              >
                {op.val}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha de pago */}
        <div className="space-y-1.5">
          <label className={label}>
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={11} /> Fecha de pago
            </span>
          </label>
          <DatePicker
            date={fechaPago ? parseISO(fechaPago) : undefined}
            setDate={(d) => setFechaPago(d ? format(d, "yyyy-MM-dd") : "")}
          />
          {/* Alerta si está a menos de 7 días */}
          {fechaPago && (() => {
            const dias = Math.ceil((new Date(fechaPago).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            if (dias < 0) return (
              <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1">
                ⚠️ Esta deuda está <strong>vencida</strong> ({Math.abs(dias)} días de retraso)
              </p>
            );
            if (dias <= 7) return (
              <p className="text-xs text-amber-400 flex items-center gap-1.5 mt-1">
                🔔 Vence en <strong>{dias} día{dias !== 1 ? "s" : ""}</strong> — ¡pronto!
              </p>
            );
            return (
              <p className="text-xs text-muted-foreground mt-1">
                Quedan {dias} días para el pago
              </p>
            );
          })()}
        </div>

        {/* Acciones */}
        <div className="flex flex-col-reverse md:flex-row gap-2.5 pt-1">
          <button
            type="button"
            onClick={onCancelar}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-muted-foreground bg-muted/40 hover:bg-muted transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-background bg-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <><Save size={14} /> Guardar deuda</>
            )}
          </button>

          {productoActual && (
            <button
              type="button"
              onClick={handleEliminar}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} /> Eliminar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}