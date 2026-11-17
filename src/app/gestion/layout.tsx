"use client";

import { useSyncExternalStore } from "react";
import { Tent, UserCog } from "lucide-react";
import { AccesoPorRol } from "@/layers/presentation/components/shared/acceso-por-rol";
import {
  leerUsuarioSesion,
  suscribirSesion,
} from "@/layers/application/services/sesion";
import InstitutionalShell, {
  type NavItemInstitucional,
} from "@/components/shared/InstitutionalShell";

const MENU_GESTION: readonly NavItemInstitucional[] = [
  { label: "Albergues", href: "/gestion/albergues", icon: Tent },
  { label: "Administradores", href: "/gestion/administradores", icon: UserCog },
];

const getServerSnapshot = () => null;

export default function GestionLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const usuario = useSyncExternalStore(
    suscribirSesion,
    leerUsuarioSesion,
    getServerSnapshot
  );

  const nombre = usuario
    ? [usuario.nombre, usuario.apellido].filter(Boolean).join(" ") || usuario.email
    : "Coordinación General";

  return (
    <AccesoPorRol rol="super_administrador">
      <InstitutionalShell
        items={MENU_GESTION}
        subtituloRol="Coordinación General"
        nombreUsuario={nombre || "Coordinación General"}
      >
        {children}
      </InstitutionalShell>
    </AccesoPorRol>
  );
}
