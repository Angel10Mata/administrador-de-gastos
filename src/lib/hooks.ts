import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { crearDeudaAction, editarDeudaAction, eliminarDeudaAction } from "./actions";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/components/(base)/providers/UserProvider";

// Hook para obtener todas las deudas del usuario actual
export function useDeudas() {
  const user = useUser(); // Obtenemos el usuario logueado

  return useQuery({
    queryKey: ["deudas", user?.id], // Agregamos el id al queryKey por seguridad
    queryFn: async () => {
      if (!user?.id) return []; // Si no hay usuario, devolvemos lista vacía

      const supabase = createClient();
      const { data, error } = await supabase
        .from("deudas")
        .select("*")
        .eq("usuario_id", user.id) // <--- CRÍTICO: Solo trae mis deudas
        .order("created_at", { ascending: false });
        
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!user?.id, // Solo ejecuta la consulta si el usuario existe
    staleTime: 1000 * 60 * 5, 
  });
}

// Hook para crear una nueva deuda
export function useCrearDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearDeudaAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}

// Hook para editar una deuda
export function useEditarDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: string; datos: any }) => editarDeudaAction(id, datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}

// Hook para eliminar una deuda
export function useEliminarDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eliminarDeudaAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deudas"] });
    },
  });
}