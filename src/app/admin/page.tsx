import {
  Users,
  House,
  HeartPulse,
  BellRing,
  Droplets,
  ClipboardCheck,
} from "lucide-react";

const stats = [
{
  title: "Población actual",
  value: "245",
  unit: "personas",
  detail: "92 familias alojadas",
  icon: Users,
  color: "text-[#008994]",
  bg: "bg-[#E5F8F8]",
},
  {
    title: "Capacidad",
    value: "300",
    unit: "personas",
    detail: "81,7 % de ocupación · 55 plazas libres",
    icon: House,
    color: "text-[#008994]",
    bg: "bg-[#E5F8F8]",
  },
  {
    title: "Semáforo Vital",
    value: "AMARILLO",
    unit: "",
    detail: "Precaución · Reforzar la prevención",
    icon: HeartPulse,
    color: "text-[#A96A00]",
    bg: "bg-[#FFF3D8]",
  },
  {
    title: "Alertas activas",
    value: "3",
    unit: "",
    detail: "2 de prioridad media · 1 baja",
    icon: BellRing,
    color: "text-[#A96A00]",
    bg: "bg-[#FFF3D8]",
  },
];

const sanitaryIndicators = [
  {
    title: "Agua potable",
    icon: Droplets,
    value: "18 L / persona / día",
    status: "Adecuada",
    detail: "Reserva disponible para 24 horas.",
    positive: true,
  },
  {
    title: "Saneamiento",
    icon: ClipboardCheck,
    value: "10 de 12 sanitarios",
    status: "Atención",
    detail: "2 sanitarios pendientes de reparación.",
    positive: false,
  },
  {
    title: "Higiene",
    icon: Users,
    value: "3 de 4 puntos equipados",
    status: "Atención",
    detail: "Falta jabón en el módulo B.",
    positive: false,
  },
  {
    title: "Casos registrados",
    icon: HeartPulse,
    value: "8 casos activos",
    status: "En seguimiento",
    detail: "5 respiratorios · 3 gastrointestinales.",
    positive: false,
  },
];

