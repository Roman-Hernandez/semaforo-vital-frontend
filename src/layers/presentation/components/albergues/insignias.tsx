import {
  ETIQUETAS_RIESGO,
  type NivelRiesgo,
} from "@/layers/domain/albergues/albergue";

const ESTILOS_RIESGO: Record<NivelRiesgo, string> = {
  bajo: "bg-[#E7F7EF] text-[#159B64]",
  medio: "bg-[#FFF7E4] text-[#B77D00]",
  alto: "bg-[#FDEEEE] text-[#E65353]",
  critico: "bg-[#FDECEE] text-[#CF343B]",
};

const BASE =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold";

export function RiesgoBadge({ riesgo }: { readonly riesgo: NivelRiesgo | null }) {
  if (!riesgo) {
    return (
      <span className={`${BASE} bg-[#F1F4F5] text-[#829198]`}>
        Sin evaluar
      </span>
    );
  }

  return (
    <span className={`${BASE} ${ESTILOS_RIESGO[riesgo]}`}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      <span>
        <span className="sr-only">Riesgo </span>
        {ETIQUETAS_RIESGO[riesgo]}
      </span>
    </span>
  );
}

export function EstadoBadge({ activo }: { readonly activo: boolean }) {
  return (
    <span
      className={`${BASE} ${
        activo ? "bg-[#E9F7F0] text-[#23A96E]" : "bg-[#F1F4F5] text-[#829198]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          activo ? "bg-[#23A96E]" : "bg-[#A5B2B8]"
        }`}
      />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
