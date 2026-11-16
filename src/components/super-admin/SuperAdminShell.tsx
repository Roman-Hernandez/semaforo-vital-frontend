"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu } from "lucide-react";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminShell({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F4F8FA]">
      <SuperAdminSidebar isOpen={menuAbierto} onClose={() => setMenuAbierto(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior: solo tablets y celulares */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#E3EAEE] bg-white px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <Image
              src="/icono.png"
              alt="Logo de Semáforo Vital"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
            <span>
              <span className="block text-[13px] font-bold text-[#172126]">Semáforo Vital</span>
              <span className="block text-[10px] text-[#53636B]">Súper Administrador</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E6F9FA] text-[#008E99]"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
