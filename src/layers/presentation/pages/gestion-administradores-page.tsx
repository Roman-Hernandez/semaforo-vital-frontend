"use client";

import { useEffect,useMemo,useRef,useState,type SyntheticEvent } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Pencil,
  Plus,
  RefreshCw,
  UserCog,
  UserPlus,
  X,
} from "lucide-react";
import {
  obtenerAdministradoresGateway,
  type Administrador,
  type AdministradoresGateway,
} from "@/layers/application/services/administradores-service";
import {
  obtenerAlberguesGateway,
  type AlberguesGateway,
} from "@/layers/application/services/albergues-service";
import {
  paginaVacia,
  type ConsultaPaginada,
  type Page,
} from "@/layers/application/services/paginacion";
import { leerToken } from "@/layers/application/services/sesion";
import {
  useListadoPaginado,
  useValorDebounced,
} from "@/layers/presentation/hooks/use-listado-paginado";
import { EstadoBadge } from "@/layers/presentation/components/albergues/insignias";
import {
  BarraFiltrosServidor,
  ControlesPaginacion,
} from "@/components/shared/ControlesPaginacion";
import { SkeletonBloque } from "@/components/shared/Skeleton";

export interface AlbergueResumen {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
}

export interface GestionAdministradoresPageProps {
  readonly gateway?: AdministradoresGateway;
  readonly alberguesGateway?: Pick<AlberguesGateway,"listar"|"obtener">;
  readonly listarAlbergues?: (
    consulta?: ConsultaPaginada
  ) => Promise<Page<AlbergueResumen>|AlbergueResumen[]>;
}

const INPUT_CLS=
  "h-10 w-full border border-[#DCE6EA] bg-white px-3 text-sm text-[#164652] outline-none transition focus:border-[#008994]";

