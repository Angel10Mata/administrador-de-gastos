import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/proxy'

export default async function proxy(request: NextRequest) {
  // Creamos el cliente de Supabase y la respuesta inicial
  const { supabase, response } = createClient(request)

  // Obtenemos al usuario (esto refresca la sesión si es necesario)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  // 1. PROTEGER RUTAS INTERNAS: Si va a /kore y NO hay usuario -> Login
  if (path.startsWith('/kore') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 2. REDIRECCIÓN INTELIGENTE (EL ARREGLO): 
  // Si el usuario YA ESTÁ logueado e intenta ir a /login O a la raíz (/) -> Mándalo a /kore
  if (user && (path === '/' || path.startsWith('/login'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/kore'
    return NextResponse.redirect(url)
  }

  // Si todo está correcto, devolvemos la respuesta con cookies actualizadas
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and images
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}