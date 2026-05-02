"use client"

import { motion } from "framer-motion"
import { Receipt, CreditCard, TrendingUp, PiggyBank, BarChart2, CalendarCheck } from "lucide-react"

const features = [
  {
    icon: Receipt,
    title: "Gastos",
    desc: "Registra y categoriza cada gasto. Filtra por mes o día y exporta en PDF/Excel.",
    color: "from-amber-500 to-orange-400",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
  },
  {
    icon: CreditCard,
    title: "Deudas",
    desc: "Administra tus deudas con cuota mensual. Sabe al instante si estás al día o atrasado.",
    color: "from-indigo-500 to-purple-400",
    glow: "shadow-indigo-500/20",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/5",
  },
  {
    icon: PiggyBank,
    title: "Abonos",
    desc: "Lleva el historial de cada abono realizado. El saldo se actualiza automáticamente.",
    color: "from-emerald-500 to-teal-400",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/5",
  },
  {
    icon: TrendingUp,
    title: "Ingresos",
    desc: "Registra tus fuentes de ingreso y compáralos mes a mes con tus egresos.",
    color: "from-cyan-500 to-blue-400",
    glow: "shadow-cyan-500/20",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
  },
  {
    icon: BarChart2,
    title: "Dashboard",
    desc: "Vista general en tiempo real con gráficas comparativas de ingresos vs egresos.",
    color: "from-pink-500 to-rose-400",
    glow: "shadow-pink-500/20",
    border: "border-pink-500/20",
    bg: "bg-pink-500/5",
  },
  {
    icon: CalendarCheck,
    title: "Alertas",
    desc: "Notificaciones automáticas de deudas próximas a vencer o vencidas.",
    color: "from-violet-500 to-purple-400",
    glow: "shadow-violet-500/20",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
  },
]

export function ServicesSection() {
  return (
    <section
      id="services"
      className="relative min-h-screen w-full snap-start flex flex-col items-center justify-center px-6 py-24 border-t border-border/20 bg-background overflow-hidden"
    >
      {/* Orb de fondo */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[140px]" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
          <BarChart2 size={11} className="text-emerald-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Funcionalidades</span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-black leading-tight text-foreground mb-4"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Todo lo que necesitas{" "}
          <br />
          <em className="italic text-muted-foreground">para tus finanzas</em>
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Un ecosistema completo para administrar tu dinero personal de forma simple, visual y segura.
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full relative z-10">
        {features.map((f, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className={`group relative p-6 rounded-2xl border ${f.border} ${f.bg} hover:scale-[1.02] transition-all duration-300 cursor-default overflow-hidden`}
          >
            {/* Glow on hover */}
            <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl ${f.bg} scale-110`} />

            <div className="relative z-10">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg ${f.glow}`}>
                <f.icon size={18} className="text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}