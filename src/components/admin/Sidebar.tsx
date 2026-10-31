
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  House,
  Users,
  Droplets,
  HeartPulse,
  TrafficCone,
  BellRing,
  ChartNoAxesCombined,
  Activity,
  BrainCircuit,
  ClipboardCheck,
  History,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { label: "Inicio", href: "/admin", icon: LayoutDashboard },
  { label: "Mi albergue", href: "/admin/mi-albergue", icon: House },
  { label: "Población", href: "/admin/poblacion", icon: Users },
  {
    label: "Condiciones sanitarias",
    href: "/admin/condiciones-sanitarias",
    icon: Droplets,
  },
  {
    label: "Enfermedades",
    href: "/admin/enfermedades",
    icon: HeartPulse,
  },
  {
    label: "Semáforo Vital",
    href: "/admin/semaforo-vital",
    icon: TrafficCone,
  },
  {
    label: "Alertas",
    href: "/admin/alertas",
    icon: BellRing,
    badge: "3",
  },
  {
    label: "Predicciones",
    href: "/admin/predicciones",
    icon: ChartNoAxesCombined,
  },
  { label: "Modelo SIR", href: "/admin/modelo-sir", icon: Activity },
  { label: "Análisis IA", href: "/admin/analisis-ia", icon: BrainCircuit },
  {
    label: "Intervenciones",
    href: "/admin/intervenciones",
    icon: ClipboardCheck,
  },
  { label: "Historial", href: "/admin/historial", icon: History },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Contenido del menú
  const menuContent = (
    <>
      <p className="mb-2 mt-5 px-3 text-xs font-bold uppercase tracking-wide text-[#82939D]">
        Mi albergue
      </p>

      <nav
        aria-label="Menú del administrador"
        className="flex-1 px-2"
      >
        {menuItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-[#E4F8F8] font-bold text-[#087F8C]"
                  : "text-[#657C8C] hover:bg-[#F3F8FA] hover:text-[#087F8C]"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={2}
                className="shrink-0"
                aria-hidden="true"
              />

              <span className="flex-1">{item.label}</span>

              {item.badge && (
                <span className="rounded-full bg-[#FFF0CF] px-2 py-1 text-[10px] font-semibold text-[#A96A00]">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Información del albergue */}
      <div className="mx-3 mb-4 mt-6 rounded-lg bg-[#F5F9FB] p-3">
        <p className="text-[10px] font-semibold text-[#164652]">
          TU ALBERGUE
        </p>

        <p className="mt-2 text-sm font-semibold leading-5 text-[#71868D]">
          Albergue San José
        </p>

        <p className="mt-1 text-xs text-[#164652]">
          Pereira - Activo
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* SIDEBAR PARA COMPUTADORES */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-[#E3EAEE] bg-white lg:flex">

        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-2"
        >
          <Image
            src="/icono.png"
            alt="Logo de Semáforo Vital"
            width={50}
            height={50}
            priority
            className="h-10 w-12 object-contain"
          />

          <span className="text-sm font-extrabold text-[#164652]">
            Semáforo Vital
          </span>
        </Link>

        {menuContent}
      </aside>

      {/* SIDEBAR PARA TABLETS Y CELULARES */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          {/* Fondo oscuro */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/30"
          />

          {/* Menú desplegable */}
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-[#E3EAEE] bg-white shadow-xl">

            <div className="flex items-center justify-between border-b border-[#EDF1F3] px-3 py-3">

              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-2"
              >
                <Image
                  src="/icono.png"
                  alt="Logo de Semáforo Vital"
                  width={45}
                  height={45}
                  className="h-10 w-10 object-contain"
                />

                <span className="text-sm font-extrabold text-[#164652]">
                  Semáforo Vital
                </span>
              </Link>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-[#657C8C] hover:bg-[#F3F8FA]"
              >
                <X size={22} />
              </button>

            </div>

            {menuContent}

          </aside>
        </div>
      )}
    </>
  );
}
