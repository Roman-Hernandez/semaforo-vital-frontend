"use client";

import Link from "next/link";
import { useMemo,useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  publicoGateway,
  type AlertaPublica,
  type NivelRiesgoPublico,
  type PublicoGateway,
} from "@/layers/application/services/publico-service";
import type { Page } from "@/layers/application/services/paginacion";
import { useListadoPaginado } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";
import { MapaAlbergues } from "@/components/shared/MapaAlbergues";
import { PublicHeader } from "@/components/shared/PublicHeader";
import { PublicFooter } from "@/components/shared/PublicFooter";
import {
  SkeletonBloque,
  SkeletonTarjetasAlbergues,
} from "@/components/shared/Skeleton";

export interface HomePageProps {
  readonly gateway?: PublicoGateway;
}

const ETIQUETA_SEMAFORO: Record<
  NivelRiesgoPublico,
  { texto: string; clase: string; barra: string }
>={
  verde: {
    texto: "Riesgo bajo",
    clase: "bg-[#E2F5EB] text-[#146C43]",
    barra: "bg-[#168052]",
  },
  amarillo: {
    texto: "Riesgo medio",
    clase: "bg-[#FEF2D6] text-[#9A6300]",
    barra: "bg-[#D48806]",
  },
  rojo: {
    texto: "Riesgo crítico",
    clase: "bg-[#FCE6E7] text-[#B02A30]",
    barra: "bg-[#C53030]",
  },
};