const interventions = [
  {
    icon: "✳",
    title: "Desinfección de áreas comunes",
    description: "Módulos A y B · Brigada de limpieza",
    date: "Hoy, 08:15",
  },
  {
    icon: "♧",
    title: "Entrega de 60 kits de higiene",
    description: "Familias con menores · Equipo de apoyo",
    date: "Hoy, 07:40",
  },
  {
    icon: "♧",
    title: "Control de calidad del agua",
    description: "Tanque principal · Equipo sanitario",
    date: "Ayer, 18:30",
  },
];

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h3 className="text-sm font-bold text-[#24364B]">
      {children}
    </h3>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      {/* Encabezado del dashboard */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#24364B]">
            Resumen del albergue
          </h2>
          <p className="mt-1 text-xs text-[#71868D]">
            Situación sanitaria y prioridades para el turno de hoy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right text-[11px] text-[#71868D]">
            <p>06 oct 2026 · 08:30</p>
            <p>Datos demostrativos</p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-[#00B8C4] px-4 py-2.5 text-xs font-bold text-[#073D49] transition hover:bg-[#30CDD3]"
          >
            + Registrar intervención
          </button>
        </div>
      </section>

      {/* Tarjetas de indicadores */}
      <section
        aria-label="Indicadores del albergue"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((stat) => (
          <article
            key={stat.title}
            className={`rounded-xl border bg-white p-4 shadow-sm ${
              stat.title === "Semáforo Vital"
                ? "border-[#F1DDAF]"
                : "border-[#E3EAEE]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-[#24364B]">
                {stat.title}
              </h3>
<span
  className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
  aria-hidden="true"
>
  <stat.icon size={17} strokeWidth={2} />
</span>
            </div>

            <p
              className={`mt-2 text-2xl font-bold ${
                stat.title === "Semáforo Vital"
                  ? "text-[#A96A00]"
                  : "text-[#24364B]"
              }`}
            >
              {stat.value}
              {stat.unit && (
                <span className="ml-1 text-xs font-normal text-[#71868D]">
                  {stat.unit}
                </span>
              )}
            </p>

            {stat.title === "Capacidad" && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E2EAF0]">
                <div className="h-full w-[81.7%] rounded-full bg-[#00B8C4]" />
              </div>
            )}

            {stat.title === "Alertas activas" && (
              <div className="mt-2">
                <span className="rounded-full bg-[#FFF3D8] px-2 py-1 text-[10px] font-semibold text-[#A96A00]">
                  ● Prioridad media
                </span>
              </div>
            )}

            <p className="mt-2 text-[10px] leading-4 text-[#71868D]">
              {stat.detail}
            </p>
          </article>
        ))}
      </section>

      {/* Alerta prioritaria */}
      <section
        aria-label="Alerta sanitaria prioritaria"
        className="flex flex-col gap-3 rounded-xl border border-[#F0D38C] border-l-4 border-l-[#D69B20] bg-[#FFF5DA] p-4 sm:flex-row sm:items-center"
      >
        <span className="text-lg text-[#A96A00]" aria-hidden="true">
          ⚠
        </span>

        <div className="flex-1">
          <h3 className="text-xs font-bold text-[#79500B]">
            Atención del turno: saneamiento e higiene
          </h3>
          <p className="mt-1 text-[11px] leading-4 text-[#896827]">
            Rehabilitar 2 sanitarios y reponer jabón en el módulo B.
            Revisar la reserva de agua.
          </p>
        </div>

        <a
          href="/admin/alertas"
          className="rounded-lg border border-[#F0E0B6] bg-white px-4 py-2.5 text-center text-xs font-semibold text-[#24364B] hover:bg-[#FFFCF3]"
        >
          → Revisar alertas
        </a>
      </section>

      {/* Estado sanitario */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <SectionTitle>Estado sanitario</SectionTitle>
          <span className="text-[10px] text-[#82939D]">
            Última revisión: hoy, 08:30
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {sanitaryIndicators.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-[#E3EAEE] bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#008994]" aria-hidden="true">
  <item.icon size={16} strokeWidth={2} />
</span>
                <h3 className="text-xs font-semibold text-[#24364B]">
                  {item.title}
                </h3>
              </div>

              <p className="mt-3 text-sm font-bold text-[#24364B]">
                {item.value}
              </p>

              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${
                  item.positive
                    ? "bg-[#E5F6EB] text-[#198653]"
                    : "bg-[#FFF2D6] text-[#A96A00]"
                }`}
              >
                ● {item.status}
              </span>

              <p className="mt-2 text-[10px] leading-4 text-[#71868D]">
                {item.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Gráfica y predicción */}
      <section className="grid grid-cols-1 gap-3 xl:grid-cols-[1.65fr_1fr]">
        <article className="min-w-0 rounded-xl border border-[#E3EAEE] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <SectionTitle>Evolución epidemiológica</SectionTitle>
              <p className="mt-2 text-[10px] text-[#71868D]">
                <span className="mr-1 text-[#00B8C4]">●</span>
                Casos nuevos por día · Todas las enfermedades
              </p>
            </div>
            <span className="text-[10px] text-[#82939D]">
              30 sep – 06 oct 2026
            </span>
          </div>

          <div className="mt-4 w-full">
            <svg
              viewBox="0 0 520 190"
              role="img"
              aria-label="Gráfica ilustrativa de casos nuevos por día: 2, 3, 1, 4, 3, 2 y 2"
              className="h-auto w-full"
            >
              {[30, 60, 90, 120, 150].map((y, index) => (
                <g key={y}>
                  <line
                    x1="35"
                    y1={y}
                    x2="510"
                    y2={y}
                    stroke="#E7EDF1"
                    strokeWidth="1"
                  />
                  <text
                    x="12"
                    y={y + 4}
                    fontSize="9"
                    fill="#82939D"
                  >
                    {4 - index}
                  </text>
                </g>
              ))}

              <path
                d="M35 90 L110 65 L185 115 L260 30 L335 52 L410 78 L485 78 L485 150 L35 150 Z"
                fill="#00B8C4"
                fillOpacity="0.11"
              />

              <path
                d="M35 90 L110 65 L185 115 L260 30 L335 52 L410 78 L485 78"
                fill="none"
                stroke="#00B8C4"
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {[
                [35, 90],
                [110, 65],
                [185, 115],
                [260, 30],
                [335, 52],
                [410, 78],
                [485, 78],
              ].map(([x, y]) => (
                <circle
                  key={`${x}-${y}`}
                  cx={x}
                  cy={y}
                  r="2.5"
                  fill="#00B8C4"
                />
              ))}

              {["30", "01", "02", "03", "04", "05", "06"].map(
                (day, index) => (
                  <text
                    key={day}
                    x={35 + index * 75}
                    y="172"
                    textAnchor="middle"
                    fontSize="9"
                    fill="#82939D"
                  >
                    {day}
                  </text>
                ),
              )}

              <rect x="462" y="60" width="28" height="18" rx="5" fill="#DFF8F8" />
              <text
                x="476"
                y="72"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#087F8C"
              >
                2
              </text>
            </svg>
          </div>

          <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-[#EDF1F3] pt-3 text-[10px] text-[#71868D]">
            <span>17 casos nuevos en 7 días</span>
            <span className="font-semibold text-[#087F8C]">
              8 activos hoy
            </span>
          </div>
        </article>

        <article className="rounded-xl border border-[#E3EAEE] bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <SectionTitle>Predicción de riesgo</SectionTitle>
            <span className="text-lg text-[#008994]" aria-hidden="true">
              ↗
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="rounded-full bg-[#FFF2D6] px-3 py-1.5 text-[10px] font-bold text-[#A96A00]">
              ● MODERADO
            </span>
            <span className="text-[10px] text-[#82939D]">
              Próximas 48 h
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-1">
            <div>
              <div className="h-1.5 rounded-full bg-[#E2EAF0]" />
              <p className="mt-2 text-center text-[9px] text-[#71868D]">
                Bajo
              </p>
            </div>
            <div>
              <div className="h-1.5 rounded-full bg-[#FDBD35]" />
              <p className="mt-2 text-center text-[9px] font-bold text-[#A96A00]">
                Moderado
              </p>
            </div>
            <div>
              <div className="h-1.5 rounded-full bg-[#E2EAF0]" />
              <p className="mt-2 text-center text-[9px] text-[#71868D]">
                Alto
              </p>
            </div>
          </div>

          <p className="mt-4 text-[11px] leading-5 text-[#71868D]">
            La ocupación del 81,7 % y las brechas de saneamiento e higiene
            podrían favorecer nuevos casos.
          </p>

          <div className="mt-3 rounded-lg bg-[#E5F8F8] p-3 text-[10px] leading-5 text-[#087F8C]">
            ◈ Priorizar reparación y reposición de insumos durante el turno.
          </div>

          <p className="mt-3 text-[9px] leading-4 text-[#82939D]">
            Estimación ilustrativa; requiere validación sanitaria.
          </p>
        </article>
      </section>

      {/* Últimas intervenciones */}
      <section className="rounded-xl border border-[#E3EAEE] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF1F3] pb-3">
          <SectionTitle>Últimas intervenciones</SectionTitle>
          <a
            href="/admin/historial"
            className="rounded-lg border border-[#E3EAEE] px-3 py-2 text-[11px] font-semibold text-[#24364B] hover:bg-[#F5F9FB]"
          >
            → Ver historial
          </a>
        </div>

        <div>
          {interventions.map((intervention) => (
            <article
              key={intervention.title}
              className="flex flex-wrap items-center gap-3 border-b border-[#EDF1F3] py-3 last:border-b-0"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E5F8F8] text-sm text-[#008994]">
                {intervention.icon}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-semibold text-[#24364B]">
                  {intervention.title}
                </h3>
                <p className="mt-1 text-[10px] text-[#82939D]">
                  {intervention.description}
                </p>
              </div>

              <span className="text-[10px] text-[#71868D]">
                {intervention.date}
              </span>

              <span className="rounded-full bg-[#E5F6EB] px-2 py-1 text-[10px] font-semibold text-[#198653]">
                ● Completada
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
