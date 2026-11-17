"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  leerToken,
  obtenerSesion,
  rutaPorRol,
  suscribirSesion,
  type RolUsuario,
} from "@/layers/application/services/sesion";

function leerRolActual(): RolUsuario | null {
  const token = leerToken();
  if (!token) return null;
  return obtenerSesion(token).rol;
}

/** Control de navegación desde localStorage sin polling; la API valida firma y permisos en cada operación. */
export function AccesoPorRol({
  rol,
  children,
}: {
  readonly rol: RolUsuario;
  readonly children: ReactNode;
}) {
  const router = useRouter();
  const actual = useSyncExternalStore(suscribirSesion, leerRolActual, () => undefined);

  useEffect(() => {
    if (actual === undefined || actual === rol) return;
    router.replace(actual ? rutaPorRol(actual) : "/login");
  }, [actual, rol, router]);

  return actual === rol ? children : null;
}