function SemaforoTag({
  nivel,
}: {
  readonly nivel: NivelRiesgoPublico|null;
}) {
  if(!nivel) {
    return (
      <span className="inline-flex items-center bg-[#EEF3F4] px-2.5 py-1 text-xs font-semibold text-[#53636B]">
        Sin evaluar
      </span>
    );
  }
  const config=ETIQUETA_SEMAFORO[nivel];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold ${config.clase}`}
    >
      {config.texto}
    </span>
  );
}

function IlustracionAlbergueHero() {
  return (
    <svg
      viewBox="0 0 560 320"
      role="img"
      aria-label="Ilustración de un centro de albergue sanitario"
      className="h-auto w-full max-w-[540px]"
    >
      <path
        d="M40 285 C 120 120, 220 90, 310 150 C 370 110, 460 140, 520 285 Z"
        fill="#EEF6F5"
      />
      <circle cx="445" cy="74" r="24" fill="#D5ECE9" />
      <ellipse cx="105" cy="272" rx="34" ry="14" fill="#CBE7E3" />
      <ellipse cx="475" cy="272" rx="38" ry="15" fill="#CBE7E3" />

      <circle cx="96" cy="205" r="34" fill="#A6D9D3" />
      <path
        d="M96 192 L96 276 M96 222 L82 208 M96 230 L110 215"
        stroke="#1C6E6D"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <circle cx="468" cy="202" r="36" fill="#A6D9D3" />
      <path
        d="M468 188 L468 276 M468 218 L453 203 M468 228 L483 212"
        stroke="#1C6E6D"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <polygon
        points="155,212 195,192 195,274 155,274"
        fill="#E5F3F1"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <line
        x1="148"
        y1="215"
        x2="195"
        y2="190"
        stroke="#1C6E6D"
        strokeWidth="3"
      />
      <rect
        x="168"
        y="230"
        width="14"
        height="20"
        fill="#CBE7E3"
        stroke="#1C6E6D"
        strokeWidth="2"
      />

      <polygon
        points="195,172 290,115 385,172 385,276 195,276"
        fill="#F4FAF9"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <polygon
        points="385,172 455,194 455,274 385,276"
        fill="#E3F2F0"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <polygon
        points="290,105 375,165 462,190 385,172 290,115"
        fill="#8ECAC3"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <polyline
        points="182,178 290,105 395,176"
        fill="none"
        stroke="#1C6E6D"
        strokeWidth="3"
      />

      <path
        d="M284 134 H296 V144 H306 V156 H296 V166 H284 V156 H274 V144 H284 Z"
        fill="#66B9B0"
      />

      <rect
        x="270"
        y="214"
        width="40"
        height="62"
        fill="#D5ECE9"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <rect
        x="218"
        y="206"
        width="24"
        height="32"
        fill="#D5ECE9"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <rect
        x="338"
        y="206"
        width="24"
        height="32"
        fill="#D5ECE9"
        stroke="#1C6E6D"
        strokeWidth="2.5"
      />
      <rect
        x="402"
        y="212"
        width="16"
        height="30"
        fill="#CBE7E3"
        stroke="#1C6E6D"
        strokeWidth="2"
      />
      <rect
        x="426"
        y="212"
        width="16"
        height="30"
        fill="#CBE7E3"
        stroke="#1C6E6D"
        strokeWidth="2"
      />

      <path
        d="M35 292 Q 280 258, 525 292"
        fill="none"
        stroke="#66B9B0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function HomePage({
  gateway: gatewayInyectado,
}: HomePageProps={}) {
  const [gateway]=useState<PublicoGateway>(
    () => gatewayInyectado??publicoGateway
  );

  // Listado paginado de albergues públicos
  const {
    datos: paginaAlbergues,
    items: albergues,
    cargando: cargandoAlbergues,
    error: errorAlbergues,
    q: busquedaAlbergues,
    desde: desdeAlbergues,
    hasta: hastaAlbergues,
    setPage: setPageAlbergues,
    setPageSize: setPageSizeAlbergues,
    setQ: setBusquedaAlbergues,
    setDesde: setDesdeAlbergues,
    setHasta: setHastaAlbergues,
    limpiarFiltros: limpiarFiltrosAlbergues,
  }=useListadoPaginado({
    fetcher: (consulta) => gateway.listarAlbergues(consulta),
    sincronizarUrl: true,
    prefijoUrl: "alb",
    mensajeErrorDefecto: "No fue posible consultar los albergues públicos.",
  });

  // Listado paginado de alertas públicas
  const [filtroActivaAlerta,setFiltroActivaAlerta]=useState<
    "todas"|"activas"|"inactivas"
  >("activas");

  function valorFiltroAlerta() {
    if(filtroActivaAlerta==="activas") { return true; }
    if(filtroActivaAlerta==="inactivas") { return false; }
    return undefined;
  }

  const {
    datos: paginaAlertas,
    items: alertas,
    cargando: cargandoAlertas,
    error: errorAlertas,
    q: busquedaAlertas,
    desde: desdeAlertas,
    hasta: hastaAlertas,
    setPage: setPageAlertas,
    setPageSize: setPageSizeAlertas,
    setQ: setBusquedaAlertas,
    setDesde: setDesdeAlertas,
    setHasta: setHastaAlertas,
    limpiarFiltros: limpiarFiltrosAlertas,
  }=useListadoPaginado({
    fetcher: (consulta) =>
      gateway.listarAlertas({
        ...consulta,
        activa:
          valorFiltroAlerta(),
      }),
    claveExtra: filtroActivaAlerta,
    sincronizarUrl: true,
    prefijoUrl: "alt",
    mensajeErrorDefecto: "No fue posible consultar las alertas públicas.",
  });

  const [filtroNivel,setFiltroNivel]=useState<
    "todos"|NivelRiesgoPublico
  >("todos");
  const [albergueDetalleId,setAlbergueDetalleId]=useState<string|null>(
    null
  );
  const [alertasAlbergue,setAlertasAlbergue]=useState<
    Record<string,Page<AlertaPublica>>
  >({});

  const conteoRiesgo=useMemo(() => {
    let bajo=0;
    let medio=0;
    let critico=0;
    for(const item of albergues) {
      if(item.nivelRiesgo==="verde") bajo+=1;
      else if(item.nivelRiesgo==="amarillo") medio+=1;
      else if(item.nivelRiesgo==="rojo") critico+=1;
    }
    return { bajo,medio,critico };
  },[albergues]);

  const alberguesFiltrados=useMemo(() => {
    if(filtroNivel==="todos") return albergues;
    return albergues.filter((alb) => alb.nivelRiesgo===filtroNivel);
  },[albergues,filtroNivel]);

  async function alternarDetalle(albergueId: string) {
    if(albergueDetalleId===albergueId) {
      setAlbergueDetalleId(null);
      return;
    }
    setAlbergueDetalleId(albergueId);
    if(!alertasAlbergue[albergueId]) {
      try {
        const pagina=await gateway.listarAlertasAlbergue(albergueId,{
          page: 1,
          page_size: 10,
          activa: true,
        });
        setAlertasAlbergue((prev) => ({ ...prev,[albergueId]: pagina }));
      } catch {
        // Silencioso en detalle secundario
      }
    }
  }

  const errorGeneral=errorAlbergues||errorAlertas||null;

  function renderizarAlbergues() {
    if(cargandoAlbergues) { return <SkeletonTarjetasAlbergues />; }
    if(alberguesFiltrados.length===0) {
      return <p className="bg-white p-8 text-sm text-[#4C666B]">
        No se encontraron albergues con los filtros seleccionados.
      </p>;
    }
    return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {alberguesFiltrados.map((alb) => {
        const abierto=albergueDetalleId===alb.id;
        const paginaAlertasDeEste=alertasAlbergue[alb.id];
        const alertasDeEste=paginaAlertasDeEste?.items??[];
        const barraColor=alb.nivelRiesgo
          ? ETIQUETA_SEMAFORO[alb.nivelRiesgo].barra
          :"bg-[#047270]";

        return (
          <article
            key={alb.id}
            className="anim-interactivo flex flex-col justify-between border-t-4 border-t-[#047270] bg-white p-6 shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#0A252A]">
                    {alb.nombre}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-[#4C666B]">
                    <MapPin
                      size={13}
                      aria-hidden="true"
                      className="shrink-0 text-[#047270]"
                    />
                    <span>
                      {alb.municipio}, {alb.departamento}
                    </span>
                  </p>
                </div>
                <SemaforoTag nivel={alb.nivelRiesgo} />
              </div>

              <p className="mt-2 text-xs text-[#5E767A]">
                {alb.direccion}
              </p>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#4C666B]">Ocupación</span>
                  <span className="font-bold text-[#0A252A]">
                    {alb.poblacionActual===null
                      ? `Sin dato de población · Capacidad: ${alb.capacidadInstalada}`
                      :`${alb.poblacionActual} / ${alb.capacidadInstalada} (${alb.porcentajeOcupacion??0}%)`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden bg-[#EAF1F0]">
                  <div
                    className={`h-full transition-all ${barraColor}`}
                    style={{
                      width: `${Math.min(100,alb.porcentajeOcupacion??0)}%`,
                    }}
                  />
                </div>
                {alb.cuposDisponibles!==null&&(
                  <p className="mt-1.5 text-xs text-[#4C666B]">
                    Cupos disponibles:{" "}
                    <strong className="text-[#0E2E33]">
                      {alb.cuposDisponibles}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-[#EBF1F0] pt-3">
              <button
                type="button"
                onClick={() => alternarDetalle(alb.id)}
                aria-expanded={abierto}
                className="flex w-full items-center justify-between text-xs font-semibold text-[#047270] hover:text-[#035B59]"
              >
                <span>
                  {abierto
                    ? "Ocultar condiciones sanitarias"
                    :"Ver condiciones sanitarias"}
                </span>
                {abierto? (
                  <ChevronUp size={15} aria-hidden="true" />
                ):(
                  <ChevronDown size={15} aria-hidden="true" />
                )}
              </button>

              {abierto&&(
                <div className="anim-entrada mt-3 space-y-2 bg-[#F6FAF9] p-3.5 text-xs text-[#0E2E33]">
                  {alb.condicionesSanitarias? (
                    <dl className="grid grid-cols-2 gap-2.5">
                      <div>
                        <dt className="text-[#5E767A]">Agua potable</dt>
                        <dd className="font-semibold">
                          {alb.condicionesSanitarias
                            .aguaPotableDisponible
                            ? "Disponible"
                            :"Sin suministro"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5E767A]">Baños</dt>
                        <dd className="font-semibold">
                          {alb.condicionesSanitarias.banosDisponibles}{" "}
                          disponibles
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5E767A]">Higiene</dt>
                        <dd className="font-semibold">
                          {alb.condicionesSanitarias.estadoHigiene}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#5E767A]">Saneamiento</dt>
                        <dd className="font-semibold">
                          {alb.condicionesSanitarias.estadoSaneamiento}
                        </dd>
                      </div>
                    </dl>
                  ):(
                    <p className="text-[#5E767A]">
                      Sin reporte sanitario registrado recientemente.
                    </p>
                  )}

                  {alertasDeEste.length>0&&(
                    <div className="border-t border-[#DCE6EA] pt-2">
                      <p className="font-semibold text-[#B02A30]">
                        Alertas vigentes (
                        {paginaAlertasDeEste?.total??
                          alertasDeEste.length}
                        ):
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-[#4C666B]">
                        {alertasDeEste.map((alerta) => (
                          <li key={alerta.id}>{alerta.mensaje}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>;
  }

  function renderizarAlertas() {
    if(cargandoAlertas) { return <SkeletonBloque filas={3} etiqueta="Cargando alertas activas…" />; }
    if(alertas.length===0) {
      return <p className="bg-white p-6 text-sm text-[#4C666B]">
        No hay alertas sanitarias críticas para los criterios seleccionados.
      </p>;
    }
    return <ul className="divide-y divide-[#E4ECEE] bg-white">
      {alertas.map((alerta) => {
        const alb=albergues.find((a) => a.id===alerta.albergueId);
        return (
          <li
            key={alerta.id}
            className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <SemaforoTag nivel={alerta.nivelRiesgo} />
                <span className="text-xs font-bold text-[#0A252A]">
                  {alb? alb.nombre:"Albergue registrado"}
                </span>
                <span className="text-xs text-[#5E767A]">
                  · {alerta.tipoAlerta}
                </span>
              </div>
              <p className="text-sm text-[#375257]">{alerta.mensaje}</p>
            </div>
            <time className="shrink-0 text-xs text-[#5E767A]">
              {alerta.fechaAlerta.slice(0,10)}
            </time>
          </li>
        );
      })}
    </ul>;
  }

  return (
    <div className="min-h-screen bg-[#FAFCFB] text-[#0E2E33]">
      <PublicHeader activo="inicio" />

      <main>
        {/* Hero */}
        <section
          id="inicio"
          className="anim-entrada mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 lg:px-8 lg:pt-14"
        >
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0A252A] sm:text-5xl">
                Información sanitaria de los albergues
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-[#4C666B] sm:text-lg">
                Consulta el estado, nivel de riesgo y condiciones sanitarias de
                los albergues habilitados. Información clara para tomar
                decisiones seguras.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#albergues"
                  className="anim-interactivo inline-flex items-center gap-2.5 rounded-xl bg-[#047270] px-6 py-3.5 text-sm font-semibold text-white shadow-xs hover:bg-[#035B59]"
                >
                  <LayoutGrid size={17} aria-hidden="true" />
                  <span>Explorar albergues</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a
                  href="#mapa"
                  className="anim-interactivo inline-flex items-center gap-2.5 rounded-xl border border-[#186A6B] bg-white px-6 py-3.5 text-sm font-semibold text-[#0E2E33] hover:bg-[#F0F8F7]"
                >
                  <MapIcon
                    size={17}
                    aria-hidden="true"
                    className="text-[#047270]"
                  />
                  <span>Ver mapa</span>
                </a>
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs font-medium text-[#4C666B]">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DCF3EC] text-[#147D55]">
                  <Check size={12} strokeWidth={3} aria-hidden="true" />
                </span>
                <span>Información verificada por equipos sanitarios</span>
              </p>
            </div>

            <div className="flex justify-center lg:col-span-6 lg:justify-end">
              <IlustracionAlbergueHero />
            </div>
          </div>

          {/* Barra resumen del semáforo de la página actual */}
          <div className="mt-10 rounded-2xl border border-[#E5EEED] bg-white px-6 py-6 shadow-[0_6px_28px_rgba(14,46,51,0.05)] sm:px-10">
            <dl className="grid grid-cols-1 divide-y divide-[#E7EFEF] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="flex items-center gap-4 pb-4 sm:pr-6 sm:pb-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#DCF3EC] text-[#147D55]">
                  <Check size={22} strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div>
                  <dd className="text-2xl font-extrabold text-[#0A252A]">
                    {cargandoAlbergues? "—":conteoRiesgo.bajo}
                  </dd>
                  <dt className="text-xs font-medium text-[#4C666B]">
                    Albergues en riesgo bajo (página actual)
                  </dt>
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 sm:px-8 sm:py-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FDF1D6] text-[#C87D12]">
                  <AlertTriangle
                    size={22}
                    strokeWidth={2.2}
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <dd className="text-2xl font-extrabold text-[#0A252A]">
                    {cargandoAlbergues? "—":conteoRiesgo.medio}
                  </dd>
                  <dt className="text-xs font-medium text-[#4C666B]">
                    Albergues en riesgo medio (página actual)
                  </dt>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pl-8 sm:pt-0">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FCE4E4] text-[#C93333]">
                  <span
                    aria-hidden="true"
                    className="text-xl font-extrabold leading-none"
                  >
                    !
                  </span>
                </span>
                <div>
                  <dd className="text-2xl font-extrabold text-[#0A252A]">
                    {cargandoAlbergues? "—":conteoRiesgo.critico}
                  </dd>
                  <dt className="text-xs font-medium text-[#4C666B]">
                    Albergues en riesgo crítico (página actual)
                  </dt>
                </div>
              </div>
            </dl>
          </div>
        </section>

        {/* Franja de 3 pilares */}
        <section
          aria-label="Pilares del sistema"
          className="border-y border-[#E6EFEF] bg-[#F2F7F6] py-10"
        >
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#047270] shadow-2xs">
                <ShieldCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#0A252A]">
                  Monitoreo constante
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#4C666B]">
                  Información actualizada y verificada por equipos sanitarios.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#047270] shadow-2xs">
                <BarChart3 size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#0A252A]">
                  Decisiones informadas
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#4C666B]">
                  Visualiza el riesgo y las condiciones de cada albergue.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#047270] shadow-2xs">
                <Users size={22} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#0A252A]">
                  Mayor protección
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#4C666B]">
                  Contribuye a la salud y seguridad de las personas en los
                  albergues.
                </p>
              </div>
            </div>
          </div>
        </section>

        {errorGeneral&&(
          <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-6 lg:px-8">
            <div
              role="alert"
              className="border-l-4 border-[#C53030] bg-[#FDF4F4] p-4 text-sm text-[#A62626]"
            >
              {errorGeneral}
            </div>
          </div>
        )}

        {/* Directorio paginado de albergues */}
        <section
          id="albergues"
          aria-labelledby="titulo-albergues"
          className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#DCE6EA] pb-5 lg:flex-row lg:items-end">
            <div>
              <h2
                id="titulo-albergues"
                className="text-2xl font-bold text-[#0A252A]"
              >
                Albergues habilitados ({paginaAlbergues.total})
              </h2>
            </div>

            <div className="flex flex-wrap items-end gap-2.5">
              <div className="relative">
                <Search
                  size={15}
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-2.5 left-3 text-[#647D82]"
                />
                <input
                  type="search"
                  maxLength={100}
                  value={busquedaAlbergues}
                  onChange={(e) => setBusquedaAlbergues(e.target.value)}
                  placeholder="Nombre, código o municipio…"
                  aria-label="Buscar albergue"
                  className="h-9 w-full border border-[#DCE6EA] bg-white pr-3 pl-8 text-xs text-[#0E2E33] outline-none focus:border-[#047270] sm:w-56"
                />
              </div>

              <input
                type="date"
                aria-label="Albergues desde fecha"
                max={hastaAlbergues||undefined}
                value={desdeAlbergues}
                onChange={(e) => setDesdeAlbergues(e.target.value)}
                className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#0E2E33] outline-none focus:border-[#047270]"
              />

              <input
                type="date"
                aria-label="Albergues hasta fecha"
                min={desdeAlbergues||undefined}
                value={hastaAlbergues}
                onChange={(e) => setHastaAlbergues(e.target.value)}
                className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#0E2E33] outline-none focus:border-[#047270]"
              />

              <select
                value={filtroNivel}
                onChange={(e) =>
                  setFiltroNivel(
                    e.target.value as "todos"|NivelRiesgoPublico
                  )
                }
                aria-label="Filtrar por nivel de riesgo"
                className="h-9 border border-[#DCE6EA] bg-white px-3 text-xs text-[#0E2E33] outline-none focus:border-[#047270]"
              >
                <option value="todos">Todos los niveles</option>
                <option value="verde">Riesgo bajo</option>
                <option value="amarillo">Riesgo medio</option>
                <option value="rojo">Riesgo crítico</option>
              </select>

              {(busquedaAlbergues.trim()||
                desdeAlbergues||
                hastaAlbergues||
                filtroNivel!=="todos")&&(
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroNivel("todos");
                      limpiarFiltrosAlbergues();
                    }}
                    className="inline-flex h-9 items-center gap-1 border border-[#DCE6EA] bg-white px-3 text-xs font-semibold text-[#0E2E33]"
                  >
                    <RotateCcw size={13} aria-hidden="true" />
                    <span>Limpiar</span>
                  </button>
                )}
            </div>
          </div>

          {renderizarAlbergues()}

          <div className="mt-6 bg-white shadow-xs">
            <ControlesPaginacion
              pagina={paginaAlbergues}
              etiquetaItems="albergues"
              cargando={cargandoAlbergues}
              onPageChange={setPageAlbergues}
              onPageSizeChange={setPageSizeAlbergues}
              ariaLabel="Paginación de albergues públicos"
            />
          </div>
        </section>

        {/* Mapa interactivo sincronizado con la página actual */}
        <section
          id="mapa"
          aria-labelledby="titulo-mapa"
          className="bg-[#F2F7F6] py-14"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <h2
                id="titulo-mapa"
                className="text-2xl font-bold text-[#0A252A]"
              >
                Mapa de albergues habilitados
              </h2>
              <span className="text-xs font-medium text-[#375257]">
                Mostrando {alberguesFiltrados.length} de {paginaAlbergues.total}{" "}
                albergues habilitados
                {paginaAlbergues.total_pages>0
                  ? ` · Página ${paginaAlbergues.page} de ${paginaAlbergues.total_pages}`
                  :""}
              </span>
            </div>

            {cargandoAlbergues? (
              <SkeletonBloque
                filas={4}
                etiqueta="Cargando mapa de albergues…"
              />
            ):(
              <MapaAlbergues
                albergues={alberguesFiltrados}
                totalAlbergues={paginaAlbergues.total}
                paginaActual={paginaAlbergues.page}
                totalPaginas={paginaAlbergues.total_pages}
              />
            )}
          </div>
        </section>

        {/* Alertas sanitarias paginadas */}
        <section
          id="alertas"
          aria-labelledby="titulo-alertas"
          className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-[#DCE6EA] pb-4 lg:flex-row lg:items-end">
            <div>
              <h2
                id="titulo-alertas"
                className="text-2xl font-bold text-[#0A252A]"
              >
                Alertas sanitarias ({paginaAlertas.total})
              </h2>
              <Link
                href="/educacion"
                className="mt-1 inline-block text-xs font-semibold text-[#047270] hover:underline"
              >
                Consultar protocolos de saneamiento →
              </Link>
            </div>

            <BarraFiltrosServidor
              q={busquedaAlertas}
              onQChange={setBusquedaAlertas}
              placeholderQ="Tipo o mensaje de alerta…"
              ariaLabelQ="Buscar alertas sanitarias"
              desde={desdeAlertas}
              hasta={hastaAlertas}
              onDesdeChange={setDesdeAlertas}
              onHastaChange={setHastaAlertas}
              onLimpiar={() => {
                setFiltroActivaAlerta("activas");
                limpiarFiltrosAlertas();
              }}
            >
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
                  Vigencia
                </span>
                <select
                  aria-label="Filtrar alertas por estado"
                  value={filtroActivaAlerta}
                  onChange={(e) =>
                    setFiltroActivaAlerta(
                      e.target.value as "todas"|"activas"|"inactivas"
                    )
                  }
                  className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#164652] outline-none focus:border-[#047270]"
                >
                  <option value="activas">Activas</option>
                  <option value="todas">Todas</option>
                  <option value="inactivas">Históricas</option>
                </select>
              </label>
            </BarraFiltrosServidor>
          </div>

          {renderizarAlertas()}

          <div className="bg-white shadow-xs">
            <ControlesPaginacion
              pagina={paginaAlertas}
              etiquetaItems="alertas"
              cargando={cargandoAlertas}
              onPageChange={setPageAlertas}
              onPageSizeChange={setPageSizeAlertas}
              ariaLabel="Paginación de alertas públicas"
            />
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
