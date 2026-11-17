"use client";

import { useCallback,useEffect,useState,type SyntheticEvent } from "react";
import { Save } from "lucide-react";
import {
  miAlbergueGateway,
  type MiAlbergueGateway,
  type ResumenPoblacion,
} from "@/layers/application/services/mi-albergue-service";
import { hoyEnBogota } from "@/layers/domain/intervenciones/intervencion";
import { useListadoPaginado } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";
import { SkeletonBloque } from "@/components/shared/Skeleton";

export interface PoblacionPageProps {
  readonly gateway?: MiAlbergueGateway;
  readonly hoy?: string;
}

export default function PoblacionPage({
  gateway=miAlbergueGateway,
  hoy=hoyEnBogota(),
}: PoblacionPageProps={}) {
  const [capacidad,setCapacidad]=useState<number>(0);
  const [resumen,setResumen]=useState<ResumenPoblacion|null>(null);
  const [errorResumen,setErrorResumen]=useState("");

  const [personas,setPersonas]=useState("");
  const [fecha,setFecha]=useState(hoy);
  const [guardando,setGuardando]=useState(false);
  const [errorForm,setErrorForm]=useState("");
  const [exitoForm,setExitoForm]=useState("");

  const [versionResumen,setVersionResumen]=useState(0);
  const [claveResumenResuelta,setClaveResumenResuelta]=useState("");
  const cargandoResumen=claveResumenResuelta!==String(versionResumen);

  const cargarResumen=useCallback(() => {
    setVersionResumen((v) => v+1);
  },[]);

  useEffect(() => {
    const clave=String(versionResumen);
    let vigente=true;
    Promise.all([gateway.consultar(),gateway.consultarPoblacion()])
      .then(([detalle,pop]) => {
        if(!vigente) return;
        setCapacidad(detalle.albergue.capacidadInstalada);
        setResumen(pop);
        setErrorResumen("");
        setClaveResumenResuelta(clave);
      })
      .catch((err: unknown) => {
        if(!vigente) return;
        setErrorResumen(
          err instanceof Error
            ? err.message
            :"No fue posible cargar el resumen de población."
        );
        setClaveResumenResuelta(clave);
      });
    return () => {
      vigente=false;
    };
  },[gateway,versionResumen]);

  const {
    datos: paginaHistorial,
    items: historial,
    cargando: cargandoHistorial,
    error: errorHistorial,
    desde,
    hasta,
    setPage,
    setPageSize,
    setDesde,
    setHasta,
    limpiarFiltros,
    recargar: recargarHistorial,
  }=useListadoPaginado({
    fetcher: (consulta) =>
      gateway.listarHistorialPoblacion({
        page: consulta.page,
        page_size: consulta.page_size,
        desde: consulta.desde,
        hasta: consulta.hasta,
      }),
    sincronizarUrl: true,
    mensajeErrorDefecto: "No fue posible cargar el historial de población.",
  });

  async function manejarGuardar(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if(guardando) return;

    const cantidad=Number(personas);
    if(
      personas.trim()===""||
      !Number.isInteger(cantidad)||
      cantidad<0
    ) {
      setErrorForm(
        "Ingresa una cantidad entera válida de personas (mayor o igual a 0)."
      );
      setExitoForm("");
      return;
    }

    if(capacidad>0&&cantidad>capacidad) {
      setErrorForm(
        `La cantidad no puede superar la capacidad máxima de ${capacidad} personas.`
      );
      setExitoForm("");
      return;
    }

    if(!fecha) {
      setErrorForm("Selecciona la fecha del registro.");
      setExitoForm("");
      return;
    }

    setGuardando(true);
    setErrorForm("");
    setExitoForm("");

    try {
      const registro=await gateway.guardarPoblacion(fecha,cantidad);
      const ocupacionCalculada=
        capacidad>0? Math.round((cantidad*100)/capacidad):null;
      const cuposCalculados=
        capacidad>0? Math.max(0,capacidad-cantidad):null;

      setResumen({
        poblacionActual: cantidad,
        porcentajeOcupacion: ocupacionCalculada,
        cuposDisponibles: cuposCalculados,
        ultimoRegistro: registro,
      });

      setExitoForm("El registro de población se guardó correctamente.");
      setPersonas("");
      cargarResumen();
      recargarHistorial();
    } catch(err: unknown) {
      setErrorForm(
        err instanceof Error
          ? err.message
          :"No fue posible guardar el registro de población."
      );
    } finally {
      setGuardando(false);
    }
  }

  const poblacionActual=resumen?.poblacionActual??null;
  const cuposDisponibles=resumen?.cuposDisponibles??null;
  const ocupacion=
    resumen?.porcentajeOcupacion!==null&&
      resumen?.porcentajeOcupacion!==undefined
      ? Math.round(resumen.porcentajeOcupacion)
      :null;

  function textoPoblacion() {
    if(cargandoResumen) { return "—"; }
    if(poblacionActual===null) { return "Sin registro"; }
    return poblacionActual;
  }

  function textoCupos() {
    if(cargandoResumen) { return "—"; }
    if(cuposDisponibles===null) { return "Sin dato"; }
    return cuposDisponibles;
  }

  function textoOcupacion() {
    if(cargandoResumen) { return "—"; }
    if(ocupacion===null) { return "Sin dato"; }
    return `${ocupacion}%`;
  }

  function renderizarHistorial() {
    if(cargandoHistorial) { return <SkeletonBloque filas={4} etiqueta="Cargando historial…" />; }
    if(historial.length===0) {
      return <p className="p-8 text-center text-sm text-[#53636B]">
        No hay registros de población.
      </p>;
    }
    return <section


      aria-labelledby="titulo-historial-poblacion"
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[480px] text-left text-xs text-[#53636B]">
        <caption className="sr-only">
          Historial diario de población alojada
        </caption>
        <thead>
          <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] text-xs font-semibold text-[#53636B]">
            <th scope="col" className="px-5 py-3">
              Fecha
            </th>
            <th scope="col" className="px-4 py-3">
              Cantidad de personas
            </th>
            <th scope="col" className="px-4 py-3">
              Ocupación
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2F4]">
          {historial.map((reg) => {
            const pct=
              capacidad>0
                ? Math.round((reg.poblacion*100)/capacidad)
                :null;
            return (
              <tr key={reg.id} className="hover:bg-[#FAFCFD]">
                <td className="px-5 py-3 font-medium text-[#164652]">
                  {reg.fecha}
                </td>
                <td className="px-4 py-3 font-semibold text-[#164652]">
                  {reg.poblacion}
                </td>
                <td className="px-4 py-3">
                  {pct===null? "Sin dato":`${pct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-[#164652]">
      <header className="border-b border-[#DCE6EA] pb-4">
        <h1 className="text-2xl font-bold text-[#164652]">
          Población del albergue
        </h1>
      </header>

      {(errorResumen||errorHistorial)&&(
        <div
          role="alert"
          className="border-l-4 border-[#C53030] bg-white p-4 text-sm text-[#C53030]"
        >
          {errorResumen||errorHistorial}
        </div>
      )}

      {/* Barra unificada de indicadores */}
      <section className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
        <dl className="grid grid-cols-2 divide-y divide-[#EEF2F4] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="py-2 pr-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Personas alojadas</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {textoPoblacion()}
            </dd>
          </div>
          <div className="py-2 sm:px-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Capacidad máxima</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {cargandoResumen? "—":capacidad}
            </dd>
          </div>
          <div className="py-2 pr-4 sm:px-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Cupos disponibles</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {textoCupos()}
            </dd>
          </div>
          <div className="py-2 sm:pl-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Ocupación</dt>
            <dd className="mt-1 text-2xl font-bold text-[#164652]">
              {textoOcupacion()}
            </dd>
          </div>
        </dl>
      </section>

      {/* Formulario horizontal superior */}
      <aside className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#164652]">
          Actualizar población
        </h2>

        <form onSubmit={manejarGuardar} noValidate className="mt-4 space-y-3">
          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3">
            <div>
              <label
                htmlFor="people"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Cantidad de personas alojadas
              </label>
              <input
                id="people"
                type="number"
                min={0}
                max={capacidad||undefined}
                step={1}
                required
                value={personas}
                onChange={(e) => {
                  setPersonas(e.target.value);
                  setErrorForm("");
                  setExitoForm("");
                }}
                className="h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none focus:border-[#008994]"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Fecha del registro
              </label>
              <input
                id="date"
                type="date"
                max={hoy}
                required
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setErrorForm("");
                  setExitoForm("");
                }}
                className="h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none focus:border-[#008994]"
              />
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex h-10 w-full items-center justify-center gap-2 bg-[#008994] px-4 text-xs font-semibold text-white transition hover:bg-[#00747E] disabled:opacity-60"
            >
              <Save size={14} aria-hidden="true" />
              <span>{guardando? "Guardando…":"Guardar registro"}</span>
            </button>
          </div>

          {errorForm&&(
            <p role="alert" className="text-xs font-medium text-[#C53030]">
              {errorForm}
            </p>
          )}

          {exitoForm&&(
            <output className="block text-xs font-medium text-[#168052]">
              {exitoForm}
            </output>
          )}
        </form>
      </aside>

      {/* Tabla histórica paginada en servidor (solo admite filtro de fechas, sin q) */}
      <section
        aria-labelledby="titulo-historial-poblacion"
        className="border-t-2 border-[#008994] bg-white shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-[#EEF2F4] px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="titulo-historial-poblacion"
            className="text-base font-bold text-[#164652]"
          >
            Historial de población ({paginaHistorial.total})
          </h2>

          <BarraFiltrosServidor
            mostrarQ={false}
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={limpiarFiltros}
          />
        </div>

        {renderizarHistorial()}

        <ControlesPaginacion
          pagina={paginaHistorial}
          etiquetaItems="registros de población"
          cargando={cargandoHistorial}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Paginación de historial de población"
        />
      </section>
    </div>
  );
}
