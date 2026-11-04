
"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

type RiskLevel = "bajo" | "medio" | "critico";

const shelters: {
  id: number;
  name: string;
  neighborhood: string;
  zone: string;
  people: number;
  risk: RiskLevel;
  updated: string;
}[] = [
  {
    id: 1,
    name: "Albergue Escuela Central",
    neighborhood: "Barrio Centro",
    zone: "Zona 1",
    people: 286,
    risk: "bajo",
    updated: "hace 8 min",
  },
  {
    id: 2,
    name: "Polideportivo Norte",
    neighborhood: "Sector Los Pinos",
    zone: "Zona 3",
    people: 412,
    risk: "medio",
    updated: "hace 12 min",
  },
  {
    id: 3,
    name: "Centro Comunal La Esperanza",
    neighborhood: "Colonia Esperanza",
    zone: "Zona 5",
    people: 198,
    risk: "bajo",
    updated: "hace 19 min",
  },
  {
    id: 4,
    name: "Instituto Técnico Sur",
    neighborhood: "Avenida del Sur",
    zone: "Zona 7",
    people: 334,
    risk: "critico",
    updated: "hace 4 min",
  },
  {
    id: 5,
    name: "Coliseo Municipal",
    neighborhood: "Sector La Pradera",
    zone: "Zona 2",
    people: 250,
    risk: "bajo",
    updated: "hace 15 min",
  },
  {
    id: 6,
    name: "Centro Comunitario El Bosque",
    neighborhood: "Barrio El Bosque",
    zone: "Zona 4",
    people: 380,
    risk: "medio",
    updated: "hace 10 min",
  },
  {
    id: 7,
    name: "Escuela Rural San José",
    neighborhood: "Sector San José",
    zone: "Zona 6",
    people: 175,
    risk: "bajo",
    updated: "hace 20 min",
  },
  {
    id: 8,
    name: "Centro Deportivo La Unión",
    neighborhood: "Barrio La Unión",
    zone: "Zona 8",
    people: 430,
    risk: "critico",
    updated: "hace 5 min",
  },
];


const riskInfo = {
  bajo: {
    label: "VERDE",
    title: "Riesgo bajo",
    description: "Condiciones sanitarias adecuadas",
    icon: "✓",
  },
  medio: {
    label: "AMARILLO",
    title: "Riesgo medio",
    description: "Requiere atención y seguimiento",
    icon: "⚠",
  },
  critico: {
    label: "ROJO",
    title: "Riesgo crítico",
    description: "Atención sanitaria inmediata",
    icon: "!",
  },
};


function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#008994]">
        {eyebrow}
      </p>
      <h2 className="text-2xl font-medium tracking-tight text-[#0A414D] sm:text-[28px]">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-[#708891]">
        {description}
      </p>
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles = {
    bajo: "bg-[#E7F7EE] text-[#168653]",
    medio: "bg-[#FFF4D9] text-[#A96A00]",
    critico: "bg-[#FDEBEC] text-[#D93642]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${styles[risk]}`}
    >
      <span aria-hidden="true">
        {risk === "bajo" ? "✓" : risk === "medio" ? "⚠" : "!"}
      </span>
      Riesgo {risk === "critico" ? "crítico" : risk}
    </span>
  );
}



