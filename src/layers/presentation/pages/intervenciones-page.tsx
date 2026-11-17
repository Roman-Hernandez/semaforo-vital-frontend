"use client";

import { useState, type SyntheticEvent } from "react";
import {
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardPlus,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  ServerCrash,
  X,
} from "lucide-react";
import {
  DESCRIPCION_MAXIMA,
  INTERVENCION_VACIA,
  OBSERVACIONES_MAXIMA,
  TIPOS_INTERVENCION,
  formatearFecha,
  hoyEnBogota,
  validarIntervencion,
  type CampoIntervencion,
  type ErroresIntervencion,
  type Intervencion,
  type IntervencionEntrada,
} from "../../domain/intervenciones/intervencion";
import { ApiError } from "../../application/services/api-client";
import {
  obtenerIntervencionesGateway,
  type IntervencionesGateway,
} from "../../application/services/intervenciones-service";
import { useListadoPaginado } from "@/layers/presentation/hooks/use-listado-paginado";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";

export interface IntervencionesPageProps {
  readonly gateway?: IntervencionesGateway;
  readonly hoy?: string;
}

const CAMPOS_ORDEN: CampoIntervencion[] = [
  "tipo",
  "descripcion",
  "fecha",
  "observaciones",
];

const CONTROL_BASE =
  "w-full border bg-white px-3 text-sm text-[#203B45] outline-none transition placeholder:text-[#9AABB3] focus:ring-2";

function claseControl(error?: string): string {
  return `${CONTROL_BASE} ${
    error
      ? "border-[#D64545] focus:ring-[#D64545]/15"
      : "border-[#DCE5EA] focus:border-[#008994] focus:ring-[#008994]/15"
  }`;
}

function enfocarFormulario() {
  document
    .getElementById("nueva-intervencion")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("intervencion-tipo")?.focus({ preventScroll: true });
}

