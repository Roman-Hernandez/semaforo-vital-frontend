"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { cerrarSesion } from "@/layers/application/services/sesion";

export interface NavItemInstitucional {
  readonly label: string;
  readonly href: string;
  readonly icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  readonly exact?: boolean;
}

interface InstitutionalShellProps {
  readonly items: readonly NavItemInstitucional[];
  readonly subtituloRol: string;
  readonly nombreUsuario: string;
  readonly subtituloContexto?: string;
  readonly children: React.ReactNode;
}

export default function InstitutionalShell({
  items,
  subtituloRol,
  nombreUsuario,
  subtituloContexto,
  children,
}: InstitutionalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (confirmarSalida && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [confirmarSalida]);

  const iniciales =
    nombreUsuario
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "SV";

  const itemActivo = items.find((item) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  function salir() {
    cerrarSesion();
    setConfirmarSalida(false);
    router.replace("/login");
  }

  const navegacion = (
    <nav aria-label="Menú principal" className="mt-4 flex-1 space-y-1 px-3">
      {items.map((item) => {
        const activo = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuAbierto(false)}
            aria-current={activo ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              activo
                ? "bg-[#E6F9FA] font-semibold text-[#008994]"
                : "text-[#53636B] hover:bg-[#F4F8FA] hover:text-[#164652]"
            }`}
          >
            <Icon size={18} strokeWidth={2} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F4F8FA] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {/* Sidebar escritorio */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-[#DCE6EA] bg-white py-4 lg:flex">
        <div className="px-4 pb-2">
          <Link href={items[0]?.href ?? "/"} className="flex items-center gap-2.5">
            <Image
              src="/icono.png"
              alt="Logo de Semáforo Vital"
              width={40}
              height={40}
              className="h-9 w-9 object-contain"
            />
            <div>
              <span className="block text-sm font-bold text-[#164652]">Semáforo Vital</span>
              <span className="block text-[11px] text-[#53636B]">{subtituloRol}</span>
            </div>
          </Link>
        </div>

        {navegacion}
      </aside>

      {/* Sidebar móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuAbierto(false)}
            aria-label="Cerrar menú"
            className="absolute inset-0 bg-[#164652]/40"
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto bg-white py-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#EEF2F4] px-4 pb-3">
              <Link
                href={items[0]?.href ?? "/"}
                onClick={() => setMenuAbierto(false)}
                className="flex items-center gap-2"
              >
                <Image
                  src="/icono.png"
                  alt="Logo de Semáforo Vital"
                  width={36}
                  height={36}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-sm font-bold text-[#164652]">Semáforo Vital</span>
              </Link>
              <button
                type="button"
                onClick={() => setMenuAbierto(false)}
                aria-label="Cerrar menú"
                className="rounded-lg p-1.5 text-[#53636B] hover:bg-[#F4F8FA]"
              >
                <X size={20} />
              </button>
            </div>
            {navegacion}
          </aside>
        </div>
      )}

      {/* Contenido y barra superior */}
      <div className="flex min-w-0 flex-col">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b border-[#DCE6EA] bg-white px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#164652] transition hover:bg-[#F4F8FA] lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="mr-auto min-w-0">
            <p className="truncate text-sm font-bold text-[#164652]">
              {itemActivo?.label ?? "Semáforo Vital"}
            </p>
            {subtituloContexto && (
              <p className="truncate text-xs text-[#53636B]">{subtituloContexto}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F9FA] text-xs font-bold text-[#008994]">
              {iniciales}
            </div>

            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-[#164652]">{nombreUsuario}</p>
              <p className="text-[11px] text-[#53636B]">{subtituloRol}</p>
            </div>

            <button
              type="button"
              onClick={() => setConfirmarSalida(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DCE6EA] bg-white px-3 py-2 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
            >
              <LogOut size={14} aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {confirmarSalida && (
        <dialog
          ref={dialogRef}
          aria-labelledby="logout-dialog-title"
          onClose={() => setConfirmarSalida(false)}
          onCancel={() => setConfirmarSalida(false)}
          className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-[#DCE6EA] bg-white p-6 shadow-xl backdrop:bg-[#164652]/40"
        >
          <h2 id="logout-dialog-title" className="text-base font-bold text-[#164652]">
            ¿Cerrar sesión?
          </h2>
          <p className="mt-2 text-xs leading-5 text-[#53636B]">
            Deberás ingresar tus credenciales nuevamente para acceder al panel.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg border border-[#DCE6EA] bg-white px-4 py-2 text-xs font-semibold text-[#164652] hover:bg-[#F4F8FA]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={salir}
              className="rounded-lg bg-[#008994] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00747E]"
            >
              Confirmar salida
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
