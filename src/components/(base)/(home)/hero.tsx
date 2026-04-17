"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative w-full h-screen snap-start flex flex-col items-center justify-center text-center overflow-hidden bg-background px-6"
    >
      {/* Esquinas decorativas */}
      <div className="absolute top-0 left-0 w-44 h-44 border-r border-b border-border/20 rounded-br-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-44 h-44 border-l border-t border-border/20 rounded-tl-full pointer-events-none" />

      {/* Tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-2 mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Sistema activo
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-6xl md:text-7xl font-bold leading-[1.1] mb-5"
      >
        <span className="text-emerald-400">FlowFinance</span>
      </motion.h1>

      {/* Subtítulo */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="text-sm text-muted-foreground leading-relaxed max-w-md mb-10"
      >
        Tu administrador de gastos y finanzas personales. Toma el control
        de tu dinero con claridad y sin complicaciones.
      </motion.p>

      {/* Botones */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="flex items-center gap-3"
      >
        <Link
          href="/login"
          className="text-sm font-medium bg-foreground text-background rounded-lg px-7 py-2.5 hover:opacity-90 transition-opacity"
        >
          Ingresar al sistema
        </Link>
        <Link
          href="/register"
          className="text-sm text-muted-foreground border border-border/50 rounded-lg px-6 py-2.5 hover:bg-muted transition-colors"
        >
          Crear cuenta
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.45 }}
        className="flex gap-10 mt-14 pt-8 border-t border-border/20 w-full max-w-xs justify-center"
      >
        {[
          { num: "24/7", label: "Disponible" },
          { num: "100%", label: "Seguro" },
          { num: "Q0", label: "Costo inicial" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="font-mono text-xl">{s.num}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}