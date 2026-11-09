"use client";

import { useState, type SyntheticEvent } from "react";
import { CircleAlert, Info, LoaderCircle, MapPin, Tent } from "lucide-react";
import {
  albergueAFormulario,
  calcularOcupacion,
  CAPACIDAD_MAXIMA,
  FORMULARIO_VACIO,
  validarAlbergue,
  type Albergue,
  type AlbergueFormulario,
  type CampoAlbergue,
  type ErroresAlbergue,
} from "@/layers/domain/albergues/albergue";
import { AlberguesError } from "@/layers/application/services/albergues-service";
import { EstadoBadge, RiesgoBadge } from "./insignias";

export type ModoPanel = "consultar" | "editar" | "registrar";

interface AlberguePanelProps {
  readonly modo: ModoPanel;
  readonly albergue: Albergue | null;
  readonly puedeAdministrar: boolean;
  readonly confirmandoEstado: boolean;
  readonly cambiandoEstado: boolean;
  readonly errorEstado: string;
  readonly onModoChange: (modo: ModoPanel) => void;
  readonly onGuardar: (formulario: AlbergueFormulario) => Promise<void>;
  readonly onCancelar: () => void;
  readonly onConfirmandoEstadoChange: (confirmando: boolean) => void;
  readonly onCambiarEstado: (albergue: Albergue) => void;
}

function formatearFecha(fecha: string): string {
  if (!fecha) return "fecha no disponible";

  const [anio, mes, dia] = fecha.slice(0, 10).split("-").map(Number);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  if (!anio || !mes || !dia) return fecha;

  return `${dia} ${meses[mes - 1]} ${anio}`;
}

/* ----------------------------- Pestañas ----------------------------- */

