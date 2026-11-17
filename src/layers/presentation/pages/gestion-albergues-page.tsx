"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CheckCircle2,Lock,Plus,RefreshCw,X } from "lucide-react";
import {
  formularioAEntrada,
  type Albergue,
  type AlbergueFormulario,
} from "@/layers/domain/albergues/albergue";
import {
  AlberguesError,
  obtenerAlberguesGateway,
  type AlberguesGateway,
  type RegistrosAlbergueGlobal,
  type ResumenAlberguesGlobal,
} from "@/layers/application/services/albergues-service";
import {
  paginaVacia,
  TAMANO_PAGINA_PREDETERMINADO,
  type ConsultaPaginada,
  type Page,
} from "@/layers/application/services/paginacion";
import {
  leerToken,
  obtenerSesion,
  suscribirSesion,
  type Sesion,
} from "@/layers/application/services/sesion";
import { useValorDebounced } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  AlberguesLista,
  FILTROS_INICIALES,
  type EstadoCarga,
  type FiltrosAlbergues,
} from "@/layers/presentation/components/albergues/albergues-lista";
import {
  AlberguePanel,
  type ModoPanel,
} from "@/layers/presentation/components/albergues/albergue-panel";

export { TAMANO_PAGINA_PREDETERMINADO as ALBERGUES_POR_PAGINA } from "@/layers/application/services/paginacion";

interface GestionAlberguesPageProps {
  readonly gateway?: AlberguesGateway;
  readonly sesion?: Sesion;
}

function useSesion(sesionFija?: Sesion): Sesion|undefined {
  const token=useSyncExternalStore(
    suscribirSesion,
    () => leerToken()??"",
    () => undefined
  );

  return useMemo(() => {
    if(sesionFija) return sesionFija;
    if(token===undefined) return undefined;
    return obtenerSesion(token||null);
  },[sesionFija,token]);
}

