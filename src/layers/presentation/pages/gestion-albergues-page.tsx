"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { CheckCircle2, Lock, Plus, RefreshCw, X } from "lucide-react";
import {
  formularioAEntrada,
  type Albergue,
  type AlbergueFormulario,
} from "@/layers/domain/albergues/albergue";
import {
  AlberguesError,
  obtenerAlberguesGateway,
  type AlberguesGateway,
} from "@/layers/application/services/albergues-service";
import {
  leerToken,
  obtenerSesion,
  type Sesion,
} from "@/layers/application/services/sesion";
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

export const ALBERGUES_POR_PAGINA = 5;

interface GestionAlberguesPageProps {
  /** Permite inyectar datos y sesión en pruebas. */
  readonly gateway?: AlberguesGateway;
  readonly sesion?: Sesion;
}

const sinSuscripcion = () => () => {};

function useSesion(sesionFija?: Sesion): Sesion | undefined {
  const token = useSyncExternalStore(
    sinSuscripcion,
    () => leerToken() ?? "",
    () => undefined
  );

  return useMemo(() => {
    if (sesionFija) return sesionFija;
    if (token === undefined) return undefined;
    return obtenerSesion(token || null, Boolean(process.env.NEXT_PUBLIC_API_URL));
  }, [sesionFija, token]);
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replaceAll(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function filtrar(albergues: Albergue[], filtros: FiltrosAlbergues): Albergue[] {
  const busqueda = normalizar(filtros.busqueda);

  return albergues.filter((albergue) => {
    if (filtros.estado === "activos" && !albergue.activo) return false;
    if (filtros.estado === "inactivos" && albergue.activo) return false;
    if (filtros.riesgo !== "todos" && albergue.riesgo !== filtros.riesgo) return false;

    if (!busqueda) return true;

    return normalizar(
      `${albergue.nombre} ${albergue.codigo} ${albergue.municipio} ${albergue.departamento} ${albergue.administrador ?? ""}`
    ).includes(busqueda);
  });
}

function horaActual(): string {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date());
}

function Resumen({ albergues }: { readonly albergues: Albergue[] }) {
  const activos = albergues.filter((a) => a.activo).length;
  const poblacion = albergues.reduce((total, a) => total + (a.poblacionActual ?? 0), 0);
  const capacidad = albergues
    .filter((a) => a.poblacionActual !== null)
    .reduce((total, a) => total + a.capacidadInstalada, 0);
  const conAdministrador = albergues.filter((a) => a.administrador).length;
  const criticos = albergues.filter((a) => a.activo && a.riesgo === "critico").length;
  const ocupacion = capacidad > 0 ? Math.round((poblacion / capacidad) * 100) : 0;

  const tarjetas = [
    { etiqueta: "Registrados", valor: String(albergues.length), detalle: `${activos} activos` },
    { etiqueta: "Población", valor: poblacion.toLocaleString("es-CO"), detalle: `${ocupacion}% ocupación` },
    { etiqueta: "Con administrador", valor: String(conAdministrador), detalle: `${albergues.length - conAdministrador} pendientes` },
    { etiqueta: "Críticos", valor: String(criticos), detalle: "Intervención inmediata", alerta: criticos > 0 },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#E3EAEE] lg:grid-cols-4">
      {tarjetas.map((tarjeta) => (
        <div key={tarjeta.etiqueta}>
          <dt className={`text-[11px] ${tarjeta.alerta ? "text-[#CF343B]" : "text-[#53636B]"}`}>
            {tarjeta.etiqueta}
          </dt>
          <dd className={`mt-0.5 text-[13px] ${tarjeta.alerta ? "text-[#CF343B]" : "text-[#172126]"}`}>
            <span className="font-bold">{tarjeta.valor}</span>
            <span className="text-[12px]"> · {tarjeta.detalle}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AccesoRestringido() {
  return (
    <div role="alert" className="mx-auto mt-10 max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-[#E3EAEE]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF7E4] text-[#B77D00]">
        <Lock size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-bold text-[#172126]">Acceso restringido</h2>
      <p className="mt-2 text-[13px] text-[#53636B]">
        La gestión de albergues es exclusiva del Súper Administrador. Inicia sesión con una cuenta autorizada.
      </p>
      <Link
        href="/login"
        className="mt-5 inline-flex rounded-lg bg-[#00C3D0] px-4 py-2 text-[13px] font-semibold text-white"
      >
        Ir a iniciar sesión
      </Link>
    </div>
  );
}

export function GestionAlberguesPage({ gateway: gatewayInyectado, sesion: sesionFija }: GestionAlberguesPageProps) {
  const sesion = useSesion(sesionFija);
  const [gateway] = useState<AlberguesGateway>(
    () => gatewayInyectado ?? obtenerAlberguesGateway(leerToken)
  );

  const [albergues, setAlbergues] = useState<Albergue[]>([]);
  const [estadoCarga, setEstadoCarga] = useState<EstadoCarga>("cargando");
  const [mensajeError, setMensajeError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState("");
  const [intentoCarga, setIntentoCarga] = useState(0);

  const [filtros, setFiltros] = useState<FiltrosAlbergues>(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);

  const [modo, setModo] = useState<ModoPanel>("consultar");
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(null);
  const [confirmandoEstado, setConfirmandoEstado] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState("");
  const [aviso, setAviso] = useState("");

  const esSuperAdmin = sesion?.rol === "super_administrador";

  useEffect(() => {
    if (!esSuperAdmin) return;

    let vigente = true;

    gateway
      .listar()
      .then((datos) => {
        if (!vigente) return;
        setAlbergues(datos);
        setEstadoCarga("listo");
        setUltimaActualizacion(horaActual());
      })
      .catch((error: unknown) => {
        if (!vigente) return;
        setMensajeError(
          error instanceof AlberguesError
            ? error.message
            : "Verifica tu conexión e inténtalo nuevamente."
        );
        setEstadoCarga("error");
      });

    return () => {
      vigente = false;
    };
  }, [gateway, esSuperAdmin, intentoCarga]);

  const recargar = useCallback(() => {
    setEstadoCarga("cargando");
    setIntentoCarga((valor) => valor + 1);
  }, []);

  const filtrados = useMemo(() => filtrar(albergues, filtros), [albergues, filtros]);
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / ALBERGUES_POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * ALBERGUES_POR_PAGINA,
    paginaActual * ALBERGUES_POR_PAGINA
  );
  const seleccionado = albergues.find((a) => a.id === seleccionadoId) ?? null;

  function enfocarPanel() {
    if (globalThis.matchMedia?.("(max-width: 1023px)").matches) {
      document.getElementById("panel-albergue")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function abrir(albergue: Albergue | null, siguienteModo: ModoPanel, confirmar = false) {
    setSeleccionadoId(albergue?.id ?? seleccionadoId);
    setModo(siguienteModo);
    setConfirmandoEstado(confirmar);
    setErrorEstado("");
    setAviso("");
    enfocarPanel();
  }

  function reemplazar(actualizado: Albergue) {
    setAlbergues((lista) => {
      const existe = lista.some((a) => a.id === actualizado.id);
      return existe
        ? lista.map((a) => (a.id === actualizado.id ? actualizado : a))
        : [actualizado, ...lista];
    });
  }

  async function guardar(formulario: AlbergueFormulario) {
    const entrada = formularioAEntrada(formulario);

    if (modo === "editar" && seleccionado) {
      const actualizado = await gateway.actualizar(seleccionado.id, {
        ...entrada,
        activo: seleccionado.activo,
      });
      reemplazar(actualizado);
      setAviso(`Los cambios de “${actualizado.nombre}” se guardaron correctamente.`);
    } else {
      const creado = await gateway.crear(entrada);
      reemplazar(creado);
      setSeleccionadoId(creado.id);
      setFiltros(FILTROS_INICIALES);
      setPagina(1);
      setAviso(`El albergue “${creado.nombre}” se registró correctamente.`);
    }

    setModo("consultar");
  }

  async function cambiarEstado(albergue: Albergue) {
    setCambiandoEstado(true);
    setErrorEstado("");

    try {
      const actualizado = await gateway.cambiarEstado(albergue.id, !albergue.activo);
      reemplazar(actualizado);
      setConfirmandoEstado(false);
      setAviso(
        actualizado.activo
          ? `“${actualizado.nombre}” fue reactivado.`
          : `“${actualizado.nombre}” fue desactivado. Sus datos históricos siguen disponibles.`
      );
    } catch (error) {
      setErrorEstado(
        error instanceof AlberguesError
          ? error.message
          : "No fue posible cambiar el estado. Inténtalo nuevamente."
      );
    } finally {
      setCambiandoEstado(false);
    }
  }

  function cambiarFiltros(siguientes: FiltrosAlbergues) {
    setFiltros(siguientes);
    setPagina(1);
  }

  if (sesion === undefined) {
    return (
      <div role="status" className="p-8 text-center text-[13px] text-[#53636B]">
        Verificando sesión…
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-[#172126] sm:text-[28px]">Gestión de albergues</h1>
          <p className="mt-1 text-[13px] text-[#53636B]">
            Registro y administración de centros habilitados
          </p>
        </div>

        {esSuperAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => abrir(null, "registrar")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00C3D0] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#00AEB9]"
            >
              <Plus size={16} aria-hidden="true" />
              Registrar albergue
            </button>

            {ultimaActualizacion && (
              <button
                type="button"
                onClick={recargar}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-left transition hover:bg-white"
                aria-label={`Actualizar listado. Última actualización hoy a las ${ultimaActualizacion}`}
              >
                <RefreshCw size={15} aria-hidden="true" className="text-[#53636B]" />
                <span>
                  <span className="block text-[9px] uppercase tracking-wide text-[#829198]">Última actualización</span>
                  <span className="block text-[11px] font-semibold text-[#172126]">Hoy, {ultimaActualizacion}</span>
                </span>
              </button>
            )}
          </div>
        )}
      </header>

      {sesion.demostracion && esSuperAdmin && (
        <p className="mt-4 rounded-lg bg-[#FFF7E4] px-3 py-2 text-[12px] text-[#7A5300]">
          Modo demostración: se muestran datos de prueba porque la API de albergues aún no está configurada
          (<code>NEXT_PUBLIC_API_URL</code>).
        </p>
      )}

      {esSuperAdmin ? (
        <>
          {aviso && (
            <div role="status" className="mt-4 flex items-start gap-2 rounded-lg bg-[#E9F7F0] px-3 py-2.5 text-[13px] text-[#15784E]">
              <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
              <p className="flex-1">{aviso}</p>
              <button type="button" aria-label="Cerrar aviso" onClick={() => setAviso("")}>
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          )}

          {estadoCarga === "listo" && albergues.length > 0 && (
            <div className="mt-5">
              <Resumen albergues={albergues} />
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_384px]">
            <AlberguesLista
              estadoCarga={estadoCarga}
              mensajeError={mensajeError}
              totalRegistrados={albergues.length}
              totalActivos={albergues.filter((a) => a.activo).length}
              albergues={visibles}
              totalFiltrados={filtrados.length}
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              porPagina={ALBERGUES_POR_PAGINA}
              filtros={filtros}
              seleccionadoId={seleccionadoId}
              puedeAdministrar={esSuperAdmin}
              onFiltrosChange={cambiarFiltros}
              onPaginaChange={setPagina}
              onConsultar={(a) => abrir(a, "consultar")}
              onEditar={(a) => abrir(a, "editar")}
              onCambiarEstado={(a) => abrir(a, "consultar", true)}
              onReintentar={recargar}
              onRegistrar={() => abrir(null, "registrar")}
            />

            <AlberguePanel
              modo={modo}
              albergue={seleccionado}
              puedeAdministrar={esSuperAdmin}
              confirmandoEstado={confirmandoEstado}
              cambiandoEstado={cambiandoEstado}
              errorEstado={errorEstado}
              onModoChange={(m) => abrir(null, m)}
              onGuardar={guardar}
              onCancelar={() => setModo("consultar")}
              onConfirmandoEstadoChange={(valor) => {
                setConfirmandoEstado(valor);
                setErrorEstado("");
              }}
              onCambiarEstado={cambiarEstado}
            />
          </div>
        </>
      ) : (
        <AccesoRestringido />
      )}
    </div>
  );
}
