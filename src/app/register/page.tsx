"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

function FormularioRegistro() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [verPass, setVerPass] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmar) {
      Swal.fire({
        title: "Las contraseñas no coinciden",
        text: "Verifica que ambas contraseñas sean iguales.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        background: document.documentElement.classList.contains("dark") ? "#1E1E1E" : "#FFFFFF",
        color: document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#000000",
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        title: "Contraseña muy corta",
        text: "La contraseña debe tener al menos 6 caracteres.",
        icon: "warning",
        confirmButtonColor: "#10b981",
        background: document.documentElement.classList.contains("dark") ? "#1E1E1E" : "#FFFFFF",
        color: document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#000000",
      });
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: nombre.trim() },
      },
    });

    if (error) {
      const msg =
        error.message.includes("already registered") || error.message.includes("User already registered")
          ? "Este correo ya tiene una cuenta. Intenta iniciar sesión."
          : error.message.includes("invalid email")
          ? "El correo no tiene un formato válido."
          : error.message.includes("Signups not allowed")
          ? "Los registros están desactivados. Contacta al administrador."
          : error.message.includes("Password should be")
          ? "La contraseña debe tener al menos 6 caracteres."
          : `Error: ${error.message}`;

      Swal.fire({
        title: "Error al registrarse",
        text: msg,
        icon: "error",
        confirmButtonColor: "#10b981",
        background: document.documentElement.classList.contains("dark") ? "#1E1E1E" : "#FFFFFF",
        color: document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#000000",
      });
      setLoading(false);
      return;
    }

    // Si Supabase requiere confirmación de correo
    if (data.user && !data.session) {
      Swal.fire({
        title: "¡Cuenta creada!",
        text: "Te enviamos un correo de confirmación. Revisa tu bandeja de entrada.",
        icon: "success",
        confirmButtonColor: "#10b981",
        background: document.documentElement.classList.contains("dark") ? "#1E1E1E" : "#FFFFFF",
        color: document.documentElement.classList.contains("dark") ? "#FFFFFF" : "#000000",
      }).then(() => router.push("/login"));
      return;
    }

    // Si no requiere confirmación, entra directo
    router.push("/kore");
    router.refresh();
  };

  const inputClass =
    "w-full h-10 rounded-lg border border-border/50 bg-muted/30 px-3 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all";
  const labelClass =
    "text-[10px] font-medium uppercase tracking-widest text-muted-foreground";

  return (
    <div className="w-full max-w-3xl flex rounded-2xl overflow-hidden border border-border/20 shadow-2xl">

      {/* Panel izquierdo */}
      <div
        className="hidden md:flex w-[42%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: "#0a0a0a" }}
      >
        <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
        <div className="absolute -bottom-4 -right-4 w-36 h-36 rounded-full border border-white/5 pointer-events-none" />

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

        <div className="flex-1 flex flex-col justify-center py-8">
          <h2
            className="text-4xl leading-[1.1] text-white mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Crea tu<br />
            <em className="italic" style={{ color: "rgba(255,255,255,0.35)" }}>cuenta gratis</em>
          </h2>
          <p className="text-xs leading-relaxed max-w-[190px]" style={{ color: "rgba(255,255,255,0.25)" }}>
            Empieza a gestionar tus finanzas personales hoy mismo.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              Sin costo — siempre
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
            Registro nuevo
          </span>
        </div>

        <h1 className="text-2xl font-medium text-foreground mb-1">Crear cuenta</h1>
        <p className="text-xs text-muted-foreground mb-8">Completa los datos para comenzar</p>

        <form onSubmit={handleRegistro} className="space-y-4">

          <div className="space-y-1.5">
            <label className={labelClass}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Contraseña</label>
            <div className="relative">
              <input
                type={verPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerPass(!verPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {verPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Confirmar contraseña</label>
            <div className="relative">
              <input
                type={verConfirmar ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="Repite la contraseña"
                required
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setVerConfirmar(!verConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {verConfirmar ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <>Crear cuenta <ArrowRight className="size-4" /></>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={12} /> ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>

        <div className="mt-6 pt-5 border-t border-border/20">
          <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground/40">
            FlowFinance · 2026
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen w-full bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={
        <div className="text-sm font-medium animate-pulse tracking-widest uppercase text-muted-foreground">
          Cargando...
        </div>
      }>
        <FormularioRegistro />
      </Suspense>
    </main>
  );
}
