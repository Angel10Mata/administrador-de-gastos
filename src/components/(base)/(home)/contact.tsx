"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, Mail, UserPlus } from "lucide-react";
import { AuroraText } from "@/components/ui/aurora-text";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="min-h-screen w-full snap-start flex flex-col justify-between px-6 pt-24 pb-10 bg-background text-foreground border-t border-border/20 overflow-hidden"
    >
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto gap-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-5">
            <UserPlus size={11} className="text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Empieza hoy</span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-black leading-tight text-foreground mb-4"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Toma el control{" "}
            <br />
            <em className="italic text-muted-foreground">de tu dinero</em>
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Crea tu cuenta gratuita en segundos y empieza a registrar tus finanzas hoy mismo.
            Sin tarjetas, sin compromisos.
          </p>
        </motion.div>

        {/* CTA cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Crear cuenta */}
          <Link
            href="/register"
            className="group flex items-center justify-between p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <UserPlus size={18} className="text-emerald-400" />
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Nuevo usuario</p>
                <p className="text-sm font-bold text-foreground">Crear cuenta gratis</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Iniciar sesión */}
          <Link
            href="/login"
            className="group flex items-center justify-between p-6 rounded-2xl border border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/60 hover:scale-[1.02] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="w-11 h-11 rounded-xl bg-muted/30 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-muted-foreground" />
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Ya tengo cuenta</p>
                <p className="text-sm font-bold text-foreground">Iniciar sesión</p>
              </div>
            </div>
            <ArrowRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* Separador */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full flex items-center gap-4"
        >
          <div className="flex-1 h-[1px] bg-border/20" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40">open source</span>
          <div className="flex-1 h-[1px] bg-border/20" />
        </motion.div>

        {/* GitHub */}
        <motion.a
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          href="https://github.com/Angel10Mata/administrador-de-gastos"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-border/30 bg-muted/10 hover:bg-muted/20 hover:border-border/50 transition-all duration-300 hover:scale-[1.02]"
        >
          <Github size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Ver código en GitHub
          </span>
          <ArrowRight size={13} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mt-10 space-y-1"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-30">
          © 2026 FlowFinance — Angel Mata
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest">
          Powered by{" "}
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline cursor-pointer transition-all inline-block"
          >
            <AuroraText>Supabase + Next.js</AuroraText>
          </a>
        </p>
      </motion.div>
    </section>
  );
}
