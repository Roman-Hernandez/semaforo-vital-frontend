"use client";

import { useCallback,useEffect,useRef,useState } from "react";
import {
  normalizarPagina,
  normalizarTamanoPagina,
  paginaVacia,
  TAMANO_PAGINA_PREDETERMINADO,
  type ConsultaPaginada,
  type Page,
} from "@/layers/application/services/paginacion";

export function useValorDebounced<T>(
  valor: T,
  esperaMs: number=process.env.NODE_ENV==="test"? 20:250
): T {
  const [debounced,setDebounced]=useState<T>(valor);

  useEffect(() => {
    const demora=esperaMs<=0||valor===""? 0:esperaMs;
    const timer=setTimeout(() => {
      setDebounced(valor);
    },demora);
    return () => clearTimeout(timer);
  },[valor,esperaMs]);

  if(esperaMs<=0||valor==="") {
    return valor;
  }

  return debounced;
}

interface EstadoInicialUrl {
  readonly page: number;
  readonly pageSize: number;
  readonly q: string;
  readonly desde: string;
  readonly hasta: string;
}

function leerEstadoDesdeUrl(prefijo=""): EstadoInicialUrl {
  if(typeof window==="undefined") {
    return {
      page: 1,
      pageSize: TAMANO_PAGINA_PREDETERMINADO,
      q: "",
      desde: "",
      hasta: "",
    };
  }
  const params=new URLSearchParams(window.location.search);
  const p=(clave: string) =>
    params.get(prefijo? `${prefijo}_${clave}`:clave);

  const pageRaw=Number(p("page"));
  const sizeRaw=Number(p("page_size"));

  return {
    page:
      Number.isFinite(pageRaw)&&pageRaw>=1? normalizarPagina(pageRaw):1,
    pageSize:
      Number.isFinite(sizeRaw)&&sizeRaw>=1
        ? normalizarTamanoPagina(sizeRaw)
        :TAMANO_PAGINA_PREDETERMINADO,
    q: p("q")??"",
    desde: p("desde")??"",
    hasta: p("hasta")??"",
  };
}

function actualizarUrlSinRecargar(
  prefijo: string,
  estado: {
    page: number;
    pageSize: number;
    q: string;
    desde: string;
    hasta: string;
  }
) {
  if(typeof window==="undefined") return;
  try {
    const url=new URL(window.location.href);
    const k=(clave: string) => (prefijo? `${prefijo}_${clave}`:clave);

    if(estado.page>1) url.searchParams.set(k("page"),String(estado.page));
    else url.searchParams.delete(k("page"));

    if(estado.pageSize!==TAMANO_PAGINA_PREDETERMINADO) {
      url.searchParams.set(k("page_size"),String(estado.pageSize));
    } else {
      url.searchParams.delete(k("page_size"));
    }

    if(estado.q.trim()) url.searchParams.set(k("q"),estado.q.trim());
    else url.searchParams.delete(k("q"));

    if(estado.desde) url.searchParams.set(k("desde"),estado.desde);
    else url.searchParams.delete(k("desde"));

    if(estado.hasta) url.searchParams.set(k("hasta"),estado.hasta);
    else url.searchParams.delete(k("hasta"));

    window.history.replaceState(window.history.state,"",url.toString());
  } catch {
    // Entornos sin soporte completo de History API
  }
}

export interface OpcionesUseListadoPaginado<T,Extra=Record<string,unknown>> {
  readonly fetcher: (consulta: ConsultaPaginada&Extra) => Promise<Page<T>>;
  readonly filtrosExtra?: Extra;
  readonly claveExtra?: string;
  readonly habilitado?: boolean;
  readonly sincronizarUrl?: boolean;
  readonly prefijoUrl?: string;
  readonly debounceMs?: number;
  readonly mensajeErrorDefecto?: string;
}

export function useListadoPaginado<
  T,
  Extra extends Record<string,unknown>=Record<string,never>,
