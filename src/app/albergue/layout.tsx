"use client";

import {
  ClipboardCheck,
  Droplets,
  HeartPulse,
  House,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { AccesoPorRol } from "@/layers/presentation/components/shared/acceso-por-rol";
import {
  MiAlbergueProvider,
  useMiAlbergue,
} from "@/layers/presentation/hooks/use-mi-albergue";
import InstitutionalShell, {
  type NavItemInstitucional,
} from "@/components/shared/InstitutionalShell";

const MENU_ALBERGUE: readonly NavItemInstitucional[] = [
  { label: "Inicio", href: "/albergue", icon: LayoutDashboard, exact: true },
  { label: "Información del albergue", href: "/albergue/informacion", icon: House },
  { label: "Población", href: "/albergue/poblacion", icon: Users },
  { label: "Condiciones sanitarias", href: "/albergue/condiciones-sanitarias", icon: Droplets },
  { label: "Enfermedades", href: "/albergue/enfermedades", icon: HeartPulse },
  { label: "Intervenciones", href: "/albergue/intervenciones", icon: ClipboardCheck },
  { label: "Laboratorio SIR", href: "/albergue/modelo-sir", icon: HeartPulse },
];

function AlbergueShellInterno({ children }: { readonly children: React.ReactNode }) {
  const { datos } = useMiAlbergue();

  const nombreUsuario = datos
    ? [datos.administrador.nombre, datos.administrador.apellido]
        .filter(Boolean)
        .join(" ") || datos.administrador.email
    : "Administrador de Albergue";

  return (
    <InstitutionalShell
      items={MENU_ALBERGUE}
      subtituloRol="Administrador de Albergue"
      nombreUsuario={nombreUsuario}
      subtituloContexto={datos?.albergue.nombre}
    >
      {children}
    </InstitutionalShell>
  );
}

export default function AlbergueLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <AccesoPorRol rol="administrador_albergue">
      <MiAlbergueProvider>
        <AlbergueShellInterno>{children}</AlbergueShellInterno>
      </MiAlbergueProvider>
    </AccesoPorRol>
  );
}
