"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  FileChartColumn,
  FlaskConical,
  GitCompareArrows,
  Globe,
  LayoutDashboard,
  Link2,
  ListChecks,
  LogOut,
  Settings,
  Tent,
  TrafficCone,
  TriangleAlert,
  UserCog,
  X,
} from "lucide-react";

interface SuperAdminSidebarProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const superAdminMenu = [
  { label: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { label: "Albergues", href: "/super-admin/albergues", icon: Tent },
  { label: "Administradores", href: "/super-admin/administradores", icon: UserCog },
  { label: "Asignaciones", href: "/super-admin/asignaciones", icon: Link2 },
  { label: "Consulta global", href: "/super-admin/consulta-global", icon: Globe },
  { label: "Comparación", href: "/super-admin/comparacion", icon: GitCompareArrows },
  { label: "Semáforo Vital", href: "/super-admin/semaforo-vital", icon: TrafficCone },
  { label: "Alertas", href: "/super-admin/alertas", icon: TriangleAlert },
  { label: "Modelos", href: "/super-admin/modelos", icon: ChartLine },
  {
    label: "Escenarios e intervenciones",
    href: "/super-admin/escenarios",
    icon: FlaskConical,
  },
  { label: "Reportes", href: "/super-admin/reportes", icon: FileChartColumn },
  { label: "Auditoría", href: "/super-admin/auditoria", icon: ListChecks },
  { label: "Configuración", href: "/super-admin/configuracion", icon: Settings },
];

function Marca({ onClick }: { readonly onClick?: () => void }) {
  return (
    <Link href="/super-admin" onClick={onClick} className="flex items-center gap-2">
      <Image
        src="/icono.png"
        alt="Logo de Semáforo Vital"
        width={45}
        height={45}
        priority
        className="h-10 w-10 object-contain"
      />
      <span>
        <span className="block text-[15px] font-bold text-[#172126]">Semáforo Vital</span>
        <span className="block text-[11px] text-[#53636B]">Vigilancia sanitaria</span>
      </span>
    </Link>
  );
}

export default function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const pathname = usePathname();

  const contenido = (
    <>
      <p className="mb-2 mt-6 px-4 text-[10px] font-bold uppercase tracking-wide text-[#53636B]">
        Navegación global
      </p>

      <nav aria-label="Menú del súper administrador" className="flex-1 space-y-1 px-3">
        {superAdminMenu.map((item) => {
          const active =
            item.href === "/super-admin"
              ? pathname === "/super-admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={active ? "page" : undefined}
              className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition ${
                active
                  ? "bg-[#E6F9FA] font-semibold text-[#008E99]"
                  : "text-[#53636B] hover:bg-[#F3F8FA] hover:text-[#008E99]"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {active && (
                <span aria-hidden="true" className="h-5 w-[3px] rounded-full bg-[#00C3D0]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mt-6 space-y-4 pb-6">
        <div>
          <p className="text-[13px] font-semibold text-[#172126]">Súper Administrador</p>
          <p className="text-[11px] text-[#53636B]">Acceso global</p>
        </div>

        <div className="rounded-lg bg-[#F8FAFB] p-3">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[#159B64]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#23A96E]" />
            Sistema operativo
          </p>
          <p className="mt-1 text-[10px] text-[#53636B]">Albergues sincronizados</p>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-lg border border-[#E3EAEE] px-3 py-2 text-[12px] font-semibold text-[#008E99] transition hover:bg-[#E6F9FA]"
        >
          <LogOut size={16} aria-hidden="true" />
          Cerrar sesión
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* COMPUTADORES */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-[#E3EAEE] bg-white pt-4 lg:flex">
        <div className="px-4">
          <Marca />
        </div>
        {contenido}
      </aside>

      {/* TABLETS Y CELULARES */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-black/30"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EEF2F4] px-4 py-3">
              <Marca onClick={onClose} />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="rounded-lg p-2 text-[#53636B] hover:bg-[#F3F8FA]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {contenido}
          </aside>
        </div>
      )}
    </>
  );
}
