"use server"

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { deudaSchema, ingresoSchema } from "./schemas";

// ==========================================
//           ACCIONES DE DEUDAS
// ==========================================

export async function crearDeudaAction(datos: any) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const validatedData = deudaSchema.parse(datos);
    // Forzar el usuario_id desde la sesion segura del server
    validatedData.usuario_id = user.id;

    const { data, error } = await supabase.from("deudas").insert([validatedData]).select();
    if (error) return { success: false, error: error.message };

    revalidatePath("/kore/deudas");
    revalidatePath("/kore");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function editarDeudaAction(id: string, datos: any) {
  const supabase = await createClient();
  try {
    const validatedData = deudaSchema.parse(datos);
    const { data, error } = await supabase.from("deudas").update(validatedData).eq("id", id).select();
    if (error) return { success: false, error: error.message };

    revalidatePath("/kore/deudas");
    revalidatePath("/kore");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function eliminarDeudaAction(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from("deudas").delete().eq("id", id);
    if (error) return { success: false, error: error.message };

    revalidatePath("/kore/deudas");
    revalidatePath("/kore");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
//           ACCION PARA ABONOS
// ==========================================

export async function registrarAbonoAction(deudaId: string, montoAbono: number, usuarioId?: string) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const safeUsuarioId = user.id;

    const { error: errorAbono } = await supabase
      .from("abonos")
      .insert([{ deuda_id: deudaId, monto: montoAbono, usuario_id: safeUsuarioId }]);

    if (errorAbono) throw new Error(errorAbono.message);

    const { data: deuda, error: errorFetch } = await supabase
      .from("deudas")
      .select("monto_abonado, monto_original, fecha_pago")
      .eq("id", deudaId)
      .single();

    if (errorFetch) throw new Error(errorFetch.message);

    const nuevoTotal = (Number(deuda.monto_abonado) || 0) + montoAbono;
    const yaPagada   = nuevoTotal >= (Number(deuda.monto_original) || Infinity);

    // Avanzar fecha_pago un mes si existe y la deuda no queda saldada
    let proximaFecha: string | null = null;
    if (deuda.fecha_pago && !yaPagada) {
      const [anio, mes, dia] = (deuda.fecha_pago as string).split("-").map(Number);
      const siguiente = new Date(anio, mes - 1, dia); // local
      siguiente.setMonth(siguiente.getMonth() + 1);
      const pad = (n: number) => String(n).padStart(2, "0");
      proximaFecha = `${siguiente.getFullYear()}-${pad(siguiente.getMonth() + 1)}-${pad(siguiente.getDate())}`;
    }

    const updatePayload: Record<string, any> = {
      monto_abonado: nuevoTotal,
      ...(yaPagada    && { estado: "Pagada" }),
      ...(proximaFecha && { fecha_pago: proximaFecha }),
    };

    const { error: errorUpdate } = await supabase
      .from("deudas")
      .update(updatePayload)
      .eq("id", deudaId);

    if (errorUpdate) throw new Error(errorUpdate.message);

    revalidatePath("/kore");
    revalidatePath("/kore/deudas");
    revalidatePath("/kore/abonos");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==========================================
//           ACCION PARA GASTOS (NUEVA)
// ==========================================

/**
 * Registra un gasto personal mensual
 */
export async function crearGastoAction(datos: { 
  descripcion: string, 
  monto: number, 
  categoria: string, 
  usuario_id?: string 
}) {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data, error } = await supabase
      .from("gastos")
      .insert([
        {
          descripcion: datos.descripcion,
          monto: datos.monto,
          categoria: datos.categoria,
          usuario_id: user.id, // Forzar desde sesion
        }
      ])
      .select();

    if (error) throw new Error(error.message);

    // Refrescar las rutas para que el Panel de Control y la lista de gastos se actualicen
    revalidatePath("/kore");
    revalidatePath("/kore/gastos");

    return { success: true, data };
  } catch (err: any) {
    console.error("Error en crearGastoAction:", err.message);
    return { success: false, error: err.message };
  }
}

export async function actualizarGastoAction(id: string, datos: {
  descripcion: string,
  monto: number,
  categoria: string,
}) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { error } = await supabase
      .from("gastos")
      .update({
        descripcion: datos.descripcion,
        monto: datos.monto,
        categoria: datos.categoria,
      })
      .eq("id", id)
      .eq("usuario_id", user.id); // Seguridad: solo el dueño puede editar

    if (error) throw new Error(error.message);

    revalidatePath("/kore");
    revalidatePath("/kore/gastos");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}


