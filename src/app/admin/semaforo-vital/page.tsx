
import Link from "next/link";
import {
  Activity,
  Bell,
  Check,
  CheckCircle2,
  ChartNoAxesCombined,
  Clock3,
  Droplets,
  HeartPulse,
  House,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const riskFactors = [
  {
    title: "Población y hacinamiento",
    value: "60% de ocupación",
    description: "120 personas de 200. Sin hacinamiento.",
    icon: Users,
    progress: 60,
  },
  {
    title: "Calidad del agua",
    value: "Agua potable",
    description: "Suministro disponible y control de calidad del día.",
    icon: Droplets,
    progress: 100,
  },
  {
    title: "Condiciones sanitarias",
    value: "Adecuadas",
    description: "Limpieza y manejo de residuos con seguimiento.",
    icon: Sparkles,
    progress: 90,
  },
  {
    title: "Casos de enfermedades",
    value: "5 registrados",
    description: "Registro acumulado; no equivale a casos activos.",
    icon: HeartPulse,
    progress: 100,
  },
  {
    title: "Tendencia epidemiológica",
    value: "Estable",
    description: "Sin señales de aumento en el seguimiento reciente.",
    icon: ChartNoAxesCombined,
    progress: 85,
  },
];

const recommendations = [
  {
    title: "Mantener la vigilancia diaria",
    description:
      "Actualizar el registro de casos y revisar la aparición de nuevos síntomas.",
    icon: ShieldCheck,
  },
  {
    title: "Continuar los controles de agua e higiene",
    description:
      "Verificar el agua potable y las rutinas de limpieza y manejo de residuos.",
    icon: Droplets,
  },
  {
    title: "Cuidar la ocupación del albergue",
    description:
      "Conservar la ventilación y evitar superar la capacidad de 200 personas.",
    icon: House,
  },
];

export default function SemaforoVitalPage() {
  return (
    <div className="space-y-5 text-[#24364B]">

      {/* ENCABEZADO */}
      <header>
        <h1 className="text-2xl font-semibold text-[#203B45]">
          Semáforo Vital
        </h1>

        <p className="mt-1 text-sm text-[#718895]">
          Consulta el nivel actual de riesgo epidemiológico de tu albergue.
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-[#718895]">
          <MapPin size={13} className="text-[#009EAD]" />
          <span className="font-medium text-[#009EAD]">
            Albergue San José - Pereira
          </span>
          <span>/</span>
          <span>Activo</span>
        </div>
      </header>

      {/* NIVEL DE RIESGO */}
      <section className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">

        <div className="flex flex-col items-center gap-4 sm:flex-row">

          {/* INDICADOR CIRCULAR */}
          <div
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[7px] border-[#D5F0E3] bg-[#E8F7F0] sm:h-32 sm:w-32"
            aria-label="Nivel de riesgo bajo"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#239B70] sm:h-24 sm:w-24">
              <Check size={32} className="text-white" />
            </div>
          </div>

          {/* INFORMACIÓN DEL RIESGO */}
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-sm text-[#718895]">
              Nivel de riesgo actual
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#168052] sm:text-3xl">
              Riesgo bajo
            </h2>

            <p className="mt-1 text-sm text-[#718895]">
              Las condiciones del albergue se mantienen estables.
              Continúa con las medidas de prevención.
            </p>

            <p className="mt-2 flex items-center justify-center gap-1 text-[10px] text-[#8297A1] sm:justify-start">
              <Clock3 size={12} />
              Última actualización: 06 oct 2026 · 08:30
            </p>
          </div>

          {/* MENSAJE PREVENTIVO */}
          <div className="w-full rounded-lg bg-[#E8F7F0] p-3 text-center sm:w-36 sm:text-left">
            <p className="text-[10px] font-semibold text-[#168052]">
              Prevención y seguimiento
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#348567]">
              No se requiere activar un protocolo de emergencia.
            </p>
          </div>

        </div>

        {/* ESTADÍSTICAS */}
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-[#E8EEF1] pt-4 sm:grid-cols-3">

          <div>
            <p className="text-xl font-bold text-[#24364B]">120</p>
            <p className="text-[10px] font-medium">Personas</p>
            <p className="mt-1 text-[10px] text-[#8297A1]">
              de 200 de capacidad
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-[#24364B]">5</p>
            <p className="text-[10px] font-medium">Casos registrados</p>
            <p className="mt-1 text-[10px] text-[#8297A1]">
              registro acumulado
            </p>
          </div>

          <div>
            <p className="text-xl font-bold text-[#24364B]">0</p>
            <p className="text-[10px] font-medium">Alertas activas</p>
            <p className="mt-1 text-[10px] text-[#8297A1]">
              sin alertas vigentes
            </p>
          </div>

        </div>
      </section>

      {/* FACTORES DE RIESGO */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-medium text-[#29434D]">
            Factores de riesgo
          </h2>

          <p className="text-[10px] text-[#8297A1]">
            5 factores evaluados en tu albergue
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">

          {riskFactors.map((factor) => {
            const Icon = factor.icon;

            return (
              <article
                key={factor.title}
                className="rounded-xl border border-[#E4EBEF] bg-white p-3 shadow-sm"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                    <Icon size={17} />
                  </span>

                  <h3 className="text-sm font-semibold text-[#29434D]">
                    {factor.title}
                  </h3>
                </div>

                <p className="text-sm font-bold text-[#29434D]">
                  {factor.value}
                </p>

                <p className="mt-1 min-h-10 text-[11px] leading-4 text-[#8297A1]">
                  {factor.description}
                </p>

                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EDF2F4]"
                  role="img"
                  aria-label={`Indicador visual de ${factor.title}: ${factor.progress}%`}
                >
                  <div
                    className="h-full rounded-full bg-[#00B9C7]"
                    style={{ width: `${factor.progress}%` }}
                  />
                </div>

                <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#E8F7F0] px-2 py-1 text-[9px] font-medium text-[#168052]">
                  <CheckCircle2 size={11} />
                  Riesgo bajo
                </span>
              </article>
            );
          })}

        </div>
      </section>

      {/* EXPLICACIÓN Y RECOMENDACIONES */}
      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">

        {/* EXPLICACIÓN */}
        <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">

          <h2 className="flex items-center gap-2 text-sm font-medium text-[#29434D]">
            <Activity size={16} className="text-[#009EAD]" />
            ¿Por qué tenemos este nivel?
          </h2>

          <p className="mt-3 text-sm leading-5 text-[#718895]">
            El Albergue San José presenta riesgo bajo: la ocupación
            está por debajo de su capacidad, el agua es potable y
            las condiciones sanitarias son adecuadas.
          </p>

          <p className="mt-3 text-sm leading-5 text-[#718895]">
            La tendencia epidemiológica es estable y no hay alertas
            activas. Los 5 casos registrados corresponden al
            acumulado, no a un conteo de casos activos.
          </p>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#E4F8F8] p-3">
            <ShieldCheck
              size={16}
              className="mt-0.5 shrink-0 text-[#009EAD]"
            />

            <p className="text-[10px] leading-4 text-[#087F8C]">
              Mantén la prevención y el seguimiento. No se requiere
              activar un protocolo de emergencia.
            </p>
          </div>

        </article>

        {/* RECOMENDACIONES */}
        <article className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5">

          <h2 className="flex items-center gap-2 text-sm font-medium text-[#29434D]">
            <ShieldCheck size={16} className="text-[#009EAD]" />
            Recomendaciones
          </h2>

          <div className="mt-3 divide-y divide-[#E8EEF1] ">

            {recommendations.map((recommendation) => {
              const Icon = recommendation.icon;

              return (
                <div
                  key={recommendation.title}
                  className="flex gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="h-fit rounded-lg bg-[#E4F8F8] p-2 text-[#009EAD]">
                    <Icon size={16} />
                  </span>

                  <div>
                    <h3 className="text-sm font-semibold text-[#29434D]">
                      {recommendation.title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-4 text-[#8297A1]">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
              );
            })}

          </div>

        </article>
      </section>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="flex flex-col justify-end gap-2 pb-2 sm:flex-row">

        <Link
          href="/admin/alertas"
          className="flex items-center justify-center gap-2 rounded-lg border border-[#00B9C7] px-4 py-3 text-sm font-semibold text-[#009EAD] transition hover:bg-[#E4F8F8]"
        >
          <Bell size={15} />
          Ver alertas
        </Link>

        <Link
          href="/admin/predicciones"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#009EAD]"
        >
          <ChartNoAxesCombined size={15} />
          Ver predicciones
        </Link>

      </div>

      {/* AVISO */}
      <div className="pb-2 text-[10px] text-[#8297A1]">
        Datos de ejemplo · Información exclusiva del Albergue San José.
      </div>

    </div>
  );
}
