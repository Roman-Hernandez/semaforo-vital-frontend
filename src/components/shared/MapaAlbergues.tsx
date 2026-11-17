"use client";

import { useEffect,useMemo,useRef,useState } from "react";
import { RotateCcw,Search,ZoomIn,ZoomOut } from "lucide-react";

export interface MarcadorAlbergueMapa {
  readonly id: string;
  readonly nombre: string;
  readonly municipio: string;
  readonly direccion?: string;
  readonly latitud: number;
  readonly longitud: number;
  readonly nivelRiesgo?: "verde"|"amarillo"|"rojo"|null;
  readonly capacidadInstalada?: number;
  readonly poblacionActual?: number|null;
}

interface MapaAlberguesProps {
  readonly albergues: readonly MarcadorAlbergueMapa[];
  readonly totalAlbergues?: number;
  readonly paginaActual?: number;
  readonly totalPaginas?: number;
  readonly alturaClase?: string;
}

const COLOR_NIVEL: Record<string,string>={
  verde: "#168052",
  amarillo: "#D48806",
  rojo: "#C53030",
};

const CENTRO_INICIAL: [number,number]=[4.8143,-75.6946];

export function MapaAlbergues({
  albergues,
  totalAlbergues,
  paginaActual,
  totalPaginas,
  alturaClase="h-[480px]",
}: MapaAlberguesProps) {
  const contenedorRef=useRef<HTMLDivElement>(null);
  const leafletRef=useRef<typeof import("leaflet")|null>(null);
  const mapaRef=useRef<import("leaflet").Map|null>(null);
  const grupoRef=useRef<import("leaflet").FeatureGroup|null>(null);
  const marcadoresRef=useRef<Map<string,import("leaflet").Marker>>(new Map());
  const ajusteInicialHechoRef=useRef(false);

  const [mapaListo,setMapaListo]=useState(false);
  const [busquedaMapa,setBusquedaMapa]=useState("");
  const [seleccionadoId,setSeleccionadoId]=useState<string>("");

  const alberguesValidos=useMemo(
    () =>
      albergues.filter(
        (alb) => Number.isFinite(alb.latitud)&&Number.isFinite(alb.longitud)
      ),
    [albergues]
  );

  const opcionesSelect=useMemo(() => {
    const termino=busquedaMapa.trim().toLowerCase();
    if(!termino) return alberguesValidos;
    return alberguesValidos.filter(
      (alb) =>
        alb.nombre.toLowerCase().includes(termino)||
        alb.municipio.toLowerCase().includes(termino)
    );
  },[alberguesValidos,busquedaMapa]);

  const claveAlbergues=useMemo(
    () =>
      alberguesValidos
        .map(
          (a) =>
            `${a.id}:${a.latitud}:${a.longitud}:${a.nivelRiesgo??""}:${a.poblacionActual??""}`
        )
        .join("|"),
    [alberguesValidos]
  );

  // 1. Inicializar la instancia de Leaflet UNA SOLA VEZ al montar
  useEffect(() => {
    const contenedor=contenedorRef.current;
    const mapaMarcadores=marcadoresRef.current;
    if(!contenedor||typeof window==="undefined") return;

    let cancelado=false;

    import("leaflet")
      .then((L) => {
        if(cancelado||!contenedorRef.current||mapaRef.current) return;

        leafletRef.current=L;

        const mapa=L.map(contenedorRef.current,{
          center: CENTRO_INICIAL,
          zoom: 12,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          touchZoom: true,
          zoomControl: true,
          wheelDebounceTime: 40,
          wheelPxPerZoomLevel: 80,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          updateWhenZooming: false,
          keepBuffer: 4,
        }).addTo(mapa);

        const grupo=L.featureGroup().addTo(mapa);
        mapaRef.current=mapa;
        grupoRef.current=grupo;
        setMapaListo(true);
      })
      .catch(() => {
        // Entorno de pruebas sin soporte gráfico completo
      });

    return () => {
      cancelado=true;
      mapaMarcadores.clear();
      if(mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current=null;
      }
      grupoRef.current=null;
    };
  },[]);

  // 2. Sincronizar marcadores sin recrear el mapa
  useEffect(() => {
    const L=leafletRef.current;
    const mapa=mapaRef.current;
    const grupo=grupoRef.current;
    if(!mapaListo||!L||!mapa||!grupo) return;

    grupo.clearLayers();
    marcadoresRef.current.clear();

    for(const alb of alberguesValidos) {
      const color=alb.nivelRiesgo
        ? COLOR_NIVEL[alb.nivelRiesgo]??"#047270"
        :"#047270";

      const icono=L.divIcon({
        className: "",
        html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:${color};border:3px solid #ffffff;box-shadow:0 2px 6px rgba(10,37,42,0.35);cursor:pointer;"></span>`,
        iconSize: [20,20],
        iconAnchor: [10,10],
        popupAnchor: [0,-10],
      });

      const marcador=L.marker([alb.latitud,alb.longitud],{
        icon: icono,
        title: alb.nombre,
      });

      const ocupacionTexto=
        alb.poblacionActual!==undefined&&
          alb.poblacionActual!==null&&
          alb.capacidadInstalada
          ? `<br/><span style="color:#375257;font-size:12px;">Ocupación: <strong>${alb.poblacionActual} / ${alb.capacidadInstalada}</strong> personas</span>`
          :"";

      marcador.bindPopup(
        `<div style="font-family:Arial,sans-serif;min-width:190px;line-height:1.45;">
          <strong style="color:#0A252A;font-size:13px;">${alb.nombre}</strong>
          <br/><span style="color:#4C666B;font-size:12px;">${alb.municipio}${alb.direccion? ` · ${alb.direccion}`:""
        }</span>
          ${ocupacionTexto}
        </div>`
      );

      marcador.on("click",() => {
        setSeleccionadoId(alb.id);
        mapa.setView([alb.latitud,alb.longitud],Math.max(mapa.getZoom(),15),{
          animate: true,
        });
      });

      marcador.addTo(grupo);
      marcadoresRef.current.set(alb.id,marcador);
    }

    if(!ajusteInicialHechoRef.current&&alberguesValidos.length>0) {
      ajusteInicialHechoRef.current=true;
      if(alberguesValidos.length>1) {
        mapa.fitBounds(grupo.getBounds().pad(0.25),{ animate: false });
      } else {
        mapa.setView(
          [alberguesValidos[0].latitud,alberguesValidos[0].longitud],
          14,
          { animate: false }
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[mapaListo,claveAlbergues]);

  function seleccionarAlbergue(id: string) {
    setSeleccionadoId(id);
    const mapa=mapaRef.current;
    if(!mapa) return;

    if(!id) {
      restablecerVista();
      return;
    }

    const alb=alberguesValidos.find((item) => item.id===id);
    const marcador=marcadoresRef.current.get(id);
    if(!alb) return;

    mapa.setView([alb.latitud,alb.longitud],16,{ animate: true });
    marcador?.openPopup();
  }

  function acercar() {
    mapaRef.current?.zoomIn();
  }

  function alejar() {
    mapaRef.current?.zoomOut();
  }

  function restablecerVista() {
    setSeleccionadoId("");
    const mapa=mapaRef.current;
    const grupo=grupoRef.current;
    if(!mapa) return;
    mapa.closePopup();
    if(grupo&&alberguesValidos.length>1) {
      mapa.fitBounds(grupo.getBounds().pad(0.25),{ animate: true });
    } else if(alberguesValidos.length===1) {
      mapa.setView(
        [alberguesValidos[0].latitud,alberguesValidos[0].longitud],
        14,
        { animate: true }
      );
    } else {
      mapa.setView(CENTRO_INICIAL,12,{ animate: true });
    }
  }

  return (
    <div className="border-y border-[#DCE6EA] bg-white">
      {/* Barra superior con buscador + select de albergues y controles de zoom */}
      <div className="flex flex-col justify-between gap-3 border-b border-[#EBF1F0] bg-[#F8FAFB] px-4 py-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-64">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#647D82]"
            />
            <input
              type="search"
              value={busquedaMapa}
              onChange={(e) => setBusquedaMapa(e.target.value)}
              placeholder="Filtrar albergue en la lista…"
              aria-label="Filtrar albergue en el mapa"
              className="h-9 w-full border border-[#DCE6EA] bg-white pr-3 pl-8 text-xs text-[#0E2E33] outline-none focus:border-[#047270]"
            />
          </div>

          <select
            value={seleccionadoId}
            onChange={(e) => seleccionarAlbergue(e.target.value)}
            aria-label="Seleccionar albergue para ver en el mapa"
            className="h-9 min-w-[240px] border border-[#DCE6EA] bg-white px-3 text-xs font-medium text-[#0E2E33] outline-none focus:border-[#047270]"
          >
            <option value="">
              Todos los albergues ({opcionesSelect.length})
            </option>
            {opcionesSelect.map((alb) => (
              <option key={alb.id} value={alb.id}>
                {alb.nombre} — {alb.municipio}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#375257] lg:justify-end">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#168052]"
              />
              <span>Bajo</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#D48806]"
              />
              <span>Medio</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full bg-[#C53030]"
              />
              <span>Crítico</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={acercar}
              className="inline-flex h-8 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#0E2E33] transition hover:bg-[#EAF2F1]"
              aria-label="Acercar mapa"
            >
              <ZoomIn size={14} aria-hidden="true" />
              <span>Acercar</span>
            </button>
            <button
              type="button"
              onClick={alejar}
              className="inline-flex h-8 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#0E2E33] transition hover:bg-[#EAF2F1]"
              aria-label="Alejar mapa"
            >
              <ZoomOut size={14} aria-hidden="true" />
              <span>Alejar</span>
            </button>
            <button
              type="button"
              onClick={restablecerVista}
              className="inline-flex h-8 items-center gap-1 border border-[#DCE6EA] bg-white px-2.5 text-xs font-semibold text-[#047270] transition hover:bg-[#EAF2F1]"
            >
              <RotateCcw size={13} aria-hidden="true" />
              <span>Vista general</span>
            </button>
          </div>
        </div>
      </div>

      <section
        ref={contenedorRef}

        aria-label="Mapa interactivo de albergues"
        className={`w-full bg-[#EAF2F1] ${alturaClase}`}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EBF1F0] bg-[#F8FAFB] px-4 py-2.5 text-xs text-[#4C666B]">
        <p>
          Cobertura visible en el mapa: mostrando{" "}
          <strong className="font-semibold text-[#0A252A]">
            {alberguesValidos.length}
          </strong>{" "}
          de{" "}
          <strong className="font-semibold text-[#0A252A]">
            {totalAlbergues??alberguesValidos.length}
          </strong>{" "}
          albergues habilitados
          {paginaActual&&totalPaginas&&totalPaginas>0
            ? ` (página ${paginaActual} de ${totalPaginas})`
            :""}
          .
        </p>
      </div>
    </div>
  );
}
