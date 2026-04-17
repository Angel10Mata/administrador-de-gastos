"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight } from "lucide-react";
import Swal from "sweetalert2";

function FormularioLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const mensaje = searchParams.get("message");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      Swal.fire({
        title: "Acceso Denegado",
        text: "El correo electrónico o la contraseña son incorrectos.",
        icon: "error",
        confirmButtonColor: "#10b981",
        background: document.documentElement.classList.contains("dark") ? "#1E1E1E" : "#FFFFFF",
        color: document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#000000",
      });
      setLoading(false);
    } else {
      router.push("/kore");
      router.refresh();
    }
  };

  return (
    <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden border border-border/20 shadow-2xl">

      {/* Panel izquierdo — oscuro */}
      <div
        className="hidden md:flex w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-4 -right-4 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-white/20 rounded-lg flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1L1 11h10L6 1z" stroke="white" strokeWidth="1" strokeLinejoin="round" opacity="0.8"/>
            </svg>
          </div>
          <span className="text-xs font-medium tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>
            FlowFinance
          </span>
        </div>

        {/* Texto central */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <h2
            className="text-4xl leading-[1.1] text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Portal<br />
            <em className="italic" style={{ color: "rgba(255,255,255,0.35)" }}>financiero</em>
          </h2>
          <p className="text-xs leading-relaxed max-w-[190px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Gestiona tus finanzas personales de forma segura.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              Sistema activo
            </span>
          </div>
        </div>

        <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>
          FlowFinance · 2026
        </span>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-background flex flex-col justify-center px-10 py-10">

        <div className="flex items-center gap-2 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Acceso seguro
          </span>
        </div>

        <h1 className="text-2xl font-medium text-foreground mb-1">Iniciar sesión</h1>
        <p className="text-xs text-muted-foreground mb-8">Ingresa tus credenciales institucionales</p>

        {mensaje && (
          <div className="mb-5 bg-amber-500/10 text-amber-600 dark:text-amber-400 p-3 rounded-lg text-xs text-center border border-amber-500/20">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              className="w-full h-10 rounded-lg border border-border/50 bg-muted/30 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-border transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 rounded-lg border border-border/50 bg-muted/30 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-border transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>Ingresar al sistema <ArrowRight className="size-4" /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/20">
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
            FlowFinance · 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="text-sm font-medium animate-pulse tracking-widest uppercase text-muted-foreground">
          Cargando...
        </div>
      }>
        <FormularioLogin />
      </Suspense>
    </main>
  );
}