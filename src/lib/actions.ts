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
      .select("monto_abonado")
      .eq("id", deudaId)
      .single();

    if (errorFetch) throw new Error(errorFetch.message);

    const nuevoTotal = (Number(deuda.monto_abonado) || 0) + montoAbono;

    const { error: errorUpdate } = await supabase
      .from("deudas")
      .update({ monto_abonado: nuevoTotal })
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

// ==========================================
//           ACCIONES DE INGRESOS
// ==========================================

export async function crearIngresoAction(datos: any) {
  const supabase = await createClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const validatedData = ingresoSchema.parse(datos);
    validatedData.usuario_id = user.id;
    if (!validatedData.fecha) {
        validatedData.fecha = new Date().toISOString();
    }

    const { data, error } = await supabase.from("ingresos").insert([validatedData]).select();
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
    const validatedData = ingresoSchema.parse(datos);
    const { data, error } = await supabase.from("ingresos").update(validatedData).eq("id", id).select();
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