function Campo({
  id,
  etiqueta,
  obligatorio = false,
  error,
  ayuda,
  children,
}: {
  readonly id: string;
  readonly etiqueta: string;
  readonly obligatorio?: boolean;
  readonly error?: string;
  readonly ayuda?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-[#164652]"
      >
        <span>{etiqueta}</span>
        {obligatorio && (
          <span aria-hidden="true" className="text-[#D64545]">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 flex items-start gap-1 text-xs text-[#D64545]"
        >
          <CircleAlert size={13} aria-hidden="true" className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-xs text-[#8297A1]">
          {ayuda}
        </p>
      )}
    </div>
  );
}

function FormularioIntervencion({
  hoy,
  editando,
  onGuardar,
  onCancelarEdicion,
}: {
  readonly hoy: string;
  readonly editando: Intervencion | null;
  readonly onGuardar: (
    entrada: IntervencionEntrada,
    idEdicion: string | null
  ) => Promise<void>;
  readonly onCancelarEdicion: () => void;
}) {
  const [valores, setValores] = useState<IntervencionEntrada>(() =>
    editando
      ? {
          tipo: editando.tipo,
          descripcion: editando.descripcion,
          fecha: editando.fecha,
          observaciones: editando.observaciones,
        }
      : INTERVENCION_VACIA
  );
  const [errores, setErrores] = useState<ErroresIntervencion>({});
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  function cambiar(campo: CampoIntervencion, valor: string) {
    const siguientes = { ...valores, [campo]: valor };
    setValores(siguientes);

    if (intentado) {
      setErrores(validarIntervencion(siguientes, hoy));
    }
  }

  function limpiar() {
    setValores(INTERVENCION_VACIA);
    setErrores({});
    setIntentado(false);
    setErrorServidor("");
    onCancelarEdicion();
  }

  function atributos(campo: CampoIntervencion) {
    const id = `intervencion-${campo}`;
    const error = errores[campo];

    return {
      id,
      name: campo,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
    };
  }

  async function enviar(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;

    setIntentado(true);
    setErrorServidor("");

    const encontrados = validarIntervencion(valores, hoy);
    setErrores(encontrados);

    const primero = CAMPOS_ORDEN.find((campo) => encontrados[campo]);

    if (primero) {
      document.getElementById(`intervencion-${primero}`)?.focus();
      return;
    }

    setGuardando(true);

    try {
      await onGuardar(valores, editando?.id ?? null);
      limpiar();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrores(error.campos);
        setErrorServidor(error.message);
      } else {
        setErrorServidor(
          "No fue posible registrar la intervención. Inténtalo nuevamente."
        );
      }
    } finally {
      setGuardando(false);
    }
  }

  const hayErroresCampo =
    intentado && Object.keys(errores).length > 0 && !errorServidor;

  return (
    <aside
      id="nueva-intervencion"
      aria-labelledby="titulo-formulario"
      className="border-t-2 border-[#008994] bg-white p-5 shadow-xs"
    >
      <h2
        id="titulo-formulario"
        className="flex items-center gap-2 text-base font-bold text-[#164652]"
      >
        <ClipboardPlus size={18} aria-hidden="true" className="text-[#008994]" />
        <span>
          {editando ? "Editar intervención" : "Nueva intervención"}
        </span>
      </h2>

      <form
        onSubmit={enviar}
        noValidate
        aria-busy={guardando}
        className="mt-4 space-y-4"
      >
        {hayErroresCampo && (
          <p
            role="alert"
            className="bg-[#FFF0F0] px-3 py-2 text-xs text-[#C53030]"
          >
            Revisa los campos marcados antes de guardar.
          </p>
        )}

        {errorServidor && (
          <p
            role="alert"
            className="flex items-start gap-2 bg-[#FFF0F0] px-3 py-2 text-xs text-[#C53030]"
          >
            <CircleAlert size={14} aria-hidden="true" className="mt-px shrink-0" />
            <span>{errorServidor}</span>
          </p>
        )}

        <fieldset
          disabled={guardando}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <legend className="sr-only">Datos de la intervención</legend>

          <Campo
            id="intervencion-tipo"
            etiqueta="Tipo de intervención"
            obligatorio
            error={errores.tipo}
          >
            <select
              {...atributos("tipo")}
              value={valores.tipo}
              onChange={(e) => cambiar("tipo", e.target.value)}
              className={`${claseControl(errores.tipo)} h-10`}
            >
              <option value="">Selecciona una categoría</option>
              {TIPOS_INTERVENCION.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </Campo>

          <Campo
            id="intervencion-fecha"
            etiqueta="Fecha de realización"
            obligatorio
            error={errores.fecha}
          >
            <input
              {...atributos("fecha")}
              type="date"
              value={valores.fecha}
              max={hoy}
              onChange={(e) => cambiar("fecha", e.target.value)}
              className={`${claseControl(errores.fecha)} h-10`}
            />
          </Campo>

          <div className="sm:col-span-2">
            <Campo
              id="intervencion-descripcion"
              etiqueta="Descripción"
              obligatorio
              error={errores.descripcion}
              ayuda={`${valores.descripcion.trim().length}/${DESCRIPCION_MAXIMA} caracteres`}
            >
              <textarea
                {...atributos("descripcion")}
                value={valores.descripcion}
                onChange={(e) => cambiar("descripcion", e.target.value)}
                placeholder="Describe la acción sanitaria realizada y su alcance…"
                rows={3}
                maxLength={DESCRIPCION_MAXIMA + 50}
                className={`${claseControl(errores.descripcion)} resize-y py-2`}
              />
            </Campo>
          </div>

          <div className="sm:col-span-2">
            <Campo
              id="intervencion-observaciones"
              etiqueta="Observaciones (opcional)"
              error={errores.observaciones}
              ayuda={`Máximo ${OBSERVACIONES_MAXIMA} caracteres`}
            >
              <textarea
                {...atributos("observaciones")}
                value={valores.observaciones}
                onChange={(e) => cambiar("observaciones", e.target.value)}
                placeholder="Información adicional (opcional)"
                rows={2}
                className={`${claseControl(errores.observaciones)} resize-y py-2`}
              />
            </Campo>
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-10 items-center justify-center gap-2 bg-[#008994] px-5 text-xs font-semibold text-white transition hover:bg-[#00747E] disabled:cursor-wait disabled:opacity-80"
          >
            {guardando && (
              <LoaderCircle
                size={14}
                aria-hidden="true"
                className="animate-spin"
              />
            )}
            <span>
              {guardando
                ? "Guardando…"
                : editando
                ? "Guardar cambios"
                : "Guardar intervención"}
            </span>
          </button>
          <button
            type="button"
            onClick={limpiar}
            disabled={guardando}
            className="h-10 border border-[#DCE5EA] bg-white px-4 text-xs font-semibold text-[#164652] transition hover:bg-[#F6F9FB] disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </aside>
  );
}

function EsqueletoListado() {
  return (
    <span aria-hidden="true" className="block divide-y divide-[#EEF2F4]">
      {[1, 2, 3, 4].map((fila) => (
        <span
          key={fila}
          className="flex animate-pulse items-center gap-4 px-4 py-4"
        >
          <span className="block h-3 w-24 bg-[#EEF2F4]" />
          <span className="block h-3 flex-1 bg-[#EEF2F4]" />
          <span className="hidden h-3 w-20 bg-[#EEF2F4] sm:block" />
        </span>
      ))}
    </span>
  );
}

function TipoBadge({ tipo }: { readonly tipo: string }) {
  return (
    <span className="inline-flex whitespace-nowrap bg-[#E4F8F8] px-2.5 py-1 text-xs font-semibold text-[#007F8A]">
      {tipo}
    </span>
  );
}

export function IntervencionesPage({
  gateway: gatewayInyectado,
  hoy = hoyEnBogota(),
}: IntervencionesPageProps) {
  const [gateway] = useState<IntervencionesGateway>(
    () => gatewayInyectado ?? obtenerIntervencionesGateway()
  );

  const [editando, setEditando] = useState<Intervencion | null>(null);
  const [aviso, setAviso] = useState("");

  const {
    datos: pagina,
    items: intervenciones,
    cargando,
    error: mensajeError,
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
    mensajeErrorDefecto: "Verifica tu conexión e inténtalo nuevamente.",
  });

  const hayFiltros = Boolean(q.trim() || desde || hasta);

  async function guardar(
    entrada: IntervencionEntrada,
    idEdicion: string | null
  ) {
    setAviso("");
    if (idEdicion && gateway.actualizar) {
      const actualizada = await gateway.actualizar(idEdicion, entrada);
      setAviso(
        `La intervención de tipo “${actualizada.tipo}” se actualizó correctamente.`
      );
    } else {
      const creada = await gateway.registrar(entrada);
      setAviso(
        `La intervención de tipo “${creada.tipo}” se registró correctamente.`
      );
    }
    setEditando(null);
    recargar();
  }

  function renderizarContenidoTabla() {
    if (cargando) {
      return (
        <output className="block" aria-label="Cargando intervenciones">
          <span className="sr-only">Cargando intervenciones…</span>
          <EsqueletoListado />
        </output>
      );
    }

    if (mensajeError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center px-6 py-12 text-center"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F0] text-[#D64545]">
            <ServerCrash size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#203B45]">
            No fue posible cargar las intervenciones
          </p>
          <p className="mt-1 max-w-sm text-sm text-[#718895]">{mensajeError}</p>
          <button
            type="button"
            onClick={recargar}
            className="mt-4 inline-flex items-center gap-2 border border-[#DCE5EA] px-4 py-2 text-xs font-semibold text-[#29434D] transition hover:bg-[#F6F9FB]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    if (intervenciones.length === 0) {
      return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F8F8] text-[#009EAD]">
            <ClipboardCheck size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#203B45]">
            {hayFiltros
              ? "No hay intervenciones con los filtros aplicados"
              : "Aún no hay intervenciones registradas"}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 border border-[#DCE5EA] px-4 py-2 text-xs font-semibold text-[#29434D] transition hover:bg-[#F6F9FB]"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-left text-xs text-[#29434D]">
            <caption className="sr-only">
              Historial de intervenciones sanitarias
            </caption>
            <thead>
              <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] font-semibold text-[#53636B]">
                <th scope="col" className="px-4 py-3">
                  Fecha
                </th>
                <th scope="col" className="px-3 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-4 py-3">
                  Descripción
                </th>
                {gateway.actualizar && (
                  <th scope="col" className="px-4 py-3">
                    Acción
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F4]">
              {intervenciones.map((item) => (
                <tr key={item.id} className="align-top hover:bg-[#FAFCFD]">
                  <td className="whitespace-nowrap px-4 py-3.5 font-medium text-[#164652]">
                    {formatearFecha(item.fecha)}
                  </td>
                  <td className="px-3 py-3.5">
                    <TipoBadge tipo={item.tipo} />
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm">{item.descripcion}</p>
                    {item.observaciones && (
                      <p className="mt-1 text-xs text-[#718895]">
                        <span className="font-medium">Observaciones: </span>
                        <span>{item.observaciones}</span>
                      </p>
                    )}
                  </td>
                  {gateway.actualizar && (
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(item);
                          enfocarFormulario();
                        }}
                        aria-label={`Editar intervención de ${item.tipo}`}
                        className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-[#008994] transition hover:bg-[#E6F9FA]"
                      >
                        <Pencil size={13} aria-hidden="true" />
                        <span>Editar</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul
          aria-label="Intervenciones registradas"
          className="space-y-3 p-3 md:hidden"
        >
          {intervenciones.map((item) => (
            <li key={item.id} className="border border-[#E4EBEF] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TipoBadge tipo={item.tipo} />
                <span className="text-xs text-[#718895]">
                  {formatearFecha(item.fecha)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#29434D]">{item.descripcion}</p>
              {item.observaciones && (
                <p className="mt-1 text-xs text-[#8297A1]">
                  <span className="font-medium">Observaciones: </span>
                  <span>{item.observaciones}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#164652]">
            Gestión de intervenciones
          </h1>
        </div>

        <button
          type="button"
          onClick={enfocarFormulario}
          className="flex items-center justify-center gap-2 bg-[#008994] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#00747E]"
        >
          <Plus size={15} aria-hidden="true" />
          <span>Registrar intervención</span>
        </button>
      </div>

      {aviso && (
        <output className="flex items-start gap-2 border-l-4 border-[#168052] bg-[#E9F7F0] p-3 text-sm text-[#23845A]">
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

      <FormularioIntervencion
        key={editando?.id ?? "nueva"}
        hoy={hoy}
        editando={editando}
        onGuardar={guardar}
        onCancelarEdicion={() => setEditando(null)}
      />

      <section
        aria-labelledby="titulo-listado"
        aria-busy={cargando}
        className="min-w-0 border-t-2 border-[#008994] bg-white shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-[#EEF2F4] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="titulo-listado"
              className="text-base font-bold text-[#164652]"
            >
              Historial de intervenciones ({pagina.total})
            </h2>
          </div>

          <BarraFiltrosServidor
            q={q}
            onQChange={setQ}
            placeholderQ="Tipo, descripción u observaciones…"
            ariaLabelQ="Buscar intervención"
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={limpiarFiltros}
          />
        </div>

        <div>{renderizarContenidoTabla()}</div>

        <ControlesPaginacion
          pagina={pagina}
          etiquetaItems="intervenciones"
          cargando={cargando}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Paginación de intervenciones"
        />
      </section>
    </div>
  );
}