>({
  fetcher,
  filtrosExtra,
  claveExtra="",
  habilitado=true,
  sincronizarUrl=false,
  prefijoUrl="",
  debounceMs,
  mensajeErrorDefecto="No fue posible cargar los registros.",
}: OpcionesUseListadoPaginado<T,Extra>) {
  const [inicial]=useState<EstadoInicialUrl>(() =>
    sincronizarUrl
      ? leerEstadoDesdeUrl(prefijoUrl)
      :{
        page: 1,
        pageSize: TAMANO_PAGINA_PREDETERMINADO,
        q: "",
        desde: "",
        hasta: "",
      }
  );

  const [page,setPage]=useState<number>(inicial.page);
  const [pageSize,setPageSize]=useState<number>(
    inicial.pageSize
  );
  const [q,setQ]=useState<string>(inicial.q);
  const [desde,setDesde]=useState<string>(inicial.desde);
  const [hasta,setHasta]=useState<string>(inicial.hasta);
  const [version,setVersion]=useState(0);

  // Reiniciar a página 1 cuando cambia un filtro externo (claveExtra)
  const [claveExtraPrevia,setClaveExtraPrevia]=useState(claveExtra);
  if(claveExtraPrevia!==claveExtra) {
    setClaveExtraPrevia(claveExtra);
    setPage(1);
  }

  const qDebounced=useValorDebounced(q,debounceMs);

  const [datos,setDatos]=useState<Page<T>>(() =>
    paginaVacia<T>(inicial.page,inicial.pageSize)
  );
  const [claveResuelta,setClaveResuelta]=useState<string>("");
  const [error,setError]=useState<string>("");

  const rangoFechasInvalido=Boolean(desde&&hasta&&desde>hasta);
  const claveActiva=`${habilitado}|${page}|${pageSize}|${qDebounced}|${desde}|${hasta}|${claveExtra}|${version}`;
  const cargando=
    habilitado&&!rangoFechasInvalido&&claveResuelta!==claveActiva;

  const secuenciaRef=useRef(0);
  const fetcherRef=useRef(fetcher);
  const filtrosExtraRef=useRef(filtrosExtra);

  useEffect(() => {
    fetcherRef.current=fetcher;
  },[fetcher]);

  useEffect(() => {
    filtrosExtraRef.current=filtrosExtra;
  },[filtrosExtra]);

  useEffect(() => {
    if(!habilitado||rangoFechasInvalido) {
      return;
    }

    if(sincronizarUrl) {
      actualizarUrlSinRecargar(prefijoUrl,{
        page,
        pageSize,
        q: qDebounced,
        desde,
        hasta,
      });
    }

    const idPeticion=++secuenciaRef.current;

    const consulta={
      ...(filtrosExtraRef.current??({} as Extra)),
      page,
      page_size: pageSize,
      q: qDebounced,
      desde: desde||undefined,
      hasta: hasta||undefined,
    } as ConsultaPaginada&Extra;

    fetcherRef
      .current(consulta)
      .then((respuesta) => {
        if(idPeticion!==secuenciaRef.current) return;
        // Si una mutación o cambio dejó la página solicitada fuera de rango pero hay páginas válidas, ajustamos
        if(
          respuesta.items.length===0&&
          respuesta.total>0&&
          respuesta.total_pages>0&&
          page>respuesta.total_pages
        ) {
          setPage(respuesta.total_pages);
          return;
        }
        setDatos(respuesta);
        setError("");
        setClaveResuelta(claveActiva);
      })
      .catch((err: unknown) => {
        if(idPeticion!==secuenciaRef.current) return;
        setError(err instanceof Error? err.message:mensajeErrorDefecto);
        setClaveResuelta(claveActiva);
      });
  },[
    habilitado,
    rangoFechasInvalido,
    claveActiva,
    page,
    pageSize,
    qDebounced,
    desde,
    hasta,
    claveExtra,
    version,
    sincronizarUrl,
    prefijoUrl,
    mensajeErrorDefecto,
  ]);

  const cambiarPage=useCallback((nuevaPagina: number) => {
    setPage(normalizarPagina(nuevaPagina));
  },[]);

  const cambiarPageSize=useCallback((nuevoTamano: number) => {
    setPageSize(normalizarTamanoPagina(nuevoTamano));
    setPage(1);
  },[]);

  const cambiarQ=useCallback((nuevoQ: string) => {
    setQ(nuevoQ);
    setPage(1);
  },[]);

  const cambiarDesde=useCallback((nuevoDesde: string) => {
    setDesde(nuevoDesde);
    setPage(1);
  },[]);

  const cambiarHasta=useCallback((nuevoHasta: string) => {
    setHasta(nuevoHasta);
    setPage(1);
  },[]);

  const limpiarFiltros=useCallback(() => {
    setQ("");
    setDesde("");
    setHasta("");
    setPage(1);
  },[]);

  const recargar=useCallback(() => {
    setVersion((v) => v+1);
  },[]);

  return {
    datos,
    setDatos,
    items: datos.items,
    cargando,
    error: claveResuelta===claveActiva? error:"",
    page,
    pageSize,
    q,
    desde,
    hasta,
    setPage: cambiarPage,
    setPageSize: cambiarPageSize,
    setQ: cambiarQ,
    setDesde: cambiarDesde,
    setHasta: cambiarHasta,
    limpiarFiltros,
    recargar,
  };
}
