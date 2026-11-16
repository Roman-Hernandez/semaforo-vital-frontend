"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ClipboardPlus,
  Layers,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
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
  ordenarIntervenciones,
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

type EstadoCarga = "cargando" | "listo" | "error";

interface IntervencionesPageProps {
  /** Permite inyectar datos en pruebas. */
  readonly gateway?: IntervencionesGateway;
  readonly modoDemostracion?: boolean;
  readonly hoy?: string;
}

const CAMPOS_ORDEN: CampoIntervencion[] = ["tipo", "descripcion", "fecha", "observaciones"];

const CONTROL_BASE =
  "w-full rounded-lg border bg-white px-3 text-sm text-[#203B45] outline-none transition placeholder:text-[#9AABB3] focus:ring-2";

function claseControl(error?: string): string {
  return `${CONTROL_BASE} ${
    error
      ? "border-[#D64545] focus:ring-[#D64545]/15"
      : "border-[#DCE5EA] focus:border-[#00B9C7] focus:ring-[#00B9C7]/20"
  }`;
}

function restarDias(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const resultado = new Date(Date.UTC(anio, mes - 1, dia - dias));
  return resultado.toISOString().slice(0, 10);
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function contarRegistros(cantidad: number): string {
  if (cantidad === 0) return "Sin registros";
  return cantidad === 1 ? "1 registro" : `${cantidad} registros`;
}

function enfocarFormulario() {
  document.getElementById("nueva-intervencion")?.scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("intervencion-tipo")?.focus({ preventScroll: true });
}

/* ------------------------------ Resumen ----------------------------- */

function calcularResumen(intervenciones: readonly Intervencion[], hoy: string) {
  const inicioMes = `${hoy.slice(0, 7)}-01`;
  const hace7Dias = restarDias(hoy, 6);
  const conteo = new Map<string, number>();

  for (const item of intervenciones) {
    conteo.set(item.tipo, (conteo.get(item.tipo) ?? 0) + 1);
  }

  let tipoFrecuente = "—";
  let maximo = 0;

  for (const [tipo, cantidad] of conteo) {
    if (cantidad > maximo) {
      tipoFrecuente = tipo;
      maximo = cantidad;
    }
  }

  return {
    total: intervenciones.length,
    esteMes: intervenciones.filter((i) => i.fecha >= inicioMes).length,
    ultimaSemana: intervenciones.filter((i) => i.fecha >= hace7Dias).length,
    tipoFrecuente,
    tipoFrecuenteCantidad: maximo,
  };
}

function Resumen({
  intervenciones,
  hoy,
}: {
  readonly intervenciones: readonly Intervencion[];
  readonly hoy: string;
}) {
  const resumen = calcularResumen(intervenciones, hoy);

  const tarjetas = [
    { titulo: "Intervenciones totales", valor: String(resumen.total), detalle: "Acciones registradas", icono: ClipboardCheck },
    { titulo: "Este mes", valor: String(resumen.esteMes), detalle: "Desde el día 1", icono: CalendarDays },
    { titulo: "Últimos 7 días", valor: String(resumen.ultimaSemana), detalle: "Acciones recientes", icono: CheckCircle2 },
    {
      titulo: "Tipo más frecuente",
      valor: resumen.tipoFrecuente,
      detalle: contarRegistros(resumen.tipoFrecuenteCantidad),
      icono: Layers,
    },
  ];

  return (
    <section aria-label="Resumen de intervenciones" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {tarjetas.map((tarjeta) => {
        const Icono = tarjeta.icono;

        return (
          <article key={tarjeta.titulo} className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-xs font-medium text-[#718895] sm:text-sm">{tarjeta.titulo}</h2>
              <Icono size={18} aria-hidden="true" className="shrink-0 text-[#009EAD]" />
            </div>
            <p className="mt-2 truncate text-lg font-semibold text-[#203B45] sm:text-2xl">{tarjeta.valor}</p>
            <p className="mt-0.5 text-xs text-[#8297A1]">{tarjeta.detalle}</p>
          </article>
        );
      })}
    </section>
  );
}

/* ----------------------------- Formulario ---------------------------- */

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
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#29434D]">
        <span>{etiqueta}</span>
        {obligatorio && (
          <span aria-hidden="true" className="text-[#D64545]"> *</span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-xs text-[#D64545]">
          <CircleAlert size={13} aria-hidden="true" className="mt-px shrink-0" />
          <span>{error}</span>
        </p>
      )}
      {!error && ayuda && (
        <p id={`${id}-ayuda`} className="mt-1 text-xs text-[#8297A1]">{ayuda}</p>
      )}
    </div>
  );
}

function FormularioIntervencion({
  hoy,
  onRegistrar,
}: {
  readonly hoy: string;
  readonly onRegistrar: (entrada: IntervencionEntrada) => Promise<void>;
}) {
  const [valores, setValores] = useState<IntervencionEntrada>(INTERVENCION_VACIA);
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
      await onRegistrar(valores);
      limpiar();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrores(error.campos);
        setErrorServidor(error.message);
      } else {
        setErrorServidor("No fue posible registrar la intervención. Inténtalo nuevamente.");
      }
    } finally {
      setGuardando(false);
    }
  }

  const hayErroresCampo = intentado && Object.keys(errores).length > 0 && !errorServidor;

  return (
    <aside
      id="nueva-intervencion"
      aria-labelledby="titulo-formulario"
      className="rounded-xl border border-[#E4EBEF] bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6"
    >
      <h2 id="titulo-formulario" className="flex items-center gap-2 text-lg font-semibold text-[#203B45]">
        <ClipboardPlus size={20} aria-hidden="true" className="text-[#009EAD]" />
        <span>Nueva intervención</span>
      </h2>
      <p className="mt-1 text-sm text-[#718895]">
        Registra una acción sanitaria ya realizada en tu albergue.
      </p>

      <form onSubmit={enviar} noValidate aria-busy={guardando} className="mt-4 space-y-4">
        {hayErroresCampo && (
          <p role="alert" className="rounded-lg bg-[#FFF0F0] px-3 py-2 text-xs text-[#C53030]">
            Revisa los campos marcados antes de guardar.
          </p>
        )}

        {errorServidor && (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-[#FFF0F0] px-3 py-2 text-xs text-[#C53030]">
            <CircleAlert size={14} aria-hidden="true" className="mt-px shrink-0" />
            <span>{errorServidor}</span>
          </p>
        )}

        <fieldset disabled={guardando} className="space-y-4">
          <legend className="sr-only">Datos de la intervención</legend>

          <Campo id="intervencion-tipo" etiqueta="Tipo de intervención" obligatorio error={errores.tipo}>
            <select
              {...atributos("tipo")}
              value={valores.tipo}
              onChange={(e) => cambiar("tipo", e.target.value)}
              className={`${claseControl(errores.tipo)} h-11`}
            >
              <option value="">Selecciona una categoría</option>
              {TIPOS_INTERVENCION.map((tipo) => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </Campo>

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
              rows={4}
              maxLength={DESCRIPCION_MAXIMA + 50}
              className={`${claseControl(errores.descripcion)} resize-y py-2.5`}
            />
          </Campo>

          <Campo id="intervencion-fecha" etiqueta="Fecha de realización" obligatorio error={errores.fecha}>
            <input
              {...atributos("fecha")}
              type="date"
              value={valores.fecha}
              max={hoy}
              onChange={(e) => cambiar("fecha", e.target.value)}
              className={`${claseControl(errores.fecha)} h-11`}
            />
          </Campo>

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
              className={`${claseControl(errores.observaciones)} resize-y py-2.5`}
            />
          </Campo>
        </fieldset>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-3 text-sm font-semibold text-white transition hover:bg-[#009EAD] disabled:cursor-wait disabled:opacity-80"
          >
            {guardando && <LoaderCircle size={15} aria-hidden="true" className="animate-spin" />}
            <span className="whitespace-nowrap">{guardando ? "Guardando…" : "Guardar intervención"}</span>
          </button>
          <button
            type="button"
            onClick={limpiar}
            disabled={guardando}
            className="h-11 rounded-lg border border-[#DCE5EA] bg-white px-4 text-sm font-semibold text-[#29434D] transition hover:bg-[#F6F9FB] disabled:opacity-60"
          >
            Cancelar
          </button>
        </div>
      </form>
    </aside>
  );
}

/* ------------------------------- Listado ----------------------------- */

function EsqueletoListado() {
  return (
    <span aria-hidden="true" className="block divide-y divide-[#EEF2F4]">
      {[1, 2, 3, 4].map((fila) => (
        <span key={fila} className="flex animate-pulse items-center gap-4 px-4 py-4">
          <span className="block h-3 w-24 rounded bg-[#EEF2F4]" />
          <span className="block h-3 flex-1 rounded bg-[#EEF2F4]" />
          <span className="hidden h-3 w-20 rounded bg-[#EEF2F4] sm:block" />
        </span>
      ))}
    </span>
  );
}

function TipoBadge({ tipo }: { readonly tipo: string }) {
  return (
    <span className="inline-flex whitespace-nowrap rounded-full bg-[#E4F8F8] px-2.5 py-1 text-xs font-medium text-[#007F8A]">
      {tipo}
    </span>
  );
}

function Listado({
  estadoCarga,
  mensajeError,
  intervenciones,
  onReintentar,
}: {
  readonly estadoCarga: EstadoCarga;
  readonly mensajeError: string;
  readonly intervenciones: readonly Intervencion[];
  readonly onReintentar: () => void;
}) {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("");
  const [desde, setDesde] = useState("");

  const filtradas = useMemo(() => {
    const texto = normalizar(busqueda);

    return intervenciones.filter(
      (item) =>
        (!tipo || item.tipo === tipo) &&
        (!desde || item.fecha >= desde) &&
        (!texto || normalizar(`${item.tipo} ${item.descripcion} ${item.observaciones}`).includes(texto))
    );
  }, [intervenciones, busqueda, tipo, desde]);

  const hayFiltros = Boolean(busqueda || tipo || desde);

  function limpiarFiltros() {
    setBusqueda("");
    setTipo("");
    setDesde("");
  }

  function contenido() {
    if (estadoCarga === "cargando") {
      return (
        <output className="block" aria-label="Cargando intervenciones">
          <span className="sr-only">Cargando intervenciones…</span>
          <EsqueletoListado />
        </output>
      );
    }

    if (estadoCarga === "error") {
      return (
        <div role="alert" className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0F0] text-[#D64545]">
            <ServerCrash size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#203B45]">No fue posible cargar las intervenciones</p>
          <p className="mt-1 max-w-sm text-sm text-[#718895]">{mensajeError}</p>
          <button
            type="button"
            onClick={onReintentar}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#DCE5EA] px-4 py-2 text-sm font-semibold text-[#29434D] transition hover:bg-[#F6F9FB]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    if (filtradas.length === 0) {
      return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E4F8F8] text-[#009EAD]">
            <ClipboardCheck size={22} aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-[#203B45]">
            {hayFiltros ? "No hay intervenciones con los filtros aplicados" : "Aún no hay intervenciones registradas"}
          </p>
          <p className="mt-1 max-w-sm text-sm text-[#718895]">
            {hayFiltros
              ? "Prueba con otro texto, tipo o fecha."
              : "Usa el formulario para registrar la primera acción sanitaria del albergue."}
          </p>
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 rounded-lg border border-[#DCE5EA] px-4 py-2 text-sm font-semibold text-[#29434D] transition hover:bg-[#F6F9FB]"
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
          <table className="w-full min-w-[640px] text-left text-sm text-[#29434D]">
            <caption className="sr-only">Historial de intervenciones sanitarias</caption>
            <thead>
              <tr className="bg-[#F6F9FB] text-xs text-[#718895]">
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-3 py-3 font-medium">Tipo</th>
                <th scope="col" className="px-4 py-3 font-medium">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF2F4]">
              {filtradas.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3.5">{formatearFecha(item.fecha)}</td>
                  <td className="px-3 py-3.5"><TipoBadge tipo={item.tipo} /></td>
                  <td className="px-4 py-3.5">
                    <p>{item.descripcion}</p>
                    {item.observaciones && (
                      <p className="mt-1 text-xs text-[#8297A1]">
                        <span className="font-medium">Observaciones: </span>
                        <span>{item.observaciones}</span>
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul aria-label="Intervenciones registradas" className="space-y-3 p-3 md:hidden">
          {filtradas.map((item) => (
            <li key={item.id} className="rounded-xl border border-[#E4EBEF] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TipoBadge tipo={item.tipo} />
                <span className="text-xs text-[#718895]">{formatearFecha(item.fecha)}</span>
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

        <p className="border-t border-[#EEF2F4] px-4 py-3 text-xs text-[#8297A1]">
          Mostrando {filtradas.length} de {intervenciones.length} intervenciones
        </p>
      </>
    );
  }

  return (
    <section
      aria-labelledby="titulo-listado"
      aria-busy={estadoCarga === "cargando"}
      className="min-w-0 rounded-xl border border-[#E4EBEF] bg-white shadow-sm"
    >
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="titulo-listado" className="text-lg font-semibold text-[#203B45]">
            Historial de intervenciones
          </h2>
          <label className="relative sm:w-64">
            <span className="sr-only">Buscar intervención</span>
            <Search size={15} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8297A1]" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar intervención"
              className={`${claseControl()} h-10 pl-9`}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-[#29434D]">
            <span>Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className={`${claseControl()} mt-1 h-10`}>
              <option value="">Todos los tipos</option>
              {TIPOS_INTERVENCION.map((opcion) => (
                <option key={opcion} value={opcion}>{opcion}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-[#29434D]">
            <span>Desde la fecha</span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className={`${claseControl()} mt-1 h-10`}
            />
          </label>
        </div>
      </div>

      <div className="border-t border-[#EEF2F4]">{contenido()}</div>
    </section>
  );
}

/* -------------------------------- Página ----------------------------- */

export function IntervencionesPage({
  gateway: gatewayInyectado,
  modoDemostracion = !process.env.NEXT_PUBLIC_API_URL,
  hoy = hoyEnBogota(),
}: IntervencionesPageProps) {
  const [gateway] = useState<IntervencionesGateway>(() => gatewayInyectado ?? obtenerIntervencionesGateway());
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>("cargando");
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    let vigente = true;

    gateway
      .listar()
      .then((datos) => {
        if (!vigente) return;
        setIntervenciones(ordenarIntervenciones(datos));
        setEstadoCarga("listo");
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        setMensajeError(error instanceof ApiError ? error.message : "Verifica tu conexión e inténtalo nuevamente.");
        setEstadoCarga("error");
      });

    return () => {
      vigente = false;
    };
  }, [gateway, intento]);

  function reintentar() {
    setEstadoCarga("cargando");
    setIntento((valor) => valor + 1);
  }

  async function registrar(entrada: IntervencionEntrada) {
    setAviso("");
    const creada = await gateway.registrar(entrada);
    setIntervenciones((lista) => ordenarIntervenciones([creada, ...lista]));
    setAviso(`La intervención de tipo “${creada.tipo}” se registró correctamente.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs text-[#8297A1]">Mi albergue / Intervenciones</p>
          <h1 className="text-2xl font-semibold text-[#203B45]">Gestión de intervenciones</h1>
          <p className="mt-1 text-sm text-[#718895]">
            Registra y consulta las acciones sanitarias realizadas en tu albergue.
          </p>
        </div>

        <button
          type="button"
          onClick={enfocarFormulario}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#00B9C7] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#009EAD]"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Registrar intervención</span>
        </button>
      </div>

      {modoDemostracion && (
        <p className="rounded-lg bg-[#FFF7E4] px-3 py-2 text-xs text-[#7A5300]">
          Datos demostrativos: la API de intervenciones aún no está configurada (<code>NEXT_PUBLIC_API_URL</code>).
        </p>
      )}

      {aviso && (
        <output className="flex items-start gap-2 rounded-lg border border-[#CDEBDD] bg-[#E9F7F0] p-3 text-sm text-[#23845A]">
          <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
          <span className="flex-1">{aviso}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso("")}>
            <X size={15} aria-hidden="true" />
          </button>
        </output>
      )}

      {estadoCarga === "listo" && <Resumen intervenciones={intervenciones} hoy={hoy} />}

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Listado
          estadoCarga={estadoCarga}
          mensajeError={mensajeError}
          intervenciones={intervenciones}
          onReintentar={reintentar}
        />
        <FormularioIntervencion hoy={hoy} onRegistrar={registrar} />
      </div>
    </div>
  );
}
