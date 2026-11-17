"use client";

import { useState,type SyntheticEvent } from "react";
import { CircleAlert,Info,LoaderCircle,Pencil,X } from "lucide-react";
import {
  albergueAFormulario,
  CAPACIDAD_MAXIMA,
  FORMULARIO_VACIO,
  validarAlbergue,
  type Albergue,
  type AlbergueFormulario,
  type CampoAlbergue,
  type ErroresAlbergue,
} from "@/layers/domain/albergues/albergue";
import {
  AlberguesError,
  type RegistrosAlbergueGlobal,
} from "@/layers/application/services/albergues-service";
import { EstadoBadge,RiesgoBadge } from "./insignias";
import { SelectorCoordenadasMapa } from "@/components/shared/SelectorCoordenadasMapa";
import type { ConsultaPaginada } from "@/layers/application/services/paginacion";

export type ModoPanel="consultar"|"editar"|"registrar";

interface AlberguePanelProps {
  readonly modo: ModoPanel;
  readonly albergue: Albergue|null;
  readonly registrosGlobales?: RegistrosAlbergueGlobal|null;
  readonly cargandoRegistros?: boolean;
  readonly consultaRegistros?: ConsultaPaginada;
  readonly onConsultaRegistrosChange?: (consulta: ConsultaPaginada) => void;
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
  if(!fecha) return "fecha no disponible";

  const [anio,mes,dia]=fecha.slice(0,10).split("-").map(Number);
  const meses=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

  if(!anio||!mes||!dia) return fecha;

  return `${dia} ${meses[mes-1]} ${anio}`;
}

