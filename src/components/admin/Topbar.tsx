
"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopbarProps {
  readonly onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const pageTitles: Record<string, string> = {
  "/admin": "Inicio",
  "/admin/mi-albergue": "Mi albergue",
  "/admin/poblacion": "Población",
  "/admin/historial": "Historial",
};

const pageTitle = pageTitles[pathname] ?? "Semáforo Vital";
  return (
    <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-[#E3EAEE] bg-white px-4 py-3 sm:px-6">

      {/* Botón hamburguesa: solo tablets y móviles */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#164652] transition hover:bg-[#E4F8F8] lg:hidden"
      >
        <Menu size={25} />
      </button>

      {/* Información de la página */}
      <div className="mr-auto">
        <h1 className="text-sm font-bold text-[#24364B]">
          {pageTitle}
        </h1>

        <p className="mt-1 text-[11px] text-[#71868D]">
          Albergue San José
        </p>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E5F8F8] text-xs font-bold text-[#087F8C]">
          LG
        </div>

        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-[#24364B]">
            Laura Gómez
          </p>

          <p className="text-[11px] text-[#71868D]">
            Administrador de Albergue
          </p>
        </div>

        <Link
          href="/login"
          className="ml-1 rounded-lg border border-[#E0E8ED] px-3 py-2 text-[11px] font-semibold text-[#24364B] transition hover:bg-[#F5F9FB]"
        >
          ↪ Cerrar sesión
        </Link>
      </div>

    </header>
  );
}