function ShelterCard({
  shelter,
}: {
  shelter: (typeof shelters)[number];
}) {
  const [expanded, setExpanded] = useState(false);

  const capacity = 350;

  const sanitaryConditions = {
    bajo: [
      { name: "Agua potable", status: "Disponible", ok: true },
      { name: "Saneamiento", status: "Adecuado", ok: true },
      { name: "Higiene", status: "Adecuada", ok: true },
    ],
    medio: [
      { name: "Agua potable", status: "Requiere revisión", ok: false },
      { name: "Saneamiento", status: "En seguimiento", ok: false },
      { name: "Higiene", status: "Adecuada", ok: true },
    ],
    critico: [
      { name: "Agua potable", status: "Atención prioritaria", ok: false },
      { name: "Saneamiento", status: "Revisión necesaria", ok: false },
      { name: "Higiene", status: "Revisión necesaria", ok: false },
    ],
  };

  const conditions = sanitaryConditions[shelter.risk];

  return (
    <article className="overflow-hidden rounded-xl border border-[#DCE9EC] bg-white shadow-[0_4px_12px_rgba(15,65,77,0.06)] transition hover:shadow-md">
      <div className="p-4">
        {/* Icono y nivel de riesgo */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E6F9F9] text-[#008994]">
            <span aria-hidden="true">▦</span>
          </span>

          <RiskBadge risk={shelter.risk} />
        </div>

        {/* Nombre */}
        <h3 className="mt-3 text-sm font-medium text-[#164652]">
          {shelter.name}
        </h3>

        {/* Ubicación y población */}
        <div className="mt-1 space-y-1 text-xs text-[#71868D]">
          <p className="flex items-center gap-1.5">
            <span aria-hidden="true">⌖</span>
            {shelter.neighborhood} · {shelter.zone}
          </p>

          <p className="flex items-center gap-1.5">
            <span aria-hidden="true">♙</span>
            {shelter.people} personas
          </p>
        </div>

        {/* Fecha de actualización y detalles */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E6EFF1] pt-3 text-xs">
          <span className="text-[#82969C]">
            Actualizado {shelter.updated}
          </span>

          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="font-semibold text-[#008994] hover:underline"
          >
            {expanded ? "Ocultar detalles ↑" : "Ver detalles →"}
          </button>
        </div>
      </div>

      {/* Detalles desplegables */}
      {expanded && (
        <div className="border-t border-[#DCE9EC] bg-[#F7FBFC] p-4">
          <h4 className="text-sm font-bold text-[#164652]">
            Información del albergue
          </h4>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#DCE9EC] bg-white p-3">
              <p className="text-xs text-[#71868D]">
                Capacidad máxima
              </p>
              <p className="mt-1 text-lg font-bold text-[#087F8C]">
                {capacity}
              </p>
            </div>

            <div className="rounded-lg border border-[#DCE9EC] bg-white p-3">
              <p className="text-xs text-[#71868D]">
                Lugares disponibles
              </p>
              <p className="mt-1 text-lg font-bold text-[#087F8C]">
                {Math.max(0, capacity - shelter.people)}
              </p>
            </div>
          </div>

          <h4 className="mt-5 text-sm font-bold text-[#164652]">
            Condiciones sanitarias
          </h4>

          <div className="mt-2 divide-y divide-[#E3ECEE] rounded-lg border border-[#DCE9EC] bg-white px-3">
            {conditions.map((condition) => (
              <div
                key={condition.name}
                className="flex items-center justify-between gap-3 py-3"
              >
                <span className="text-sm text-[#385C65]">
                  {condition.name}
                </span>

                <span
                  className={`text-right text-xs font-semibold ${
                    condition.ok ? "text-[#168653]" : "text-[#A96A00]"
                  }`}
                >
                  {condition.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-lg bg-[#E8F7F8] p-3">
            <p className="text-sm font-semibold text-[#087F8C]">
              {riskInfo[shelter.risk].title}
            </p>
            <p className="mt-1 text-xs leading-5 text-[#55727A]">
              {riskInfo[shelter.risk].description}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}





function RiskCard({ risk }: { risk: RiskLevel }) {
  const styles = {
    bajo: {
      circle: "bg-[#E6F7ED] text-[#19965B]",
      label: "text-[#159052]",
      icon: "✓",
    },
    medio: {
      circle: "bg-[#FFF3D7] text-[#B77A00]",
      label: "text-[#AC7000]",
      icon: "⚠",
    },
    critico: {
      circle: "bg-[#FDEBEC] text-[#E23D49]",
      label: "text-[#D93642]",
      icon: "!",
    },
  };

  const info = riskInfo[risk];

  const total = shelters.filter(
    (shelter) => shelter.risk === risk
  ).length;

  return (
    <article className="rounded-xl border border-[#DCE8EC] bg-white p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${styles[risk].circle}`}
          aria-hidden="true"
        >
          {styles[risk].icon}
        </div>

        <span className={`text-2xl font-extrabold ${styles[risk].label}`}>
          {total}
        </span>
      </div>

      <p className={`mt-3 text-xs font-extrabold ${styles[risk].label}`}>
        {info.label}
      </p>

      <h3 className="mt-0.5 text-sm font-medium text-[#164652]">
        {info.title}
      </h3>

      <p className="mt-1 text-xs leading-4 text-[#71868D]">
        {info.description}
      </p>

      <p className="mt-3 border-t border-[#E8EFF1] pt-2 text-xs text-[#617C83]">
        Total de albergues: <strong>{total}</strong>
      </p>
    </article>
  );
}



function ShelterMap() {
  const points = [
    {
      name: "Escuela Central",
      risk: "bajo",
      left: "17%",
      top: "24%",
    },
    {
      name: "Polideportivo",
      risk: "medio",
      left: "51%",
      top: "31%",
    },
    {
      name: "La Esperanza",
      risk: "bajo",
      left: "32%",
      top: "68%",
    },
    {
      name: "Instituto Sur",
      risk: "critico",
      left: "76%",
      top: "62%",
    },
  ] as const;

  const markerStyles = {
    bajo: "bg-[#188A5A]",
    medio: "bg-[#B57900]",
    critico: "bg-[#D9434B]",
  };

  return (
    <div
      role="img"
      aria-label="Mapa ilustrativo con cuatro albergues de ejemplo"
      className="relative h-[300px] overflow-hidden rounded-2xl border border-[#D7E7E9] bg-[#DCE9E8] shadow-sm sm:h-[380px] lg:h-[430px]"
    >
      {/* Calles y manzanas */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 46%, #FFFFFF 46%, #FFFFFF 49%, transparent 49%), linear-gradient(0deg, transparent 42%, #FFFFFF 42%, #FFFFFF 45%, transparent 45%), repeating-linear-gradient(0deg, transparent 0px, transparent 30px, #F7FAF9 31px, #F7FAF9 35px), repeating-linear-gradient(90deg, transparent 0px, transparent 42px, #F7FAF9 43px, #F7FAF9 47px)",
        }}
      />

      {/* Vías principales */}
      <div className="absolute -left-10 top-[43%] h-10 w-[120%] rotate-[-12deg] rounded-full border-y-4 border-white bg-[#B5DAD0]" />

      <div className="absolute -left-10 top-[68%] h-7 w-[120%] rotate-[8deg] rounded-full border-y-2 border-white bg-[#B5DAD0]" />

      <div className="absolute left-[62%] top-[-15%] h-[130%] w-7 rotate-[24deg] rounded-full border-x-2 border-white bg-[#C5DFD7]" />

      {/* Marcadores */}
      {points.map((point) => (
        <div
          key={point.name}
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
          style={{ left: point.left, top: point.top }}
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white text-sm font-bold text-white shadow-md ${markerStyles[point.risk]}`}
          >
            {point.risk === "bajo"
              ? "V"
              : point.risk === "medio"
                ? "A"
                : "R"}
          </div>

          <span className="mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-[#164652] shadow-sm">
            {point.name}
          </span>
        </div>
      ))}

      {/* Controles visuales de zoom */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-[#D5E3E6] bg-white shadow-sm">
        <span className="flex h-9 w-9 items-center justify-center text-lg text-[#164652]">
          +
        </span>
        <span className="flex h-9 w-9 items-center justify-center border-t border-[#E3EBED] text-lg text-[#164652]">
          −
        </span>
      </div>

      {/* Etiqueta del mapa */}
      <span className="absolute bottom-3 left-3 rounded-md bg-white/95 px-3 py-1.5 text-xs text-[#637C84] shadow-sm">
        Mapa ilustrativo · Ubicaciones de ejemplo
      </span>
    </div>
  );
}


export default function HomePage() {
  const [mostrarRecomendaciones, setMostrarRecomendaciones] = useState(false);
  const [recursoSeleccionado, setRecursoSeleccionado] = useState<string | null>(null);
  const [cantidadVisible, setCantidadVisible] = useState(4);
  return (
    <main className="min-h-screen bg-[#F4F8FA] text-[#164652]">

{/* Navegación */}
<header className="sticky top-0 z-30 border-b border-[#E2ECEE] bg-white">
  <nav
    aria-label="Navegación principal"
    className="mx-auto flex min-h-[52px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"
  >
    {/* Logo y nombre */}
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <Image
        src="/icono.png"
        alt="Logo de Semáforo Vital"
        width={40}
        height={40}
        priority
        className="h-8 w-8 object-contain"
      />

      <span className="text-sm font-extrabold tracking-tight text-[#0A414D]">
        Semáforo Vital
      </span>
    </Link>

    {/* Menú de navegación */}
    <div className="hidden items-center gap-6 text-sm md:flex">
      <a href="#inicio" className="font-bold text-[#008994]">
        Inicio
      </a>

      <a href="#albergues" className="text-[#164652] transition hover:text-[#008994]">
        Albergues
      </a>

      <a href="#mapa" className="text-[#164652] transition hover:text-[#008994]">
        Mapa
      </a>

      <a href="#alertas" className="text-[#164652] transition hover:text-[#008994]">
        Alertas
      </a>

      <a href="#recursos" className="text-[#164652] transition hover:text-[#008994]">
        Educación
      </a>
    </div>

    {/* Botón de inicio de sesión */}
    <Link
      href="/login"
      className="shrink-0 rounded-lg border border-[#00B8C4] px-4 py-2 text-sm font-bold text-[#008994] transition hover:bg-[#E8FAFA]"
    >
      Iniciar sesión
    </Link>
  </nav>

  {/* Navegación para dispositivos pequeños */}
  <div className="flex justify-center gap-5 overflow-x-auto px-4 pb-3 text-sm md:hidden">
    <a href="#inicio" className="shrink-0 font-bold text-[#008994]">
      Inicio
    </a>

    <a href="#albergues" className="shrink-0 text-[#164652]">
      Albergues
    </a>

    <a href="#mapa" className="shrink-0 text-[#164652]">
      Mapa
    </a>

    <a href="#alertas" className="shrink-0 text-[#164652]">
      Alertas
    </a>

<a href="#recursos" className="text-[#164652] transition hover:text-[#008994]">
  Educación
</a>
  </div>
</header>

{/* Portada */}
<section
  id="inicio"
  className="scroll-mt-24 bg-[#E9FAFB] px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14"
>
  <div className="mx-auto grid max-w-[1120px] items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">

    {/* Información principal */}
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-[#D7EBED] bg-white px-3 py-1.5 text-xs font-semibold text-[#087F8C]">
        <span aria-hidden="true">♢</span>
        Consulta pública · Actualización continua
      </span>

      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[#0A414D]">
        Semáforo Vital
      </h1>

      <p className="mt-2 text-lg font-normal text-[#008994]">
        Información sanitaria de los albergues
      </p>

      <p className="mt-3 max-w-[500px] text-sm leading-6 text-[#385C65]">
        Consulta el estado, nivel de riesgo y condiciones sanitarias de
        los albergues habilitados después del terremoto. Información
        clara para tomar decisiones seguras.
      </p>

      {/* Botones de acceso rápido */}
      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href="#albergues"
          className="inline-flex items-center gap-2 rounded-md bg-[#00B8C4] px-4 py-2.5 text-sm font-semibold text-[#063D46] transition hover:bg-[#14C8D1]"
        >
          <span aria-hidden="true">▦</span>
          Ver albergues
        </a>

        <a
          href="#mapa"
          className="inline-flex items-center gap-2 rounded-md border border-[#00B8C4] bg-white px-4 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#E4F9FA]"
        >
          <span aria-hidden="true">▤</span>
          Ver mapa
        </a>
      </div>

      {/* Última actualización */}
      <p className="mt-3 flex items-center gap-1.5 text-xs text-[#617C83]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#19965B]" />
        Última actualización: hoy, 10:35
      </p>
    </div>

    {/* Información verificada */}
    <div className="flex min-h-[190px] items-center justify-center">
      <div className="flex items-center gap-2 rounded-xl border border-[#E2EEEE] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(0,95,103,0.08)]">

        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E7F7EE] text-sm font-bold text-[#168653]">
          ✓
        </span>

        <div>
          <p className="text-xs font-bold text-[#164652]">
            Información verificada
          </p>

          <p className="mt-0.5 text-xs text-[#71868D]">
            Equipos sanitarios en terreno
          </p>
        </div>

      </div>
    </div>

  </div>
</section>


{/* Estado de los albergues */}
<section className="bg-[#F4F8FA] px-5 py-10 sm:px-8 sm:py-12 lg:px-10">
  <div className="mx-auto max-w-[1120px]">
    <SectionHeading
      eyebrow="Lectura rápida"
      title="Estado de los albergues"
      description="Cada nivel combina color, texto e iconos para que el riesgo sea fácil de reconocer."
    />

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <RiskCard risk="bajo" />
      <RiskCard risk="medio" />
      <RiskCard risk="critico" />
    </div>
  </div>
</section>



{/* Directorio de albergues */}
<section
  id="albergues"
  className="scroll-mt-24 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-10"
>
  <div className="mx-auto max-w-[1120px]">

    <SectionHeading
      eyebrow="Directorio actualizado"
      title="Albergues registrados"
      description="Consulta capacidad, ubicación y condición sanitaria de cada centro habilitado."
    />

    {/* Tarjetas de albergues */}
    <div className="grid items-start gap-3 md:grid-cols-2">
      {shelters.slice(0, cantidadVisible).map((shelter) => (
        <ShelterCard key={shelter.id} shelter={shelter} />
      ))}
    </div>

    {/* Botón para mostrar más */}
    {cantidadVisible < shelters.length && (
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setCantidadVisible((actual) => actual + 4)}
          className="rounded-lg border border-[#00B8C4] bg-white px-5 py-2.5 text-sm font-semibold text-[#008994] transition hover:bg-[#E8FAFA]"
        >
          Ver más albergues
        </button>
      </div>
    )}

    <p className="mt-4 text-xs text-[#83979D]">
      Los nombres, las cantidades y los estados mostrados son ficticios.
    </p>

  </div>
</section>




{/* Mapa público */}
<section
  id="mapa"
  className="scroll-mt-24 bg-[#F4F8FA] px-5 py-10 sm:px-8 sm:py-12 lg:px-10"
>
  <div className="mx-auto max-w-[1120px]">

    {/* Encabezado y leyenda */}
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <SectionHeading
        eyebrow="Mapa público"
        title="Ubica los albergues"
        description="Identifica los centros y sus niveles de riesgo antes de desplazarte."
      />

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-[#5F7880]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#188A5A]" />
          Bajo
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#B57900]" />
          Medio
        </span>

        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D9434B]" />
          Crítico
        </span>
      </div>
    </div>

    <ShelterMap />

    <p className="mt-3 text-xs leading-5 text-[#71868D]">
      Los marcadores incluyen una letra y un nombre para identificar
      fácilmente el nivel de riesgo. 
    </p>

  </div>
</section>



{/* Alertas sanitarias */}
<section
  id="alertas"
  className="scroll-mt-24 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-10"
>
  <div className="mx-auto max-w-[1120px]">
    <SectionHeading
      eyebrow="Información importante"
      title="Alertas sanitarias"
      description="Conoce las situaciones que requieren atención y las recomendaciones para proteger la salud."
    />

    <article className="rounded-xl border border-[#F0DDAA] bg-[#FFF9E9] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Icono de alerta */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0C2] text-lg font-bold text-[#B57900]">
          !
        </div>

        {/* Información de la alerta */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FCE8B2] px-2.5 py-1 text-xs font-bold text-[#956300]">
              Prioridad media
            </span>
            <span className="text-xs text-[#8B7B55]">
              06 de octubre de 2026
            </span>
          </div>

          <h3 className="text-base font-bold text-[#604B18]">
            Refuerza el consumo de agua segura en la Zona 3
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#75643C]">
            Se recomienda verificar que el agua destinada al consumo
            humano haya sido tratada adecuadamente. Mantén los recipientes
            limpios y tapados para evitar su contaminación.
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#806D3E]">
            <span className="font-semibold">Recomendaciones:</span>
            <span>Hervir el agua</span>
            <span aria-hidden="true">•</span>
            <span>Usar recipientes limpios</span>
            <span aria-hidden="true">•</span>
            <span>Mantenerlos tapados</span>
          </div>
        </div>

        {/* Acción */}
<button
  type="button"
  onClick={() => setMostrarRecomendaciones(true)}
  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-[#D9C27F] bg-white px-4 py-2 text-sm font-semibold text-[#806018] transition hover:bg-[#FFF1C9]"
>
  Ver recomendaciones
</button>
      </div>
    </article>

  </div>
</section>


      {/* Información sanitaria */}

{/* Información sanitaria */}
<section
  id="informacion-sanitaria"
  className="scroll-mt-24 bg-[#F4F8FA] px-5 py-10 sm:px-8 sm:py-12 lg:px-10"
>
  <div className="mx-auto max-w-[1120px]">
    <SectionHeading
      eyebrow="Prevención y cuidado"
      title="Información sanitaria"
      description="Conoce las medidas básicas para mantener condiciones saludables dentro de los albergues."
    />

    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {/* Agua segura */}
      <article className="rounded-xl border border-[#DCE8EC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F7F8] text-xl text-[#008994]">
          💧
        </div>
        <h3 className="mt-4 text-base font-bold text-[#0A414D]">
          Agua segura
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#617C83]">
          Aprende cómo tratar, almacenar y consumir agua de manera segura
          para prevenir enfermedades.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#385C65]">
          <li>✓ Hervir o tratar el agua.</li>
          <li>✓ Usar recipientes limpios.</li>
          <li>✓ Mantener el agua tapada.</li>
        </ul>
      </article>

      {/* Saneamiento */}
      <article className="rounded-xl border border-[#DCE8EC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F7F8] text-xl text-[#008994]">
          🚿
        </div>
        <h3 className="mt-4 text-base font-bold text-[#0A414D]">
          Saneamiento
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#617C83]">
          Mantén espacios limpios y condiciones adecuadas para reducir
          los riesgos sanitarios.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#385C65]">
          <li>✓ Limpiar baños regularmente.</li>
          <li>✓ Disponer bien los residuos.</li>
          <li>✓ Evitar aguas estancadas.</li>
        </ul>
      </article>

      {/* Higiene */}
      <article className="rounded-xl border border-[#DCE8EC] bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E2F7F8] text-xl text-[#008994]">
          🧼
        </div>
        <h3 className="mt-4 text-base font-bold text-[#0A414D]">
          Higiene personal
        </h3>
        <p className="mt-2 text-sm leading-6 text-[#617C83]">
          Incorpora hábitos de higiene que ayudan a proteger a las
          personas que conviven en los albergues.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#385C65]">
          <li>✓ Lavarse las manos frecuentemente.</li>
          <li>✓ Mantener las uñas limpias.</li>
          <li>✓ Utilizar elementos personales.</li>
        </ul>
      </article>
    </div>
  </div>
</section>


      {/* Educación */}

{/* Recursos educativos */}
<section
  id="recursos"
  className="scroll-mt-24 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-10"
>
  <div className="mx-auto max-w-[1120px]">
    <SectionHeading
      eyebrow="Aprende y previene"
      title="Recursos educativos"
      description="Encuentra información práctica para cuidar la salud y prevenir enfermedades en los albergues."
    />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Recurso 1 */}
      <article className="flex flex-col rounded-xl border border-[#DCE8EC] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E2F7F8] text-2xl">
          💧
        </div>
        <span className="mt-4 text-xs font-semibold text-[#008994]">
          Agua segura
        </span>
        <h3 className="mt-1 text-sm font-bold text-[#0A414D]">
          Cómo tratar el agua para consumo
        </h3>
        <p className="mt-2 flex-1 text-sm leading-5 text-[#71868D]">
          Aprende métodos básicos para obtener agua segura y almacenarla
          correctamente.
        </p>
<button
  type="button"
  onClick={() => setRecursoSeleccionado("agua")}
  className="mt-4 self-start text-sm font-bold text-[#008994] hover:underline"
>
  Consultar recurso →
</button>
      </article>

      {/* Recurso 2 */}
      <article className="flex flex-col rounded-xl border border-[#DCE8EC] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E2F7F8] text-2xl">
          🧼
        </div>
        <span className="mt-4 text-xs font-semibold text-[#008994]">
          Higiene
        </span>
        <h3 className="mt-1 text-sm font-bold text-[#0A414D]">
          Lavado correcto de manos
        </h3>
        <p className="mt-2 flex-1 text-sm leading-5 text-[#71868D]">
          Conoce los momentos clave y los pasos para un lavado adecuado
          de manos.
        </p>
<button
  type="button"
  onClick={() => setRecursoSeleccionado("higiene")}
  className="mt-4 self-start text-sm font-bold text-[#008994] hover:underline"
>
  Consultar recurso →
</button>
      </article>

      {/* Recurso 3 */}
      <article className="flex flex-col rounded-xl border border-[#DCE8EC] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E2F7F8] text-2xl">
          🗑️
        </div>
        <span className="mt-4 text-xs font-semibold text-[#008994]">
          Saneamiento
        </span>
        <h3 className="mt-1 text-sm font-bold text-[#0A414D]">
          Manejo adecuado de residuos
        </h3>
        <p className="mt-2 flex-1 text-sm leading-5 text-[#71868D]">
          Aprende a separar y disponer los residuos para mantener espacios
          saludables.
        </p>
<button
  type="button"
  onClick={() => setRecursoSeleccionado("saneamiento")}
  className="mt-4 self-start text-sm font-bold text-[#008994] hover:underline"
>
  Consultar recurso →
</button>
      </article>

      {/* Recurso 4 */}
      <article className="flex flex-col rounded-xl border border-[#DCE8EC] bg-white p-4 transition hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E2F7F8] text-2xl">
          🦟
        </div>
        <span className="mt-4 text-xs font-semibold text-[#008994]">
          Prevención
        </span>
        <h3 className="mt-1 text-sm font-bold text-[#0A414D]">
          Prevención de enfermedades
        </h3>
        <p className="mt-2 flex-1 text-sm leading-5 text-[#71868D]">
          Identifica medidas para reducir riesgos y proteger a la comunidad.
        </p>
<button
  type="button"
  onClick={() => setRecursoSeleccionado("prevencion")}
  className="mt-4 self-start text-sm font-bold text-[#008994] hover:underline"
>
  Consultar recurso →
</button>
      </article>
    </div>
  </div>
</section>


      {/* Pie de página */}

{/* Footer */}
<footer className="bg-[#0A414D] px-5 py-8 text-white sm:px-8 lg:px-10">
  <div className="mx-auto max-w-[1120px]">

    <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-7 sm:grid-cols-2 lg:grid-cols-3">

      {/* Información del proyecto */}
      <div>
        <div className="flex items-center gap-2">
          <Image
            src="/icono.png"
            alt="Logo de Semáforo Vital"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-sm font-bold">
            Semáforo Vital
          </span>
        </div>

        <p className="mt-3 max-w-xs text-sm leading-6 text-[#C4DADD]">
          Plataforma de prevención y monitoreo sanitario para apoyar
          el cuidado de las comunidades en los albergues.
        </p>
      </div>

      {/* Navegación */}
      <div>
        <h3 className="text-sm font-bold">Navegación</h3>

        <ul className="mt-3 space-y-2 text-sm text-[#C4DADD]">
          <li>
            <a href="#inicio" className="transition hover:text-white">
              Inicio
            </a>
          </li>
          <li>
            <a href="#albergues" className="transition hover:text-white">
              Albergues
            </a>
          </li>
          <li>
            <a href="#mapa" className="transition hover:text-white">
              Mapa
            </a>
          </li>
          <li>
            <a href="#alertas" className="transition hover:text-white">
              Alertas sanitarias
            </a>
          </li>
          <li>
            <a href="#recursos" className="transition hover:text-white">
              Recursos educativos
            </a>
          </li>
        </ul>
      </div>

      {/* Acceso */}
      <div>
        <h3 className="text-sm font-bold">Acceso a la plataforma</h3>

        <p className="mt-3 text-sm leading-6 text-[#C4DADD]">
          Ingresa al sistema para consultar las herramientas de
          administración y seguimiento sanitario.
        </p>

        <Link
          href="/login"
          className="mt-4 inline-flex rounded-lg border border-[#55D6D8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Iniciar sesión →
        </Link>
      </div>

    </div>

    {/* Créditos */}
    <div className="flex flex-col items-center justify-between gap-2 pt-5 text-center sm:flex-row sm:text-left">
      <p className="text-xs text-[#C4DADD]">
        © 2026 Semáforo Vital. Todos los derechos reservados.
      </p>

      <p className="text-xs text-[#C4DADD]">
        Prevención · Monitoreo · Bienestar
      </p>
    </div>

  </div>
</footer>

      
{/* Modal de recomendaciones */}
{mostrarRecomendaciones && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A414D]/50 px-4 py-6"
    onClick={() => setMostrarRecomendaciones(false)}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-recomendaciones"
      className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#B57900]">
            Alerta sanitaria
          </span>

          <h2
            id="titulo-recomendaciones"
            className="mt-1 text-lg font-bold text-[#0A414D]"
          >
            Recomendaciones para el consumo de agua segura
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setMostrarRecomendaciones(false)}
          aria-label="Cerrar recomendaciones"
          className="rounded-lg px-2 py-1 text-xl text-[#71868D] hover:bg-[#F1F6F7]"
        >
          ×
        </button>
      </div>

      <p className="mt-3 text-sm leading-6 text-[#617C83]">
        Sigue estas medidas para reducir el riesgo de contaminación del agua:
      </p>

      <ul className="mt-4 space-y-3 text-sm text-[#385C65]">
        <li className="flex gap-2">
          <span className="font-bold text-[#008994]">✓</span>
          Hierve el agua antes de consumirla.
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-[#008994]">✓</span>
          Utiliza recipientes limpios y desinfectados.
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-[#008994]">✓</span>
          Mantén los recipientes bien tapados.
        </li>
        <li className="flex gap-2">
          <span className="font-bold text-[#008994]">✓</span>
          Evita introducir vasos o manos en los recipientes.
        </li>
      </ul>

      <button
        type="button"
        onClick={() => setMostrarRecomendaciones(false)}
        className="mt-5 w-full rounded-lg bg-[#00B8C4] px-4 py-2.5 text-sm font-semibold text-[#063D46] transition hover:bg-[#14C8D1]"
      >
        Entendido
      </button>
    </div>
  </div>
)}

{/* Modal de recursos educativos */}
{recursoSeleccionado && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A414D]/50 px-4 py-6"
    onClick={() => setRecursoSeleccionado(null)}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-recurso"
      className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wide text-[#008994]">
            Recurso educativo
          </span>

          <h2
            id="titulo-recurso"
            className="mt-1 text-lg font-bold text-[#0A414D]"
          >
            {recursoSeleccionado === "agua" && "Agua segura"}
            {recursoSeleccionado === "higiene" && "Lavado correcto de manos"}
            {recursoSeleccionado === "saneamiento" && "Manejo adecuado de residuos"}
            {recursoSeleccionado === "prevencion" && "Prevención de enfermedades"}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setRecursoSeleccionado(null)}
          aria-label="Cerrar recurso"
          className="rounded-lg px-2 py-1 text-xl text-[#71868D] hover:bg-[#F1F6F7]"
        >
          ×
        </button>
      </div>

      <div className="mt-4 space-y-3 text-sm leading-6 text-[#385C65]">
        {recursoSeleccionado === "agua" && (
          <>
            <p>El agua debe tratarse y almacenarse correctamente para evitar enfermedades.</p>
            <p className="font-bold text-[#164652]">Recomendaciones:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Hierve el agua cuando no tengas certeza de su potabilidad.</li>
              <li>Utiliza recipientes limpios y con tapa.</li>
              <li>No introduzcas las manos ni vasos sucios en el agua almacenada.</li>
              <li>Conserva el agua en un lugar limpio y protegido.</li>
            </ul>
          </>
        )}

        {recursoSeleccionado === "higiene" && (
          <>
            <p>El lavado de manos ayuda a prevenir la transmisión de microorganismos.</p>
            <p className="font-bold text-[#164652]">Recomendaciones:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Moja tus manos con agua limpia.</li>
              <li>Aplica jabón y frota palmas, dedos y uñas.</li>
              <li>Enjuaga con agua limpia.</li>
              <li>Seca tus manos con una toalla limpia.</li>
              <li>Lávate las manos antes de comer y después de ir al baño.</li>
            </ul>
          </>
        )}

        {recursoSeleccionado === "saneamiento" && (
          <>
            <p>Un entorno limpio ayuda a disminuir los riesgos de contaminación y enfermedades.</p>
            <p className="font-bold text-[#164652]">Recomendaciones:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Deposita los residuos en recipientes adecuados.</li>
              <li>Separa los residuos según las indicaciones locales.</li>
              <li>Mantén limpios los baños y las zonas comunes.</li>
              <li>Evita la acumulación de agua estancada.</li>
            </ul>
          </>
        )}

        {recursoSeleccionado === "prevencion" && (
          <>
            <p>La prevención es fundamental para proteger la salud de todas las personas del albergue.</p>
            <p className="font-bold text-[#164652]">Recomendaciones:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Mantén una buena higiene personal.</li>
              <li>Consume agua segura y alimentos bien preparados.</li>
              <li>Evita la acumulación de residuos y agua estancada.</li>
              <li>Informa al personal sanitario si presentas síntomas de enfermedad.</li>
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => setRecursoSeleccionado(null)}
        className="mt-5 w-full rounded-lg bg-[#00B8C4] px-4 py-2.5 text-sm font-semibold text-[#063D46] transition hover:bg-[#14C8D1]"
      >
        Entendido
      </button>
    </div>
  </div>
)}


    </main>
    
  );
  
}