function DetalleAlbergue({
  albergue,
  registros,
  cargandoRegistros,
  consultaRegistros,
  onConsultaRegistrosChange,
  puedeAdministrar,
  onEditar,
  onCerrar,
}: {
  readonly albergue: Albergue;
  readonly registros?: RegistrosAlbergueGlobal|null;
  readonly cargandoRegistros?: boolean;
  readonly consultaRegistros?: ConsultaPaginada;
  readonly onConsultaRegistrosChange?: (consulta: ConsultaPaginada) => void;
  readonly puedeAdministrar: boolean;
  readonly onEditar: () => void;
  readonly onCerrar: () => void;
}) {
  const primeraCondicion=registros?.condiciones.items[0];
  const primeraEnfermedad=registros?.enfermedades.items[0];
  const primeraIntervencion=registros?.intervenciones.items[0];
  const textoAgua=primeraCondicion?.aguaPotableDisponible? "disponible":"no disponible";
  const recuperados=primeraEnfermedad?.cantidadRecuperados;
  const textoRecuperados=recuperados==null? "":` · ${recuperados} recuperados`;

  function renderizarRegistros() {
    if(cargandoRegistros) {
      return <div className="space-y-2 pt-2">
        <span className="sr-only">Cargando registros del albergue…</span>
        <div className="h-4 w-3/4 animate-pulse bg-[#EAF1F3]" />
        <div className="h-4 w-2/3 animate-pulse bg-[#EAF1F3]" />
        <div className="h-4 w-1/2 animate-pulse bg-[#EAF1F3]" />
      </div>;
    }
    if(registros) {
      return <dl className="divide-y divide-[#EEF2F4] border-t border-[#EEF2F4]">
        <div className="py-2.5">
          <dt className="font-semibold text-[#164652]">
            Condiciones sanitarias ({registros.condiciones.total})
          </dt>
          <dd className="mt-0.5 text-[#53636B]">
            {primeraCondicion
              ? `${primeraCondicion.fecha}: Agua ${textoAgua
              } · ${primeraCondicion.banosDisponibles} baños · Higiene: ${primeraCondicion.estadoHigiene
              }`
              :"Sin registros sanitarios."}
          </dd>
        </div>

        <div className="py-2.5">
          <dt className="font-semibold text-[#164652]">
            Casos de enfermedades ({registros.enfermedades.total})
          </dt>
          <dd className="mt-0.5 text-[#53636B]">
            {primeraEnfermedad
              ? `${primeraEnfermedad.fecha}: ${primeraEnfermedad.enfermedad} (${primeraEnfermedad.cantidadCasosActivos} casos activos${textoRecuperados
              })`
              :"Sin casos registrados."}
          </dd>
        </div>

        <div className="py-2.5">
          <dt className="font-semibold text-[#164652]">
            Intervenciones ({registros.intervenciones.total})
          </dt>
          <dd className="mt-0.5 text-[#53636B]">
            {primeraIntervencion
              ? `${primeraIntervencion.tipo}: ${primeraIntervencion.descripcion}`
              :"Sin intervenciones registradas."}
          </dd>
        </div>
      </dl>;
    }
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF2F4] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-[#164652]">{albergue.nombre}</h2>
            <EstadoBadge activo={albergue.activo} />
          </div>
          <p className="mt-0.5 text-xs text-[#718895]">
            {albergue.codigo} · creado el {formatearFecha(albergue.creadoEn)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {puedeAdministrar&&albergue.activo&&(
            <button
              type="button"
              onClick={onEditar}
              className="inline-flex items-center gap-1.5 border border-[#DCE6EA] bg-white px-3 py-1.5 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
            >
              <Pencil size={13} aria-hidden="true" />
              <span>Editar</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar panel"
            className="p-1.5 text-[#53636B] transition hover:bg-[#F4F8FA]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <dl className="divide-y divide-[#EEF2F4] text-xs">
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-[#53636B]">Ubicación</dt>
            <dd className="text-right font-medium text-[#164652]">
              {albergue.municipio}, {albergue.departamento}
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-[#53636B]">Dirección</dt>
            <dd className="text-right font-medium text-[#164652]">{albergue.direccion}</dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-[#53636B]">Población / Capacidad</dt>
            <dd className="text-right font-medium text-[#164652]">
              {albergue.poblacionActual===null
                ? "Sin dato"
                :`${albergue.poblacionActual} personas`}{" "}
              / {albergue.capacidadInstalada} personas
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-[#53636B]">Nivel de riesgo</dt>
            <dd className="text-right font-medium text-[#164652]">
              <RiesgoBadge riesgo={albergue.riesgo} />
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-2.5">
            <dt className="text-[#53636B]">Administrador</dt>
            <dd className="text-right font-medium text-[#164652]">
              {albergue.administrador??"Sin asignar"}
            </dd>
          </div>
        </dl>

        {/* Registros sanitarios reportados */}
        <div className="space-y-2.5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-[#164652]">
              Registros reportados en este albergue
            </h3>
            {onConsultaRegistrosChange&&(
              <input
                type="search"
                aria-label="Filtrar registros del albergue"
                value={consultaRegistros?.q??""}
                onChange={(e) =>
                  onConsultaRegistrosChange({
                    ...consultaRegistros,
                    page: 1,
                    q: e.target.value,
                  })
                }
                placeholder="Filtrar registros…"
                className="h-7 border border-[#DCE6EA] bg-white px-2 text-xs text-[#164652] outline-none focus:border-[#008994]"
              />
            )}
          </div>

          {renderizarRegistros()}
        </div>
      </div>
    </div>
  );
}

const CONTROL=
  "h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-[#164652] outline-none transition placeholder:text-[#A5B2B8] focus:ring-2 disabled:bg-[#F8FAFB] disabled:text-[#718895]";

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
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-[#164652]">
        {etiqueta}
        {obligatorio&&(
          <span aria-hidden="true" className="text-[#C53030]"> *</span>
        )}
      </label>
      {children}
      {error? (
        <p id={`${id}-error`} className="mt-1 flex items-start gap-1 text-[11px] text-[#C53030]">
          <CircleAlert size={12} aria-hidden="true" className="mt-px shrink-0" />
          {error}
        </p>
      ):(
        ayuda&&<p id={`${id}-ayuda`} className="mt-1 text-[11px] text-[#718895]">{ayuda}</p>
      )}
    </div>
  );
}

const CAMPOS_ORDEN: CampoAlbergue[]=[
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
  readonly albergue: Albergue|null;
  readonly modo: "editar"|"registrar";
  readonly onGuardar: (formulario: AlbergueFormulario) => Promise<void>;
  readonly onCancelar: () => void;
}) {
  const [valores,setValores]=useState<AlbergueFormulario>(
    modo==="editar"&&albergue? albergueAFormulario(albergue):FORMULARIO_VACIO
  );
  const [errores,setErrores]=useState<ErroresAlbergue>({});
  const [intentado,setIntentado]=useState(false);
  const [guardando,setGuardando]=useState(false);
  const [errorServidor,setErrorServidor]=useState("");

  const prefijo=`alb-${modo}`;
  const esEdicion=modo==="editar";
  const textoAccion=esEdicion? "Guardar cambios":"Registrar";
  const textoEnviar=guardando? "Guardando…":textoAccion;

  function cambiar<K extends CampoAlbergue>(campo: K,valor: AlbergueFormulario[K]) {
    const siguientes={ ...valores,[campo]: valor };
    setValores(siguientes);

    if(intentado) {
      setErrores(validarAlbergue(siguientes));
    }
  }

  function cambiarCoordenadas(nuevaLat: string,nuevaLng: string) {
    const siguientes={ ...valores,latitud: nuevaLat,longitud: nuevaLng };
    setValores(siguientes);
    if(intentado) {
      setErrores(validarAlbergue(siguientes));
    }
  }

  function propiedades(campo: CampoAlbergue) {
    const error=errores[campo];
    const id=`${prefijo}-${campo}`;

    return {
      id,
      name: campo,
      "aria-invalid": error? true:undefined,
      "aria-describedby": error? `${id}-error`:undefined,
      className: `${CONTROL} ${error
          ? "border-[#C53030] focus:ring-[#C53030]/15"
          :"border-[#DCE6EA] focus:border-[#008994] focus:ring-[#008994]/15"
        }`,
    };
  }

  async function enviar(evento: SyntheticEvent<HTMLFormElement>) {
    evento.preventDefault();
    if(guardando) return;

    setIntentado(true);
    setErrorServidor("");

    const encontrados=validarAlbergue(valores);
    setErrores(encontrados);

    const primero=CAMPOS_ORDEN.find((campo) => encontrados[campo]);

    if(primero) {
      const idCampo=
        primero==="latitud"||primero==="longitud"
          ? `selector-${primero}`
          :`${prefijo}-${primero}`;
      document.getElementById(idCampo)?.focus();
      return;
    }

    setGuardando(true);

    try {
      await onGuardar(valores);
    } catch(error) {
      if(error instanceof AlberguesError) {
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
      <div className="flex items-start justify-between gap-3 border-b border-[#EEF2F4] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#164652]">
            {esEdicion? "Editar albergue":"Registrar albergue"}
          </h2>
          <p className="text-xs text-[#718895]">
            {esEdicion&&albergue
              ? `${albergue.codigo} · creado el ${formatearFecha(albergue.creadoEn)}`
              :"Completa los datos y selecciona el punto en el mapa para crear el centro"}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancelar}
          aria-label="Cerrar formulario"
          className="rounded-lg p-1.5 text-[#53636B] transition hover:bg-[#F4F8FA]"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {intentado&&Object.keys(errores).length>0&&!errorServidor&&(
        <p role="alert" className="text-xs font-medium text-[#C53030]">
          Revisa los campos marcados antes de continuar.
        </p>
      )}

      {errorServidor&&(
        <p role="alert" className="flex items-start gap-1.5 text-xs font-medium text-[#C53030]">
          <CircleAlert size={14} aria-hidden="true" className="mt-px shrink-0" />
          {errorServidor}
        </p>
      )}

      <fieldset disabled={guardando} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <legend className="sr-only">Datos del albergue</legend>

        <div className="space-y-3.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo id={`${prefijo}-capacidadInstalada`} etiqueta="Capacidad" obligatorio error={errores.capacidadInstalada}>
              <input
                {...propiedades("capacidadInstalada")}
                value={valores.capacidadInstalada}
                onChange={(e) => cambiar("capacidadInstalada",e.target.value)}
                placeholder="Ej. 450"
                inputMode="numeric"
                type="number"
                min={1}
                max={CAPACIDAD_MAXIMA}
              />
            </Campo>
          </div>

          <Campo id={`${prefijo}-nombre`} etiqueta="Nombre del albergue" obligatorio error={errores.nombre}>
            <input
              {...propiedades("nombre")}
              value={valores.nombre}
              onChange={(e) => cambiar("nombre",e.target.value)}
              placeholder="Ej. Albergue Municipal Norte"
              maxLength={120}
            />
          </Campo>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Campo id={`${prefijo}-departamento`} etiqueta="Departamento" obligatorio error={errores.departamento}>
              <input
                {...propiedades("departamento")}
                value={valores.departamento}
                onChange={(e) => cambiar("departamento",e.target.value)}
                placeholder="Ej. Risaralda"
                maxLength={60}
              />
            </Campo>
            <Campo id={`${prefijo}-municipio`} etiqueta="Municipio" obligatorio error={errores.municipio}>
              <input
                {...propiedades("municipio")}
                value={valores.municipio}
                onChange={(e) => cambiar("municipio",e.target.value)}
                placeholder="Ej. Pereira"
                maxLength={60}
              />
            </Campo>
          </div>

          <Campo id={`${prefijo}-direccion`} etiqueta="Dirección institucional" obligatorio error={errores.direccion}>
            <input
              {...propiedades("direccion")}
              value={valores.direccion}
              onChange={(e) => cambiar("direccion",e.target.value)}
              placeholder="Ej. Cra. 7 # 19-45, Centro"
              maxLength={160}
            />
          </Campo>
        </div>

        {/* Selector visual en el mapa */}
        <div>
          <SelectorCoordenadasMapa
            latitud={valores.latitud}
            longitud={valores.longitud}
            onChange={cambiarCoordenadas}
            errorLatitud={errores.latitud}
            errorLongitud={errores.longitud}
            disabled={guardando}
          />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF2F4] pt-4">
        <p className="flex items-center gap-1.5 text-[11px] text-[#718895]">
          <Info size={13} aria-hidden="true" className="shrink-0 text-[#008994]" />
          {esEdicion
            ? "La modificación quedará registrada en el sistema."
            :"La creación quedará registrada en el sistema."}
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={guardando}
            className="h-10 rounded-lg border border-[#DCE6EA] bg-white px-4 text-xs font-semibold text-[#164652] transition hover:bg-[#F8FAFB] disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#008994] px-5 text-xs font-semibold text-white transition hover:bg-[#00747E] disabled:cursor-wait disabled:opacity-80"
          >
            {guardando&&<LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
            {textoEnviar}
          </button>
        </div>
      </div>
    </form>
  );
}

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
  const desactivar=albergue.activo;

  if(!confirmando) {
    return (
      <div className="mt-4 flex justify-end border-t border-[#EEF2F4] pt-4">
        <button
          type="button"
          onClick={() => onConfirmandoChange(true)}
          className="h-9 rounded-lg border border-[#F5C9CB] px-4 text-xs font-semibold text-[#C53030] transition hover:bg-[#FDECEC]"
        >
          {desactivar? "Desactivar albergue":"Reactivar albergue"}
        </button>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="titulo-confirmacion"
      className="mt-4 border-t border-[#EEF2F4] pt-4"
    >
      <h3 id="titulo-confirmacion" className="text-xs font-bold text-[#C53030]">
        {desactivar? "Confirmar desactivación":"Confirmar reactivación"}
      </h3>
      <p className="mt-1 text-xs leading-4 text-[#53636B]">
        {desactivar
          ? `Se suspenderá el acceso operativo de ${albergue.nombre}. Los datos históricos permanecerán disponibles.`
          :`${albergue.nombre} volverá a estar disponible para su operación.`}
      </p>

      {error&&(
        <p role="alert" className="mt-2 text-xs font-semibold text-[#C53030]">
          {error}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onConfirmandoChange(false)}
          disabled={cambiando}
          className="h-9 rounded-lg border border-[#DCE6EA] bg-white px-4 text-xs font-semibold text-[#164652] disabled:opacity-60"
        >
          {desactivar? "Mantener activo":"Cancelar"}
        </button>
        <button
          type="button"
          onClick={() => onCambiarEstado(albergue)}
          disabled={cambiando}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#C53030] px-4 text-xs font-semibold text-white hover:bg-[#A8252B] disabled:opacity-80"
        >
          {cambiando&&<LoaderCircle size={14} aria-hidden="true" className="animate-spin" />}
          {desactivar? "Desactivar":"Reactivar"}
        </button>
      </div>
    </section>
  );
}

export function AlberguePanel({
  modo,
  albergue,
  registrosGlobales,
  cargandoRegistros,
  consultaRegistros,
  onConsultaRegistrosChange,
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
  const esFormulario=modo==="editar"||modo==="registrar";
  const mostrarPanel=modo==="registrar"||albergue!==null;

  if(!mostrarPanel) {
    return null;
  }

  function renderizarPanel() {
    if(modo==="registrar"||(modo==="editar"&&albergue)) {
      return <FormularioAlbergue
        key={`${modo}-${albergue?.id??"nuevo"}`}
        albergue={albergue}
        modo={modo}
        onGuardar={onGuardar}
        onCancelar={onCancelar}
      />;
    }
    if(albergue) {
      return <DetalleAlbergue
        albergue={albergue}
        registros={registrosGlobales}
        cargandoRegistros={cargandoRegistros}
        consultaRegistros={consultaRegistros}
        onConsultaRegistrosChange={onConsultaRegistrosChange}
        puedeAdministrar={puedeAdministrar}
        onEditar={() => onModoChange("editar")}
        onCerrar={onCancelar}
      />;
    }
    return null;
  }

  return (
    <aside
      id="panel-albergue"
      aria-label="Detalle y formulario del albergue"
      className="border-t-2 border-[#008994] bg-white p-6 shadow-xs"
    >
      {renderizarPanel()}

      {puedeAdministrar&&albergue?.activo&&(modo==="editar"||!esFormulario)&&(
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
