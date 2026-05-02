"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import Link from "next/link"
import { TrendingUp, TrendingDown, ArrowRight, Sparkles } from "lucide-react"

/* ── Contador animado ───────────────────────────────────────────── */
function CountUp({ end, prefix = "", suffix = "", duration = 1800 }: { end: number; prefix?: string; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setVal(end); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration])
  return <>{prefix}{val.toLocaleString("es-GT")}{suffix}</>
}

/* ── Tarjeta flotante con tilt ──────────────────────────────────── */
function FloatCard({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const rotX = useMotionValue(0)
  const rotY = useMotionValue(0)
  const sRotX = useSpring(rotX, { stiffness: 200, damping: 20 })
  const sRotY = useSpring(rotY, { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    rotX.set(((e.clientY - cy) / rect.height) * -14)
    rotY.set(((e.clientX - cx) / rect.width) * 14)
  }

  const handleMouseLeave = () => { rotX.set(0); rotY.set(0) }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ rotateX: sRotX, rotateY: sRotY, transformPerspective: 800 }}
      className={`cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ── Hero principal ─────────────────────────────────────────────── */
export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null)

  // Glow que sigue el cursor
  const glowX = useMotionValue(-200)
  const glowY = useMotionValue(-200)
  const sGlowX = useSpring(glowX, { stiffness: 80, damping: 20 })
  const sGlowY = useSpring(glowY, { stiffness: 80, damping: 20 })

  // Parallax de orbs con el mouse
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const orb1X = useTransform(mouseX, [-500, 500], [-30, 30])
  const orb1Y = useTransform(mouseY, [-300, 300], [-20, 20])
  const orb2X = useTransform(mouseX, [-500, 500], [20, -20])
  const orb2Y = useTransform(mouseY, [-300, 300], [15, -15])
  const sOrb1X = useSpring(orb1X, { stiffness: 40, damping: 15 })
  const sOrb1Y = useSpring(orb1Y, { stiffness: 40, damping: 15 })
  const sOrb2X = useSpring(orb2X, { stiffness: 30, damping: 15 })
  const sOrb2Y = useSpring(orb2Y, { stiffness: 30, damping: 15 })

  // Parallax tarjetas con el mouse
  const card1X = useTransform(mouseX, [-500, 500], [-15, 15])
  const card1Y = useTransform(mouseY, [-300, 300], [-10, 10])
  const card2X = useTransform(mouseX, [-500, 500], [12, -12])
  const card2Y = useTransform(mouseY, [-300, 300], [8, -8])
  const sCard1X = useSpring(card1X, { stiffness: 60, damping: 18 })
  const sCard1Y = useSpring(card1Y, { stiffness: 60, damping: 18 })
  const sCard2X = useSpring(card2X, { stiffness: 50, damping: 18 })
  const sCard2Y = useSpring(card2Y, { stiffness: 50, damping: 18 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mouseX.set(e.clientX - cx)
    mouseY.set(e.clientY - cy)
    glowX.set(e.clientX - rect.left)
    glowY.set(e.clientY - rect.top)
  }

  const handleMouseLeave = () => {
    mouseX.set(0); mouseY.set(0)
    glowX.set(-200); glowY.set(-200)
  }

  return (
    <section
      ref={containerRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen snap-start flex flex-col items-center justify-center text-center overflow-hidden bg-background px-6"
    >
      {/* ── Cursor glow ── */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full"
        style={{
          x: sGlowX,
          y: sGlowY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Orbs con parallax ── */}
      <motion.div
        className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-emerald-500/10 blur-[120px]"
        style={{ x: sOrb1X, y: sOrb1Y }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-indigo-500/10 blur-[100px]"
        style={{ x: sOrb2X, y: sOrb2Y }}
      />

      {/* ── Grid de fondo ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Tarjeta flotante — Ingresos ── */}
      <motion.div
        className="hidden lg:block absolute left-[6%] top-[28%]"
        style={{ x: sCard1X, y: sCard1Y }}
      >
        <FloatCard delay={0}>
          <div className="flex flex-col gap-2 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl shadow-2xl shadow-emerald-500/10 w-52 hover:border-emerald-500/40 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp size={13} className="text-emerald-400" />
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Ingresos</span>
            </div>
            <p className="font-mono text-xl font-bold text-emerald-400">Q 8,450.00</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500">
              <TrendingUp size={9} /> +12% este mes
            </div>
            {/* Mini barra animada */}
            <div className="w-full h-[2px] bg-white/5 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "72%" }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </FloatCard>
      </motion.div>

      {/* ── Tarjeta flotante — Egresos ── */}
      <motion.div
        className="hidden lg:block absolute right-[6%] top-[32%]"
        style={{ x: sCard2X, y: sCard2Y }}
      >
        <FloatCard delay={1}>
          <div className="flex flex-col gap-2 p-4 rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl shadow-2xl shadow-red-500/10 w-52 hover:border-red-500/40 transition-colors duration-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                <TrendingDown size={13} className="text-red-400" />
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Egresos</span>
            </div>
            <p className="font-mono text-xl font-bold text-red-400">Q 3,210.00</p>
            <div className="flex items-center gap-1 text-[10px] text-red-400">
              <TrendingDown size={9} /> -5% este mes
            </div>
            <div className="w-full h-[2px] bg-white/5 rounded-full mt-1 overflow-hidden">
              <motion.div
                className="h-full bg-red-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "38%" }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </FloatCard>
      </motion.div>

      {/* ── Contenido central ── */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl">

        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8 cursor-default group hover:bg-emerald-500/20 transition-colors duration-300"
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
            Sistema activo
          </span>
          <Sparkles size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black leading-[1.0] mb-6 tracking-tight select-none"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          <motion.span
            className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent inline-block"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Flow
          </motion.span>
          <motion.span
            className="text-foreground inline-block"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Finance
          </motion.span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base text-muted-foreground leading-relaxed max-w-md mb-10"
        >
          Tu administrador de gastos y finanzas personales.{" "}
          <span className="text-foreground font-medium">Toma el control de tu dinero</span> con claridad y sin complicaciones.
        </motion.p>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center gap-3 mb-14"
        >
          <Link
            href="/login"
            className="group relative inline-flex items-center gap-2 text-sm font-semibold bg-emerald-500 text-black rounded-xl px-7 py-3 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-95"
          >
            {/* Shimmer */}
            <span className="absolute inset-0 rounded-xl overflow-hidden">
              <motion.span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                animate={{ translateX: ["−100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5 }}
              />
            </span>
            <span className="relative">Ingresar al sistema</span>
            <ArrowRight size={14} className="relative group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground border border-border/50 rounded-xl px-6 py-3 hover:bg-muted/40 hover:text-foreground hover:border-border transition-all hover:scale-[1.02] active:scale-95"
          >
            Crear cuenta gratis
          </Link>
        </motion.div>

        {/* Stats con contador animado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex gap-8 pt-8 border-t border-border/20 w-full max-w-sm justify-center"
        >
          {[
            { label: "Disponible", display: "24/7", isText: true, color: "text-foreground" },
            { label: "Seguro", display: "100", suffix: "%", isText: false, color: "text-foreground" },
            { label: "Costo inicial", display: "100", prefix: "Q", isText: false, color: "text-emerald-400" },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="text-center cursor-default"
            >
              <div className={`font-mono text-2xl font-bold ${s.color}`}>
                {s.isText ? s.display : (
                  <CountUp end={Number(s.display)} prefix={s.prefix} suffix={s.suffix} />
                )}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="w-[1px] h-6 bg-gradient-to-b from-muted-foreground/30 to-transparent"
        />
      </motion.div>
    </section>
  )
}