function horaActual(): string {
  return new Intl.DateTimeFormat("es-CO",{
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date());
}

function ResumenGlobal({
  resumen,
}: {
  readonly resumen: ResumenAlberguesGlobal;
}) {
  const inactivos=Math.max(
    0,
    resumen.totalRegistrados-resumen.totalActivos
  );
  const sinAdmin=Math.max(
    0,
    resumen.totalRegistrados-resumen.conAdministrador
  );

  const tarjetas=[
    {
      etiqueta: "Albergues registrados",
      valor: String(resumen.totalRegistrados),
      detalle: `${resumen.totalActivos} activos · ${inactivos} inactivos`,
    },
    {
      etiqueta: "Con administrador",
      valor: String(resumen.conAdministrador),
      detalle: `${sinAdmin} sin asignar`,
    },
    {
      etiqueta: "Riesgo crítico",
      valor: String(resumen.criticos),
      detalle: `${resumen.sinClasificacion} sin clasificación`,
    },
    {
      etiqueta: "Población alojada",
      valor:
        resumen.poblacionActual===null
          ? "Sin dato completo"
          :resumen.poblacionActual.toLocaleString("es-CO"),
      detalle: `${resumen.porcentajeOcupacion===null
          ? "Ocupación sin dato"
          :`${Math.round(resumen.porcentajeOcupacion)}% ocupación`
        } · ${resumen.alberguesSinPoblacion} sin reporte`,
    },
  ];

  return (
    <dl
      aria-label="Resumen global de albergues"
      className="grid grid-cols-2 gap-4 border-t-2 border-[#008994] bg-white p-5 shadow-xs lg:grid-cols-4"
    >
      {tarjetas.map((tarjeta) => (
        <div
          key={tarjeta.etiqueta}
          className="border-l-2 border-[#EEF2F4] pl-3 first:border-l-0 first:pl-0"
        >
          <dt className="text-xs text-[#53636B]">{tarjeta.etiqueta}</dt>
          <dd className="mt-1 text-lg font-bold text-[#164652]">
            {tarjeta.valor}
          </dd>
          <p className="mt-0.5 text-xs text-[#718895]">{tarjeta.detalle}</p>
        </div>
      ))}
    </dl>
  );
}

function AccesoRestringido() {
  return (
    <div
      role="alert"
      className="mx-auto mt-10 max-w-md border-t-2 border-[#A96A00] bg-white p-8 text-center shadow-xs"
    >
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4D9] text-[#A96A00]">
        <Lock size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-bold text-[#164652]">
        Acceso restringido
      </h2>
      <p className="mt-2 text-xs text-[#53636B]">
        La gestión general de albergues requiere permisos de coordinación
        general. Inicia sesión con una cuenta autorizada.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  );
}

export function GestionAlberguesPage({
  gateway: gatewayInyectado,
  sesion: sesionFija,
}: GestionAlberguesPageProps) {
  const sesion=useSesion(sesionFija);
  const [gateway]=useState<AlberguesGateway>(
    () => gatewayInyectado??obtenerAlberguesGateway(leerToken)
  );

  const [paginaDatos,setPaginaDatos]=useState<Page<Albergue>>(() =>
    paginaVacia<Albergue>(1,TAMANO_PAGINA_PREDETERMINADO)
  );
  const [resumenGlobal,setResumenGlobal]=
    useState<ResumenAlberguesGlobal|null>(null);
  const [claveListadoResuelta,setClaveListadoResuelta]=useState("");
  const [estadoCarga,setEstadoCarga]=useState<EstadoCarga>("cargando");
  const [mensajeError,setMensajeError]=useState("");
  const [ultimaActualizacion,setUltimaActualizacion]=useState("");
  const [intentoCarga,setIntentoCarga]=useState(0);

  const [filtros,setFiltros]=useState<FiltrosAlbergues>(FILTROS_INICIALES);
  const [pagina,setPagina]=useState(1);
  const [pageSize,setPageSize]=useState<number>(TAMANO_PAGINA_PREDETERMINADO);

  const busquedaDebounced=useValorDebounced(filtros.busqueda);

  const [modo,setModo]=useState<ModoPanel>("consultar");
  const [seleccionado,setSeleccionado]=useState<Albergue|null>(null);
  const [registrosGlobales,setRegistrosGlobales]=
    useState<RegistrosAlbergueGlobal|null>(null);
  const [claveRegistrosResuelta,setClaveRegistrosResuelta]=useState("");
  const [consultaRegistros,setConsultaRegistros]=useState<ConsultaPaginada>({
    page: 1,
    page_size: 10,
  });

  const [confirmandoEstado,setConfirmandoEstado]=useState(false);
  const [cambiandoEstado,setCambiandoEstado]=useState(false);
  const [errorEstado,setErrorEstado]=useState("");
  const [aviso,setAviso]=useState("");

  const secuenciaListadoRef=useRef(0);
  const esSuperAdmin=sesion?.rol==="super_administrador";

  const cargarResumen=useCallback(() => {
    if(!esSuperAdmin||!gateway.resumen) return;
    gateway
      .resumen()
      .then((res) => setResumenGlobal(res))
      .catch(() => {
        // Si resumen falla se mantiene el listado operativo
      });
  },[esSuperAdmin,gateway]);

  useEffect(() => {
    cargarResumen();
  },[cargarResumen,intentoCarga]);

  const rangoFechasInvalido=Boolean(
    filtros.desde&&filtros.hasta&&filtros.desde>filtros.hasta
  );
  const claveListadoActiva=`${esSuperAdmin}|${pagina}|${pageSize}|${busquedaDebounced}|${filtros.estado}|${filtros.desde}|${filtros.hasta}|${intentoCarga}`;
  const estadoCargaEfectivo: EstadoCarga=
    !rangoFechasInvalido&&claveListadoResuelta!==claveListadoActiva
      ? "cargando"
      :estadoCarga;

  useEffect(() => {
    if(!esSuperAdmin||rangoFechasInvalido) return;

    const idPeticion=++secuenciaListadoRef.current;

    function valorFiltroActivo() {
      if(filtros.estado==="activos") { return true; }
      if(filtros.estado==="inactivos") { return false; }
      return undefined;
    }

    const activoParam=
      valorFiltroActivo();

    gateway
      .listar({
        page: pagina,
        page_size: pageSize,
        q: busquedaDebounced,
        desde: filtros.desde||undefined,
        hasta: filtros.hasta||undefined,
        activo: activoParam,
      })
      .then((datos) => {
        if(idPeticion!==secuenciaListadoRef.current) return;
        if(
          datos.items.length===0&&
          datos.total>0&&
          datos.total_pages>0&&
          pagina>datos.total_pages
        ) {
          setPagina(datos.total_pages);
          return;
        }
        setPaginaDatos(datos);
        setEstadoCarga("listo");
        setClaveListadoResuelta(claveListadoActiva);
        setUltimaActualizacion(horaActual());
      })
      .catch((error: unknown) => {
        if(idPeticion!==secuenciaListadoRef.current) return;
        setMensajeError(
          error instanceof AlberguesError
            ? error.message
            :"Verifica tu conexión e inténtalo nuevamente."
        );
        setEstadoCarga("error");
        setClaveListadoResuelta(claveListadoActiva);
      });
  },[
    gateway,
    esSuperAdmin,
    rangoFechasInvalido,
    claveListadoActiva,
    pagina,
    pageSize,
    busquedaDebounced,
    filtros.estado,
    filtros.desde,
    filtros.hasta,
    intentoCarga,
  ]);

  const seleccionadoId=seleccionado?.id??null;
  const debeCargarRegistros=Boolean(
    esSuperAdmin&&
    seleccionadoId&&
    modo==="consultar"&&
    gateway.consultarRegistros
  );
  const claveRegistrosActiva=`${seleccionadoId??""}|${modo}|${consultaRegistros.page??1}|${consultaRegistros.page_size??10}|${consultaRegistros.q??""}|${consultaRegistros.desde??""}|${consultaRegistros.hasta??""}`;
  const cargandoRegistros=
    debeCargarRegistros&&claveRegistrosResuelta!==claveRegistrosActiva;

  useEffect(() => {
    if(
      !esSuperAdmin||
      !seleccionadoId||
      modo!=="consultar"||
      !gateway.consultarRegistros
    ) {
      return;
    }

    let vigente=true;

    gateway
      .consultarRegistros(seleccionadoId,consultaRegistros)
      .then((datos) => {
        if(!vigente) return;
        setRegistrosGlobales(datos);
        setClaveRegistrosResuelta(claveRegistrosActiva);
      })
      .catch(() => {
        if(!vigente) return;
        setRegistrosGlobales(null);
        setClaveRegistrosResuelta(claveRegistrosActiva);
      });

    return () => {
      vigente=false;
    };
  },[
    esSuperAdmin,
    gateway,
    seleccionadoId,
    modo,
    consultaRegistros,
    claveRegistrosActiva,
  ]);

  const recargar=useCallback(() => {
    setIntentoCarga((valor) => valor+1);
  },[]);

  function abrir(
    albergue: Albergue|null,
    siguienteModo: ModoPanel,
    confirmar=false
  ) {
    setSeleccionado(albergue);
    setModo(siguienteModo);
    if(albergue&&siguienteModo==="consultar") {
      setConsultaRegistros({ page: 1,page_size: 10 });
    }
    setConfirmandoEstado(confirmar);
    setErrorEstado("");
    setAviso("");
  }

  async function guardar(formulario: AlbergueFormulario) {
    const entrada=formularioAEntrada(formulario);

    if(modo==="editar"&&seleccionado) {
      const actualizado=await gateway.actualizar(seleccionado.id,{
        ...entrada,
        activo: seleccionado.activo,
      });
      setSeleccionado(actualizado);
      setAviso(
        `Los cambios de “${actualizado.nombre}” se guardaron correctamente.`
      );
    } else {
      const creado=await gateway.crear(entrada);
      setSeleccionado(creado);
      setFiltros(FILTROS_INICIALES);
      setPagina(1);
      setAviso(`El albergue “${creado.nombre}” se registró correctamente.`);
    }

    setModo("consultar");
    recargar();
  }

  async function cambiarEstado(albergue: Albergue) {
    setCambiandoEstado(true);
    setErrorEstado("");

    try {
      const actualizado=await gateway.cambiarEstado(
        albergue.id,
        !albergue.activo
      );
      setSeleccionado(actualizado);
      setConfirmandoEstado(false);
      setAviso(
        actualizado.activo
          ? `“${actualizado.nombre}” fue reactivado.`
          :`“${actualizado.nombre}” fue desactivado. Sus datos históricos siguen disponibles.`
      );
      recargar();
    } catch(error) {
      setErrorEstado(
        error instanceof AlberguesError
          ? error.message
          :"No fue posible cambiar el estado. Inténtalo nuevamente."
      );
    } finally {
      setCambiandoEstado(false);
    }
  }

  function cambiarFiltros(siguientes: FiltrosAlbergues) {
    setFiltros(siguientes);
    setPagina(1);
  }

  function cambiarTamanoPagina(nuevoTamano: number) {
    setPageSize(nuevoTamano);
    setPagina(1);
  }

  if(sesion===undefined) {
    return (
      <output className="block p-8 text-center text-xs text-[#53636B]">
        Verificando sesión…
      </output>
    );
  }

  const totalRegistrados=
    resumenGlobal?.totalRegistrados??paginaDatos.total;
  const totalActivos=
    resumenGlobal?.totalActivos??
    paginaDatos.items.filter((a) => a.activo).length;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-col gap-4 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#164652]">
            Gestión de albergues
          </h1>
        </div>

        {esSuperAdmin&&(
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => abrir(null,"registrar")}
              className="inline-flex h-10 items-center gap-2 bg-[#008994] px-4 text-xs font-semibold text-white transition hover:bg-[#00747E]"
            >
              <Plus size={16} aria-hidden="true" />
              Registrar albergue
            </button>

            {ultimaActualizacion&&(
              <button
                type="button"
                onClick={recargar}
                className="flex items-center gap-2 border border-[#DCE6EA] bg-white px-3 py-2 text-left text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
                aria-label={`Actualizar listado. Última actualización hoy a las ${ultimaActualizacion}`}
              >
                <RefreshCw
                  size={14}
                  aria-hidden="true"
                  className="text-[#008994]"
                />
                <span>Hoy, {ultimaActualizacion}</span>
              </button>
            )}
          </div>
        )}
      </header>

      {esSuperAdmin? (
        <>
          {aviso&&(
            <output className="flex items-start gap-2 border-l-4 border-[#168052] bg-[#E8F7F0] px-3 py-2.5 text-xs text-[#168052]">
              <CheckCircle2
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0"
              />
              <span className="flex-1">{aviso}</span>
              <button
                type="button"
                aria-label="Cerrar aviso"
                onClick={() => setAviso("")}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </output>
          )}

          {resumenGlobal&&<ResumenGlobal resumen={resumenGlobal} />}

          <AlberguePanel
            modo={modo}
            albergue={seleccionado}
            registrosGlobales={registrosGlobales}
            cargandoRegistros={cargandoRegistros}
            consultaRegistros={consultaRegistros}
            onConsultaRegistrosChange={setConsultaRegistros}
            puedeAdministrar={esSuperAdmin}
            confirmandoEstado={confirmandoEstado}
            cambiandoEstado={cambiandoEstado}
            errorEstado={errorEstado}
            onModoChange={(m) => abrir(seleccionado,m)}
            onGuardar={guardar}
            onCancelar={() => {
              if(modo==="registrar"||modo==="consultar") {
                setSeleccionado(null);
              }
              setModo("consultar");
            }}
            onConfirmandoEstadoChange={(valor) => {
              setConfirmandoEstado(valor);
              setErrorEstado("");
            }}
            onCambiarEstado={cambiarEstado}
          />

          <AlberguesLista
            estadoCarga={estadoCargaEfectivo}
            mensajeError={mensajeError}
            totalRegistrados={totalRegistrados}
            totalActivos={totalActivos}
            pagina={paginaDatos}
            filtros={filtros}
            seleccionadoId={seleccionadoId}
            puedeAdministrar={esSuperAdmin}
            onFiltrosChange={cambiarFiltros}
            onPaginaChange={setPagina}
            onPageSizeChange={cambiarTamanoPagina}
            onConsultar={(a) => abrir(a,"consultar")}
            onEditar={(a) => abrir(a,"editar")}
            onCambiarEstado={(a) => abrir(a,"consultar",true)}
            onReintentar={recargar}
            onRegistrar={() => abrir(null,"registrar")}
          />
        </>
      ):(
        <AccesoRestringido />
      )}
    </div>
  );
}
