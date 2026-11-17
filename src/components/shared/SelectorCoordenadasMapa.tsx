"use client";

import { useEffect,useRef } from "react";
import { CheckCircle2,MapPin } from "lucide-react";

interface SelectorCoordenadasMapaProps {
  readonly latitud: string;
  readonly longitud: string;
  readonly onChange: (latitud: string,longitud: string) => void;
  readonly errorLatitud?: string;
  readonly errorLongitud?: string;
  readonly disabled?: boolean;
}

const CENTRO_DEFECTO: [number,number]=[4.8143,-75.6946];

const ZONAS_REFERENCIA: ReadonlyArray<{
  readonly nombre: string;
  readonly coords: [number,number];
}>=[
    { nombre: "Pereira",coords: [4.8143,-75.6946] },
    { nombre: "Dosquebradas",coords: [4.8395,-75.6673] },
    { nombre: "Santa Rosa de Cabal",coords: [4.8681,-75.6214] },
    { nombre: "La Virginia",coords: [4.8997,-75.8825] },
  ];

function parsearCoord(valor: string): number|null {
  const limpio=valor.trim().replace(",",".");
  if(!limpio) return null;
  const num=Number(limpio);
  return Number.isFinite(num)? num:null;
}

export function SelectorCoordenadasMapa({
  latitud,
  longitud,
  onChange,
  errorLatitud,
  errorLongitud,
  disabled=false,
}: SelectorCoordenadasMapaProps) {
  const contenedorRef=useRef<HTMLDivElement>(null);
  const leafletRef=useRef<typeof import("leaflet")|null>(null);
  const mapaRef=useRef<import("leaflet").Map|null>(null);
  const marcadorRef=useRef<import("leaflet").Marker|null>(null);
  const onChangeRef=useRef(onChange);

  useEffect(() => {
    onChangeRef.current=onChange;
  },[onChange]);

  useEffect(() => {
    const contenedor=contenedorRef.current;
    if(!contenedor||typeof window==="undefined") return;

    let cancelado=false;

    import("leaflet")
      .then((L) => {
        if(cancelado||!contenedorRef.current||mapaRef.current) return;

        leafletRef.current=L;

        const latInicial=parsearCoord(latitud)??CENTRO_DEFECTO[0];
        const lngInicial=parsearCoord(longitud)??CENTRO_DEFECTO[1];

        const mapa=L.map(contenedorRef.current,{
          center: [latInicial,lngInicial],
          zoom: 13,
          scrollWheelZoom: true,
          wheelDebounceTime: 40,
          wheelPxPerZoomLevel: 80,
        });
        mapaRef.current=mapa;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
          updateWhenZooming: false,
          keepBuffer: 4,
        }).addTo(mapa);

        const crearIconoPin=() =>
          L.divIcon({
            className: "",
            html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:#047270;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(10,37,42,0.38);"></span>`,
            iconSize: [20,20],
            iconAnchor: [10,10],
          });

        const tieneCoordenadasIniciales=
          parsearCoord(latitud)!==null&&parsearCoord(longitud)!==null;

        if(tieneCoordenadasIniciales) {
          marcadorRef.current=L.marker([latInicial,lngInicial],{
            icon: crearIconoPin(),
          }).addTo(mapa);
        }

        mapa.on("click",(evento: import("leaflet").LeafletMouseEvent) => {
          if(disabled) return;
          const nuevaLat=evento.latlng.lat.toFixed(6);
          const nuevaLng=evento.latlng.lng.toFixed(6);

          if(marcadorRef.current) {
            marcadorRef.current.setLatLng(evento.latlng);
          } else {
            marcadorRef.current=L.marker(evento.latlng,{
              icon: crearIconoPin(),
            }).addTo(mapa);
          }

          onChangeRef.current(nuevaLat,nuevaLng);
        });
      })
      .catch(() => { });

    return () => {
      cancelado=true;
      if(mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current=null;
        marcadorRef.current=null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(() => {
    const lat=parsearCoord(latitud);
    const lng=parsearCoord(longitud);
    const L=leafletRef.current;
    const mapa=mapaRef.current;
    if(!mapa||!L||lat===null||lng===null) return;
    if(lat<-90||lat>90||lng<-180||lng>180) return;

    const punto: [number,number]=[lat,lng];
    if(marcadorRef.current) {
      marcadorRef.current.setLatLng(punto);
    } else {
      const icono=L.divIcon({
        className: "",
        html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:#047270;border:3px solid #ffffff;box-shadow:0 2px 6px rgba(10,37,42,0.38);"></span>`,
        iconSize: [20,20],
        iconAnchor: [10,10],
      });
      marcadorRef.current=L.marker(punto,{ icon: icono }).addTo(mapa);
    }
  },[latitud,longitud]);

  function centrarEnZona(coords: [number,number]) {
    if(disabled) return;
    onChange(coords[0].toFixed(6),coords[1].toFixed(6));
    mapaRef.current?.setView(coords,14,{ animate: true });
  }

  const tieneUbicacion=
    parsearCoord(latitud)!==null&&parsearCoord(longitud)!==null;

  return (
    <div className="space-y-2">
      <div className="border border-[#DCE6EA] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EBF1F0] bg-[#F8FAFB] px-3.5 py-2 text-xs text-[#4C666B]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#164652]">
            {tieneUbicacion? (
              <>
                <CheckCircle2
                  size={14}
                  aria-hidden="true"
                  className="text-[#168052]"
                />
                <span className="text-[#168052]">
                  Ubicación señalada en el mapa
                </span>
              </>
            ):(
              <>
                <MapPin
                  size={14}
                  aria-hidden="true"
                  className="text-[#008994]"
                />
                <span>Haz clic en el mapa para señalar dónde queda el albergue</span>
              </>
            )}
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            {ZONAS_REFERENCIA.map((zona) => (
              <button
                key={zona.nombre}
                type="button"
                disabled={disabled}
                onClick={() => centrarEnZona(zona.coords)}
                className="border border-[#DCE6EA] bg-white px-2 py-0.5 text-[11px] font-medium text-[#164652] transition hover:border-[#008994] hover:text-[#008994]"
              >
                {zona.nombre}
              </button>
            ))}
          </div>
        </div>

        <section
          ref={contenedorRef}

          aria-label="Selector de ubicación en el mapa"
          className="h-60 w-full bg-[#EAF2F1]"
        />
      </div>

      {(errorLatitud||errorLongitud)&&(
        <p className="text-xs font-medium text-[#C53030]">
          Selecciona un punto en el mapa para registrar la ubicación del albergue.
        </p>
      )}

      <div className="sr-only">
        <label htmlFor="selector-latitud">Latitud *</label>
        <input
          id="selector-latitud"
          name="latitud"
          type="text"
          disabled={disabled}
          value={latitud}
          aria-invalid={errorLatitud? true:undefined}
          onChange={(e) => onChange(e.target.value,longitud)}
        />
        <label htmlFor="selector-longitud">Longitud *</label>
        <input
          id="selector-longitud"
          name="longitud"
          type="text"
          disabled={disabled}
          value={longitud}
          aria-invalid={errorLongitud? true:undefined}
          onChange={(e) => onChange(latitud,e.target.value)}
        />
      </div>
    </div>
  );
}
