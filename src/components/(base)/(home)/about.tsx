"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Smartphone, GitMerge, Lock } from "lucide-react";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Datos 100% tuyos",
    desc: "Cada cuenta está aislada. Nadie más puede ver tus finanzas gracias a Row Level Security en Supabase.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Smartphone,
    title: "Diseño responsive",
    desc: "Accede desde cualquier dispositivo. La interfaz se adapta perfectamente a móvil, tablet y escritorio.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: GitMerge,
    title: "Todo en un lugar",
    desc: "Gastos, ingresos, deudas y abonos conectados. Un ecosistema financiero completo y coherente.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Lock,
    title: "Autenticación segura",
    desc: "Inicio de sesión protegido. Tu acceso está cifrado y gestionado por Supabase Auth.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative min-h-screen w-full snap-start flex flex-col items-center justify-center px-6 py-24 border-t border-border/20 bg-background overflow-hidden"
    >
      {/* Orb fondo */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/5 blur-[120px] rounded-full" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14 relative z-10 max-w-xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-5">
          <ShieldCheck size={11} className="text-indigo-400" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">¿Por qué FlowFinance?</span>
        </div>
        <h2
          className="text-4xl md:text-5xl font-black leading-tight text-foreground mb-4"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Construido para{" "}
          <em className="italic text-muted-foreground">la claridad</em>
        </h2>
        <p className="text-sm text-muted-foreground">
          FlowFinance nació para eliminar la confusión de las finanzas personales.
          Sin hojas de cálculo, sin apps complicadas. Solo control real de tu dinero.
        </p>
      </motion.div>

      {/* Pilares */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full relative z-10">
        {pillars.map((p, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`p-6 rounded-2xl border ${p.border} ${p.bg} cursor-default transition-all duration-300`}
          >
            <div className={`w-10 h-10 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center mb-4`}>
              <p.icon size={18} className={p.color} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-2">{p.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Quote */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-12 text-center text-xs text-muted-foreground/50 max-w-sm italic"
      >
        "El primer paso para tener más dinero es saber exactamente en qué lo gastas."
      </motion.p>
    </section>
  );
}