export async function crearIngresoAction(datos: any) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const payload: any = {
      concepto:       datos.concepto,
      cantidad:       Number(datos.cantidad),
      usuario_id:     user.id,
      es_recurrente:  !!datos.es_recurrente,
      dia_pago:       datos.dia_pago   ? Number(datos.dia_pago)   : null,
      dia_pago_2:     datos.dia_pago_2 ? Number(datos.dia_pago_2) : null,
    };

    if (datos.es_recurrente) {
      // Para ingresos recurrentes no guardamos fecha fija; se auto-generan
      payload.fecha = null;
    } else {
      payload.fecha = datos.fecha || new Date().toISOString().split("T")[0];
    }

    const { data, error } = await supabase.from("ingresos").insert([payload]).select();
    if (error) throw new Error(error.message);

    revalidatePath("/kore/ingresos");
    revalidatePath("/kore");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function editarIngresoAction(id: string, datos: any) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const payload: any = {
      concepto:      datos.concepto,
      cantidad:      Number(datos.cantidad),
      es_recurrente: !!datos.es_recurrente,
      dia_pago:      datos.dia_pago   ? Number(datos.dia_pago)   : null,
      dia_pago_2:    datos.dia_pago_2 ? Number(datos.dia_pago_2) : null,
      fecha:         datos.es_recurrente ? null : (datos.fecha || null),
    };

    const { data, error } = await supabase.from("ingresos").update(payload).eq("id", id).eq("usuario_id", user.id).select();
    if (error) throw new Error(error.message);

    revalidatePath("/kore/ingresos");
    revalidatePath("/kore");
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function eliminarIngresoAction(id: string) {
  const supabase = await createClient();
  try {
    const { error } = await supabase.from("ingresos").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/kore/ingresos");
    revalidatePath("/kore");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ============================================================
//   AUTO-GENERACIÓN DE INGRESOS RECURRENTES DEL MES ACTUAL
// ============================================================

export async function verificarIngresosRecurrentesAction() {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, insertados: 0 };

    const hoy   = new Date();
    const anio  = hoy.getFullYear();
    const mes   = hoy.getMonth() + 1; // 1-12
    const dia   = hoy.getDate();
    const pad   = (n: number) => String(n).padStart(2, "0");

    // 1. Cargar todas las plantillas recurrentes del usuario
    const { data: plantillas, error: errP } = await supabase
      .from("ingresos")
      .select("id, concepto, cantidad, dia_pago, dia_pago_2")
      .eq("usuario_id", user.id)
      .eq("es_recurrente", true)
      .is("fecha", null);  // plantillas no tienen fecha

    if (errP || !plantillas?.length) return { success: true, insertados: 0 };

    // 2. Cargar ingresos ya generados en el mes actual (los que sí tienen fecha)
    const { data: existentes } = await supabase
      .from("ingresos")
      .select("concepto, fecha")
      .eq("usuario_id", user.id)
      .gte("fecha", `${anio}-${pad(mes)}-01`)
      .lte("fecha", `${anio}-${pad(mes)}-31`);

    const fechasExistentes = new Set((existentes || []).map(e => e.fecha?.slice(0, 10)));

    const insertar: any[] = [];

    for (const p of plantillas) {
      // Verificar cada día de pago configurado
      for (const diaPago of [p.dia_pago, p.dia_pago_2].filter(Boolean)) {
        if ((diaPago as number) > dia) continue; // todavía no llega ese día
        const diasEnMes = new Date(anio, mes, 0).getDate();
        const diaReal = Math.min(diaPago as number, diasEnMes);
        const fechaStr = `${anio}-${pad(mes)}-${pad(diaReal)}`;
        if (!fechasExistentes.has(fechaStr)) {
          insertar.push({
            concepto:      p.concepto,
            cantidad:      p.cantidad,
            fecha:         fechaStr,
            usuario_id:    user.id,
            es_recurrente: false, // la copia generada NO es plantilla
            dia_pago:      null,
            dia_pago_2:    null,
          });
        }
      }
    }

    if (insertar.length) {
      await supabase.from("ingresos").insert(insertar);
      revalidatePath("/kore/ingresos");
      revalidatePath("/kore");
    }

    return { success: true, insertados: insertar.length };
  } catch (err: any) {
    return { success: false, error: err.message, insertados: 0 };
  }
}