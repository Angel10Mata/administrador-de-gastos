"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Clock, Receipt, Menu, X, LogOut, TrendingDown } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/kore", label: "Resumen", icon: LayoutDashboard },
    { href: "/kore/ingresos", label: "Ingresos", icon: TrendingDown },
  ];

  return (
    <>
      {/* Botón Hamburguesa Flotante - Oculto en Desktop */}
      <button 
        onClick={() => setOpen(!open)}
        className="fixed top-5 left-5 z-50 p-2 bg-background border border-border/40 rounded-lg shadow-sm text-muted-foreground hover:text-foreground transition-all md:hidden"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay fondo oscuro cuando está abierto - Oculto en Desktop */}
      <div 
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-background border-r border-border/20 px-6 py-8 z-40 flex flex-col gap-6 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between pt-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-base font-medium">FlowFinance</span>
            </div>
            <p className="text-xs text-muted-foreground pl-4">Panel financiero</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex flex-col gap-1.5 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-colors ${
                  active 
                    ? "text-foreground font-semibold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Pie: cerrar sesión */}
        <div className="border-t border-border/20 pt-4 flex flex-col gap-3">
          <Link
            href="/api/logout"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-red-400 transition-colors"
          >
            <LogOut size={15} />
            Cerrar sesión
          </Link>
        </div>
      </aside>
    </>
  );
}
