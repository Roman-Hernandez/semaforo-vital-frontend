"use client";

import { useState,type SyntheticEvent } from "react";
import { Pencil,Save } from "lucide-react";
import {
  obtenerEnfermedadesGateway,
  type EnfermedadesGateway,
  type RegistroEnfermedad,
} from "@/layers/application/services/registros-sanitarios-service";
import { hoyEnBogota } from "@/layers/domain/intervenciones/intervencion";
import { useListadoPaginado } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";
import { SkeletonBloque } from "@/components/shared/Skeleton";

export interface EnfermedadesPageProps {
  readonly gateway?: EnfermedadesGateway;
  readonly hoy?: string;
}

const ENFERMEDADES_CATALOGO=[
  "Infección respiratoria aguda",
  "Enfermedad diarreica aguda",
  "Gastroenteritis",
  "Dermatitis",
  "Conjuntivitis",
] as const;

const INPUT_CLS=
  "h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none transition focus:border-[#008994]";

export default function EnfermedadesPage({
  gateway: gatewayInyectado,
  hoy=hoyEnBogota(),
}: EnfermedadesPageProps={}) {
  const [gateway]=useState<EnfermedadesGateway>(
    () => gatewayInyectado??obtenerEnfermedadesGateway()
  );

  const {
    datos: pagina,
    items: registros,
    cargando,
    error: errorCarga,
    q,
    desde,
    hasta,
    setPage,
    setPageSize,
    setQ,
    setDesde,
    setHasta,
    limpiarFiltros,
    recargar,
  }=useListadoPaginado({
    fetcher: (consulta) => gateway.listar(consulta),
    sincronizarUrl: true,
    mensajeErrorDefecto: "No fue posible cargar los casos de enfermedades.",
  });

  const [editandoId,setEditandoId]=useState<string|null>(null);
  const [fecha,setFecha]=useState(hoy);
  const [enfermedad,setEnfermedad]=useState<string>(ENFERMEDADES_CATALOGO[0]);
  const [casosActivos,setCasosActivos]=useState("1");
  // Nunca inicializar automáticamente en 0: vacío representa desconocido (null)
  const [recuperados,setRecuperados]=useState("");
  const [observaciones,setObservaciones]=useState("");

  const [guardando,setGuardando]=useState(false);
  const [errorForm,setErrorForm]=useState("");
  const [exitoForm,setExitoForm]=useState("");

  function limpiarFormulario() {
    setEditandoId(null);
    setFecha(hoy);
    setEnfermedad(ENFERMEDADES_CATALOGO[0]);
    setCasosActivos("1");
    setRecuperados("");
    setObservaciones("");
    setErrorForm("");
  }

  function cargarEnFormulario(item: RegistroEnfermedad) {
    setEditandoId(item.id);
    setFecha(item.fecha);
    setEnfermedad(item.enfermedad);
    setCasosActivos(String(item.cantidadCasosActivos));
    setRecuperados(
      item.cantidadRecuperados===null||item.cantidadRecuperados===undefined
        ? ""
        :String(item.cantidadRecuperados)
    );
    setObservaciones(item.observaciones);
    setErrorForm("");
    setExitoForm("");
  }

  async function manejarSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if(guardando) return;

    const cantidad=Number(casosActivos);
    if(
      casosActivos.trim()===""||
      !Number.isInteger(cantidad)||
      cantidad<0
    ) {
      setErrorForm("Ingresa una cantidad entera válida de casos activos.");
      return;
    }

    let cantidadRecuperados: number|null=null;
    if(recuperados.trim()!=="") {
      const numRec=Number(recuperados);
      if(!Number.isInteger(numRec)||numRec<0) {
        setErrorForm(
          "La cantidad de recuperados debe ser un número entero mayor o igual a 0, o dejarse en blanco si se desconoce."
        );
        return;
      }
      cantidadRecuperados=numRec;
    }

    if(!fecha||!enfermedad.trim()) {
      setErrorForm("Selecciona la enfermedad y la fecha del reporte.");
      return;
    }

    setGuardando(true);
    setErrorForm("");
    setExitoForm("");

    try {
      const payload={
        fecha,
        enfermedad: enfermedad.trim(),
        cantidadCasosActivos: cantidad,
        ...(cantidadRecuperados!==null
          ? { cantidadRecuperados }
          :{}),
        observaciones,
      };

      if(editandoId) {
        await gateway.actualizar(editandoId,payload);
        setExitoForm("El caso se actualizó correctamente.");
      } else {
        await gateway.crear(payload);
        setExitoForm("El caso se registró correctamente.");
      }
      limpiarFormulario();
      recargar();
    } catch(err: unknown) {
      setErrorForm(
        err instanceof Error? err.message:"No fue posible guardar el caso."
      );
    } finally {
      setGuardando(false);
    }
  }

  function textoGuardar() {
    if(guardando) { return "Guardando…"; }
    if(editandoId) { return "Guardar cambios"; }
    return "Guardar registro";
  }

  function renderizarHistorial() {
    if(errorCarga) {
      return <div role="alert" className="p-6 text-sm text-[#C53030]">
        <p>{errorCarga}</p>
        <button
          type="button"
          onClick={recargar}
          className="mt-2 border border-[#DCE6EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#164652]"
        >
          Reintentar
        </button>
      </div>;
    }
    if(cargando) { return <SkeletonBloque filas={4} etiqueta="Cargando casos registrados…" />; }
    if(registros.length===0) {
      return <p className="p-8 text-center text-sm text-[#53636B]">
        No se encontraron casos registrados.
      </p>;
    }
    return <section


      aria-labelledby="titulo-tabla-enfermedades"
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[600px] text-left text-xs text-[#53636B]">
        <caption className="sr-only">
          Listado de casos de enfermedades
        </caption>
        <thead>
          <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] text-xs font-semibold text-[#53636B]">
            <th scope="col" className="px-4 py-3">
              Fecha
            </th>
            <th scope="col" className="px-3 py-3">
              Enfermedad
            </th>
            <th scope="col" className="px-3 py-3">
              Casos activos
            </th>
            <th scope="col" className="px-3 py-3">
              Recuperados
            </th>
            <th scope="col" className="px-3 py-3">
              Observaciones
            </th>
            <th scope="col" className="px-4 py-3">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2F4]">
          {registros.map((item) => (
            <tr key={item.id} className="hover:bg-[#FAFCFD]">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-[#164652]">
                {item.fecha}
              </td>
              <td className="px-3 py-3 font-semibold text-[#164652]">
                {item.enfermedad}
              </td>
              <td className="px-3 py-3 font-bold text-[#164652]">
                {item.cantidadCasosActivos}
              </td>
              <td className="px-3 py-3 text-[#164652]">
                {item.cantidadRecuperados??"Sin dato"}
              </td>
              <td className="max-w-xs px-3 py-3">
                {item.observaciones||"—"}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => cargarEnFormulario(item)}
                  aria-label={`Editar caso de ${item.enfermedad}`}
                  className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-[#008994] transition hover:bg-[#E6F9FA]"
                >
                  <Pencil size={13} aria-hidden="true" />
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-[#164652]">
      <header className="border-b border-[#DCE6EA] pb-4">
        <h1 className="text-2xl font-bold text-[#164652]">
          Enfermedades y casos
        </h1>
      </header>

      {/* Formulario horizontal superior */}
      <aside className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#164652]">
          {editandoId? "Editar caso":"Registrar caso"}
        </h2>

        <form onSubmit={manejarSubmit} noValidate className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="enf-nombre"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Enfermedad *
              </label>
              <select
                id="enf-nombre"
                value={enfermedad}
                onChange={(e) => setEnfermedad(e.target.value)}
                className={INPUT_CLS}
              >
                {ENFERMEDADES_CATALOGO.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="enf-cantidad"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Cantidad de casos activos *
              </label>
              <input
                id="enf-cantidad"
                type="number"
                min={0}
                step={1}
                required
                value={casosActivos}
                onChange={(e) => setCasosActivos(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label
                htmlFor="enf-recuperados"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Personas recuperadas (opcional)
              </label>
              <input
                id="enf-recuperados"
                type="number"
                min={0}
                step={1}
                value={recuperados}
                onChange={(e) => setRecuperados(e.target.value)}
                placeholder="Sin dato si se desconoce"
                className={INPUT_CLS}
              />
              <p className="mt-1 text-[11px] text-[#718895]">
                Recuperados observados en la población actual (no solo del día).
              </p>
            </div>

            <div>
              <label
                htmlFor="enf-fecha"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Fecha del reporte *
              </label>
              <input
                id="enf-fecha"
                type="date"
                max={hoy}
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="enf-observaciones"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Observaciones
              </label>
              <input
                id="enf-observaciones"
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones generales del seguimiento..."
                className={INPUT_CLS}
              />
            </div>

            <div className="flex gap-2">
              {editandoId&&(
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  disabled={guardando}
                  className="h-10 border border-[#DCE6EA] bg-white px-4 text-xs font-semibold text-[#164652]"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={guardando}
                className="inline-flex h-10 items-center justify-center gap-2 bg-[#008994] px-5 text-xs font-semibold text-white transition hover:bg-[#00747E] disabled:opacity-60"
              >
                <Save size={14} aria-hidden="true" />
                <span>
                  {textoGuardar()}
                </span>
              </button>
            </div>
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

      {/* Tabla de casos paginada en servidor */}
      <section
        aria-labelledby="titulo-tabla-enfermedades"
        className="border-t-2 border-[#008994] bg-white shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-[#EEF2F4] px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="titulo-tabla-enfermedades"
              className="text-base font-bold text-[#164652]"
            >
              Casos registrados ({pagina.total})
            </h2>
          </div>

          <BarraFiltrosServidor
            q={q}
            onQChange={setQ}
            placeholderQ="Filtrar por nombre de enfermedad…"
            ariaLabelQ="Buscar enfermedad"
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={limpiarFiltros}
          />
        </div>

        {renderizarHistorial()}

        <ControlesPaginacion
          pagina={pagina}
          etiquetaItems="casos"
          cargando={cargando}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Paginación de casos de enfermedades"
        />
      </section>
    </div>
  );
}
