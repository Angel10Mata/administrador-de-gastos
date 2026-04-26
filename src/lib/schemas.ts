import { z } from "zod";

// ==========================================
//      ESQUEMA PARA DEUDAS (ADMIN GASTOS)
// ==========================================
export const deudaSchema = z.object({
  nombre: z.string().min(1, "La descripción de la deuda es obligatoria"),
  categoria: z.string().optional().nullable().or(z.literal('')),
  
  // Coerce asegura que si viene como string desde el input, se convierta a número
  monto_original: z.coerce
    .number()
    .positive("El monto original debe ser mayor a 0"),
    
  monto_abonado: z.coerce
    .number()
    .nonnegative("El abono no puede ser negativo")
    .default(0),
    
  estado: z.string().default("Pendiente"),
  descripcion: z.string().optional().nullable().or(z.literal('')),
  fecha_pago: z.string().optional().nullable().or(z.literal('')),
  usuario_id: z.string().optional().nullable(),
});

// ==========================================
//      ESQUEMA PARA INGRESOS
// ==========================================
export const ingresoSchema = z.object({
  concepto: z.string().min(1, "El concepto es obligatorio"),
  cantidad: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  fecha: z.string().optional().nullable().or(z.literal('')),
  usuario_id: z.string().optional().nullable(),
});