function Pestanas({
  modo,
  hayAlbergue,
  puedeAdministrar,
  onModoChange,
}: {
  readonly modo: ModoPanel;
  readonly hayAlbergue: boolean;
  readonly puedeAdministrar: boolean;
  readonly onModoChange: (modo: ModoPanel) => void;
}) {
  const opciones: { modo: ModoPanel; etiqueta: string; deshabilitada: boolean }[] = [
    { modo: "consultar", etiqueta: "Consultar", deshabilitada: !hayAlbergue },
    ...(puedeAdministrar
      ? [
          { modo: "editar" as const, etiqueta: "Editar", deshabilitada: !hayAlbergue },
          { modo: "registrar" as const, etiqueta: "Registrar", deshabilitada: false },
        ]
      : []),
  ];

  return (
    <div role="tablist" aria-label="Acciones del albergue" className="grid auto-cols-fr grid-flow-col gap-2">
      {opciones.map((opcion) => (
        <button
          key={opcion.modo}
          type="button"
          role="tab"
          aria-selected={modo === opcion.modo}
          disabled={opcion.deshabilitada}
          onClick={() => onModoChange(opcion.modo)}
          className={`rounded-lg border py-2 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            modo === opcion.modo
              ? "border-[#00C3D0] bg-[#E6F9FA] text-[#008E99]"
              : "border-[#E3EAEE] bg-white text-[#53636B] hover:bg-[#F8FAFB]"
          }`}
        >
          {opcion.etiqueta}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Consultar ---------------------------- */

function Dato({ etiqueta, children }: { readonly etiqueta: string; readonly children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#F8FAFB] px-3 py-2.5">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#829198]">{etiqueta}</dt>
      <dd className="mt-1 text-[13px] text-[#172126]">{children}</dd>
    </div>
  );
}

function DetalleAlbergue({ albergue }: { readonly albergue: Albergue }) {
  const ocupacion = calcularOcupacion(albergue);

  return (
    <div>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E6F9FA] text-[#008E99]">
          <Tent size={20} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-6 text-[#172126]">{albergue.nombre}</h2>
          <p className="text-[12px] text-[#829198]">
            {albergue.codigo} · creado el {formatearFecha(albergue.creadoEn)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <EstadoBadge activo={albergue.activo} />
        <RiesgoBadge riesgo={albergue.riesgo} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="col-span-2">
          <Dato etiqueta="Ubicación">
            {albergue.municipio}, {albergue.departamento}
          </Dato>
        </div>
        <div className="col-span-2">
          <Dato etiqueta="Dirección">{albergue.direccion}</Dato>
        </div>
        <Dato etiqueta="Capacidad instalada">{albergue.capacidadInstalada} personas</Dato>
        <Dato etiqueta="Población actual">
          {albergue.poblacionActual === null
            ? "Sin datos"
            : `${albergue.poblacionActual} (${ocupacion}%)`}
        </Dato>
        <div className="col-span-2">
          <Dato etiqueta="Administrador responsable">
            {albergue.administrador ?? "Sin asignar"}
          </Dato>
        </div>
        <div className="col-span-2">
          <Dato etiqueta="Coordenadas">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" className="text-[#008E99]" />
              {albergue.latitud}, {albergue.longitud}
            </span>
          </Dato>
        </div>
      </dl>
    </div>
  );
}

/* ---------------------------- Formulario ---------------------------- */

const CONTROL =
  "h-11 w-full rounded-lg border bg-white px-3 text-[13px] text-[#172126] outline-none transition placeholder:text-[#A5B2B8] focus:ring-2 disabled:bg-[#F8FAFB] disabled:text-[#829198]";

function Campo({
  id,
  etiqueta,
  obligatorio,
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
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-semibold text-[#172126]">
        {etiqueta}
        {obligatorio && (
          <span aria-hidden="true" className="text-[#CF343B]"> *</span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-[11px] text-[#CF343B]">
          <CircleAlert size={12} aria-hidden="true" className="mt-px shrink-0" />
          {error}
        </p>
      ) : (
        ayuda && <p id={`${id}-ayuda`} className="mt-1 text-[11px] text-[#829198]">{ayuda}</p>
      )}
    </div>
  );
}

const CAMPOS_ORDEN: CampoAlbergue[] = [
  "codigo",
  "nombre",
  "departamento",
  "municipio",
  "direccion",
  "capacidadInstalada",
  "latitud",
  "longitud",
];

function FormularioAlbergue({
  albergue,
  modo,
  onGuardar,
  onCancelar,
}: {
  readonly albergue: Albergue | null;
  readonly modo: "editar" | "registrar";
  readonly onGuardar: (formulario: AlbergueFormulario) => Promise<void>;
  readonly onCancelar: () => void;
}) {
  const [valores, setValores] = useState<AlbergueFormulario>(
    modo === "editar" && albergue ? albergueAFormulario(albergue) : FORMULARIO_VACIO
  );
  const [errores, setErrores] = useState<ErroresAlbergue>({});
  const [intentado, setIntentado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  const prefijo = `alb-${modo}`;
  const esEdicion = modo === "editar";

  function cambiar<K extends CampoAlbergue>(campo: K, valor: AlbergueFormulario[K]) {
    const siguientes = { ...valores, [campo]: valor };
    setValores(siguientes);

    if (intentado) {
      setErrores(validarAlbergue(siguientes));
    }
  }

  function propiedades(campo: CampoAlbergue) {
    const error = errores[campo];
    const id = `${prefijo}-${campo}`;

    return {
      id,
      name: campo,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : undefined,
      className: `${CONTROL} ${
        error
          ? "border-[#CF343B] focus:ring-[#CF343B]/15"
          : "border-[#E3EAEE] focus:border-[#00C3D0] focus:ring-[#00C3D0]/20"
      }`,
    };
  }

  async function enviar(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (guardando) return;

    setIntentado(true);
    setErrorServidor("");

    const encontrados = validarAlbergue(valores);
    setErrores(encontrados);

    const primero = CAMPOS_ORDEN.find((campo) => encontrados[campo]);

    if (primero) {
      document.getElementById(`${prefijo}-${primero}`)?.focus();
      return;
    }

    setGuardando(true);

    try {
      await onGuardar(valores);
    } catch (error) {
      if (error instanceof AlberguesError) {
        setErrores(error.campos);
        setErrorServidor(error.message);
      } else {
        setErrorServidor("Ocurrió un error inesperado. Inténtalo nuevamente.");
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate aria-busy={guardando} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold leading-6 text-[#172126]">
          {esEdicion ? "Editar albergue" : "Registrar albergue"}
        </h2>
        <p className="text-[12px] text-[#829198]">
          {esEdicion && albergue
            ? `${albergue.codigo} · creado el ${formatearFecha(albergue.creadoEn)}`
            : "Completa los datos para crear un nuevo centro"}
        </p>
      </div>

      {intentado && Object.keys(errores).length > 0 && !errorServidor && (
        <p role="alert" className="rounded-lg bg-[#FDECEE] px-3 py-2 text-[12px] text-[#CF343B]">
          Revisa los campos marcados antes de continuar.
        </p>
      )}

      {errorServidor && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-[#FDECEE] px-3 py-2 text-[12px] text-[#CF343B]">
          <CircleAlert size={14} aria-hidden="true" className="mt-px shrink-0" />
          {errorServidor}
        </p>
      )}

      <fieldset disabled={guardando} className="space-y-4">
        <legend className="sr-only">Datos del albergue</legend>

        <Campo
          id={`${prefijo}-codigo`}
          etiqueta="Código del albergue"
          obligatorio
          error={errores.codigo}
          ayuda={esEdicion ? undefined : "Identificador único. Ej: ALB-PER-010"}
        >
          <input
            {...propiedades("codigo")}
            value={valores.codigo}
            onChange={(e) => cambiar("codigo", e.target.value.toUpperCase())}
            placeholder="Ej. ALB-PER-010"
            maxLength={20}
            autoComplete="off"
          />
        </Campo>

        <Campo id={`${prefijo}-nombre`} etiqueta="Nombre del albergue" obligatorio error={errores.nombre}>
          <input
            {...propiedades("nombre")}
            value={valores.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            placeholder="Ej. Albergue Municipal Norte"
            maxLength={120}
          />
        </Campo>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo id={`${prefijo}-departamento`} etiqueta="Departamento" obligatorio error={errores.departamento}>
            <input
              {...propiedades("departamento")}
              value={valores.departamento}
              onChange={(e) => cambiar("departamento", e.target.value)}
              placeholder="Ej. Risaralda"
              maxLength={60}
            />
          </Campo>
          <Campo id={`${prefijo}-municipio`} etiqueta="Municipio" obligatorio error={errores.municipio}>
            <input
              {...propiedades("municipio")}
              value={valores.municipio}
              onChange={(e) => cambiar("municipio", e.target.value)}
              placeholder="Ej. Pereira"
              maxLength={60}
            />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Campo id={`${prefijo}-capacidadInstalada`} etiqueta="Capacidad" obligatorio error={errores.capacidadInstalada}>
            <input
              {...propiedades("capacidadInstalada")}
              value={valores.capacidadInstalada}
              onChange={(e) => cambiar("capacidadInstalada", e.target.value)}
              placeholder="Ej. 450"
              inputMode="numeric"
              type="number"
              min={1}
              max={CAPACIDAD_MAXIMA}
            />
          </Campo>
          <Campo id={`${prefijo}-activo`} etiqueta="Estado" ayuda={esEdicion ? "Cámbialo con Desactivar/Reactivar" : undefined}>
            <select
              {...propiedades("activo")}
              value={valores.activo ? "activo" : "inactivo"}
              onChange={(e) => cambiar("activo", e.target.value === "activo")}
              disabled={esEdicion}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </Campo>
        </div>

        <Campo id={`${prefijo}-direccion`} etiqueta="Dirección institucional" obligatorio error={errores.direccion}>
          <input
            {...propiedades("direccion")}
            value={valores.direccion}
            onChange={(e) => cambiar("direccion", e.target.value)}
            placeholder="Ej. Cra. 7 # 19-45, Centro"
            maxLength={160}
          />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo id={`${prefijo}-latitud`} etiqueta="Latitud" obligatorio error={errores.latitud}>
            <input
              {...propiedades("latitud")}
              value={valores.latitud}
              onChange={(e) => cambiar("latitud", e.target.value)}
              placeholder="Ej. 4.8143"
              inputMode="decimal"
            />
          </Campo>
          <Campo id={`${prefijo}-longitud`} etiqueta="Longitud" obligatorio error={errores.longitud}>
            <input
              {...propiedades("longitud")}
              value={valores.longitud}
              onChange={(e) => cambiar("longitud", e.target.value)}
              placeholder="Ej. -75.6946"
              inputMode="decimal"
            />
          </Campo>
        </div>

        <div className="rounded-lg bg-[#F8FAFB] px-3 py-2.5">
          <p className="text-[12px] font-semibold text-[#172126]">Administrador responsable</p>
          <p className="mt-1 text-[12px] text-[#53636B]">
            {esEdicion && albergue?.administrador
              ? albergue.administrador
              : "Sin asignar"}
            <span className="block text-[11px] text-[#829198]">
              La asignación se gestiona desde el módulo Asignaciones.
            </span>
          </p>
        </div>
      </fieldset>

      <p className="flex items-center gap-2 rounded-lg bg-[#F8FAFB] px-3 py-2.5 text-[11px] text-[#53636B]">
        <Info size={14} aria-hidden="true" className="shrink-0 text-[#008E99]" />
        {esEdicion
          ? "La modificación quedará registrada en la bitácora global."
          : "La creación quedará registrada en la bitácora global."}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
          className="h-11 rounded-lg border border-[#E3EAEE] bg-white text-[13px] font-semibold text-[#172126] transition hover:bg-[#F8FAFB] disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={guardando}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00C3D0] text-[13px] font-semibold text-white transition hover:bg-[#00AEB9] disabled:cursor-wait disabled:opacity-80"
        >
          {guardando && <LoaderCircle size={15} aria-hidden="true" className="animate-spin" />}
          {guardando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Registrar"}
        </button>
      </div>
    </form>
  );
}

/* --------------------------- Cambiar estado -------------------------- */

function ZonaEstado({
  albergue,
  confirmando,
  cambiando,
  error,
  onConfirmandoChange,
  onCambiarEstado,
}: {
  readonly albergue: Albergue;
  readonly confirmando: boolean;
  readonly cambiando: boolean;
  readonly error: string;
  readonly onConfirmandoChange: (confirmando: boolean) => void;
  readonly onCambiarEstado: (albergue: Albergue) => void;
}) {
  const desactivar = albergue.activo;

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => onConfirmandoChange(true)}
        className={`mt-4 h-10 w-full rounded-lg border text-[13px] font-semibold transition ${
          desactivar
            ? "border-[#F5C9CB] text-[#CF343B] hover:bg-[#FDEEEE]"
            : "border-[#BDEEF1] text-[#008E99] hover:bg-[#E6F9FA]"
        }`}
      >
        {desactivar ? "Desactivar albergue" : "Reactivar albergue"}
      </button>
    );
  }

  return (
    <section
      aria-labelledby="titulo-confirmacion"
      className={`mt-4 rounded-lg border-l-4 p-4 ${
        desactivar ? "border-[#E65353] bg-[#FDEEEE]" : "border-[#00C3D0] bg-[#E6F9FA]"
      }`}
    >
      <h3 id="titulo-confirmacion" className="text-[13px] font-bold text-[#172126]">
        {desactivar ? "Confirmar desactivación" : "Confirmar reactivación"}
      </h3>
      <p className="mt-1 text-[11px] leading-4 text-[#53636B]">
        {desactivar
          ? `Se suspenderá el acceso operativo de ${albergue.nombre}. Los datos históricos permanecerán disponibles.`
          : `${albergue.nombre} volverá a estar disponible para su operación y seguimiento.`}
      </p>

      {error && (
        <p role="alert" className="mt-2 text-[11px] font-semibold text-[#CF343B]">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onConfirmandoChange(false)}
          disabled={cambiando}
          className="h-10 rounded-lg border border-[#E3EAEE] bg-white px-4 text-[13px] font-semibold text-[#172126] disabled:opacity-60"
        >
          {desactivar ? "Mantener activo" : "Cancelar"}
        </button>
        <button
          type="button"
          onClick={() => onCambiarEstado(albergue)}
          disabled={cambiando}
          className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-[13px] font-semibold text-white disabled:cursor-wait disabled:opacity-80 ${
            desactivar ? "bg-[#E65353] hover:bg-[#D94848]" : "bg-[#00C3D0] hover:bg-[#00AEB9]"
          }`}
        >
          {cambiando && <LoaderCircle size={15} aria-hidden="true" className="animate-spin" />}
          {desactivar ? "Desactivar" : "Reactivar"}
        </button>
      </div>
    </section>
  );
}

/* ------------------------------- Panel ------------------------------ */

export function AlberguePanel({
  modo,
  albergue,
  puedeAdministrar,
  confirmandoEstado,
  cambiandoEstado,
  errorEstado,
  onModoChange,
  onGuardar,
  onCancelar,
  onConfirmandoEstadoChange,
  onCambiarEstado,
}: AlberguePanelProps) {
  const esFormulario = modo === "editar" || modo === "registrar";

  function contenido() {
    if (modo === "registrar" || (modo === "editar" && albergue)) {
      return (
        <FormularioAlbergue
          key={`${modo}-${albergue?.id ?? "nuevo"}`}
          albergue={albergue}
          modo={modo}
          onGuardar={onGuardar}
          onCancelar={onCancelar}
        />
      );
    }

    if (albergue) {
      return <DetalleAlbergue albergue={albergue} />;
    }

    return (
      <div className="flex flex-col items-center py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E6F9FA] text-[#008E99]">
          <Tent size={22} aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-semibold text-[#172126]">Selecciona un albergue</p>
        <p className="mt-1 text-[12px] text-[#53636B]">
          Elige un albergue del listado para consultar su información
          {puedeAdministrar ? " o regístralo con la pestaña Registrar." : "."}
        </p>
      </div>
    );
  }

  return (
    <aside
      id="panel-albergue"
      aria-label="Detalle y formulario del albergue"
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E3EAEE] sm:p-5 lg:sticky lg:top-6"
    >
      <Pestanas
        modo={modo}
        hayAlbergue={albergue !== null}
        puedeAdministrar={puedeAdministrar}
        onModoChange={onModoChange}
      />

      <div className="mt-5">{contenido()}</div>

      {puedeAdministrar && albergue && (modo === "editar" || !esFormulario) && (
        <ZonaEstado
          albergue={albergue}
          confirmando={confirmandoEstado}
          cambiando={cambiandoEstado}
          error={errorEstado}
          onConfirmandoChange={onConfirmandoEstadoChange}
          onCambiarEstado={onCambiarEstado}
        />
      )}
    </aside>
  );
}