export function GestionAdministradoresPage({
  gateway: gatewayInyectado,
  alberguesGateway: alberguesGatewayInyectado,
  listarAlbergues: listarAlberguesInyectado,
}: GestionAdministradoresPageProps={}) {
  const [gateway]=useState<AdministradoresGateway>(
    () => gatewayInyectado??obtenerAdministradoresGateway()
  );
  const [alberguesGw]=useState<Pick<AlberguesGateway,"listar"|"obtener">>(
    () => alberguesGatewayInyectado??obtenerAlberguesGateway(leerToken)
  );

  const [filtroEstadoAdmin,setFiltroEstadoAdmin]=useState<
    "todos"|"activos"|"inactivos"
  >("todos");

  function valorFiltroActivo() {
    if(filtroEstadoAdmin==="activos") { return true; }
    if(filtroEstadoAdmin==="inactivos") { return false; }
    return undefined;
  }

  const {
    datos: paginaAdmins,
    items: administradores,
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
    fetcher: (consulta) =>
      gateway.listar({
        ...consulta,
        activo:
          valorFiltroActivo(),
      }),
    claveExtra: filtroEstadoAdmin,
    sincronizarUrl: true,
    mensajeErrorDefecto: "No fue posible cargar los administradores.",
  });

  const [formularioAbierto,setFormularioAbierto]=useState(true);
  const [editando,setEditando]=useState<Administrador|null>(null);

  const [nombre,setNombre]=useState("");
  const [apellido,setApellido]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [albergueId,setAlbergueId]=useState("");
  const [albergueSeleccionadoCache,setAlbergueSeleccionadoCache]=
    useState<AlbergueResumen|null>(null);
  const [activo,setActivo]=useState(true);

  // Estado del selector paginado y buscable de albergues en servidor
  const [busquedaAlbergue,setBusquedaAlbergue]=useState("");
  const busquedaAlbergueDebounced=useValorDebounced(busquedaAlbergue);
  const [paginaAlbergue,setPaginaAlbergue]=useState(1);
  const [paginaOpcionesAlbergue,setPaginaOpcionesAlbergue]=useState<
    Page<AlbergueResumen>
  >(() => paginaVacia<AlbergueResumen>(1,10));
  const secuenciaAlberguesRef=useRef(0);

  const [guardando,setGuardando]=useState(false);
  const [errorFormulario,setErrorFormulario]=useState("");
  const [aviso,setAviso]=useState("");

  useEffect(() => {
    if(!formularioAbierto) return;
    const idPeticion=++secuenciaAlberguesRef.current;

    const consulta: ConsultaPaginada={
      page: paginaAlbergue,
      page_size: 10,
      q: busquedaAlbergueDebounced||undefined,
      activo: true,
    };

    const promesa=listarAlberguesInyectado
      ? listarAlberguesInyectado(consulta)
      :alberguesGw.listar(consulta);

    promesa
      .then((res) => {
        if(idPeticion!==secuenciaAlberguesRef.current) return;
        if(Array.isArray(res)) {
          setPaginaOpcionesAlbergue({
            items: res.map((a) => ({
              id: a.id,
              codigo: a.codigo,
              nombre: a.nombre,
            })),
            page: 1,
            page_size: Math.max(10,res.length),
            total: res.length,
            total_pages: res.length>0? 1:0,
            has_next: false,
            has_previous: false,
          });
        } else {
          setPaginaOpcionesAlbergue({
            ...res,
            items: res.items.map((a) => ({
              id: a.id,
              codigo: a.codigo,
              nombre: a.nombre,
            })),
          });
        }
      })
      .catch(() => {
        if(idPeticion!==secuenciaAlberguesRef.current) return;
        setPaginaOpcionesAlbergue(paginaVacia<AlbergueResumen>(1,10));
      });
  },[
    formularioAbierto,
    paginaAlbergue,
    busquedaAlbergueDebounced,
    listarAlberguesInyectado,
    alberguesGw,
  ]);

  // Si hay un albergueId seleccionado que no está en la página actual ni tiene nombre en caché, consulta solo ese ID
  useEffect(() => {
    if(!albergueId||!alberguesGw.obtener) {
      return;
    }
    const enPagina=paginaOpcionesAlbergue.items.some(
      (a) => a.id===albergueId
    );
    if(
      enPagina||
      albergueSeleccionadoCache?.id===albergueId
    ) {
      return;
    }

    let vigente=true;
    alberguesGw
      .obtener(albergueId)
      .then((detalle) => {
        if(!vigente) return;
        setAlbergueSeleccionadoCache({
          id: detalle.id,
          codigo: detalle.codigo,
          nombre: detalle.nombre,
        });
      })
      .catch(() => { });

    return () => {
      vigente=false;
    };
  },[
    albergueId,
    paginaOpcionesAlbergue.items,
    albergueSeleccionadoCache,
    alberguesGw,
  ]);

  const opcionesSelectAlbergue=useMemo(() => {
    const lista=[...paginaOpcionesAlbergue.items];
    if(
      albergueId&&
      albergueSeleccionadoCache?.id===albergueId&&
      !lista.some((item) => item.id===albergueSeleccionadoCache.id)
    ) {
      lista.unshift(albergueSeleccionadoCache);
    }
    return lista;
  },[albergueId,paginaOpcionesAlbergue.items,albergueSeleccionadoCache]);

  const mapaOpciones=useMemo(() => {
    const mapa=new Map<string,AlbergueResumen>();
    for(const item of opcionesSelectAlbergue) {
      mapa.set(item.id,item);
    }
    return mapa;
  },[opcionesSelectAlbergue]);

  function limpiarFormulario() {
    setEditando(null);
    setNombre("");
    setApellido("");
    setEmail("");
    setPassword("");
    setAlbergueId("");
    setAlbergueSeleccionadoCache(null);
    setActivo(true);
    setErrorFormulario("");
  }

  function seleccionarParaEditar(admin: Administrador) {
    setEditando(admin);
    setFormularioAbierto(true);
    setNombre(admin.nombre??"");
    setApellido(admin.apellido??"");
    setEmail(admin.email);
    setPassword("");
    setAlbergueId(admin.albergueId??"");
    if(admin.albergueId&&admin.albergueNombre) {
      setAlbergueSeleccionadoCache({
        id: admin.albergueId,
        nombre: admin.albergueNombre,
        codigo: admin.codigoAlbergue??"",
      });
    } else {
      setAlbergueSeleccionadoCache(null);
    }
    setActivo(admin.active);
    setErrorFormulario("");
    setAviso("");
  }

  async function manejarSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if(guardando) return;

    if(!nombre.trim()||!apellido.trim()||!email.trim()) {
      setErrorFormulario("Completa nombre, apellido y correo electrónico.");
      return;
    }

    if(!editando&&password.length<8) {
      setErrorFormulario("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setGuardando(true);
    setErrorFormulario("");
    setAviso("");

    try {
      if(editando) {
        await gateway.actualizar(editando.id,{
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          active: activo,
          ...(password? { password }:{}),
        });

        if((albergueId||null)!==editando.albergueId) {
          await gateway.asignarAlbergue(editando.id,albergueId||null);
        }

        setAviso("Administrador actualizado correctamente.");
        limpiarFormulario();
        recargar();
      } else {
        await gateway.crear({
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          password,
          albergueId: albergueId||null,
        });
        setAviso("Administrador registrado correctamente.");
        limpiarFormulario();
        recargar();
      }
    } catch(err: unknown) {
      setErrorFormulario(
        err instanceof Error
          ? err.message
          :"No fue posible guardar el administrador."
      );
    } finally {
      setGuardando(false);
    }
  }

  function textoGuardar() {
    if(guardando) { return "Guardando…"; }
    if(editando) { return "Guardar cambios"; }
    return "Crear administrador";
  }

  function renderizarAdministradores() {
    if(errorCarga) {
      return <div role="alert" className="p-6 text-center text-sm text-[#C53030]">
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
    if(cargando) { return <SkeletonBloque filas={4} etiqueta="Cargando administradores…" />; }
    if(administradores.length===0) {
      return <div className="p-8 text-center text-sm text-[#53636B]">
        No hay administradores registrados con ese criterio.
      </div>;
    }
    return <section


      aria-labelledby="titulo-tabla-admins"
      className="overflow-x-auto"
    >
      <table className="w-full min-w-[600px] text-left text-xs text-[#53636B]">
        <caption className="sr-only">
          Listado de administradores de albergue
        </caption>
        <thead>
          <tr className="border-b border-[#EEF2F4] bg-[#F8FAFB] text-xs font-semibold text-[#53636B]">
            <th scope="col" className="px-4 py-3">
              Administrador
            </th>
            <th scope="col" className="px-3 py-3">
              Correo electrónico
            </th>
            <th scope="col" className="px-3 py-3">
              Albergue asignado
            </th>
            <th scope="col" className="px-3 py-3">
              Estado
            </th>
            <th scope="col" className="px-4 py-3">
              Acción
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2F4]">
          {administradores.map((admin) => {
            const nombreCompleto=
              [admin.nombre,admin.apellido].filter(Boolean).join(" ")||
              "Sin nombre";

            const fallbackOpciones=admin.albergueId
              ? mapaOpciones.get(admin.albergueId)
              :null;

            function nombreAlbergueAsignado() {
              const nombre = admin.albergueNombre ?? fallbackOpciones?.nombre;
              const codigo = admin.albergueNombre ? admin.codigoAlbergue : fallbackOpciones?.codigo;
              if (!nombre) return admin.albergueId ?? "Sin asignar";
              const sufijo = codigo ? ` (${codigo})` : "";
              return nombre + sufijo;
            }

            const textoAlbergue=nombreAlbergueAsignado();

            return (
              <tr key={admin.id} className="hover:bg-[#FAFCFD]">
                <td className="px-4 py-3 font-semibold text-[#164652]">
                  {nombreCompleto}
                </td>
                <td className="px-3 py-3">{admin.email}</td>
                <td className="px-3 py-3">{textoAlbergue}</td>
                <td className="px-3 py-3">
                  <EstadoBadge activo={admin.active} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => seleccionarParaEditar(admin)}
                    aria-label={`Editar ${nombreCompleto}`}
                    className="inline-flex items-center gap-1 px-2 py-1 font-semibold text-[#008994] transition hover:bg-[#E6F9FA]"
                  >
                    <Pencil size={14} aria-hidden="true" />
                    Editar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="flex flex-col gap-3 border-b border-[#DCE6EA] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#164652]">
            Administradores de albergues
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              limpiarFormulario();
              setFormularioAbierto(true);
            }}
            className="inline-flex h-10 items-center gap-2 bg-[#008994] px-4 text-xs font-semibold text-white transition hover:bg-[#00747E]"
          >
            <Plus size={15} aria-hidden="true" />
            Nuevo administrador
          </button>

          <button
            type="button"
            onClick={recargar}
            className="inline-flex h-10 items-center gap-2 border border-[#DCE6EA] bg-white px-3 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
          >
            <RefreshCw size={14} aria-hidden="true" />
            Actualizar
          </button>
        </div>
      </header>

      {aviso&&(
        <output className="flex items-center justify-between gap-2 border-l-4 border-[#168052] bg-[#E8F7F0] px-4 py-2.5 text-xs font-medium text-[#168052]">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} aria-hidden="true" />
            {aviso}
          </span>
          <button
            type="button"
            aria-label="Cerrar aviso"
            onClick={() => setAviso("")}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </output>
      )}

      {/* Formulario horizontal superior */}
      {formularioAbierto&&(
        <section
          aria-labelledby="titulo-form-admin"
          className="border-t-2 border-[#008994] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-[#EEF2F4] pb-3">
            <div className="flex items-center gap-2">
              {editando? (
                <UserCog
                  size={18}
                  aria-hidden="true"
                  className="text-[#008994]"
                />
              ):(
                <UserPlus
                  size={18}
                  aria-hidden="true"
                  className="text-[#008994]"
                />
              )}
              <h2
                id="titulo-form-admin"
                className="text-base font-bold text-[#164652]"
              >
                {editando? "Editar administrador":"Nuevo administrador"}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                limpiarFormulario();
                setFormularioAbierto(false);
              }}
              aria-label="Cerrar formulario"
              className="p-1 text-[#53636B] hover:bg-[#F4F8FA]"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <form onSubmit={manejarSubmit} noValidate className="mt-4 space-y-4">
            {errorFormulario&&(
              <p
                role="alert"
                className="flex items-start gap-1.5 text-xs font-medium text-[#C53030]"
              >
                <CircleAlert
                  size={14}
                  aria-hidden="true"
                  className="mt-px shrink-0"
                />
                <span>{errorFormulario}</span>
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="admin-nombre"
                  className="mb-1 block text-xs font-semibold text-[#164652]"
                >
                  Nombre *
                </label>
                <input
                  id="admin-nombre"
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-apellido"
                  className="mb-1 block text-xs font-semibold text-[#164652]"
                >
                  Apellido *
                </label>
                <input
                  id="admin-apellido"
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-email"
                  className="mb-1 block text-xs font-semibold text-[#164652]"
                >
                  Correo electrónico *
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={INPUT_CLS}
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1 block text-xs font-semibold text-[#164652]"
                >
                  {editando? "Nueva contraseña (opcional)":"Contraseña *"}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="new-password"
                  required={!editando}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={INPUT_CLS}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label
                    htmlFor="admin-albergue"
                    className="block text-xs font-semibold text-[#164652]"
                  >
                    Albergue asignado
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="search"
                      aria-label="Buscar albergue para asignar"
                      value={busquedaAlbergue}
                      onChange={(e) => {
                        setBusquedaAlbergue(e.target.value);
                        setPaginaAlbergue(1);
                      }}
                      placeholder="Buscar albergue en servidor…"
                      maxLength={100}
                      className="h-7 w-48 border border-[#DCE6EA] bg-white px-2 text-xs text-[#164652] outline-none focus:border-[#008994]"
                    />
                    <button
                      type="button"
                      aria-label="Página anterior de albergues"
                      disabled={!paginaOpcionesAlbergue.has_previous}
                      onClick={() =>
                        setPaginaAlbergue((p) => Math.max(1,p-1))
                      }
                      className="inline-flex h-7 items-center border border-[#DCE6EA] bg-white px-1.5 text-xs text-[#164652] disabled:opacity-40"
                    >
                      <ChevronLeft size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label="Página siguiente de albergues"
                      disabled={!paginaOpcionesAlbergue.has_next}
                      onClick={() => setPaginaAlbergue((p) => p+1)}
                      className="inline-flex h-7 items-center border border-[#DCE6EA] bg-white px-1.5 text-xs text-[#164652] disabled:opacity-40"
                    >
                      <ChevronRight size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <select
                  id="admin-albergue"
                  value={albergueId}
                  onChange={(e) => {
                    const nuevoId=e.target.value;
                    setAlbergueId(nuevoId);
                    const encontrado=opcionesSelectAlbergue.find(
                      (a) => a.id===nuevoId
                    );
                    if(encontrado) {
                      setAlbergueSeleccionadoCache(encontrado);
                    }
                  }}
                  className={INPUT_CLS}
                >
                  <option value="">Sin asignar</option>
                  {opcionesSelectAlbergue.map((alb) => (
                    <option key={alb.id} value={alb.id}>
                      {alb.nombre}
                      {alb.codigo? ` (${alb.codigo})`:""}
                    </option>
                  ))}
                </select>
              </div>

              {editando&&(
                <div>
                  <label
                    htmlFor="admin-estado"
                    className="mb-1 block text-xs font-semibold text-[#164652]"
                  >
                    Estado de la cuenta
                  </label>
                  <select
                    id="admin-estado"
                    value={activo? "activo":"inactivo"}
                    onChange={(e) => setActivo(e.target.value==="activo")}
                    className={INPUT_CLS}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-[#EEF2F4] pt-3">
              {editando&&(
                <button
                  type="button"
                  onClick={limpiarFormulario}
                  disabled={guardando}
                  className="h-10 border border-[#DCE6EA] bg-white px-4 text-xs font-semibold text-[#164652] transition hover:bg-[#F4F8FA]"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={guardando}
                className="h-10 bg-[#008994] px-5 text-xs font-semibold text-white transition hover:bg-[#00747E] disabled:opacity-60"
              >
                {textoGuardar()}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tabla de administradores paginada en servidor */}
      <section
        aria-labelledby="titulo-tabla-admins"
        className="border-t-2 border-[#008994] bg-white shadow-xs"
      >
        <div className="flex flex-col gap-3 border-b border-[#EEF2F4] p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="titulo-tabla-admins"
              className="text-base font-bold text-[#164652]"
            >
              Cuentas registradas ({paginaAdmins.total})
            </h2>
          </div>

          <BarraFiltrosServidor
            q={q}
            onQChange={setQ}
            placeholderQ="Nombre, apellido o correo…"
            ariaLabelQ="Buscar administrador"
            desde={desde}
            hasta={hasta}
            onDesdeChange={setDesde}
            onHastaChange={setHasta}
            onLimpiar={() => {
              setFiltroEstadoAdmin("todos");
              limpiarFiltros();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[#53636B]">
                Estado
              </span>
              <select
                aria-label="Filtrar administradores por estado"
                value={filtroEstadoAdmin}
                onChange={(e) =>
                  setFiltroEstadoAdmin(
                    e.target.value as "todos"|"activos"|"inactivos"
                  )
                }
                className="h-9 border border-[#DCE6EA] bg-white px-2.5 text-xs text-[#164652] outline-none focus:border-[#008994]"
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </label>
          </BarraFiltrosServidor>
        </div>

        {renderizarAdministradores()}

        <ControlesPaginacion
          pagina={paginaAdmins}
          etiquetaItems="administradores"
          cargando={cargando}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          ariaLabel="Paginación de administradores"
        />
      </section>
    </div>
  );
}
