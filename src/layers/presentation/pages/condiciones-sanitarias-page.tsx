"use client";

import { useState, type SyntheticEvent } from "react";
import { Pencil, Save } from "lucide-react";
import {
  obtenerCondicionesSanitariasGateway,
  type CondicionSanitaria,
  type CondicionesSanitariasGateway,
} from "@/layers/application/services/registros-sanitarios-service";
import { hoyEnBogota } from "@/layers/domain/intervenciones/intervencion";
import { useListadoPaginado } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";
import { SkeletonBloque } from "@/components/shared/Skeleton";

export interface CondicionesSanitariasProps {
  readonly gateway?: CondicionesSanitariasGateway;
  readonly hoy?: string;
}

const OPCIONES_ESTADO = ["Adecuado", "Requiere atención", "Crítico"] as const;

const INPUT_CLS =
  "h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none transition focus:border-[#008994]";

export default function CondicionesSanitariasPage({
  gateway: gatewayInyectado,
  hoy = hoyEnBogota(),
}: CondicionesSanitariasProps = {}) {
  const [gateway] = useState<CondicionesSanitariasGateway>(
    () => gatewayInyectado ?? obtenerCondicionesSanitariasGateway()
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
  } = useListadoPaginado({
    fetcher: (consulta) => gateway.listar(consulta),
    sincronizarUrl: true,
    mensajeErrorDefecto: "No fue posible cargar las condiciones sanitarias.",
  });

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [fecha, setFecha] = useState(hoy);
  const [aguaPotable, setAguaPotable] = useState(true);
  const [banos, setBanos] = useState("0");
  const [estadoHigiene, setEstadoHigiene] = useState("Adecuado");
  const [estadoSaneamiento, setEstadoSaneamiento] = useState("Adecuado");
  const [observaciones, setObservaciones] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [exitoForm, setExitoForm] = useState("");

  function limpiarFormulario() {
    setEditandoId(null);
    setFecha(hoy);
    setAguaPotable(true);
    setBanos("0");
    setEstadoHigiene("Adecuado");
    setEstadoSaneamiento("Adecuado");
    setObservaciones("");
    setErrorForm("");
  }

  function cargarEnFormulario(item: CondicionSanitaria) {
    setEditandoId(item.id);
    setFecha(item.fecha);
    setAguaPotable(item.aguaPotableDisponible);
    setBanos(String(item.banosDisponibles));
    setEstadoHigiene(item.estadoHigiene);
    setEstadoSaneamiento(item.estadoSaneamiento);
    setObservaciones(item.observaciones);
    setErrorForm("");
    setExitoForm("");
  }

  async function manejarSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (guardando) return;

    const cantidadBanos = Number(banos);
    if (
      banos.trim() === "" ||
      !Number.isInteger(cantidadBanos) ||
      cantidadBanos < 0
    ) {
      setErrorForm(
        "La cantidad de baños debe ser un número entero mayor o igual a 0."
      );
      return;
    }

    if (!fecha || !estadoHigiene.trim() || !estadoSaneamiento.trim()) {
      setErrorForm("Completa todos los campos obligatorios.");
      return;
    }

    setGuardando(true);
    setErrorForm("");
    setExitoForm("");

    try {
      const payload = {
        fecha,
        aguaPotableDisponible: aguaPotable,
        banosDisponibles: cantidadBanos,
        estadoHigiene,
        estadoSaneamiento,
        observaciones,
      };

      if (editandoId) {
        await gateway.actualizar(editandoId, payload);
        setExitoForm(
          "Las condiciones sanitarias se actualizaron correctamente."
        );
      } else {
        await gateway.crear(payload);
        setExitoForm(
          "El registro de condiciones sanitarias se guardó correctamente."
        );
      }
      limpiarFormulario();
      recargar();
    } catch (err: unknown) {
      setErrorForm(
        err instanceof Error
          ? err.message
          : "No fue posible guardar el registro sanitario."
      );
    } finally {
      setGuardando(false);
    }
  }

  const ultimo = registros[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-6 text-[#164652]">
      <header className="border-b border-[#DCE6EA] pb-4">
        <h1 className="text-2xl font-bold text-[#164652]">
          Condiciones sanitarias
        </h1>
      </header>

      {/* Barra unificada del último estado en la vista actual */}
      <section className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
        <dl className="grid grid-cols-2 divide-y divide-[#EEF2F4] sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          <div className="py-2 pr-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Agua potable</dt>
            <dd className="mt-1 text-lg font-bold text-[#164652]">
              {ultimo
                ? ultimo.aguaPotableDisponible
                  ? "Disponible"
                  : "No disponible"
                : "Sin registro"}
            </dd>
          </div>
          <div className="py-2 sm:px-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Baños disponibles</dt>
            <dd className="mt-1 text-lg font-bold text-[#164652]">
              {ultimo ? ultimo.banosDisponibles : "—"}
            </dd>
          </div>
          <div className="py-2 pr-4 sm:px-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Estado de higiene</dt>
            <dd className="mt-1 text-lg font-bold text-[#164652]">
              {ultimo ? ultimo.estadoHigiene : "—"}
            </dd>
          </div>
          <div className="py-2 sm:pl-4 sm:py-0">
            <dt className="text-xs text-[#53636B]">Estado de saneamiento</dt>
            <dd className="mt-1 text-lg font-bold text-[#164652]">
              {ultimo ? ultimo.estadoSaneamiento : "—"}
            </dd>
          </div>
        </dl>
      </section>

      {/* Formulario horizontal superior */}
      <aside className="border-t-2 border-[#008994] bg-white p-5 shadow-xs">
        <h2 className="text-base font-bold text-[#164652]">
          {editandoId ? "Editar condiciones" : "Registrar condiciones"}
        </h2>

        <form onSubmit={manejarSubmit} noValidate className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label
                htmlFor="san-fecha"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Fecha del registro *
              </label>
              <input
                id="san-fecha"
                type="date"
                max={hoy}
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label
                htmlFor="san-agua"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Agua potable disponible *
              </label>
              <select
                id="san-agua"
                value={aguaPotable ? "si" : "no"}
                onChange={(e) => setAguaPotable(e.target.value === "si")}
                className={INPUT_CLS}
              >
                <option value="si">Disponible</option>
                <option value="no">No disponible</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="san-banos"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Baños disponibles *
              </label>
              <input
                id="san-banos"
                type="number"
                min={0}
                step={1}
                required
                value={banos}
                onChange={(e) => setBanos(e.target.value)}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label
                htmlFor="san-higiene"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Estado de higiene *
              </label>
              <select
                id="san-higiene"
                value={estadoHigiene}
                onChange={(e) => setEstadoHigiene(e.target.value)}
                className={INPUT_CLS}
              >
                {OPCIONES_ESTADO.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="san-saneamiento"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Estado del saneamiento *
              </label>
              <select
                id="san-saneamiento"
                value={estadoSaneamiento}
                onChange={(e) => setEstadoSaneamiento(e.target.value)}
                className={INPUT_CLS}
              >
                {OPCIONES_ESTADO.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label
                htmlFor="san-observaciones"
                className="mb-1 block text-xs font-semibold text-[#164652]"
              >
                Observaciones
              </label>
              <input
                id="san-observaciones"
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Observaciones adicionales de la revisión..."
                className={INPUT_CLS}
              />
            </div>

            <div className="flex gap-2">
              {editandoId && (
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
                  {guardando
                    ? "Guardando…"
                    : editandoId
                    ? "Guardar cambios"
                    : "Guardar registro"}
                </span>
              </button>
            </div>
          </div>

          {errorForm && (
            <p role="alert" className="text-xs font-medium text-[#C53030]">
              {errorForm}
            </p>
          )}

          {exitoForm && (
            <output className="block text-xs font-medium text-[#168052]">
              {exitoForm}
            </output>
          )}
        </form>
      </aside>

      {/* Tabla histórica paginada en servidor */}
      <section
        aria-labelledby="titulo-historial-sanitario"
        className="border-t-2 border-[#008994] bg-white shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-[#EEF2F4] px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
          <h2
            id="titulo-historial-sanitario"
            className="text-base font-bold text-[#164652]"
          >
            Historial de condiciones sanitarias ({pagina.total})
          </h2>

          <BarraFiltrosServidor
            q={q}
            onQChange={setQ}
            placeholderQ="Estado de higiene, saneamiento u observaciones…"
            ariaLabelQ="Buscar condiciones sanitarias"
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={limpiarFiltros}
          />
        </div>

        {errorCarga ? (
          <div role="alert" className="p-6 text-sm text-[#C53030]">
            <p>{errorCarga}</p>
            <button
              type="button"
              onClick={recargar}
              className="mt-2 border border-[#DCE6EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#164652]"
            >
              Reintentar
            </button>
          </div>
        ) : cargando ? (
          <SkeletonBloque filas={4} etiqueta="Cargando registros sanitarios…" />
        ) : registros.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#53636B]">
            No hay registros de condiciones sanitarias.
          </p>
        ) : (
          <div
            tabIndex={0}
            role="region"
            aria-labelledby="titulo-historial-sanitario"
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[600px] text-left text-xs text-[#53636B]">
              <caption className="sr-only">
                Historial de condiciones sanitarias
              </caption>
              <thead>
                <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] text-xs font-semibold text-[#53636B]">
                  <th scope="col" className="px-4 py-3">
                    Fecha
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Agua potable
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Baños
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Higiene
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Saneamiento
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
                    <td className="px-3 py-3">
                      {item.aguaPotableDisponible
                        ? "Disponible"
                        : "No disponible"}
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#164652]">
                      {item.banosDisponibles}
                    </td>
                    <td className="px-3 py-3">{item.estadoHigiene}</td>
                    <td className="px-3 py-3">{item.estadoSaneamiento}</td>
                    <td className="max-w-xs px-3 py-3">
                      {item.observaciones || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => cargarEnFormulario(item)}
                        aria-label={`Editar registro de ${item.fecha}`}
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
          </div>
        )}

        <ControlesPaginacion
          pagina={pagina}
          etiquetaItems="registros"
          cargando={cargando}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Paginación de condiciones sanitarias"
        />
      </section>
    </div>
  );
}
