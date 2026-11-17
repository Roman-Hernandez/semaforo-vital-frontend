"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  obtenerSesion,
  rutaPorRol,
  suscribirSesion,
} from "@/layers/application/services/sesion";

const getRolSnapshot = () => obtenerSesion().rol;
const getServerRolSnapshot = () => null;

export function PublicHeader({
  activo,
}: {
  readonly activo?: "inicio" | "educacion" | "institucional";
}) {
  const rolSesion = useSyncExternalStore(
    suscribirSesion,
    getRolSnapshot,
    getServerRolSnapshot
  );
  const rutaAcceso = rolSesion ? rutaPorRol(rolSesion) : "/login";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E7EFEF] bg-white/95 backdrop-blur-sm">
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/icono.png"
            alt="Logo de Semáforo Vital"
            width={36}
            height={36}
            priority
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-[#0E2E33]">
            Semáforo Vital
          </span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-[#375257] md:flex">
          <Link
            href="/#inicio"
            aria-current={activo === "inicio" ? "page" : undefined}
            className={
              activo === "inicio"
                ? "border-b-2 border-[#047270] py-6 font-semibold text-[#047270]"
                : "py-6 transition hover:text-[#047270]"
            }
          >
            Inicio
          </Link>
          <Link
            href="/#albergues"
            className="py-6 transition hover:text-[#047270]"
          >
            Albergues
          </Link>
          <Link href="/#mapa" className="py-6 transition hover:text-[#047270]">
            Mapa
          </Link>
          <Link
            href="/#alertas"
            className="py-6 transition hover:text-[#047270]"
          >
            Alertas
          </Link>
          <Link
            href="/educacion"
            aria-current={activo === "educacion" ? "page" : undefined}
            className={
              activo === "educacion"
                ? "border-b-2 border-[#047270] py-6 font-semibold text-[#047270]"
                : "py-6 transition hover:text-[#047270]"
            }
          >
            Educación
          </Link>
        </div>

        <Link
          href={rutaAcceso}
          className="anim-interactivo rounded-xl border border-[#186A6B] bg-white px-5 py-2.5 text-sm font-semibold text-[#047270] hover:bg-[#F0F8F7]"
        >
          {rolSesion ? "Ir a mi panel" : "Iniciar sesión"}
        </Link>
      </nav>
    </header>
  );
}
