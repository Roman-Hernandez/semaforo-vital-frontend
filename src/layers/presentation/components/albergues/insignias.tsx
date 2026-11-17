import {
  ETIQUETAS_RIESGO,
  type NivelRiesgo,
} from "@/layers/domain/albergues/albergue";

const COLOR_RIESGO: Record<NivelRiesgo, { texto: string; punto: string }> = {
  bajo: { texto: "text-[#168052]", punto: "bg-[#168052]" },
  medio: { texto: "text-[#A96A00]", punto: "bg-[#D69B20]" },
  alto: { texto: "text-[#C53030]", punto: "bg-[#C53030]" },
  critico: { texto: "text-[#C53030]", punto: "bg-[#C53030]" },
};

export function RiesgoBadge({ riesgo }: { readonly riesgo: NivelRiesgo | null }) {
  if (!riesgo) {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[#718895]">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#A5B2B8]" />
        Sin evaluar
      </span>
    );
  }

  const estilo = COLOR_RIESGO[riesgo];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${estilo.texto}`}>
      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${estilo.punto}`} />
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
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium ${
        activo ? "text-[#168052]" : "text-[#718895]"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          activo ? "bg-[#168052]" : "bg-[#A5B2B8]"
        }`}
      />
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}
