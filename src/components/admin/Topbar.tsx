
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LogOut, X } from "lucide-react";

interface TopbarProps {
  readonly onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (showLogoutModal && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [showLogoutModal]);

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    setShowLogoutModal(false);
    router.replace("/login");
  };

  const handleCloseModal = () => {
    setShowLogoutModal(false);
  };

  const pageTitles: Record<string, string> = {
    "/admin": "Inicio",
    "/admin/mi-albergue": "Mi albergue",
    "/admin/poblacion": "Población",
    "/admin/historial": "Historial",
    "/admin/condiciones-sanitarias": "Condiciones sanitarias",
    "/admin/enfermedades": "Enfermedades",
  };

  const pageTitle = pageTitles[pathname] ?? "Semáforo Vital";

  return (
    <>
      <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-[#E3EAEE] bg-white px-4 py-3 sm:px-6">
        {/* Botón hamburguesa */}
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

          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="ml-1 rounded-lg border border-[#E0E8ED] px-3 py-2 text-[11px] font-semibold text-[#24364B] transition hover:border-[#A5DEDA] hover:bg-[#E4F8F8]"
          >
            <span className="flex items-center gap-1.5">
              <LogOut size={14} />
              Cerrar sesión
            </span>
          </button>
        </div>
      </header>

      {/* Modal de confirmación */}
      {showLogoutModal && (
        <dialog
          ref={dialogRef}
          aria-labelledby="logout-title"
          aria-describedby="logout-description"
          onClose={handleCloseModal}
          onCancel={handleCloseModal}
          className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl backdrop:bg-[#24364B]/50 backdrop:backdrop-blur-[2px] sm:p-7"
        >
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar ventana"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-[#71868D] transition hover:bg-[#E4F8F8] hover:text-[#087F8C]"
          >
            <X size={19} />
          </button>

          {/* Icono */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DDFBFA]">
            <LogOut size={30} className="text-[#087F8C]" />
          </div>

          {/* Mensaje */}
          <div className="text-center">
            <h2
              id="logout-title"
              className="text-lg font-bold text-[#24364B]"
            >
              ¿Cerrar sesión?
            </h2>

            <p
              id="logout-description"
              className="mt-2 text-sm leading-relaxed text-[#71868D]"
            >
              ¿Estás seguro de que deseas cerrar tu sesión?
              Tendrás que iniciar sesión nuevamente para acceder
              al panel de administración.
            </p>
          </div>

          {/* Botones */}
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="flex-1 rounded-xl border border-[#E0E8ED] bg-[#F5F9FB] px-4 py-3 text-sm font-semibold text-[#24364B] transition hover:bg-[#EAF1F4]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-[#30CDD3] px-4 py-3 text-sm font-semibold text-[#24364B] transition hover:bg-[#24B8BE] focus:outline-none focus:ring-2 focus:ring-[#30CDD3] focus:ring-offset-2"
            >
              Sí, cerrar sesión
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
